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
import { teacherService } from "@/services/teacher.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { Loader2, Plus, Search, Filter, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InstructorsPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<BatchCourseInstructor[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;

            const [assignmentsData, teachersData, coursesData, batchesData] = await Promise.all([
                batchCourseInstructorService.listAssignments(params),
                teacherService.getAllTeachers(),
                courseService.getAllCourses(),
                batchService.getAllBatches()
            ]);

            // Handle response structure where data might be nested
            setAssignments(Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.assignments || []);
            setTeachers(teachersData || []);
            setCourses(coursesData || []);
            setBatches(batchesData || []);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this instructor assignment?")) return;
        try {
            await batchCourseInstructorService.deleteAssignment(id);
            toast.success("Instructor removed");
            fetchData();
        } catch (error) {
            toast.error("Failed to remove instructor");
        }
    };

    const getTeacherName = (id: string) => {
        const teacher = teachers.find(t => t.id === id);
        return teacher ? teacher.fullName : "Unknown Instructor";
    };

    const getTeacherEmail = (id: string) => {
        const teacher = teachers.find(t => t.id === id);
        return teacher ? teacher.email : "";
    };

    const getCourseName = (id: string) => {
        const course = courses.find(c => c.id === id);
        return course ? `${course.name} (${course.code})` : "Unknown Course";
    };

    const getBatchName = (id: string) => {
        const batch = batches.find(b => b.id === id);
        return batch ? batch.name : "Unknown Batch";
    };

    const filteredAssignments = assignments.filter(assignment => {
        const teacherName = getTeacherName(assignment.instructorId).toLowerCase();
        const courseName = getCourseName(assignment.courseId).toLowerCase();
        const batchName = getBatchName(assignment.batchId).toLowerCase();
        const searchLower = search.toLowerCase();

        return teacherName.includes(searchLower) ||
            courseName.includes(searchLower) ||
            batchName.includes(searchLower);
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Instructors</h1>
                        <p className="text-muted-foreground">Manage course instructor assignments</p>
                    </div>
                    <Button className="bg-[#3e6253] hover:bg-[#2c463b]" onClick={() => router.push("/dashboard/admin/enrollment/instructors/create")}>
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
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="reassigned">Reassigned</SelectItem>
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
                                        <TableHead>Semester</TableHead>
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
                                                    <div>{getTeacherName(assignment.instructorId)}</div>
                                                    <div className="text-xs text-muted-foreground">{getTeacherEmail(assignment.instructorId)}</div>
                                                </TableCell>
                                                <TableCell>{getCourseName(assignment.courseId)}</TableCell>
                                                <TableCell>{getBatchName(assignment.batchId)}</TableCell>
                                                <TableCell>Semester {assignment.semester}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            assignment.status === 'reassigned' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{assignment.assignedDate ? format(new Date(assignment.assignedDate), "MMM d, yyyy") : "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/admin/enrollment/instructors/${assignment.id}`)}>
                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/admin/enrollment/instructors/${assignment.id}/edit`)}>
                                                        <Edit className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(assignment.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
