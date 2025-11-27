"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { academicService, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CalendarClock,
  FileText,
  GitBranch,
  TrendingUp,
  Clock,
  GraduationCap,
  CalendarRange,
} from "lucide-react";

interface DashboardStats {
  courses: number;
  classrooms: number;
  schedules: number;
  syllabus: number;
  programs: number;
  sessions: number;
}

export default function ProgramControllerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    courses: 0,
    classrooms: 0,
    schedules: 0,
    syllabus: 0,
    programs: 0,
    sessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [courses, classrooms, schedules, syllabus, programs, sessions] = await Promise.all([
        academicService.getAllCourses().catch(() => []),
        academicService.getAllClassrooms().catch(() => []),
        academicService.getAllSchedules().catch(() => []),
        academicService.getAllSyllabi().catch(() => []),
        academicService.getAllPrograms().catch(() => []),
        academicService.getAllSessions().catch(() => []),
      ]);

      setStats({
        courses: Array.isArray(courses) ? courses.length : 0,
        classrooms: Array.isArray(classrooms) ? classrooms.length : 0,
        schedules: Array.isArray(schedules) ? schedules.length : 0,
        syllabus: Array.isArray(syllabus) ? syllabus.length : 0,
        programs: Array.isArray(programs) ? programs.length : 0,
        sessions: Array.isArray(sessions) ? sessions.length : 0,
      });
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to load dashboard stats";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Programs",
      description: "Manage academic programs and degrees",
      icon: GraduationCap,
      href: "/dashboard/staff/program-controller/programs",
      count: stats.programs,
      color: "bg-indigo-500",
    },
    {
      title: "Sessions",
      description: "Manage academic sessions and years",
      icon: CalendarRange,
      href: "/dashboard/staff/program-controller/sessions",
      count: stats.sessions,
      color: "bg-teal-500",
    },
    {
      title: "Courses",
      description: "Manage courses, credits, and course types",
      icon: BookOpen,
      href: "/dashboard/staff/program-controller/courses",
      count: stats.courses,
      color: "bg-blue-500",
    },
    {
      title: "Classrooms",
      description: "Manage classroom resources and facilities",
      icon: Building2,
      href: "/dashboard/staff/program-controller/classrooms",
      count: stats.classrooms,
      color: "bg-green-500",
    },
    {
      title: "Schedules",
      description: "Create and manage course schedules",
      icon: CalendarClock,
      href: "/dashboard/staff/program-controller/schedules",
      count: stats.schedules,
      color: "bg-purple-500",
    },
    {
      title: "Syllabus",
      description: "Manage course syllabus and content",
      icon: FileText,
      href: "/dashboard/staff/program-controller/syllabus",
      count: stats.syllabus,
      color: "bg-orange-500",
    },
    {
      title: "Prerequisites",
      description: "Define course prerequisites",
      icon: GitBranch,
      href: "/dashboard/staff/program-controller/prerequisites",
      count: null,
      color: "bg-pink-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#344e41]">
            Program Controller Dashboard
          </h1>
          <p className="text-[#588157] mt-1">
            Manage academic courses, schedules, and resources for your
            department
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Programs</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {isLoading ? "..." : stats.programs}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sessions</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {isLoading ? "..." : stats.sessions}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <CalendarRange className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Courses</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {isLoading ? "..." : stats.courses}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Classrooms</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {isLoading ? "..." : stats.classrooms}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Schedules</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {isLoading ? "..." : stats.schedules}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <CalendarClock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Syllabus</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {isLoading ? "..." : stats.syllabus}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-[#344e41] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {action.title}
                        </CardTitle>
                        {action.count !== null && (
                          <span className="text-xs text-gray-500">
                            {action.count} items
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#588157]" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Course Management</p>
                  <p className="text-sm text-blue-700">
                    You can create, edit, and manage courses within your
                    department.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">
                    Classroom Resources
                  </p>
                  <p className="text-sm text-green-700">
                    Manage classroom facilities, capacities, and maintenance
                    status.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">
                    Syllabus Approval
                  </p>
                  <p className="text-sm text-orange-700">
                    Note: Syllabus approval and publishing requires admin
                    authorization.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
