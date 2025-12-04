"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { Loader2, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface StudentAttendanceViewProps {
    courseId: string;
    batchId: string;
    studentId: string;
}

export function StudentAttendanceView({ courseId, batchId, studentId }: StudentAttendanceViewProps) {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [courseId, batchId, studentId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch attendance history
            // We might need a specific endpoint for student's own attendance or filter the list
            // Assuming listAttendance can filter by studentId
            const data = await attendanceService.listAttendance({ courseId, batchId, studentId });
            setAttendance(data.attendance || []);

            // Calculate stats locally if not provided by API
            const total = data.attendance.length;
            const present = data.attendance.filter((a: any) => a.status === 'present').length;
            const absent = data.attendance.filter((a: any) => a.status === 'absent').length;
            const late = data.attendance.filter((a: any) => a.status === 'late').length;
            const excused = data.attendance.filter((a: any) => a.status === 'excused').length;

            setStats({
                total,
                present,
                absent,
                late,
                excused,
                percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0
            });

        } catch (error) {
            toast.error("Failed to fetch attendance data");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'late': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'excused': return <AlertCircle className="h-4 w-4 text-blue-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'text-green-700 bg-green-50';
            case 'absent': return 'text-red-700 bg-red-50';
            case 'late': return 'text-yellow-700 bg-yellow-50';
            case 'excused': return 'text-blue-700 bg-blue-50';
            default: return 'text-gray-700 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.percentage}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.present + stats.late} present out of {stats.total} classes
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Present</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.present}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Absent</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.absent}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Late/Excused</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.late + stats.excused}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendance.length > 0 ? (
                                    attendance.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>{format(new Date(record.date), "MMMM d, yyyy")}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                            No attendance records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
