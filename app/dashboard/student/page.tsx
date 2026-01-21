"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { courseGradeService } from "@/services/enrollment/courseGrade.service";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { borrowingService } from "@/services/library/borrowing.service";
import { scheduleService } from "@/services/academic/schedule.service";
import { notificationService } from "@/services/notification/notification.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { batchService } from "@/services/academic/batch.service";
import { NotificationDropdown } from "@/components/dashboard/notifications/NotificationDropdown";
import { useNotificationStats } from "@/hooks/queries/useNotificationQueries";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

interface CourseProgress {
  id: string;
  name: string;
  code: string;
  professor: string;
  progress: number;
  grade: string;
  color: string;
  icon: "science" | "functions" | "palette";
}

interface TaskItem {
  id: string;
  title: string;
  time: string;
  location?: string;
  priority?: "high" | "normal";
  completed: boolean;
  dotColor: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cgpa, setCgpa] = useState<number>(0);
  const [attendance, setAttendance] = useState<number>(0);
  const [credits, setCredits] = useState<number>(0);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const { stats } = useNotificationStats();
  const notificationCount = stats?.unread || 0;

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const studentId = user.id || (user as any)._id;
      if (!studentId) return;

      const [cgpaRes, gradeRes, attRes, borrowedRes, notifRes] = await Promise.all([
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

      // Calculate total credits
      const totalCreds = gradesList.reduce((acc, g) => acc + ((g.course as any)?.credit || 0), 0);
      setCredits(totalCreds);

      // Identify Batch ID
      let batchId: string | undefined;
      if ("batchId" in user && typeof user.batchId === "string") {
        batchId = user.batchId;
      } else if ("batchId" in user && user.batchId && typeof user.batchId === "object") {
        batchId = (user.batchId as any).id || (user.batchId as any)._id;
      }

      let mappedCourses: CourseProgress[] = [];

      if (batchId) {
        // Fetch Batch Details to get Current Semester
        const batchDetails = await batchService.getBatchById(batchId).catch(() => null);
        const currentSemester = batchDetails?.currentSemester || 1;

        // Fetch Session Courses for this Batch and Semester
        const semesterCourses = await enrollmentService.getBatchSemesterCourses(batchId, currentSemester).catch(() => []);

        const courseIcons: ("science" | "functions" | "palette")[] = ["science", "functions", "palette"];
        const colors = ["pink", "yellow", "indigo", "emerald", "blue", "purple"];

        mappedCourses = semesterCourses.map((semCourse: any, idx: number) => {
          const course = semCourse.course;
          const gradeInfo = gradesList.find(g => (g.course as any)?.id === course?.id || g.courseId === course?.id);

          return {
            id: semCourse.id || idx.toString(),
            name: course?.name || "Term Course",
            code: course?.code || "N/A",
            professor: semCourse.instructor?.fullName || course?.instructor?.fullName || "Faculty Advisor",
            progress: gradeInfo?.totalMarks > 0 ? Math.round((gradeInfo.totalMarksObtained / gradeInfo.totalMarks) * 100) : 0,
            grade: gradeInfo?.grade || "N/A",
            color: colors[idx % colors.length],
            icon: courseIcons[idx % courseIcons.length],
          };
        });
      }

      setCourses(mappedCourses);

      let attList: any[] = Array.isArray(attRes)
        ? attRes
        : (attRes as any)?.attendance || (attRes as any)?.data || [];

      const total = attList.length;
      const present = attList.filter((a) => a.status === "present").length;
      const late = attList.filter((a) => a.status === "late").length;
      const attPercent = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
      setAttendance(attPercent);

      // Notifications (Wait for hook to handle count/list if needed elsewhere, 
      // but we still need to know if we should show 'X new updates' in header)

      // Tasks from Schedule and Library
      const taskItems: TaskItem[] = [];

      // Schedule Logic
      if (batchId) {
        const scheduleData = await scheduleService.getScheduleByBatch(batchId).catch(() => []);
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = dayNames[new Date().getDay()];

        const todaySchedule = Array.isArray(scheduleData)
          ? scheduleData.filter((s: any) => s.daysOfWeek.includes(todayName))
          : [];

        todaySchedule.slice(0, 3).forEach((s: any, idx: number) => {
          const course = typeof s.sessionCourseId === "object" && "courseId" in s.sessionCourseId ? (s.sessionCourseId as any).courseId : s.course;
          taskItems.push({
            id: `schedule-${idx}`,
            title: course?.name || "Class Session",
            time: s.startTime || "09:00 AM",
            location: typeof s.classroomId === "object" ? (s.classroomId as any)?.roomNumber : "TBA",
            completed: false,
            dotColor: "bg-blue-400",
          });
        });
      }

      // Library Logic
      let borrowedList: any[] = Array.isArray(borrowedRes) ? borrowedRes : [];
      borrowedList.slice(0, 2).forEach((item, idx) => {
        const bookDetails = item.copy?.book;
        const dueDate = new Date(item.dueDate);
        taskItems.push({
          id: `book-${idx}`,
          title: `Return: ${bookDetails?.title || "Library Book"}`,
          time: dueDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          priority: "high",
          completed: false,
          dotColor: "bg-red-400",
        });
      });

      // Fill with demo tasks if still low
      if (taskItems.length < 3) {
        taskItems.push(
          { id: "task-demo-1", title: "Review Lecture Notes", time: "05:00 PM", completed: false, dotColor: "bg-purple-400" }
        );
      }

      setTasks(taskItems.slice(0, 6));
      setCheckedTasks(new Set());
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { border: string; bg: string; text: string; progress: string }> = {
      pink: { border: "border-t-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", progress: "bg-pink-500" },
      yellow: { border: "border-t-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", progress: "bg-yellow-500" },
      indigo: { border: "border-t-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", progress: "bg-indigo-500" },
      emerald: { border: "border-t-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", progress: "bg-emerald-500" },
      blue: { border: "border-t-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", progress: "bg-blue-500" },
      purple: { border: "border-t-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", progress: "bg-purple-500" },
    };
    return colorMap[color] || colorMap.indigo;
  };

  const getCourseIcon = (icon: string) => {
    switch (icon) {
      case "science": return "science";
      case "functions": return "functions";
      case "palette": return "palette";
      default: return "menu_book";
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#0088A9]" />
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const displayCourses = courses;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex gap-4 h-full pb-4"
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-4 py-6 glass-panel rounded-[2rem] border border-white/40">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Welcome back, <span className="text-[#0088A9]">{user?.fullName?.split(" ")[0] || "Student"}</span>
              </h1>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-1">
              <span className="text-[#0088A9] font-black">Dhaka Internation University Student Portal</span>: You have <span className="text-[#0088A9] font-black">{tasks.filter(t => t.id.startsWith('schedule')).length} sessions</span> today and <span className="text-[#0088A9] font-black">{notificationCount} new</span> updates to review.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
          </div>
        </motion.header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pr-2">
          {/* Stats Section */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Performance Vector Chart */}
            <div className="xl:col-span-2 glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group min-h-[300px] flex flex-col cursor-pointer border border-white/50 shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#0088A9]/15 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-[#0088A9]/25 transition-all duration-1000" />
              <div className="flex justify-between items-start mb-10 z-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">Performance Vector</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide leading-relaxed">Real-time academic analysis</p>
                </div>
                <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-full px-5 py-2 border border-white/20 shadow-sm">
                  <span className="text-[11px] font-black text-[#0088A9] uppercase tracking-widest">Live Data</span>
                </div>
              </div>
              <div className="flex-1 w-full relative flex items-end">
                <svg className="w-full h-56 drop-shadow-[0_15px_15px_rgba(0,136,169,0.2)]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                  <defs>
                    <linearGradient id="gradientPrimary" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#0088A9", stopOpacity: 0.5 }} />
                      <stop offset="100%" style={{ stopColor: "#0088A9", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,192C672,181,768,139,864,133.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    fill="url(#gradientPrimary)"
                    className="transition-all duration-1000"
                  />
                  <path
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,192C672,181,768,139,864,133.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128"
                    fill="none"
                    stroke="#0088A9"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Floating Indicators */}
                <div className="absolute top-1/4 left-1/4 h-4 w-4 bg-white dark:bg-gray-800 rounded-full shadow-[0_0_20px_rgba(0,136,169,0.5)] border-2 border-[#0088A9] animate-float z-20" />
                <div className="absolute top-1/3 left-2/3 h-4 w-4 bg-white dark:bg-gray-800 rounded-full shadow-[0_0_20px_rgba(0,136,169,0.5)] border-2 border-[#0088A9] animate-float z-20" style={{ animationDelay: "2s" }} />
              </div>
            </div>

            {/* GPA & Attendance Cards */}
            <div className="flex flex-col gap-8 h-full">
              <motion.div variants={itemVariants} className="clay-card flex-1 p-8 relative flex flex-col justify-center cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98] border border-white/40">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-blue-900/40 text-[#0088A9] shadow-sm border border-white/40">
                    <span className="material-icons-outlined text-2xl font-bold">rocket_launch</span>
                  </div>
                  <span className="text-green-500 text-sm font-black tracking-tight">{credits} Credits</span>
                </div>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mt-2 tracking-tighter">{cgpa.toFixed(2)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-1 opacity-70">Overall GPA</p>
              </motion.div>

              <motion.div variants={itemVariants} className="clay-card flex-1 p-8 relative flex flex-col justify-center cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98] border border-white/40">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 shadow-sm border border-white/40">
                    <span className="material-icons-outlined text-2xl font-bold">fact_check</span>
                  </div>
                  <div className="bg-green-100/60 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-sm border border-green-200/40">
                    {attendance >= 85 ? "Excellent" : "Regular"}
                  </div>
                </div>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mt-2 tracking-tighter">{attendance}%</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-1 opacity-70">Academic Presence</p>
              </motion.div>
            </div>
          </motion.section>

          {/* Course Progress Section */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Course Progress</h3>
              <Link href="/dashboard/student/grades" className="text-sm font-black text-[#0088A9] hover:text-[#0088A9]/80 transition-colors flex items-center group cursor-pointer tracking-wide">
                View All Courses <span className="material-icons-outlined text-lg ml-1 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </Link>
            </div>
            <div className={`grid grid-cols-1 ${displayCourses.length > 2 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-8`}>
              {displayCourses.length > 0 ? (
                displayCourses.map((course) => {
                  const colors = getColorClasses(course.color);
                  const IconComponent = getCourseIcon(course.icon);
                  return (
                    <motion.div
                      key={course.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`glass-panel p-8 rounded-[3rem] border border-white/60 shadow-xl group relative overflow-hidden transition-all hover:shadow-2xl ${colors.border}`}
                    >
                      <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity ${colors.text}`}>
                        <span className="material-icons-outlined h-20 w-20">{IconComponent}</span>
                      </div>

                      <div className="flex flex-col h-full relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className={`p-4 rounded-[1.5rem] bg-gradient-to-br ${colors.bg} ${colors.text} shadow-lg ring-4 ring-white`}>
                            <span className="material-icons-outlined h-8 w-8">{IconComponent}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${colors.text} opacity-70 mb-1`}>Status</span>
                            <span className="text-[11px] font-bold text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 uppercase tracking-tighter">
                              {course.grade === "N/A" ? "Ongoing" : "Completed"}
                            </span>
                          </div>
                        </div>

                        <div className="mb-8">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-[#0088A9] transition-colors">{course.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{course.code}</span>
                            <span className="text-[11px] font-bold text-gray-500 line-clamp-1">{course.professor}</span>
                          </div>
                        </div>

                        <div className="mt-auto space-y-4">
                          <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-1">Performance Index</span>
                              <span className="text-2xl font-black text-gray-900 tracking-tighter">{course.progress}%</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-1">Grade</span>
                              <span className={`text-2xl font-black tracking-tighter ${colors.text}`}>{course.grade}</span>
                            </div>
                          </div>

                          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-gray-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full rounded-full shadow-sm bg-gradient-to-r ${colors.progress}`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center glass-panel rounded-[3rem] border border-dashed border-gray-300">
                  <div className="p-6 rounded-[2rem] bg-gray-50 text-gray-300 mb-4">
                    <span className="material-icons-outlined text-5xl">auto_stories</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">No Active Courses</h3>
                  <p className="text-sm font-medium text-gray-400 text-center max-w-xs uppercase tracking-tighter leading-relaxed">
                    We couldn't find any session courses mapped to your batch for this semester.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      {/* Right Sidebar - Daily Itinerary & Help */}
      <aside className="w-96 glass-inner border-l border-white/20 hidden xl:flex flex-col h-full overflow-hidden flex-shrink-0 z-30">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-icons-outlined text-[#0088A9] text-3xl">event_note</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Daily Schedule</h3>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest font-black">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {tasks.map((task: TaskItem) => (
            <motion.div
              key={task.id}
              variants={itemVariants}
              whileHover={{ x: 5 }}
              className={`glass-panel p-6 rounded-[2rem] border border-white/40 shadow-md group hover:shadow-lg transition-all border-l-4 ${checkedTasks.has(task.id) ? 'border-l-gray-300 opacity-60' : 'border-l-[#0088A9]/40'}`}
            >
              <div className="flex items-start gap-4">
                <label className="checkbox-wrapper relative flex items-center cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checkedTasks.has(task.id)}
                    onChange={() => toggleTask(task.id)}
                  />
                  <div className="w-6 h-6 border-2 border-[#0088A9]/30 rounded-lg flex items-center justify-center transition-all peer-checked:bg-[#0088A9] peer-checked:border-[#0088A9] shadow-inner bg-white/40 dark:bg-black/20">
                    <span className="material-icons-outlined text-white text-base hidden peer-checked:block">check</span>
                  </div>
                </label>
                <div className="flex-1">
                  <h4 className={`font-black text-gray-900 dark:text-white tracking-tight mb-1 group-hover:text-[#0088A9] transition-colors ${checkedTasks.has(task.id) ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {task.time}
                    </span>
                    {task.location && (
                      <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {task.location}
                      </span>
                    )}
                  </div>
                  {task.priority === "high" && !checkedTasks.has(task.id) && (
                    <span className="inline-block mt-3 px-3 py-1 bg-orange-100/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-orange-200/50">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Academic Help Promo */}
        <div className="p-8">
          <div className="relative group overflow-hidden bg-gradient-to-br from-[#0088A9] to-[#00b4d8] rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/30">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md shadow-xl border border-white/30">
                <span className="material-icons-outlined text-3xl">psychology</span>
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">Academic Help?</h3>
              <p className="text-white/80 text-xs mb-8 leading-relaxed font-medium px-2">
                Connect with faculty advisors or technical support instantly.
              </p>
              <button className="w-full bg-white text-[#0088A9] py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 border-b-4 border-gray-200">
                Connect Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </motion.div>
  );
}
