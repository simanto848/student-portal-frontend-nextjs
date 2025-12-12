"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  FileText,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceService, Attendance } from "@/services/enrollment/attendance.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentAttendancesPage() {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  // New state for course selection
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const studentId = user.id || user._id;

        const enrollData = await enrollmentService.listEnrollments({ studentId });
        let enrols: any[] = [];
        if (Array.isArray(enrollData)) {
          enrols = enrollData;
        } else if (enrollData && Array.isArray((enrollData as any).enrollments)) {
          enrols = (enrollData as any).enrollments;
        } else if (enrollData && Array.isArray((enrollData as any).data)) {
          enrols = (enrollData as any).data;
        }

        setEnrollments(enrols);

        const semesterSet = new Set<number>();
        enrols.forEach((e: any) => semesterSet.add(e.semester));
        const sortedSemesters = Array.from(semesterSet).sort((a, b) => b - a);
        setSemesters(sortedSemesters);

        if (sortedSemesters.length > 0 && selectedSemester === 'all') {
          setSelectedSemester(sortedSemesters[0].toString());
        }

        const attData = await attendanceService.listAttendance({ studentId });
        let list: Attendance[] = [];
        if (Array.isArray(attData)) {
          list = attData;
        } else if (attData && Array.isArray((attData as any).attendance)) {
          list = (attData as any).attendance;
        } else if (attData && Array.isArray((attData as any).data)) {
          list = (attData as any).data;
        }

        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAttendanceList(list);

      } catch (err: any) {
        console.error("Failed to fetch data", err);
        setError("Failed to load attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Reset selected course when semester changes
  useEffect(() => {
    setSelectedCourseId(null);
  }, [selectedSemester]);

  const filteredEnrollments = selectedSemester === 'all'
    ? enrollments
    : enrollments.filter(e => e.semester.toString() === selectedSemester);

  const courseIdsInSemester = new Set(filteredEnrollments.map(e => e.courseId));

  const filteredAttendance = attendanceList.filter(a => {
    // 1. Filter by Semester
    if (selectedSemester !== 'all' && !courseIdsInSemester.has(a.courseId)) {
      return false;
    }
    // 2. Filter by Selected Course
    if (selectedCourseId && a.courseId !== selectedCourseId) {
      return false;
    }
    return true;
  });

  const courseStats = filteredEnrollments.map(enrol => {
    const courseAtt = attendanceList.filter(a => a.courseId === enrol.courseId);
    const total = courseAtt.length;
    const present = courseAtt.filter(a => a.status === 'present').length;
    const late = courseAtt.filter(a => a.status === 'late').length;
    const excused = courseAtt.filter(a => a.status === 'excused').length;
    const absent = courseAtt.filter(a => a.status === 'absent').length;

    const attended = present + late;
    const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      courseId: enrol.courseId,
      courseName: enrol.course?.name || 'Unknown Course',
      courseCode: enrol.course?.code || 'N/A',
      total,
      present,
      late,
      excused,
      absent,
      percent,
      hasClasses: total > 0
    };
  });


  // Calculate Stats for Overview (Filtered)
  const total = filteredAttendance.length;
  const present = filteredAttendance.filter(a => a.status === 'present').length;
  const absent = filteredAttendance.filter(a => a.status === 'absent').length;
  const late = filteredAttendance.filter(a => a.status === 'late').length;
  const excused = filteredAttendance.filter(a => a.status === 'excused').length;
  const attendedCount = present + late;
  const overall = total > 0 ? Math.round((attendedCount / total) * 100) : 100;

  const statusColors: Record<string, string> = {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-yellow-100 text-yellow-800",
    excused: "bg-blue-100 text-blue-700",
  };

  // Find selected course name for display title
  const selectedCourseName = selectedCourseId
    ? courseStats.find(c => c.courseId === selectedCourseId)?.courseName
    : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[300px] w-full lg:col-span-2" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Attendance Overview
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Stay consistent. Keep your attendance strong.
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {/* Semester Selector */}
                <div className="w-[180px]">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map(sem => (
                        <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[220px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Overall Attendance {selectedSemester !== 'all' ? `(Sem ${selectedSemester})` : ''}
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">
                  {overall}%
                </span>
                <span className="text-sm text-white/70">attendance</span>
              </div>
              <Progress
                value={overall}
                className="mt-3 bg-white/20"
              />
              <p className="text-[11px] text-white/70 mt-2">
                Attended {attendedCount} / {total}{" "}
                sessions
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Course-wise Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courseStats.map(course => (
            <Card
              key={course.courseId}
              className={`border-none shadow-sm hover:shadow-md transition-all cursor-pointer ${selectedCourseId === course.courseId ? 'ring-2 ring-[#3e6253] bg-gray-50' : ''}`}
              onClick={() => setSelectedCourseId(selectedCourseId === course.courseId ? null : course.courseId)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-[#1a3d32] line-clamp-1" title={course.courseName}>
                      {course.courseName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{course.courseCode}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${course.percent >= 85 ? 'bg-green-100 text-green-700' :
                    course.percent >= 75 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {course.hasClasses ? `${course.percent}%` : 'N/A'}
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
                {selectedCourseId === course.courseId && (
                  <p className="text-xs text-[#3e6253] mt-2 font-medium text-center">
                    Showing details below ▼
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {courseStats.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No courses found {selectedSemester !== 'all' ? 'for this semester' : ''}.
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-none shadow-sm lg:col-span-2 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#3e6253]" />
                {selectedCourseName ? `History: ${selectedCourseName}` : `Recent History ${selectedSemester !== 'all' ? `(Sem ${selectedSemester})` : ''}`}
              </CardTitle>
              {selectedCourseId && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCourseId(null)} className="text-xs h-7">
                  Clear Filter
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredAttendance.map((row) => {
                // Try to find course details from enrollments if not in row
                const enrolledCourse = enrollments.find(e => e.courseId === row.courseId)?.course;
                const courseCode = (row.course as any)?.code || enrolledCourse?.code || 'N/A';
                const courseName = (row.course as any)?.name || enrolledCourse?.name || 'Unknown Course';

                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-2 md:grid-cols-4 items-center gap-2 rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#1a3d32]">
                        {courseCode}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {courseName}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(row.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[row.status]
                          }`}
                      >
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">{row.remarks || '-'}</div>
                  </div>
                );
              })}
              {filteredAttendance.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No attendance records found for this selection.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#1a3d32]">
                Breakdown {selectedCourseName ? `(${selectedCourseName})` : (selectedSemester !== 'all' ? `(Sem ${selectedSemester})` : '')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Present</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {present}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Absent</span>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  {absent}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Late</span>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  {late}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Excused</span>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {excused}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
