"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { Loader2, Calculator, Send, Eye } from "lucide-react";
import { toast } from "sonner";

interface CourseGradeViewProps {
    courseId: string;
    batchId: string;
    semester: number;
}

export function CourseGradeView({ courseId, batchId, semester }: CourseGradeViewProps) {
    const [grades, setGrades] = useState<CourseGrade[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        fetchData();
    }, [courseId, batchId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch enrolled students
            const enrollmentsData = await enrollmentService.listEnrollments({ batchId, courseId, status: 'enrolled' });
            setStudents(enrollmentsData.enrollments.map(e => e.student));

            // Fetch existing grades
            const gradesData = await courseGradeService.listGrades({ batchId, courseId });
            setGrades(gradesData.grades || []);

        } catch (error) {
            toast.error("Failed to fetch grade data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalculate = async (studentId: string) => {
        setIsCalculating(true);
        try {
            await courseGradeService.calculateGrade({ studentId, courseId, batchId });
            toast.success("Grade calculated");
            fetchData();
        } catch (error) {
            toast.error("Failed to calculate grade");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSubmitToCommittee = async () => {
        if (!confirm("Are you sure you want to submit these grades to the Exam Committee?")) return;
        try {
            const gradeIds = grades.filter(g => g.status === 'draft').map(g => g.id);
            if (gradeIds.length === 0) {
                toast.error("No draft grades to submit");
                return;
            }
            await courseGradeService.submitToCommittee({ gradeIds });
            toast.success("Grades submitted to committee");
            fetchData();
        } catch (error) {
            toast.error("Failed to submit grades");
        }
    };

    const getGradeForStudent = (studentId: string) => {
        return grades.find(g => g.studentId === studentId);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Course Grades</CardTitle>
                        <Button onClick={handleSubmitToCommittee} className="bg-[#3e6253] hover:bg-[#2c463b]">
                            <Send className="mr-2 h-4 w-4" />
                            Submit to Committee
                        </Button>
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
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Registration No.</TableHead>
                                    <TableHead>Total Marks</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Point</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length > 0 ? (
                                    students.map((student) => {
                                        const grade = getGradeForStudent(student.id);
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.fullName}</TableCell>
                                                <TableCell>{student.registrationNumber}</TableCell>
                                                <TableCell>{grade?.totalMarks || "-"}</TableCell>
                                                <TableCell className="font-bold">{grade?.grade || "-"}</TableCell>
                                                <TableCell>{grade?.gradePoint || "-"}</TableCell>
                                                <TableCell>
                                                    {grade ? (
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${grade.status === 'published' ? 'bg-green-100 text-green-800' :
                                                                grade.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                                    grade.status === 'returned' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {grade.status.charAt(0).toUpperCase() + grade.status.slice(1)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">Not Calculated</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCalculate(student.id)}
                                                        disabled={isCalculating || (grade && grade.status !== 'draft' && grade.status !== 'returned')}
                                                    >
                                                        <Calculator className="h-4 w-4 mr-2" />
                                                        Calculate
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No students enrolled in this course batch.
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
