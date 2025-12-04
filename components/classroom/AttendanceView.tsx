"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { attendanceService, Attendance } from "@/services/enrollment/attendance.service";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";
import { Loader2, Save, Calendar as CalendarIcon, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AttendanceViewProps {
    courseId: string;
    batchId: string;
}

export function AttendanceView({ courseId, batchId }: AttendanceViewProps) {
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [courseId, batchId, date]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch enrolled students
            // Ideally, we should have a method to get students for a batch/course directly or use the workspace data
            // For now, let's list enrollments for this batch/course
            const enrollmentsData = await enrollmentService.listEnrollments({ batchId, courseId, status: 'enrolled' });
            const enrolledStudents = enrollmentsData.enrollments.map(e => e.student);
            setStudents(enrolledStudents);

            // Fetch existing attendance for the date
            const attendanceData = await attendanceService.listAttendance({ batchId, courseId, date });
            const attendanceMap: Record<string, string> = {};
            attendanceData.attendance.forEach(a => {
                attendanceMap[a.studentId] = a.status;
            });

            // If no attendance exists, default to 'present' or empty? Let's keep it empty to force marking
            // Or pre-fill with 'present' if it's a new day? Let's leave it empty for explicit marking.
            setAttendance(attendanceMap);

        } catch (error) {
            toast.error("Failed to fetch attendance data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const attendances = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status: status as 'present' | 'absent' | 'late' | 'excused'
            }));

            await attendanceService.bulkMarkAttendance({
                courseId,
                batchId,
                date,
                attendances
            });

            toast.success("Attendance saved successfully");
        } catch (error) {
            toast.error("Failed to save attendance");
        } finally {
            setIsSaving(false);
        }
    };

    const markAll = (status: string) => {
        const newAttendance: Record<string, string> = {};
        students.forEach(s => {
            newAttendance[s.id] = status;
        });
        setAttendance(newAttendance);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Mark Attendance</CardTitle>
                        <div className="flex items-center gap-4">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-40"
                            />
                            <Button onClick={handleSave} disabled={isSaving || students.length === 0} className="bg-[#3e6253] hover:bg-[#2c463b]">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Attendance
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => markAll('present')}>Mark All Present</Button>
                                <Button variant="outline" size="sm" onClick={() => markAll('absent')}>Mark All Absent</Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Registration No.</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.length > 0 ? (
                                        students.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.fullName}</TableCell>
                                                <TableCell>{student.registrationNumber}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={attendance[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'present')}
                                                        >
                                                            P
                                                        </Button>
                                                        <Button
                                                            variant={attendance[student.id] === 'absent' ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={attendance[student.id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'absent')}
                                                        >
                                                            A
                                                        </Button>
                                                        <Button
                                                            variant={attendance[student.id] === 'late' ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={attendance[student.id] === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'late')}
                                                        >
                                                            L
                                                        </Button>
                                                        <Button
                                                            variant={attendance[student.id] === 'excused' ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={attendance[student.id] === 'excused' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                                            onClick={() => handleStatusChange(student.id, 'excused')}
                                                        >
                                                            E
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No students enrolled in this course batch.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
