"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditGradePage() {
    const router = useRouter();
    const params = useParams();
    const [grade, setGrade] = useState<CourseGrade | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form Data
    const [totalMarksObtained, setTotalMarksObtained] = useState<number>(0);
    const [totalMarks, setTotalMarks] = useState<number>(100);
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchGrade(params.id as string);
        }
    }, [params.id]);

    const fetchGrade = async (id: string) => {
        try {
            const data = await courseGradeService.getById(id);
            setGrade(data);
            setTotalMarksObtained(data.totalMarksObtained);
            setTotalMarks(data.totalMarks);
            setRemarks(data.remarks || "");
        } catch (error) {
            toast.error("Failed to load grade");
            router.push("/dashboard/admin/enrollment/grades");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grade) return;

        setIsSaving(true);
        try {
            await courseGradeService.update(grade.id, {
                totalMarksObtained,
                totalMarks,
                remarks
            });
            toast.success("Grade updated successfully");
            router.push(`/dashboard/admin/enrollment/grades/${grade.id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update grade");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>
            </DashboardLayout>
        );
    }

    if (!grade) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Edit Grade</h2>
                        <p className="text-muted-foreground">{grade.student?.fullName} - {grade.course?.code}</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Student</span>
                                <span>{grade.student?.fullName}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Course</span>
                                <span>{grade.course?.name}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Batch</span>
                                <span>{grade.batch?.name}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Semester</span>
                                <span>{grade.semester}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Current Grade</span>
                                <span>{grade.grade || "N/A"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Update Grade</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totalMarksObtained">Marks Obtained</Label>
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
                                    <Label htmlFor="totalMarks">Total Marks</Label>
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
                                        rows={4}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                    <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" /> Update Grade
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
