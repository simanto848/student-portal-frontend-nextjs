"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService } from "@/services/teacher.service";
import { batchService } from "@/services/academic/batch.service";
import { departmentService } from "@/services/academic/department.service";
import { sessionCourseService } from "@/services/academic/session-course.service";
import { Loader2, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface InstructorAssignmentFormProps {
    initialData?: BatchCourseInstructor;
    isEditing?: boolean;
}

interface CourseAssignment {
    courseId: string;
    courseName: string;
    courseCode: string;
    instructorId: string;
    status: "active" | "completed" | "reassigned";
}

export function InstructorAssignmentForm({ initialData, isEditing = false }: InstructorAssignmentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Selection State
    const [selectedBatchId, setSelectedBatchId] = useState(initialData?.batchId || "");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

    // Data Lists
    const [teachers, setTeachers] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [sessionCourses, setSessionCourses] = useState<any[]>([]);

    // Assignment State
    const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
    const [globalInstructorId, setGlobalInstructorId] = useState<string>("");

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (selectedBatchId) {
            fetchBatchCourses(selectedBatchId);
        } else {
            setSessionCourses([]);
            setAssignments([]);
        }
    }, [selectedBatchId]);

    const fetchDropdownData = async () => {
        setIsFetching(true);
        try {
            const [teachersData, batchesData, departmentsData] = await Promise.all([
                teacherService.getAllTeachers(),
                batchService.getAllBatches(),
                departmentService.getAllDepartments()
            ]);
            setTeachers(teachersData || []);
            setBatches(batchesData || []);
            setDepartments(departmentsData || []);
        } catch (error) {
            toast.error("Failed to load form data");
        } finally {
            setIsFetching(false);
        }
    };

    const fetchBatchCourses = async (batchId: string) => {
        try {
            const [courses, existingAssignments] = await Promise.all([
                sessionCourseService.getBatchSessionCourses(batchId),
                batchCourseInstructorService.listAssignments({ batchId, status: 'active' })
            ]);

            setSessionCourses(courses || []);

            const assignmentsList: BatchCourseInstructor[] = Array.isArray(existingAssignments)
                ? (existingAssignments as any)
                : (existingAssignments as any)?.assignments || [];

            const assignmentMap = new Map<string, BatchCourseInstructor>(
                assignmentsList.map((a) => [a.courseId, a])
            );

            const initialAssignments: CourseAssignment[] = courses.map((sc: any) => {
                const courseId = sc.courseId.id || sc.courseId._id;
                const existing = assignmentMap.get(courseId);

                return {
                    courseId: courseId,
                    courseName: sc.courseId.name,
                    courseCode: sc.courseId.code,
                    instructorId: existing ? existing.instructorId : "",
                    status: existing ? (existing.status as "active" | "completed" | "reassigned") : "active" as const
                };
            });
            setAssignments(initialAssignments);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load batch data");
        }
    };

    const getDepartmentId = (item: any) => {
        if (!item.departmentId) return null;
        return typeof item.departmentId === 'object' ? item.departmentId.id || item.departmentId._id : item.departmentId;
    };

    const filteredBatches = batches.filter(b => !selectedDepartmentId || getDepartmentId(b) === selectedDepartmentId);

    const handleAssignmentChange = (courseId: string, field: keyof CourseAssignment, value: any) => {
        setAssignments(prev => prev.map(a =>
            a.courseId === courseId ? { ...a, [field]: value } : a
        ));
    };

    const applyGlobalInstructor = () => {
        if (!globalInstructorId) return;
        setAssignments(prev => prev.map(a => ({ ...a, instructorId: globalInstructorId })));
        toast.success("Applied instructor to all courses");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedBatch = batches.find(b => b.id === selectedBatchId);
        if (!selectedBatch) {
            toast.error("Invalid batch selection");
            return;
        }

        const validAssignments = assignments.filter(a => a.instructorId);
        if (validAssignments.length === 0) {
            toast.error("Please assign an instructor to at least one course");
            return;
        }

        const sessionId = typeof selectedBatch.sessionId === 'object'
            ? (selectedBatch.sessionId.id || selectedBatch.sessionId._id)
            : selectedBatch.sessionId;

        const semester = selectedBatch.currentSemester;

        setIsLoading(true);
        try {
            const payload = validAssignments.map(a => ({
                batchId: selectedBatchId,
                courseId: a.courseId,
                instructorId: a.instructorId,
                sessionId,
                semester,
                status: a.status
            }));

            await batchCourseInstructorService.bulkAssign(payload);
            toast.success(`Successfully processed ${payload.length} assignments`);
            router.push("/dashboard/admin/enrollment/instructors");
        } catch (error: any) {
            toast.error(error.message || "Failed to save assignments");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assign Instructors to Batch Courses</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Batch Selection */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Filter by Department</Label>
                            <SearchableSelect
                                options={[
                                    { label: "All Departments", value: "" },
                                    ...departments.map(d => ({ label: d.name, value: d.id }))
                                ]}
                                value={selectedDepartmentId}
                                onChange={setSelectedDepartmentId}
                                placeholder="Filter Batch Department..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Batch <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                options={filteredBatches.map(b => ({
                                    label: b.name,
                                    value: b.id
                                }))}
                                value={selectedBatchId}
                                onChange={setSelectedBatchId}
                                placeholder="Select Batch"
                            />
                        </div>
                    </div>

                    {selectedBatchId && (
                        <div className="space-y-4 border-t pt-6">
                            <div className="flex items-end gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Apply Instructor to All</Label>
                                    <SearchableSelect
                                        options={teachers.map(t => ({
                                            label: `${t.fullName} (${t.email})`,
                                            value: t.id
                                        }))}
                                        value={globalInstructorId}
                                        onChange={setGlobalInstructorId}
                                        placeholder="Select Instructor for All..."
                                    />
                                </div>
                                <Button onClick={applyGlobalInstructor} variant="outline" className="mb-0.5">
                                    <Copy className="mr-2 h-4 w-4" /> Apply to All
                                </Button>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course Code</TableHead>
                                            <TableHead>Course Name</TableHead>
                                            <TableHead>Instructor</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No running courses found for this batch.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            assignments.map((assignment) => (
                                                <TableRow key={assignment.courseId}>
                                                    <TableCell className="font-medium">{assignment.courseCode}</TableCell>
                                                    <TableCell>{assignment.courseName}</TableCell>
                                                    <TableCell className="w-[300px]">
                                                        <SearchableSelect
                                                            options={teachers.map(t => ({
                                                                label: `${t.fullName}`,
                                                                value: t.id
                                                            }))}
                                                            value={assignment.instructorId}
                                                            onChange={(val) => handleAssignmentChange(assignment.courseId, "instructorId", val)}
                                                            placeholder="Select Instructor"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {assignment.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isLoading || assignments.length === 0}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Assignments
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
