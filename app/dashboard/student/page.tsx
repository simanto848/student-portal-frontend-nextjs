"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScheduleList } from "@/components/dashboard/widgets/ScheduleList";
import { GradeCircle } from "@/components/dashboard/widgets/GradeCircle";
import { LibraryList } from "@/components/dashboard/widgets/LibraryList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Megaphone,
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  Bell,
  GraduationCap,
  Library,
  ClipboardCheck,
  User,
  CalendarDays,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  Gamepad2,
  Rocket
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { courseGradeService } from "@/services/enrollment/courseGrade.service";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { borrowingService } from "@/services/library/borrowing.service";
import { notificationService } from "@/services/notification/notification.service";
import { scheduleService } from "@/services/academic/schedule.service";
import { Skeleton } from "@/components/ui/skeleton";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

const GlassCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-cyan-500/5 ${className}`}
  >
    {children}
  </motion.div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cgpa, setCgpa] = useState<number>(0);
  const [attendance, setAttendance] = useState<number>(0);
  const [credits, setCredits] = useState<number>(0);
  const [grades, setGrades] = useState<any[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const studentId = user.id || (user as any)._id;
      if (!studentId) return;

      const [cgpaRes, gradeRes, attRes, borrowedRes, notifRes] =
        await Promise.all([
          courseGradeService.calculateCGPA(studentId).catch(() => ({ cgpa: 0 })),
          courseGradeService.list({ studentId }).catch(() => []),
          attendanceService.listAttendance({ studentId }).catch(() => []),
          borrowingService.getMyBorrowedBooks().catch(() => []),
          notificationService.list().catch(() => []),
        ]);

      if (cgpaRes && typeof cgpaRes.cgpa === "number") {
        setCgpa(cgpaRes.cgpa);
      }

      let gradesList: any[] = Array.isArray(gradeRes)
        ? gradeRes
        : (gradeRes as any)?.grades || (gradeRes as any)?.data || [];

      const maxSem = Math.max(...gradesList.map((g) => g.semester || 1), 1);
      const currentGrades = gradesList.filter((g) => g.semester === maxSem);

      setGrades(
        currentGrades.slice(0, 3).map((g) => ({
          subject: (g.course as any)?.code || "N/A",
          grade: g.grade || "N/A",
          percentage:
            g.totalMarks > 0
              ? Math.round((g.totalMarksObtained / g.totalMarks) * 100)
              : 0,
          color: "#0891b2", // cyan-600
        }))
      );

      const totalCreds = gradesList.reduce(
        (acc, g) => acc + ((g.course as any)?.credit || 0),
        0
      );
      setCredits(totalCreds);

      let attList: any[] = Array.isArray(attRes)
        ? attRes
        : (attRes as any)?.attendance || (attRes as any)?.data || [];

      const total = attList.length;
      const present = attList.filter((a) => a.status === "present").length;
      const late = attList.filter((a) => a.status === "late").length;
      const attPercent = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
      setAttendance(attPercent);

      let borrowedList: any[] = Array.isArray(borrowedRes) ? borrowedRes : [];
      setLibraryItems(
        borrowedList.slice(0, 3).map((item) => {
          const bookDetails = item.copy?.book;
          const dueDate = new Date(item.dueDate);
          const today = new Date();
          const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: item.id,
            title: bookDetails?.title || "Unknown Book",
            dueDate: daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`,
            status: daysLeft < 0 ? "overdue" : daysLeft <= 3 ? "due_soon" : "normal",
          };
        })
      );

      let notifList: any[] = Array.isArray(notifRes)
        ? notifRes
        : (notifRes as any)?.notifications || (notifRes as any)?.data || [];

      setNotifications(
        notifList.slice(0, 4).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt || n.publishedAt).toLocaleDateString(),
          icon: n.type === "alert" ? Megaphone : Calendar,
        }))
      );

      let batchId: string | undefined;
      if ('batchId' in user && typeof user.batchId === "string") {
        batchId = user.batchId;
      } else if ('batchId' in user && user.batchId && typeof user.batchId === "object") {
        batchId = (user.batchId as any).id || (user.batchId as any)._id;
      }

      if (batchId) {
        const scheduleData = await scheduleService.getScheduleByBatch(batchId).catch(() => []);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];

        const todaySchedule = scheduleData
          .filter((s) => s.daysOfWeek.includes(today as any))
          .slice(0, 4)
          .map((s) => {
            const course = typeof s.sessionCourseId === "object" && "courseId" in s.sessionCourseId ? (s.sessionCourseId as any).courseId : null;
            const room = typeof s.classroomId === "object" ? (s.classroomId as any)?.roomNumber : "TBA";

            return {
              id: s.id,
              title: `${course?.code || "N/A"}: ${course?.name || "Unknown"}`,
              time: s.startTime,
              location: `Room ${room}`,
              type: "lecture" as const,
            };
          });

        setScheduleItems(todaySchedule);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { label: "Overall GPA", value: cgpa.toFixed(2), icon: Rocket, color: "text-cyan-600", bg: "bg-cyan-50", trend: "+0.2 this term" },
    { label: "Attendance", value: `${attendance}%`, icon: User, color: "text-sky-600", bg: "bg-sky-50", trend: "Highly regular" },
    { label: "Total Credits", value: credits.toString(), icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50", trend: "Target: 140" },
  ];

  const menuItems = [
    { label: "Classrooms", icon: BookOpen, href: "/dashboard/student/classroom", color: "text-indigo-300", bg: "bg-indigo-500/20" },
    { label: "Exams", icon: FileText, href: "/dashboard/student/assessments", color: "text-rose-300", bg: "bg-rose-500/20" },
    { label: "Library", icon: Library, href: "/dashboard/student/library", color: "text-amber-300", bg: "bg-amber-500/20" },
    { label: "Grades", icon: Sparkles, href: "/dashboard/student/grades", color: "text-emerald-300", bg: "bg-emerald-500/20" },
    { label: "Attendance", icon: ClipboardCheck, href: "/dashboard/student/attendances", color: "text-sky-300", bg: "bg-sky-500/20" },
    { label: "Schedule", icon: CalendarDays, href: "/dashboard/student/classes", color: "text-violet-300", bg: "bg-violet-500/20" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 max-w-[1600px] mx-auto p-4 animate-in fade-in duration-500">
          <Skeleton className="h-[280px] w-full rounded-[2.5rem]" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-[2rem]" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-12">
            <Skeleton className="h-[500px] lg:col-span-8 rounded-[2rem]" />
            <Skeleton className="h-[500px] lg:col-span-4 rounded-[2rem]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8 max-w-[1600px] mx-auto pb-12"
      >
        {/* Modern Hero Section */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 border-cyan-900 via-sky-950 to-cyan-900 p-8 md:p-12 text-white shadow-2xl transition-all duration-700"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-[100px] opacity-60" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-sky-500/10 blur-[100px] opacity-40" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-cyan-300 text-sm font-semibold tracking-wider uppercase"
              >
                <Sparkles className="h-4 w-4" />
                <span>Student Nexus Platform</span>
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                  Welcome back,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-sky-200">
                    {user?.fullName?.split(" ")[0] || "Student"}
                  </span>
                </h1>
                <p className="text-cyan-100/70 max-w-xl text-lg font-medium">
                  Your academic journey is looking bright. You have <span className="text-white font-bold">{scheduleItems.length} classes</span> today and <span className="text-white font-bold">{notifications.length} new</span> updates to review.
                </p>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Button
                  className="h-14 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg shadow-xl shadow-cyan-950/20 transition-all active:scale-95"
                  onClick={() => window.location.href = "/dashboard/student/classroom"}
                >
                  Join Classroom
                </Button>
                <Button
                  variant="outline"
                  className="h-14 px-8 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-sm shadow-xl transition-all active:scale-95"
                  onClick={() => window.location.href = "/dashboard/student/profile"}
                >
                  Profile
                </Button>
              </div>
            </div>

            {/* Quick Access Floating Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              {menuItems.map((item, idx) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = item.href}
                  className="cursor-pointer group flex flex-col items-center justify-center p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
                >
                  <div className={`p-3 rounded-2xl ${item.bg} ${item.color} mb-2 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-white/90">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-[1.5rem] ${stat.bg} ${stat.color} shadow-inner`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Trend</span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {stat.trend}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main Grid Content */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Schedule Section */}
            <GlassCard>
              <div className="p-8 border-b border-cyan-50/50 flex items-center justify-between bg-gradient-to-r from-cyan-50/20 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-cyan-600 shadow-lg shadow-cyan-200">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Itinerary</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-full text-cyan-600 font-bold hover:bg-cyan-50" onClick={() => window.location.href = "/dashboard/student/classes"}>
                  Full Matrix
                </Button>
              </div>
              <div className="p-6">
                {scheduleItems.length > 0 ? (
                  <ScheduleList items={scheduleItems} />
                ) : (
                  <div className="py-20 text-center flex flex-col items-center">
                    <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6">
                      <Calendar className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="font-bold text-slate-400 italic">No scheduled streams for this orbital period.</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Academic Performance Snapshot */}
            <GlassCard>
              <div className="p-8 border-b border-cyan-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200 text-white">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Performance Vector</h2>
                </div>
                <Button variant="link" className="text-cyan-600 font-bold" onClick={() => window.location.href = "/dashboard/student/grades"}>
                  Deconstruct Grades <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="p-10">
                {grades.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                    {grades.map((grade) => (
                      <GradeCircle key={grade.subject} {...grade} />
                    ))}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 italic font-bold">
                    Awaiting term evaluations.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">

            {/* Quick Link/Help Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-[2rem] bg-cyan-600 text-white shadow-xl shadow-cyan-200 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                <LayoutDashboard className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black tracking-tight leading-tight">Need academic assistance?</h3>
                <p className="text-cyan-100 text-sm font-medium">Connect with faculty advisors or technical support directly from your portal.</p>
                <Button className="bg-white text-cyan-600 hover:bg-indigo-50 font-black rounded-xl h-10 px-6">
                  Get Help
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
