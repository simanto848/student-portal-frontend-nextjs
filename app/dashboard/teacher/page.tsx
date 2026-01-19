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
      if (user && 'departmentId' in user && user.departmentId) {
        const deptId = (user as any).departmentId;
        promises.push(
          import("@/services/academic/department.service")
            .then(m => m.departmentService.getDepartmentById(deptId))
            .then(dept => {
              if (dept.departmentHeadId === user!.id) {
                setIsDeptHead(true);
              }
            })
            .catch(err => console.error("Failed to check dept head status", err))
        );
      }

      const results = await Promise.allSettled(promises);

      const scheduleResult = results[0];
      const coursesResult = results[1];
      const workflowResult = results[2];

      if (scheduleResult.status === 'fulfilled') setSchedules(scheduleResult.value);
      else console.error("Failed to fetch schedule", scheduleResult.reason);

      if (coursesResult.status === 'fulfilled') setCourses(coursesResult.value);
      else console.error("Failed to fetch courses", coursesResult.reason);

      if (workflowResult.status === 'fulfilled') setWorkflows(workflowResult.value || []);
      else console.error("Failed to fetch workflows", workflowResult.reason);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), "EEEE");
  const todaySchedules = schedules
    .filter((s) => s.daysOfWeek.includes(today as any))
    .map((s) => {
      // Safe extraction of course name
      const courseName = (typeof s.sessionCourseId === 'object' && s.sessionCourseId !== null)
        ? ((s.sessionCourseId as any).course?.name || (s.sessionCourseId as any).courseId?.name || "Untitled Course")
        : "Untitled Course";

      // Safe extraction of location
      let location = "TBD";
      if (typeof s.classroom === 'object' && s.classroom !== null) {
        const room = (s.classroom as any).roomNumber;
        const building = (s.classroom as any).buildingName;
        if (room && building) location = `${building}, Room ${room}`;
        else if (room) location = `Room ${room}`;
        else if (building) location = building;
      }

      // Normalize type
      const type = (s.classType || 'lecture').toLowerCase() as "lecture" | "lab" | "meeting";

      return {
        id: s.id,
        title: courseName,
        time: `${s.startTime} - ${s.endTime}`,
        location: location,
        type: type,
      };
    });

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
      case "submitted": return <Badge className="bg-indigo-500/15 text-indigo-600 hover:bg-indigo-500/25 border-indigo-200">Submitted</Badge>;
      case "returned": return <Badge className="bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-rose-200">Returned</Badge>;
      case "draft": return <Badge variant="secondary" className="bg-slate-100 text-slate-600">Draft</Badge>;
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
      icon: <Calendar className="h-5 w-5 text-indigo-600" />
    },
    {
      id: "2",
      type: "nav" as const,
      title: "Grade Workflow",
      subtitle: "Submit/track grades",
      actionLabel: "Open Grading",
      onClick: () => router.push("/dashboard/teacher/grading"),
      icon: <FileCheck className="h-5 w-5 text-indigo-600" />
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
      icon: <Building2 className="h-5 w-5 text-indigo-600" />
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
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] opacity-50" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] opacity-30" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-indigo-200 text-sm font-bold uppercase tracking-widest"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <GraduationCap className="h-4 w-4" />
                <span>Academic Intelligence Hub</span>
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 leading-tight">
                  Welcome Back, {user?.fullName?.split(' ')[0]}!
                </h1>
                <p className="text-indigo-100/80 max-w-xl text-lg font-medium leading-relaxed">
                  Your academic activities for <span className="text-white font-bold">{today}</span> include <span className="text-white font-bold">{todaySchedules.length} classes</span> and <span className="text-white font-bold">{pendingGradesCount} pending</span> evaluations.
                </p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Button
                className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-xl shadow-indigo-950/20 font-black tracking-tight transition-all active:scale-95"
                onClick={() => router.push("/dashboard/teacher/attendance")}
              >
                Mark Attendance
              </Button>
              <Button
                variant="outline"
                className="h-14 px-8 rounded-2xl bg-white/5 text-white border-white/10 hover:bg-white/10 backdrop-blur-sm shadow-xl font-black tracking-tight transition-all active:scale-95"
                onClick={() => router.push("/dashboard/teacher/classroom")}
              >
                Virtual Room
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Active Courses", value: activeCoursesCount, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Enrolled Students", value: totalStudents, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Pending Grades", value: pendingGradesCount, icon: FileCheck, color: "text-indigo-600", bg: "bg-indigo-50" }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">

            {/* My Courses Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Portfolio</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Courses</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 font-bold" onClick={() => router.push('/dashboard/teacher/courses')}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[2rem] animate-pulse" />)}
                </div>
              ) : courses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
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
                        whileHover={{ y: -8 }}
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
                            label: "Evaluation Progress",
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-dashed border-2 rounded-[2rem] shadow-none bg-slate-50/50">
                  <CardContent className="py-16 text-center text-slate-400 font-bold italic">
                    No active courses detected in your sector.
                  </CardContent>
                </Card>
              )}
            </motion.section>

            {/* Grading Workflow Section */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grading Pipeline</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pending Grades</h2>
                </div>
              </div>

              <Card className="border-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                <CardContent className="p-0">
                  {pendingWorkflows.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 mb-6">
                        <FileCheck className="h-10 w-10 text-slate-200" />
                      </div>
                      <p className="font-bold">Grading pipeline clear. No pending tasks.</p>
                    </div>
                  ) : (
                    <div className="divide-y-2 divide-slate-50">
                      {pendingWorkflows.map((wf) => (
                        <div
                          key={wf.id}
                          className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                              <span className="text-indigo-700 font-black text-xs uppercase">{wf.grade?.course?.code?.substring(0, 3)}</span>
                            </div>
                            <div>
                              <p className="font-black text-slate-800 tracking-tight">{wf.grade?.course?.name}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                {statusBadge(wf.status)}
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(wf.actionAt), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            className="h-10 rounded-xl bg-white border-2 border-slate-100 hover:border-indigo-500/30 hover:text-indigo-600 font-bold transition-all shadow-lg shadow-slate-200/40"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/teacher/courses/${wf.grade?.courseId || ""}`)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 bg-slate-50/80 border-t-2 border-slate-100 text-center">
                    <Button variant="link" size="sm" className="text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-indigo-600" onClick={() => router.push("/dashboard/teacher/grading")}>
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-10">

            {/* Quick Actions */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Quick Actions</h2>
              </div>
              <div className="space-y-4">
                {actionItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(248, 250, 252, 1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-5 p-5 rounded-[1.5rem] bg-white border-2 border-slate-100 shadow-lg shadow-slate-200/40 text-left transition-all hover:border-indigo-500/30 group"
                  >
                    <div className="p-3.5 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 tracking-tight leading-none mb-1.5">{item.title}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.subtitle}</p>
                    </div>
                  </motion.button>
                ))}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="h-20 rounded-2xl border-2 border-slate-100 hover:border-indigo-500/30 font-black tracking-tight text-slate-600 hover:text-indigo-600 transition-all shadow-lg shadow-slate-200/40"
                    onClick={() => router.push("/dashboard/teacher/notifications")}
                  >
                    Notifications
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 rounded-2xl border-2 border-slate-100 hover:border-indigo-500/30 font-black tracking-tight text-slate-600 hover:text-indigo-600 transition-all shadow-lg shadow-slate-200/40"
                    onClick={() => router.push("/dashboard/teacher/communication")}
                  >
                    Communication's
                  </Button>
                </div>
              </div>
            </motion.section>

            {/* Today's Schedule */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Today's Schedule</h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">{today}</span>
              </div>
              <Card className="border-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-0">
                  {todaySchedules.length > 0 ? (
                    <ScheduleList items={todaySchedules} />
                  ) : (
                    <div className="p-16 text-center bg-slate-50/20">
                      <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                        <Calendar className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold italic text-sm">
                        No sessions scheduled for today.
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
