"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface StudentGradeViewProps {
    courseId: string;
    batchId: string;
    studentId: string;
}

export function StudentGradeView({ courseId, batchId, studentId }: StudentGradeViewProps) {
    const [grade, setGrade] = useState<CourseGrade | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [courseId, batchId, studentId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch grades for this student in this course
            const data = await courseGradeService.listGrades({ courseId, batchId, studentId });
            // Assuming listGrades returns an array, we take the first one as it's per course/student
            if (data.grades && data.grades.length > 0) {
                setGrade(data.grades[0]);
            }
        } catch (error) {
            toast.error("Failed to fetch grade data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#3e6253]" />
                        Final Course Grade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                        </div>
                    ) : grade ? (
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                                <span className="text-sm text-muted-foreground mb-1">Total Marks</span>
                                <span className="text-3xl font-bold text-[#1a3d32]">{grade.totalMarks}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                                <span className="text-sm text-muted-foreground mb-1">Grade Point</span>
                                <span className="text-3xl font-bold text-[#1a3d32]">{grade.gradePoint}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-[#3e6253]/10 rounded-lg border border-[#3e6253]/20">
                                <span className="text-sm text-[#3e6253] font-medium mb-1">Final Grade</span>
                                <span className="text-4xl font-bold text-[#3e6253]">{grade.grade}</span>
                            </div>

                            <div className="col-span-full mt-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                                    <span>Status: <span className="font-medium text-gray-900 capitalize">{grade.status}</span></span>
                                    {grade.status === 'published' && (
                                        <span className="text-green-600 font-medium">Result Published</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No final grade available yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
