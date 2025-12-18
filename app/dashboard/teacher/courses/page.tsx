"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  AlertCircle,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherCourseDashboard } from "@/hooks/queries/useTeacherQueries";
import { useRouter } from "next/navigation";

export default function MyCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const instructorId = user?.id || user?._id || "";
  const [searchQuery, setSearchQuery] = useState("");

  // Use React Query hook for courses with stats
  const { courses, isLoading, isError, error, refetch } =
    useTeacherCourseDashboard(instructorId);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.course?.name?.toLowerCase().includes(query) ||
        c.course?.code?.toLowerCase().includes(query) ||
        c.batch?.name?.toLowerCase().includes(query),
    );
  }, [courses, searchQuery]);

  // Calculate total students across all courses
  const totalStudents = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
  }, [courses]);

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-cards" cardCount={6} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={BookOpen}
          label="Course Management"
          title="My Courses"
          description="Manage your assigned courses and batches"
          actions={
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 bg-accent hover:bg-white hover:text-accent hover:cursor-pointer"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          }
          stats={{
            label: "Total Courses",
            value: courses.length.toString(),
            subtext: "assigned",
          }}
        >
          <p className="text-[11px] text-white/70 mt-2">
            {totalStudents} students across all courses
          </p>
        </DashboardHero>

        {/* Error Alert */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load courses."}
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((assignment) => (
              <CourseCard
                key={assignment.id}
                assignment={assignment}
                onViewClass={() =>
                  router.push(`/dashboard/teacher/courses/${assignment.id}`)
                }
                onViewAttendance={() =>
                  router.push(
                    `/dashboard/teacher/attendance?courseId=${assignment.courseId}&batchId=${assignment.batchId}`,
                  )
                }
                onViewGrades={() =>
                  router.push(
                    `/dashboard/teacher/grading?courseId=${assignment.courseId}`,
                  )
                }
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                {searchQuery
                  ? "No Courses Match Your Search"
                  : "No Courses Found"}
              </h3>
              <p className="text-sm text-center max-w-md mt-1">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "You are not assigned to any courses currently."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Course Card sub-component
interface CourseCardProps {
  assignment: {
    id: string;
    courseId: string;
    batchId: string;
    semester?: number;
    course?: {
      code?: string;
      name?: string;
    };
    batch?: {
      name?: string;
      currentStudents?: number;
    };
    studentsCount?: number;
    attendanceCount?: number;
    assessmentsCount?: number;
  };
  onViewClass: () => void;
  onViewAttendance: () => void;
  onViewGrades: () => void;
}

function CourseCard({
  assignment,
  onViewClass,
  onViewAttendance,
  onViewGrades,
}: CourseCardProps) {
  return (
    <Card className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow pt-0">
      <CardHeader className="bg-[#f8f9fa] border-b pt-4">
        <div className="flex justify-between items-start">
          <div className="pt-2">
            <p className="text-sm font-medium text-[#588157]">
              {assignment.course?.code || "N/A"}
            </p>
            <CardTitle
              className="text-xl font-bold dashboard-title mt-1 line-clamp-2"
              title={assignment.course?.name}
            >
              {assignment.course?.name || "Unknown Course"}
            </CardTitle>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#dad7cd] flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-[#3a5a40]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>{assignment.batch?.name || "Batch"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Semester {assignment.semester || "1"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 col-span-2">
            <GraduationCap className="h-4 w-4" />
            <span>{assignment.studentsCount || 0} Students</span>
          </div>
        </div>
        <div className="pt-2 border-t space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Attendance Records</span>
            <span className="font-semibold text-[#3a5a40]">
              {assignment.attendanceCount || 0}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Assessments</span>
            <span className="font-semibold text-[#3a5a40]">
              {assignment.assessmentsCount || 0}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t bg-gray-50/50 gap-2">
        <Button
          className="flex-1 bg-[#3a5a40] hover:bg-[#344e41] text-white hover:cursor-pointer"
          onClick={onViewClass}
        >
          View Class
        </Button>
        <Button
          variant="outline"
          className="px-3 hover:text-white"
          title="Attendance"
          onClick={onViewAttendance}
        >
          <ClipboardList className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="px-3 hover:text-white"
          title="Grades"
          onClick={onViewGrades}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
