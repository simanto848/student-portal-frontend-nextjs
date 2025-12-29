"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { courseGradeService } from "@/services/enrollment/courseGrade.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";
import { Loader2, Calculator, ArrowLeft, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function CalculateGradePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Filter Data
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    // Selection State
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [selectedEnrollment, setSelectedEnrollment] = useState<string>("");

    // Form Data
    const [totalMarksObtained, setTotalMarksObtained] = useState<number>(0);
    const [totalMarks, setTotalMarks] = useState<number>(100);
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (selectedCourse && selectedBatch) {
            fetchEnrollments();
        } else {
            setEnrollments([]);
        }
    }, [selectedCourse, selectedBatch, selectedSemester]);

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

    const fetchEnrollments = async () => {
        try {
            const params: any = {
                courseId: selectedCourse,
                batchId: selectedBatch,
                status: 'active'
            };
            if (selectedSemester) params.semester = selectedSemester;

            const data = await enrollmentService.listEnrollments(params);
            const list = Array.isArray(data) ? data : (data as any).enrollments || [];
            setEnrollments(list);
        } catch (error) {
            toast.error("Failed to load students");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEnrollment) {
            toast.error("Please select a student");
            return;
        }

        setIsCalculating(true);
        try {
            const enrollment = enrollments.find(e => e.id === selectedEnrollment);
            if (!enrollment) throw new Error("Student not found");

            await courseGradeService.calculate({
                studentId: enrollment.studentId,
                enrollmentId: enrollment.id,
                courseId: selectedCourse,
                batchId: selectedBatch,
                semester: parseInt(selectedSemester) || enrollment.semester,
                totalMarksObtained,
                totalMarks,
                remarks
            });

            toast.success("Grade calculated successfully");
            router.push("/dashboard/admin/enrollment/grades");
        } catch (error: any) {
            toast.error(error.message || "Failed to calculate grade");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleAutoCalculate = async () => {
        if (!selectedEnrollment) {
            toast.error("Please select a student first");
            return;
        }

        setIsCalculating(true);
        try {
            const result = await courseGradeService.autoCalculate(selectedEnrollment);
            setTotalMarksObtained(result.totalMarksObtained);
            setTotalMarks(result.totalMarks);
            toast.success("Grade auto-calculated. Review and save.");
        } catch (error: any) {
            toast.error(error.message || "Auto-calculation failed");
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Calculate Grade</h2>
                        <p className="text-muted-foreground">Manually enter or auto-calculate student grades.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selection Criteria</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                    value={selectedCourse}
                                    onChange={setSelectedCourse}
                                    placeholder="Select Course"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="batch">Batch <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={batches.map(b => ({ label: b.name, value: b.id }))}
                                    value={selectedBatch}
                                    onChange={setSelectedBatch}
                                    placeholder="Select Batch"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="semester">Semester</Label>
                                <Input
                                    id="semester"
                                    type="number"
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    placeholder="Semester number (Optional)"
                                    min={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="student">Student <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={enrollments.map(e => ({
                                        label: `${e.student?.fullName || 'Unknown'} (${e.student?.studentId || '-'})`,
                                        value: e.id
                                    }))}
                                    value={selectedEnrollment}
                                    onChange={setSelectedEnrollment}
                                    placeholder={selectedCourse && selectedBatch ? "Select Student" : "Select Course & Batch first"}
                                    disabled={!selectedCourse || !selectedBatch}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Grade Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex justify-end mb-2">
                                    <Button type="button" variant="outline" size="sm" onClick={handleAutoCalculate} disabled={!selectedEnrollment || isCalculating}>
                                        <Wand2 className="mr-2 h-4 w-4" /> Auto Calculate
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalMarksObtained">Marks Obtained <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="totalMarksObtained"
                                        type="number"
                                        value={totalMarksObtained}
                                        onChange={(e) => setTotalMarksObtained(Number(e.target.value))}
                                        required
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalMarks">Total Marks <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="totalMarks"
                                        type="number"
                                        value={totalMarks}
                                        onChange={(e) => setTotalMarks(Number(e.target.value))}
                                        required
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Optional remarks"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                    <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isCalculating}>
                                        {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Calculator className="mr-2 h-4 w-4" /> Save Grade
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
