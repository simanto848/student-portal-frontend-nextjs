"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { assessmentService, Assessment, AssessmentType } from "@/services/enrollment/assessment.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface AssessmentFormProps {
    initialData?: Assessment;
    isEditing?: boolean;
}

export function AssessmentForm({ initialData, isEditing = false }: AssessmentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Dropdown Data
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [types, setTypes] = useState<AssessmentType[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        courseId: initialData?.courseId || "",
        batchId: initialData?.batchId || "",
        assessmentTypeId: initialData?.typeId || "",
        semester: (initialData as any)?.semester || 1,
        totalMarks: initialData?.totalMarks || 100,
        passingMarks: initialData?.passingMarks || 40,
        weightPercentage: initialData?.weightPercentage || 0,
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
        status: initialData?.status || "draft",
    });

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [coursesData, batchesData, typesData] = await Promise.all([
                courseService.getAllCourses(),
                batchService.getAllBatches(),
                assessmentService.listTypes()
            ]);
            setCourses(coursesData || []);
            setBatches(batchesData || []);
            setTypes(typesData || []);
        } catch (error) {
            toast.error("Failed to load form data");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isEditing && initialData) {
                await assessmentService.update(initialData.id, formData);
                toast.success("Assessment updated successfully");
            } else {
                await assessmentService.create(formData);
                toast.success("Assessment created successfully");
            }
            router.push("/dashboard/admin/enrollment/assessments");
        } catch (error: any) {
            toast.error(error.message || "Failed to save assessment");
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
                <CardTitle>{isEditing ? "Edit Assessment" : "Create New Assessment"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Midterm Exam"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Assessment Type <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                options={types.map(t => ({ label: t.name, value: t.id }))}
                                value={formData.assessmentTypeId}
                                onChange={(val) => setFormData({ ...formData, assessmentTypeId: val })}
                                placeholder="Select Type"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                value={formData.courseId}
                                onChange={(val) => setFormData({ ...formData, courseId: val })}
                                placeholder="Select Course"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batch">Batch <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                options={batches.map(b => ({ label: b.name, value: b.id }))}
                                value={formData.batchId}
                                onChange={(val) => setFormData({ ...formData, batchId: val })}
                                placeholder="Select Batch"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="semester">Semester <span className="text-red-500">*</span></Label>
                            <Input
                                id="semester"
                                type="number"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                                min="1"
                                required
                                placeholder="e.g. 1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalMarks">Total Marks <span className="text-red-500">*</span></Label>
                            <Input
                                id="totalMarks"
                                type="number"
                                value={formData.totalMarks}
                                onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                                min="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="passingMarks">Passing Marks <span className="text-red-500">*</span></Label>
                            <Input
                                id="passingMarks"
                                type="number"
                                value={formData.passingMarks}
                                onChange={(e) => setFormData({ ...formData, passingMarks: Number(e.target.value) })}
                                min="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weightPercentage">Weightage (%) <span className="text-red-500">*</span></Label>
                            <Input
                                id="weightPercentage"
                                type="number"
                                value={formData.weightPercentage}
                                onChange={(e) => setFormData({ ...formData, weightPercentage: Number(e.target.value) })}
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <SearchableSelect
                                options={[
                                    { label: "Draft", value: "draft" },
                                    { label: "Published", value: "published" },
                                    { label: "Closed", value: "closed" },
                                    { label: "Graded", value: "graded" }
                                ]}
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val as any })}
                                placeholder="Select Status"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Instructions or details about the assessment..."
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            {isEditing ? "Update Assessment" : "Create Assessment"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
