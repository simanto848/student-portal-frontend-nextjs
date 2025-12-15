"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useStudentAttendance,
  useEnrollments,
} from "@/hooks/queries/useEnrollmentQueries";
import { Attendance } from "@/services/enrollment/attendance.service";
import { Enrollment } from "@/services/enrollment/enrollment.service";

export default function StudentAttendancesPage() {
  const { user } = useAuth();
  const studentId = user?.id || user?._id || "";

  // State for filters - track previous semester to detect changes
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Use React Query hooks for data fetching
  const {
    data: attendanceList = [],
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useStudentAttendance(studentId);

  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useEnrollments({ studentId });

  const isLoading = attendanceLoading || enrollmentsLoading;
  const error = attendanceError ? "Failed to load attendance data." : null;

  // Extract unique semesters from enrollments
  const semesters = useMemo(() => {
    const semesterSet = new Set<number>();
    enrollments.forEach((e) => semesterSet.add(e.semester));
    return Array.from(semesterSet).sort((a, b) => b - a);
  }, [enrollments]);

  // Compute the effective semester (default to first semester if not selected)
  const effectiveSemester = useMemo(() => {
    if (selectedSemester !== null) return selectedSemester;
    if (semesters.length > 0) return semesters[0].toString();
    return "all";
  }, [selectedSemester, semesters]);

  // Handle semester change - reset course selection
  const handleSemesterChange = (newSemester: string) => {
    setSelectedSemester(newSemester);
    setSelectedCourseId(null);
  };

  // Filtered enrollments based on semester
  const filteredEnrollments = useMemo(() => {
    return effectiveSemester === "all"
      ? enrollments
      : enrollments.filter((e) => e.semester.toString() === effectiveSemester);
  }, [enrollments, effectiveSemester]);

  // Course IDs in the selected semester
  const courseIdsInSemester = useMemo(() => {
    return new Set(filteredEnrollments.map((e) => e.courseId));
  }, [filteredEnrollments]);

  // Sorted attendance list
  const sortedAttendance = useMemo(() => {
    return [...attendanceList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [attendanceList]);

  // Filtered attendance based on semester and course
  const filteredAttendance = useMemo(() => {
    return sortedAttendance.filter((a) => {
      if (effectiveSemester !== "all" && !courseIdsInSemester.has(a.courseId)) {
        return false;
      }
      if (selectedCourseId && a.courseId !== selectedCourseId) {
        return false;
      }
      return true;
    });
  }, [
    sortedAttendance,
    effectiveSemester,
    courseIdsInSemester,
    selectedCourseId,
  ]);

  // Course-wise statistics
  const courseStats = useMemo(() => {
    return filteredEnrollments.map((enrol) => {
      const courseAtt = attendanceList.filter(
        (a) => a.courseId === enrol.courseId,
      );
      const total = courseAtt.length;
      const present = courseAtt.filter((a) => a.status === "present").length;
      const late = courseAtt.filter((a) => a.status === "late").length;
      const excused = courseAtt.filter((a) => a.status === "excused").length;
      const absent = courseAtt.filter((a) => a.status === "absent").length;

      const attended = present + late;
      const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

      return {
        courseId: enrol.courseId,
        courseName: enrol.course?.name || "Unknown Course",
        courseCode: enrol.course?.code || "N/A",
        total,
        present,
        late,
        excused,
        absent,
        percent,
        hasClasses: total > 0,
      };
    });
  }, [filteredEnrollments, attendanceList]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(
      (a) => a.status === "present",
    ).length;
    const absent = filteredAttendance.filter(
      (a) => a.status === "absent",
    ).length;
    const late = filteredAttendance.filter((a) => a.status === "late").length;
    const excused = filteredAttendance.filter(
      (a) => a.status === "excused",
    ).length;
    const attendedCount = present + late;
    const overall = total > 0 ? Math.round((attendedCount / total) * 100) : 100;

    return { total, present, absent, late, excused, attendedCount, overall };
  }, [filteredAttendance]);

  // Selected course name for display
  const selectedCourseName = selectedCourseId
    ? courseStats.find((c) => c.courseId === selectedCourseId)?.courseName
    : null;

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-grid" />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={CalendarDays}
          label="Attendance Overview"
          title="Stay consistent. Keep your attendance strong."
          stats={{
            label: `Overall Attendance ${effectiveSemester !== "all" ? `(Sem ${effectiveSemester})` : ""}`,
            value: `${stats.overall}%`,
            subtext: "attendance",
            progress: stats.overall,
            progressMax: 100,
          }}
        >
          {/* Semester Selector */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="w-[180px]">
              <Select
                value={effectiveSemester}
                onValueChange={handleSemesterChange}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-white/70 mt-2">
            Attended {stats.attendedCount} / {stats.total} sessions
          </p>
        </DashboardHero>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Course-wise Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courseStats.map((course) => (
            <CourseAttendanceCard
              key={course.courseId}
              course={course}
              isSelected={selectedCourseId === course.courseId}
              onSelect={() =>
                setSelectedCourseId(
                  selectedCourseId === course.courseId ? null : course.courseId,
                )
              }
            />
          ))}
          {courseStats.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No courses found{" "}
              {effectiveSemester !== "all" ? "for this semester" : ""}.
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Attendance History */}
          <Card className="border-none shadow-sm lg:col-span-2 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                <FileText className="h-4 w-4 dashboard-accent" />
                {selectedCourseName
                  ? `History: ${selectedCourseName}`
                  : `Recent History ${effectiveSemester !== "all" ? `(Sem ${effectiveSemester})` : ""}`}
              </CardTitle>
              {selectedCourseId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCourseId(null)}
                  className="text-xs h-7"
                >
                  Clear Filter
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredAttendance.map((row) => (
                <AttendanceRow
                  key={row.id}
                  attendance={row}
                  enrollments={enrollments}
                />
              ))}
              {filteredAttendance.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No attendance records found for this selection.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Breakdown Card */}
          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold dashboard-title">
                Breakdown{" "}
                {selectedCourseName
                  ? `(${selectedCourseName})`
                  : effectiveSemester !== "all"
                    ? `(Sem ${effectiveSemester})`
                    : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Present</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {stats.present}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Absent</span>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  {stats.absent}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Late</span>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  {stats.late}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Excused</span>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {stats.excused}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Course Attendance Card sub-component
interface CourseStats {
  courseId: string;
  courseName: string;
  courseCode: string;
  total: number;
  present: number;
  late: number;
  percent: number;
  hasClasses: boolean;
}

function CourseAttendanceCard({
  course,
  isSelected,
  onSelect,
}: {
  course: CourseStats;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getPercentageColor = (percent: number) => {
    if (percent >= 85) return "bg-green-100 text-green-700";
    if (percent >= 75) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <Card
      className={`border-none shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isSelected ? "ring-2 ring-[#3e6253] bg-gray-50" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle
              className="text-base font-bold dashboard-title line-clamp-1"
              title={course.courseName}
            >
              {course.courseName}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{course.courseCode}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-bold ${getPercentageColor(course.percent)}`}
          >
            {course.hasClasses ? `${course.percent}%` : "N/A"}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={course.percent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Present: {course.present + course.late}</span>
            <span>Total: {course.total}</span>
          </div>
        </div>
        {isSelected && (
          <p className="text-xs text-[#3e6253] mt-2 font-medium text-center">
            Showing details below ▼
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Attendance Row sub-component
function AttendanceRow({
  attendance,
  enrollments,
}: {
  attendance: Attendance;
  enrollments: Enrollment[];
}) {
  const enrolledCourse = enrollments.find(
    (e) => e.courseId === attendance.courseId,
  )?.course;

  const courseCode =
    (attendance.course as { code?: string })?.code ||
    enrolledCourse?.code ||
    "N/A";
  const courseName =
    (attendance.course as { name?: string })?.name ||
    enrolledCourse?.name ||
    "Unknown Course";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-2 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200">
      <div className="flex flex-col">
        <span className="text-sm font-semibold dashboard-title">
          {courseCode}
        </span>
        <span className="text-xs text-muted-foreground">{courseName}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {new Date(attendance.date).toLocaleDateString()}
      </div>
      <div>
        <StatusBadge status={attendance.status} />
      </div>
      <div className="text-sm text-muted-foreground">
        {attendance.remarks || "-"}
      </div>
    </div>
  );
}
