"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { attendanceService, Attendance } from "@/services/enrollment/attendance.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { Loader2, Filter, X, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [selectedCourse, selectedBatch, selectedDate, selectedStatus]);

    const fetchInitialData = async () => {
        try {
            const [coursesData, batchesData] = await Promise.all([
                courseService.getAllCourses(),
                batchService.getAllBatches()
            ]);
            setCourses(coursesData || []);
            setBatches(batchesData || []);
        } catch (error) {
            toast.error("Failed to load filter data");
        }
    };

    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedCourse) params.courseId = selectedCourse;
            if (selectedBatch) params.batchId = selectedBatch;
            if (selectedDate) {
                params.startDate = new Date(selectedDate).toISOString();
                params.endDate = new Date(selectedDate).toISOString();
            }
            if (selectedStatus) params.status = selectedStatus;

            const data = await attendanceService.listAttendance(params);
            setAttendance(Array.isArray(data) ? data : (data as any).attendance || []);
        } catch (error) {
            toast.error("Failed to load attendance records");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        try {
            await attendanceService.deleteAttendance(id);
            toast.success("Attendance record deleted");
            fetchAttendance();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete record");
        }
    };

    const clearFilters = () => {
        setSelectedCourse("");
        setSelectedBatch("");
        setSelectedDate("");
        setSelectedStatus("");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return <Badge className="bg-green-600">Present</Badge>;
            case 'absent': return <Badge variant="destructive">Absent</Badge>;
            case 'late': return <Badge className="bg-yellow-600">Late</Badge>;
            case 'excused': return <Badge className="bg-blue-600">Excused</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Attendance</h2>
                        <p className="text-muted-foreground">Manage student attendance records.</p>
                    </div>
                    <Link href="/dashboard/admin/enrollment/attendance/create">
                        <Button className="bg-[#3e6253] hover:bg-[#2c463b]">
                            <Plus className="mr-2 h-4 w-4" /> Mark Attendance
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <SearchableSelect
                                options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="Filter by Course"
                            />
                            <SearchableSelect
                                options={batches.map(b => ({ label: b.name, value: b.id }))}
                                value={selectedBatch}
                                onChange={setSelectedBatch}
                                placeholder="Filter by Batch"
                            />
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                placeholder="Filter by Date"
                            />
                            <SearchableSelect
                                options={[
                                    { label: "Present", value: "present" },
                                    { label: "Absent", value: "absent" },
                                    { label: "Late", value: "late" },
                                    { label: "Excused", value: "excused" }
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                placeholder="Filter by Status"
                            />
                        </div>
                        {(selectedCourse || selectedBatch || selectedDate || selectedStatus) && (
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                    <X className="mr-2 h-4 w-4" /> Clear Filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#344e41]" />
                                        </TableCell>
                                    </TableRow>
                                ) : attendance.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No attendance records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    attendance.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">
                                                {record.student?.fullName}
                                                <div className="text-xs text-muted-foreground">{record.student?.studentId}</div>
                                            </TableCell>
                                            <TableCell>{record.course?.name || "-"}</TableCell>
                                            <TableCell>{record.batch?.name || "-"}</TableCell>
                                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={record.remarks}>
                                                {record.remarks || "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/dashboard/admin/enrollment/attendance/${record.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(record.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
