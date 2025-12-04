"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";
import { Loader2, Plus, Search, Filter, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EnrollmentsPage() {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchEnrollments();
    }, [statusFilter]);

    const fetchEnrollments = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;
            // Add other filters as needed

            const data = await enrollmentService.listEnrollments(params);
            setEnrollments(data.enrollments || []);
        } catch (error) {
            toast.error("Failed to fetch enrollments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this enrollment?")) return;
        try {
            await enrollmentService.deleteEnrollment(id);
            toast.success("Enrollment deleted");
            fetchEnrollments();
        } catch (error) {
            toast.error("Failed to delete enrollment");
        }
    };

    const filteredEnrollments = enrollments.filter(enrollment =>
        enrollment.student?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        enrollment.course?.name?.toLowerCase().includes(search.toLowerCase()) ||
        enrollment.batch?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Enrollments</h1>
                        <p className="text-muted-foreground">Manage student enrollments</p>
                    </div>
                    <Button className="bg-[#3e6253] hover:bg-[#2c463b]">
                        <Plus className="mr-2 h-4 w-4" />
                        Enroll Student
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student, course, or batch..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                                        <TableHead>Student</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Enrolled Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEnrollments.length > 0 ? (
                                        filteredEnrollments.map((enrollment) => (
                                            <TableRow key={enrollment.id}>
                                                <TableCell className="font-medium">
                                                    <div>{enrollment.student?.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{enrollment.student?.registrationNumber}</div>
                                                </TableCell>
                                                <TableCell>{enrollment.course?.name} ({enrollment.course?.code})</TableCell>
                                                <TableCell>{enrollment.batch?.name}</TableCell>
                                                <TableCell>{enrollment.semester}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${enrollment.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                                                            enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                enrollment.status === 'dropped' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                        }`}>
                                                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{format(new Date(enrollment.enrollmentDate), "MMM d, yyyy")}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(enrollment.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No enrollments found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
