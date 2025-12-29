"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Loader2, Save, ArrowLeft, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function CreateAttendancePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingStudents, setIsFetchingStudents] = useState(false);

    // Form Data
    const [courseId, setCourseId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendances, setAttendances] = useState<any[]>([]);

    // Dropdown Data
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (courseId && batchId) {
            fetchEnrolledStudents();
        } else {
            setAttendances([]);
        }
    }, [courseId, batchId]);

    const fetchDropdownData = async () => {
        try {
            const [coursesData, batchesData] = await Promise.all([
                courseService.getAllCourses(),
                batchService.getAllBatches()
            ]);
            setCourses(coursesData || []);
            setBatches(batchesData || []);
        } catch (error) {
            toast.error("Failed to load form data");
        }
    };

    const fetchEnrolledStudents = async () => {
        setIsFetchingStudents(true);
        try {
            const data = await enrollmentService.listEnrollments({ courseId, batchId, status: 'active' });
            const enrollments = Array.isArray(data) ? data : (data as any).enrollments || [];

            const initialAttendances = enrollments.map((enrollment: any) => ({
                studentId: enrollment.studentId,
                studentName: enrollment.student?.fullName || "Unknown Student",
                registrationNumber: enrollment.student?.registrationNumber || "-",
                status: 'present',
                remarks: ""
            }));

            setAttendances(initialAttendances);
        } catch (error) {
            toast.error("Failed to load students");
            setAttendances([]);
        } finally {
            setIsFetchingStudents(false);
        }
    };

    const handleStatusChange = (index: number, status: string) => {
        const newAttendances = [...attendances];
        newAttendances[index].status = status;
        setAttendances(newAttendances);
    };

    const handleRemarksChange = (index: number, remarks: string) => {
        const newAttendances = [...attendances];
        newAttendances[index].remarks = remarks;
        setAttendances(newAttendances);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !batchId || !date) {
            toast.error("Please fill all required fields");
            return;
        }
        if (attendances.length === 0) {
            toast.error("No students to mark attendance for");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                courseId,
                batchId,
                date: new Date(date).toISOString(),
                attendances: attendances.map(a => ({
                    studentId: a.studentId,
                    status: a.status,
                    remarks: a.remarks
                }))
            };

            await attendanceService.bulkMarkAttendance(payload as any);
            toast.success("Attendance marked successfully");
            router.push("/dashboard/admin/enrollment/attendance");
        } catch (error: any) {
            toast.error(error.message || "Failed to mark attendance");
        } finally {
            setIsLoading(false);
        }
    };

    const markAll = (status: string) => {
        const newAttendances = attendances.map(a => ({ ...a, status }));
        setAttendances(newAttendances);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Mark Attendance</h2>
                        <p className="text-muted-foreground">Record attendance for a batch.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Session Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                    value={courseId}
                                    onChange={setCourseId}
                                    placeholder="Select Course"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="batch">Batch <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={batches.map(b => ({ label: b.name, value: b.id }))}
                                    value={batchId}
                                    onChange={setBatchId}
                                    placeholder="Select Batch"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isFetchingStudents ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>
                ) : attendances.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Student List ({attendances.length})</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => markAll('present')}>Mark All Present</Button>
                                <Button variant="outline" size="sm" onClick={() => markAll('absent')}>Mark All Absent</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <form onSubmit={handleSubmit}>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Student ID</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendances.map((item, index) => (
                                            <TableRow key={item.studentId}>
                                                <TableCell className="font-medium">{item.studentName}</TableCell>
                                                <TableCell>{item.registrationNumber}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {['present', 'absent', 'late', 'excused'].map((status) => (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                onClick={() => handleStatusChange(index, status)}
                                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${item.status === status
                                                                    ? status === 'present' ? 'bg-green-100 text-green-700 border-green-200'
                                                                        : status === 'absent' ? 'bg-red-100 text-red-700 border-red-200'
                                                                            : status === 'late' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                                                : 'bg-blue-100 text-blue-700 border-blue-200'
                                                                    : 'bg-transparent text-muted-foreground border-transparent hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={item.remarks}
                                                        onChange={(e) => handleRemarksChange(index, e.target.value)}
                                                        placeholder="Optional remarks"
                                                        className="max-w-[200px]"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-end p-6 bg-slate-50 border-t">
                                    <Button type="button" variant="outline" className="mr-4" onClick={() => router.back()}>Cancel</Button>
                                    <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" /> Save Attendance
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
