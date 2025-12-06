"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  batchCourseInstructorService,
  BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import {
  enrollmentService,
  Enrollment,
} from "@/services/enrollment/enrollment.service";
import {
  attendanceService,
  Attendance,
} from "@/services/enrollment/attendance.service";
import { studentService } from "@/services/user/student.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface AttendanceState {
  [studentId: string]: {
    status: "present" | "absent" | "late" | "excused";
    remarks: string;
  };
}

export default function AttendancePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<BatchCourseInstructor[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    searchParams.get("courseId") ? "" : ""
  );
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user?.id]);

  useEffect(() => {
    const paramCourseId = searchParams.get("courseId");
    const paramBatchId = searchParams.get("batchId");

    if (courses.length > 0 && paramCourseId && paramBatchId) {
      const match = courses.find(
        (c) => c.courseId === paramCourseId && c.batchId === paramBatchId
      );
      if (match) {
        setSelectedAssignmentId(match.id);
      }
    }
  }, [courses, searchParams]);

  useEffect(() => {
    if (selectedAssignmentId && date) {
      fetchClassData();
    } else {
      setStudents([]);
    }
  }, [selectedAssignmentId, date]);

  const fetchCourses = async () => {
    try {
      const data = await batchCourseInstructorService.getInstructorCourses(
        user!.id
      );
      setCourses(data);
    } catch (error) {
      console.error("Fetch courses error:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const assignment = courses.find((c) => c.id === selectedAssignmentId);
      if (!assignment) return;

      const enrollmentsResponse = await enrollmentService.listEnrollments({
        batchId: assignment.batchId,
        courseId: assignment.courseId,
        limit: 100,
      });
      let enrolledStudents = enrollmentsResponse.enrollments || [];

      const studentsWithDetails = await Promise.all(
        enrolledStudents.map(async (enrollment) => {
          if (!enrollment.student) {
            try {
              const studentDetails = await studentService.getById(
                enrollment.studentId
              );
              return {
                ...enrollment,
                student: studentDetails,
              };
            } catch (error) {
              console.error(
                `Failed to fetch student ${enrollment.studentId}:`,
                error
              );
              return enrollment;
            }
          }
          return enrollment;
        })
      );
      enrolledStudents = studentsWithDetails;
      setStudents(enrolledStudents);

      const startDateTime = new Date(date);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(date);
      endDateTime.setHours(23, 59, 59, 999);

      const attendanceResponse: any = await attendanceService.listAttendance({
        batchId: assignment.batchId,
        courseId: assignment.courseId,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      });
      const existingAttendance = Array.isArray(attendanceResponse) ? attendanceResponse : (attendanceResponse.attendance || []);

      const initialState: AttendanceState = {};
      enrolledStudents.forEach((student) => {
        const record = existingAttendance.find(
          (a: { studentId: string; }) => a.studentId === student.studentId
        );
        initialState[student.studentId] = {
          status: record ? record.status : "present",
          remarks: record ? record.remarks || "" : "",
        };
      });
      setAttendanceState(initialState);
    } catch (error) {
      console.error("Fetch class data error:", error);
      toast.error("Failed to load student list");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    studentId: string,
    status: "present" | "absent" | "late" | "excused"
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

      await attendanceService.bulkMarkAttendance(payload);
      toast.success("Attendance saved successfully");
    } catch (error) {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">
            Mark and view attendance for your classes
          </p>
        </div>

        <Card>
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
                Please select a class to mark attendance.
              </div>
            ) : loading ? (
              <div className="text-center py-10">Loading class list...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No students enrolled in this class.
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
                      {students.map((student) => {
                        const state = attendanceState[student.studentId] || {
                          status: "present",
                          remarks: "",
                        };
                        return (
                          <TableRow key={student.studentId}>
                            <TableCell className="font-medium">
                              {student.student?.registrationNumber}
                            </TableCell>
                            <TableCell>{student.student?.fullName}</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant={
                                    state.status === "present" ? "default" : "outline"
                                  }
                                  className={
                                    state.status === "present" ? "bg-green-600 hover:bg-green-700" : ""
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      student.studentId,
                                      "present"
                                    )
                                  }
                                  title="Present"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    state.status === "absent" ? "destructive" : "outline"
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      student.studentId,
                                      "absent"
                                    )
                                  }
                                  title="Absent"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    state.status === "late" ? "secondary" : "outline"
                                  }
                                  className={
                                    state.status === "late" ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      student.studentId,
                                      "late"
                                    )
                                  }
                                  title="Late"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    state.status === "excused" ? "secondary" : "outline"
                                  }
                                  className={
                                    state.status === "excused" ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      student.studentId,
                                      "excused"
                                    )
                                  }
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
                                onChange={(e) =>
                                  handleRemarksChange(
                                    student.studentId,
                                    e.target.value
                                  )
                                }
                                className="h-8 md:w-48"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
