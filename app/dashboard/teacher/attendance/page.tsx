"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendanceManagement } from "@/hooks/queries/useTeacherQueries";
import {
  enrollmentService,
  Enrollment,
} from "@/services/enrollment/enrollment.service";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { studentService } from "@/services/user/student.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import { format } from "date-fns";
import {
  Check,
  X,
  Clock,
  AlertCircle,
  CalendarDays,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface AttendanceState {
  [studentId: string]: {
    status: "present" | "absent" | "late" | "excused";
    remarks: string;
  };
}

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function AttendanceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const instructorId = user?.id || user?._id || "";

  // Use React Query hook for courses
  const { courses, isLoading: coursesLoading } =
    useAttendanceManagement(instructorId);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle URL params for course/batch selection
  useEffect(() => {
    const paramCourseId = searchParams.get("courseId");
    const paramBatchId = searchParams.get("batchId");

    if (courses.length > 0 && paramCourseId && paramBatchId) {
      const match = courses.find(
        (c) => c.courseId === paramCourseId && c.batchId === paramBatchId,
      );
      if (match) {
        setSelectedAssignmentId(match.id);
      }
    }
  }, [courses, searchParams]);

  // Fetch class data function wrapped in useCallback
  const fetchClassData = useCallback(async () => {
    setLoadingStudents(true);
    setError(null);
    try {
      const assignment = courses.find((c) => c.id === selectedAssignmentId);
      if (!assignment) return;

      // Fetch enrolled students
      const enrollmentsResponse = await enrollmentService.listEnrollments({
        batchId: assignment.batchId,
        courseId: assignment.courseId,
        limit: 100,
      });
      let enrolledStudents = enrollmentsResponse.enrollments || [];

      // Enrich students with details
      const studentsWithDetails = await Promise.all(
        enrolledStudents.map(async (enrollment) => {
          if (!enrollment.student) {
            try {
              const studentDetails = await studentService.getById(
                enrollment.studentId,
              );
              return {
                ...enrollment,
                student: studentDetails,
              };
            } catch (error) {
              console.error(
                `Failed to fetch student ${enrollment.studentId}:`,
                error,
              );
              return enrollment;
            }
          }
          return enrollment;
        }),
      );
      enrolledStudents = studentsWithDetails;
      setStudents(enrolledStudents);

      // Fetch existing attendance for the date
      const startDateTime = new Date(date);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(date);
      endDateTime.setHours(23, 59, 59, 999);

      const attendanceResponse = await attendanceService.listAttendance({
        batchId: assignment.batchId,
        courseId: assignment.courseId,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      });
      const existingAttendance = Array.isArray(attendanceResponse)
        ? attendanceResponse
        : (
          attendanceResponse as {
            attendance?: {
              studentId: string;
              status: "present" | "absent" | "late" | "excused";
              remarks?: string;
            }[];
          }
        ).attendance || [];

      // Initialize attendance state
      const initialState: AttendanceState = {};
      enrolledStudents.forEach((student) => {
        const record = existingAttendance.find(
          (a: { studentId: string }) => a.studentId === student.studentId,
        );
        initialState[student.studentId] = {
          status: record ? record.status : "present",
          remarks: record ? record.remarks || "" : "",
        };
      });
      setAttendanceState(initialState);
    } catch (error) {
      console.error("Fetch class data error:", error);
      const message = getErrorMessage(error, "Failed to load student list");
      setError(message);
      notifyError(message);
    } finally {
      setLoadingStudents(false);
    }
  }, [courses, selectedAssignmentId, date]);

  // Fetch students and attendance when course/date changes
  useEffect(() => {
    if (selectedAssignmentId && date) {
      fetchClassData();
    } else {
      setStudents([]);
      setAttendanceState({});
    }
  }, [selectedAssignmentId, date, fetchClassData]);

  const handleStatusChange = (
    studentId: string,
    status: "present" | "absent" | "late" | "excused",
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleSubmit = async () => {
    const assignment = courses.find((c) => c.id === selectedAssignmentId);
    if (!assignment) return;

    setSaving(true);
    try {
      const isoDate = new Date(date).toISOString().split("T")[0] + "T00:00:00Z";

      const payload = {
        courseId: assignment.courseId,
        batchId: assignment.batchId,
        date: isoDate,
        attendances: students.map((student) => ({
          studentId: student.studentId,
          status: attendanceState[student.studentId].status,
          remarks: attendanceState[student.studentId].remarks,
        })),
      };

      const res = await attendanceService.bulkMarkAttendance(payload);
      const message = getSuccessMessage(res, "Attendance saved successfully");
      notifySuccess(message);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to save attendance");
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate attendance summary
  const attendanceSummary = useMemo(() => {
    const total = students.length;
    const present = Object.values(attendanceState).filter(
      (s) => s.status === "present",
    ).length;
    const absent = Object.values(attendanceState).filter(
      (s) => s.status === "absent",
    ).length;
    const late = Object.values(attendanceState).filter(
      (s) => s.status === "late",
    ).length;
    const excused = Object.values(attendanceState).filter(
      (s) => s.status === "excused",
    ).length;

    return { total, present, absent, late, excused };
  }, [students, attendanceState]);

  // Get selected course name for display
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedAssignmentId),
    [courses, selectedAssignmentId],
  );
  const selectedCourseName = selectedCourse
    ? `${selectedCourse.course?.code} - ${selectedCourse.course?.name}`
    : "";

  // Loading state using DashboardSkeleton
  if (coursesLoading) {
    return <DashboardSkeleton layout="hero-table" rowCount={8} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={ClipboardCheck}
          label="Attendance Management"
          title="Mark and view attendance for your classes"
          description={
            selectedCourseName
              ? `Currently viewing: ${selectedCourseName}`
              : "Select a class to begin marking attendance"
          }
          stats={
            selectedAssignmentId && students.length > 0
              ? {
                label: "Present Today",
                value: `${attendanceSummary.present}/${attendanceSummary.total}`,
                subtext: "students",
                progress: attendanceSummary.present,
                progressMax: attendanceSummary.total || 1,
              }
              : undefined
          }
        >
          {selectedAssignmentId && students.length > 0 && (
            <div className="flex gap-4 mt-2 text-xs text-white/70">
              <span>Present: {attendanceSummary.present}</span>
              <span>Absent: {attendanceSummary.absent}</span>
              <span>Late: {attendanceSummary.late}</span>
              <span>Excused: {attendanceSummary.excused}</span>
            </div>
          )}
        </DashboardHero>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-[#f8f9fa]">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Select Class
                </label>
                <Select
                  value={selectedAssignmentId}
                  onValueChange={setSelectedAssignmentId}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.course?.code} - {course.course?.name} (
                        {course.batch?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!selectedAssignmentId ? (
              <div className="text-center py-10 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Please select a class to mark attendance.</p>
              </div>
            ) : loadingStudents ? (
              <div className="text-center py-10">Loading class list...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No students enrolled in this class.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Registration No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <AttendanceRow
                          key={student.studentId}
                          student={student}
                          state={
                            attendanceState[student.studentId] || {
                              status: "present",
                              remarks: "",
                            }
                          }
                          onStatusChange={(status) =>
                            handleStatusChange(student.studentId, status)
                          }
                          onRemarksChange={(remarks) =>
                            handleRemarksChange(student.studentId, remarks)
                          }
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    size="lg"
                    className="bg-[#1a3d32] hover:bg-[#142e26]"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Attendance"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <DashboardSkeleton layout="hero-table" rowCount={8} />
      </DashboardLayout>
    }>
      <AttendanceContent />
    </Suspense>
  );
}

// Attendance Row sub-component
interface AttendanceRowProps {
  student: Enrollment;
  state: { status: "present" | "absent" | "late" | "excused"; remarks: string };
  onStatusChange: (status: "present" | "absent" | "late" | "excused") => void;
  onRemarksChange: (remarks: string) => void;
}

function AttendanceRow({
  student,
  state,
  onStatusChange,
  onRemarksChange,
}: AttendanceRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {student.student?.registrationNumber || "N/A"}
      </TableCell>
      <TableCell>{student.student?.fullName || "Unknown"}</TableCell>
      <TableCell>
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant={state.status === "present" ? "default" : "outline"}
            className={
              state.status === "present"
                ? "bg-green-600 hover:bg-green-700"
                : ""
            }
            onClick={() => onStatusChange("present")}
            title="Present"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={state.status === "absent" ? "destructive" : "outline"}
            onClick={() => onStatusChange("absent")}
            title="Absent"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={state.status === "late" ? "secondary" : "outline"}
            className={
              state.status === "late"
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : ""
            }
            onClick={() => onStatusChange("late")}
            title="Late"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={state.status === "excused" ? "secondary" : "outline"}
            className={
              state.status === "excused"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : ""
            }
            onClick={() => onStatusChange("excused")}
            title="Excused"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Input
          placeholder="Optional remarks"
          value={state.remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          className="h-8 md:w-48"
        />
      </TableCell>
    </TableRow>
  );
}
