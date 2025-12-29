"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScheduleList } from "@/components/dashboard/widgets/ScheduleList";
import { GradeCircle } from "@/components/dashboard/widgets/GradeCircle";
import { LibraryList } from "@/components/dashboard/widgets/LibraryList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Megaphone,
  Calendar,
  CreditCard,
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { courseGradeService } from "@/services/enrollment/courseGrade.service";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { borrowingService } from "@/services/library/borrowing.service";
import { notificationService } from "@/services/notification/notification.service";
import { scheduleService } from "@/services/academic/schedule.service";
import { Skeleton } from "@/components/ui/skeleton";

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

      // Fetch all data in parallel
      const [cgpaRes, gradeRes, attRes, borrowedRes, notifRes] =
        await Promise.all([
          courseGradeService
            .calculateCGPA(studentId)
            .catch(() => ({ cgpa: 0 })),
          courseGradeService.list({ studentId }).catch(() => []),
          attendanceService.listAttendance({ studentId }).catch(() => []),
          borrowingService.getMyBorrowedBooks().catch(() => []),
          notificationService.list().catch(() => []),
        ]);

      // Set CGPA
      if (cgpaRes && typeof cgpaRes.cgpa === "number") {
        setCgpa(cgpaRes.cgpa);
      }

      // Process grades
      let gradesList: any[] = Array.isArray(gradeRes)
        ? gradeRes
        : (gradeRes as any)?.grades || (gradeRes as any)?.data || [];

      // Get current semester grades
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
          color: "#3e6253",
        }))
      );

      // Calculate total credits
      const totalCreds = gradesList.reduce(
        (acc, g) => acc + ((g.course as any)?.credit || 0),
        0
      );
      setCredits(totalCreds);

      // Process attendance
      let attList: any[] = Array.isArray(attRes)
        ? attRes
        : (attRes as any)?.attendance || (attRes as any)?.data || [];

      const total = attList.length;
      const present = attList.filter((a) => a.status === "present").length;
      const late = attList.filter((a) => a.status === "late").length;
      const attPercent =
        total > 0 ? Math.round(((present + late) / total) * 100) : 100;
      setAttendance(attPercent);

      // Process library items
      let borrowedList: any[] = Array.isArray(borrowedRes) ? borrowedRes : [];
      setLibraryItems(
        borrowedList.slice(0, 3).map((item) => {
          const bookDetails = item.copy?.book;
          const dueDate = new Date(item.dueDate);
          const today = new Date();
          const daysLeft = Math.ceil(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: item.id,
            title: bookDetails?.title || "Unknown Book",
            dueDate:
              daysLeft < 0
                ? `${Math.abs(daysLeft)} days overdue`
                : `${daysLeft} days`,
            status:
              daysLeft < 0
                ? ("overdue" as const)
                : daysLeft <= 3
                  ? ("due_soon" as const)
                  : ("normal" as const),
          };
        })
      );

      // Process notifications
      let notifList: any[] = Array.isArray(notifRes)
        ? notifRes
        : (notifRes as any)?.notifications || (notifRes as any)?.data || [];

      setNotifications(
        notifList.slice(0, 3).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: new Date(n.createdAt || n.publishedAt).toLocaleDateString(),
          icon: n.type === "alert" ? Megaphone : Calendar,
        }))
      );

      // Fetch schedule if batch is available
      let batchId: string | undefined;
      if ('batchId' in user && typeof user.batchId === "string") {
        batchId = user.batchId;
      } else if ('batchId' in user && user.batchId && typeof user.batchId === "object") {
        batchId = (user.batchId as any).id || (user.batchId as any)._id;
      }

      if (batchId) {
        const scheduleData = await scheduleService
          .getScheduleByBatch(batchId)
          .catch(() => []);

        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const today = days[new Date().getDay()];

        const todaySchedule = scheduleData
          .filter((s) => s.daysOfWeek.includes(today as any))
          .slice(0, 3)
          .map((s) => {
            const course =
              typeof s.sessionCourseId === "object" &&
                "course" in s.sessionCourseId
                ? (s.sessionCourseId as any).course
                : null;
            const room =
              typeof s.classroomId === "object"
                ? (s.classroomId as any)?.roomNumber
                : "TBA";

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
    {
      label: "Overall GPA",
      value: cgpa.toFixed(2),
      trend: cgpa >= 3.5 ? "+Good" : "Improve",
      detail: "Cumulative",
      accent: "from-[#3e6253] to-[#7ca38b]",
    },
    {
      label: "Credits Completed",
      value: credits.toString(),
      trend: `${credits} earned`,
      detail: "Total credits",
      accent: "from-[#2d6a4f] to-[#52b788]",
    },
    {
      label: "Attendance",
      value: `${attendance}%`,
      trend: attendance >= 75 ? "Good" : "Low",
      detail: "Current term",
      accent: "from-[#31536d] to-[#5fa8d3]",
    },
  ];

  // Quick Access Cards
  const quickAccessCards = [
    {
      label: "Classrooms",
      description: "Access your course materials",
      icon: BookOpen,
      href: "/dashboard/student/classroom",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Grades",
      description: "View your academic performance",
      icon: FileText,
      href: "/dashboard/student/grades",
      color: "from-green-500 to-green-600",
    },
    {
      label: "Attendance",
      description: "Check your attendance records",
      icon: ClipboardCheck,
      href: "/dashboard/student/attendances",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Library",
      description: "Manage borrowed books",
      icon: Library,
      href: "/dashboard/student/library",
      color: "from-orange-500 to-orange-600",
    },
    {
      label: "Schedule",
      description: "View your class timetable",
      icon: CalendarDays,
      href: "/dashboard/student/classes",
      color: "from-pink-500 to-pink-600",
    },
    {
      label: "Assessments",
      description: "Manage assignments & exams",
      icon: CheckCircle,
      href: "/dashboard/student/assessments",
      color: "from-teal-500 to-teal-600",
    },
    {
      label: "Enrollments",
      description: "View enrolled courses",
      icon: GraduationCap,
      href: "/dashboard/student/enrollments",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Profile",
      description: "Manage your profile",
      icon: User,
      href: "/dashboard/student/profile",
      color: "from-red-500 to-red-600",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-[300px] w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-12">
            <Skeleton className="h-[400px] lg:col-span-8" />
            <Skeleton className="h-[400px] lg:col-span-4" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Daily Snapshot
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Hi {user?.fullName?.split(" ")[0] || "Student"}, let&apos;s
                crush today.
              </h1>
              <p className="text-white/80 max-w-2xl">
                Stay on top of your classes, grades, and deadlines with a quick
                glance. Everything you need for the day is right here.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-[360px]">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl bg-linear-to-r ${stat.accent} text-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <p className="text-xs uppercase tracking-wide text-white/80">
                    {stat.label}
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-xs font-semibold text-white/80">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-1">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {quickAccessCards.map((card) => (
            <Card
              key={card.label}
              className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => (window.location.href = card.href)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div
                  className={`rounded-xl bg-gradient-to-r ${card.color} p-3 text-white group-hover:scale-110 transition-transform`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {card.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            {scheduleItems.length > 0 && (
              <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#3e6253]" /> Today&apos;s
                    Schedule
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent>
                  <ScheduleList items={scheduleItems} />
                </CardContent>
              </Card>
            )}

            {grades.length > 0 && (
              <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#3e6253]" /> Grade
                    Snapshot
                  </CardTitle>
                  <Button
                    variant="link"
                    className="text-[#3e6253] font-semibold"
                    onClick={() =>
                      (window.location.href = "/dashboard/student/grades")
                    }
                  >
                    View Details
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {grades.map((grade) => (
                      <GradeCircle key={grade.subject} {...grade} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            {notifications.length > 0 && (
              <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#3e6253]" />
                    Notifications
                  </CardTitle>
                  <Button
                    variant="link"
                    className="text-xs text-muted-foreground"
                    onClick={() =>
                    (window.location.href =
                      "/dashboard/student/notifications")
                    }
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex gap-3 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                      onClick={() =>
                      (window.location.href =
                        "/dashboard/student/notifications")
                      }
                    >
                      <notif.icon className="h-5 w-5 text-[#3e6253] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#1a3d32] text-sm">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {libraryItems.length > 0 && (
              <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                    <Library className="h-4 w-4 text-[#3e6253]" />
                    Library Due Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LibraryList items={libraryItems} />
                  <Button
                    variant="link"
                    className="text-[#3e6253] font-semibold w-full mt-2"
                    onClick={() =>
                      (window.location.href = "/dashboard/student/library")
                    }
                  >
                    View All Books
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
