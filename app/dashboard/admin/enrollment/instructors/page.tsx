"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { Loader2, Plus, Search, Filter, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InstructorsPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<BatchCourseInstructor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchAssignments();
    }, [statusFilter]);

    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;

            const data = await batchCourseInstructorService.listAssignments(params);
            setAssignments(data.assignments || []);
        } catch (error) {
            toast.error("Failed to fetch instructor assignments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this instructor assignment?")) return;
        try {
            await batchCourseInstructorService.deleteAssignment(id);
            toast.success("Instructor removed");
            fetchAssignments();
        } catch (error) {
            toast.error("Failed to remove instructor");
        }
    };

    const filteredAssignments = assignments.filter(assignment =>
        assignment.instructor?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        assignment.course?.name?.toLowerCase().includes(search.toLowerCase()) ||
        assignment.batch?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Instructors</h1>
                        <p className="text-muted-foreground">Manage course instructor assignments</p>
                    </div>
                    <Button className="bg-[#3e6253] hover:bg-[#2c463b]">
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Instructor
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by instructor, course, or batch..."
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
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
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
                                        <TableHead>Instructor</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAssignments.length > 0 ? (
                                        filteredAssignments.map((assignment) => (
                                            <TableRow key={assignment.id}>
                                                <TableCell className="font-medium">
                                                    <div>{assignment.instructor?.fullName}</div>
                                                    <div className="text-xs text-muted-foreground">{assignment.instructor?.email}</div>
                                                </TableCell>
                                                <TableCell>{assignment.course?.name} ({assignment.course?.code})</TableCell>
                                                <TableCell>{assignment.batch?.name}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{format(new Date(assignment.assignedAt), "MMM d, yyyy")}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(assignment.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No instructor assignments found
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
