"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService } from "@/services/teacher.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { departmentService } from "@/services/academic/department.service";
import { Loader2, Filter } from "lucide-react";
import { toast } from "sonner";

interface InstructorAssignmentFormProps {
    initialData?: BatchCourseInstructor;
    isEditing?: boolean;
}

export function InstructorAssignmentForm({ initialData, isEditing = false }: InstructorAssignmentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Form State
    const [instructorId, setInstructorId] = useState(initialData?.instructorId || "");
    const [courseId, setCourseId] = useState(initialData?.courseId || "");
    const [batchId, setBatchId] = useState(initialData?.batchId || "");
    const [status, setStatus] = useState<"active" | "completed" | "reassigned">(initialData?.status as "active" | "completed" | "reassigned" || "active");

    // Filter State
    const [selectedInstructorDeptId, setSelectedInstructorDeptId] = useState<string>("");
    const [selectedCourseDeptId, setSelectedCourseDeptId] = useState<string>("");
    const [selectedBatchDeptId, setSelectedBatchDeptId] = useState<string>("");

    // Data Lists
    const [teachers, setTeachers] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        setIsFetching(true);
        try {
            const [teachersData, coursesData, batchesData, departmentsData] = await Promise.all([
                teacherService.getAllTeachers(),
                courseService.getAllCourses(),
                batchService.getAllBatches(),
                departmentService.getAllDepartments()
            ]);
            setTeachers(teachersData || []);
            setCourses(coursesData || []);
            setBatches(batchesData || []);
            setDepartments(departmentsData || []);
        } catch (error) {
            toast.error("Failed to load form data");
        } finally {
            setIsFetching(false);
        }
    };

    const getDepartmentId = (item: any) => {
        if (!item.departmentId) return null;
        return typeof item.departmentId === 'object' ? item.departmentId.id || item.departmentId._id : item.departmentId;
    };

    // Filtered Options
    const filteredTeachers = teachers.filter(t => !selectedInstructorDeptId || getDepartmentId(t) === selectedInstructorDeptId);
    const filteredCourses = courses.filter(c => !selectedCourseDeptId || getDepartmentId(c) === selectedCourseDeptId);
    const filteredBatches = batches.filter(b => !selectedBatchDeptId || getDepartmentId(b) === selectedBatchDeptId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instructorId || !courseId || !batchId) {
            toast.error("Please fill in all required fields");
            return;
        }

        const selectedBatch = batches.find(b => b.id === batchId);
        if (!selectedBatch) {
            toast.error("Invalid batch selection");
            return;
        }

        const sessionId = typeof selectedBatch.sessionId === 'object'
            ? (selectedBatch.sessionId.id || selectedBatch.sessionId._id)
            : selectedBatch.sessionId;

        const semester = selectedBatch.currentSemester;

        if (!sessionId || !semester) {
            toast.error("Selected batch is missing session or semester information");
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                instructorId,
                courseId,
                batchId,
                sessionId,
                semester,
                status
            };

            if (isEditing && initialData) {
                await batchCourseInstructorService.updateAssignment(initialData.id, data);
                toast.success("Assignment updated successfully");
            } else {
                await batchCourseInstructorService.assignInstructor(data);
                toast.success("Instructor assigned successfully");
            }
            router.push("/dashboard/admin/enrollment/instructors");
        } catch (error: any) {
            toast.error(error.message || "Failed to save assignment");
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
                <CardTitle>{isEditing ? "Edit Assignment" : "Assign Instructor"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Section 1: Instructor Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <h3 className="font-semibold text-[#1a3d32]">Instructor Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Filter by Department</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "All Departments", value: "" },
                                            ...departments.map(d => ({ label: d.name, value: d.id }))
                                        ]}
                                        value={selectedInstructorDeptId}
                                        onChange={setSelectedInstructorDeptId}
                                        placeholder="Filter Instructor Department..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Instructor <span className="text-red-500">*</span></Label>
                                    <SearchableSelect
                                        options={filteredTeachers.map(t => ({
                                            label: `${t.fullName} (${t.email})`,
                                            value: t.id
                                        }))}
                                        value={instructorId}
                                        onChange={setInstructorId}
                                        placeholder="Select Instructor"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Course Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <h3 className="font-semibold text-[#1a3d32]">Course Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Filter by Department</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "All Departments", value: "" },
                                            ...departments.map(d => ({ label: d.name, value: d.id }))
                                        ]}
                                        value={selectedCourseDeptId}
                                        onChange={setSelectedCourseDeptId}
                                        placeholder="Filter Course Department..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Course <span className="text-red-500">*</span></Label>
                                    <SearchableSelect
                                        options={filteredCourses.map(c => ({
                                            label: `${c.name} (${c.code})`,
                                            value: c.id
                                        }))}
                                        value={courseId}
                                        onChange={setCourseId}
                                        placeholder="Select Course"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Batch Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <h3 className="font-semibold text-[#1a3d32]">Batch Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Filter by Department</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "All Departments", value: "" },
                                            ...departments.map(d => ({ label: d.name, value: d.id }))
                                        ]}
                                        value={selectedBatchDeptId}
                                        onChange={setSelectedBatchDeptId}
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
                                        value={batchId}
                                        onChange={setBatchId}
                                        placeholder="Select Batch"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Assignment Status */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b">
                                <h3 className="font-semibold text-[#1a3d32]">Assignment Status</h3>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(value) => setStatus(value as "active" | "completed" | "reassigned")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="reassigned">Reassigned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update Assignment" : "Assign Instructor"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
