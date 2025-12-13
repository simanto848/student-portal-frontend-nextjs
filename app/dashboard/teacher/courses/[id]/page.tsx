"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  batchCourseInstructorService,
  BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import {
  enrollmentService,
  Enrollment,
} from "@/services/enrollment/enrollment.service";
import { scheduleService } from "@/services/academic/schedule.service";
import { CourseSchedule } from "@/services/academic/types";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { assessmentService } from "@/services/enrollment/assessment.service";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  ArrowLeft,
  Clock,
} from "lucide-react";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<BatchCourseInstructor | null>(
    null
  );
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [stats, setStats] = useState({
    attendanceCount: 0,
    assessmentsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const assignmentData = await batchCourseInstructorService.getAssignment(
        id as string
      );
      setAssignment(assignmentData);

      // Fetch related data in parallel
      const [studentsData, schedulesData, attendanceRes, assessmentsRes] =
        await Promise.all([
          enrollmentService.listEnrollments({
            batchId: assignmentData.batchId,
            courseId: assignmentData.courseId,
            semester: assignmentData.semester,
          }),
          scheduleService.getScheduleByBatch(assignmentData.batchId),
          attendanceService.listAttendance({
            courseId: assignmentData.courseId,
            batchId: assignmentData.batchId,
            limit: 1,
          }),
          assessmentService.list({
            courseId: assignmentData.courseId,
            batchId: assignmentData.batchId,
            limit: 1,
          }),
        ]);

      setStudents(studentsData.enrollments || []);
      // Filter schedules for this specific course
      const courseSchedules = schedulesData.filter((s: CourseSchedule) => {
        const sessionCourse =
          typeof s.sessionCourseId === "object" ? s.sessionCourseId : null;
        const course =
          sessionCourse && typeof sessionCourse.course === "object"
            ? sessionCourse.course
            : null;
        return course && course.id === assignmentData.courseId;
      });
      setSchedules(courseSchedules);
      setStats({
        attendanceCount: attendanceRes.pagination?.total || 0,
        assessmentsCount: assessmentsRes.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Fetch course details error:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  if (!assignment)
    return (
      <DashboardLayout>
        <div>Course not found</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
              {assignment.course?.name}
            </h1>
            <p className="text-muted-foreground">
              {assignment.course?.code} • {assignment.batch?.name} • Semester{" "}
              {assignment.semester}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Course Code
                    </h3>
                    <p className="text-base">{assignment.course?.code}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Credits
                    </h3>
                    <p className="text-base">
                      {assignment.course?.credit || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Type
                    </h3>
                    <Badge variant="outline" className="capitalize">
                      {assignment.course?.courseType || "N/A"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600">
                      {assignment.course?.description ||
                        "No description available."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {schedules.length > 0 ? (
                    schedules.map((schedule) => {
                      const roomNumber =
                        typeof schedule.classroom === "object"
                          ? schedule.classroom?.roomNumber
                          : undefined;
                      return (
                        <div
                          key={schedule.id}
                          className="p-3 rounded-lg border bg-gray-50/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-[#3a5a40]" />
                            <span className="font-semibold text-sm">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {schedule.daysOfWeek?.map((day, index) => (
                              <Badge
                                key={`${schedule.id}-${day}-${index}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {day}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Room: {roomNumber || "TBD"} • {schedule.classType}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No schedule available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50">
                      <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">
                        {students.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">
                        {stats.attendanceCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Attendance Records
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-amber-50">
                      <BookOpen className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                      <p className="text-2xl font-bold text-amber-600">
                        {stats.assessmentsCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assessments
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-50">
                      <GraduationCap className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-600">
                        {assignment.semester}
                      </p>
                      <p className="text-xs text-muted-foreground">Semester</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow key="no-students">
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          No students enrolled.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.student?.registrationNumber}
                          </TableCell>
                          <TableCell>{enrollment.student?.fullName}</TableCell>
                          <TableCell className="capitalize">
                            {enrollment.status}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Mark Attendance</h3>
                  <p className="text-muted-foreground text-sm">
                    Record attendance for today&apos;s class.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/teacher/attendance?courseId=${assignment.courseId}&batchId=${assignment.batchId}`
                    )
                  }
                >
                  Go to Attendance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Management</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Input Grades</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage student grades and assessments.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/teacher/grading?courseId=${assignment.courseId}&batchId=${assignment.batchId}`
                    )
                  }
                >
                  Go to Gradebook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
