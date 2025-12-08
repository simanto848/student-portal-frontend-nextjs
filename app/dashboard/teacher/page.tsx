"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScheduleList } from "@/components/dashboard/widgets/ScheduleList";
import { CourseCard } from "@/components/dashboard/widgets/CourseCard";
import { ActionList } from "@/components/dashboard/widgets/ActionList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/academic/schedule.service";
import { batchCourseInstructorService } from "@/services/enrollment/batchCourseInstructor.service";
import { CourseSchedule } from "@/services/academic/types";
import { BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import {
  courseGradeService,
  ResultWorkflow,
} from "@/services/enrollment/courseGrade.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { motion, Variants } from "framer-motion";
import {
  BookOpen,
  Users,
  FileCheck,
  Calendar,
  ArrowRight,
  GraduationCap,
  Building2
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [courses, setCourses] = useState<BatchCourseInstructor[]>([]);
  const [workflows, setWorkflows] = useState<ResultWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeptHead, setIsDeptHead] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        scheduleService.getScheduleByTeacher(user!.id),
        batchCourseInstructorService.getInstructorCourses(user!.id),
        courseGradeService.getWorkflow({ mine: true }),
      ];

      // Check if department head
      if (user?.departmentId) {
        promises.push(
          import("@/services/academic/department.service")
            .then(m => m.departmentService.getDepartmentById(user!.departmentId))
            .then(dept => {
              if (dept.departmentHeadId === user!.id) {
                setIsDeptHead(true);
              }
            })
            .catch(err => console.error("Failed to check dept head status", err))
        );
      }

      const results = await Promise.all(promises);
      const scheduleData = results[0];
      const coursesData = results[1];
      const workflowData = results[2];

      setSchedules(scheduleData);
      setCourses(coursesData);
      setWorkflows(workflowData || []);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), "EEEE");
  const todaySchedules = schedules
    .filter((s) => s.daysOfWeek.includes(today as any))
    .map((s) => ({
      id: s.id,
      title: (s.sessionCourse as any)?.course?.name || "Untitled Course",
      time: `${s.startTime} - ${s.endTime}`,
      location: (s.classroom as any)?.roomNumber ? `Room ${(s.classroom as any).roomNumber}` : "TBD",
      type: s.classType.toLowerCase() as "lecture" | "lab" | "meeting",
    }));

  const pendingWorkflows = workflows.filter((w) => ["draft", "submitted", "returned"].includes(w.status)).slice(0, 4);

  const totalStudents = courses.reduce((acc, curr) => acc + (curr.batch?.currentStudents || 0), 0);
  const activeCoursesCount = courses.length;
  const pendingGradesCount = pendingWorkflows.length;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-200">Approved</Badge>;
      case "submitted": return <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-200">Submitted</Badge>;
      case "returned": return <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-200">Returned</Badge>;
      case "draft": return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Draft</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const actionItems = [
    {
      id: "1",
      type: "form" as const,
      title: "Mark Attendance",
      subtitle: "For today's classes",
      actionLabel: "Go to Attendance",
      onClick: () => router.push("/dashboard/teacher/attendance"),
      icon: <Calendar className="h-5 w-5 text-emerald-600" />
    },
    {
      id: "2",
      type: "nav" as const,
      title: "Grade Workflow",
      subtitle: "Submit/track grades",
      actionLabel: "Open Grading",
      onClick: () => router.push("/dashboard/teacher/grading"),
      icon: <FileCheck className="h-5 w-5 text-blue-600" />
    },
    {
      id: "3",
      type: "nav" as const,
      title: "Manage Courses",
      subtitle: "See enrolled students",
      actionLabel: "My Courses",
      onClick: () => router.push("/dashboard/teacher/courses"),
      icon: <BookOpen className="h-5 w-5 text-indigo-600" />
    },
    ...(isDeptHead ? [{
      id: "4",
      type: "nav" as const,
      title: "Department",
      subtitle: "Manage Batches",
      actionLabel: "View Batches",
      onClick: () => router.push("/dashboard/teacher/department"),
      icon: <Building2 className="h-5 w-5 text-orange-600" />
    }] : []),
  ];

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-8 max-w-7xl mx-auto pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a3d32] to-[#2d5246] p-8 md:p-10 text-white shadow-xl"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-black/10 blur-3xl opacity-50" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-emerald-100 mb-2 font-medium"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Teacher Portal</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Welcome back, {user?.fullName?.split(' ')[0]}!
              </h1>
              <p className="text-emerald-50 max-w-lg text-lg/relaxed">
                You have <span className="font-semibold text-white">{todaySchedules.length} classes</span> today and <span className="font-semibold text-white">{pendingGradesCount} pending</span> grading tasks.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                className="bg-white text-[#1a3d32] hover:bg-emerald-50 border-0 shadow-lg font-semibold transition-transform hover:scale-105"
                onClick={() => router.push("/dashboard/teacher/attendance")}
              >
                Take Attendance
              </Button>
              <Button
                variant="outline"
                className="bg-[#ffffff1a] text-white border-white/20 hover:bg-[#ffffff30] backdrop-blur-sm shadow-lg transition-transform hover:scale-105"
                onClick={() => router.push("/dashboard/teacher/classroom")}
              >
                Classroom
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Active Courses", value: activeCoursesCount, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Students", value: totalStudents, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Pending Grading", value: pendingGradesCount, icon: FileCheck, color: "text-amber-600", bg: "bg-amber-50" }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-800">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">

            {/* My Courses Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  Active Courses
                </h2>
                <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800" onClick={() => router.push('/dashboard/teacher/courses')}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : courses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((c, idx) => {
                    const relatedWorkflows = workflows.filter(
                      (w) => w.grade?.courseId === c.courseId
                    );
                    const approvedCount = relatedWorkflows.filter(
                      (w) => w.status === "approved"
                    ).length;
                    const totalWorkflows = relatedWorkflows.length || 1;

                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CourseCard
                          title={c.course?.name || "Unknown Course"}
                          code={c.course?.code}
                          batchName={c.batch?.name}
                          studentCount={c.batch?.currentStudents || 0}
                          progress={{
                            current: approvedCount,
                            total: totalWorkflows,
                            label: totalWorkflows > 1 ? "Grading Progress" : "Grading Started",
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No active courses found.
                  </CardContent>
                </Card>
              )}
            </motion.section>

            {/* Grading Workflow Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-500" />
                  Grading Tasks
                </h2>
              </div>

              <Card className="border shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  {pendingWorkflows.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                        <FileCheck className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>All caught up! No pending grading tasks.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {pendingWorkflows.map((wf) => (
                        <div
                          key={wf.id}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                              <span className="text-amber-700 font-bold text-xs">{wf.grade?.course?.code?.substring(0, 3)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{wf.grade?.course?.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {statusBadge(wf.status)}
                                <span className="text-xs text-muted-foreground">{format(new Date(wf.actionAt), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/teacher/courses/${wf.grade?.courseId || ""}`)}>
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <Button variant="link" size="sm" className="text-slate-600" onClick={() => router.push("/dashboard/teacher/grading")}>
                      View All Workflows
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">

            {/* Quick Actions */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(248, 250, 252, 1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-left transition-all hover:border-emerald-200 group"
                  >
                    <div className="p-3 rounded-lg bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </motion.button>
                ))}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center justify-center" onClick={() => router.push("/dashboard/teacher/notifications")}>
                    <span className="font-semibold">Notifications</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center justify-center" onClick={() => router.push("/dashboard/teacher/communication")}>
                    <span className="font-semibold">Messages</span>
                  </Button>
                </div>
              </div>
            </motion.section>

            {/* Today's Schedule */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center justify-between">
                <span>Today's Schedule</span>
                <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-1 rounded-md">{today}</span>
              </h2>
              <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                  {todaySchedules.length > 0 ? (
                    <ScheduleList items={todaySchedules} />
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50">
                      <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        No classes scheduled for today.
                        <br />Enjoy your free time!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.section>

          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
