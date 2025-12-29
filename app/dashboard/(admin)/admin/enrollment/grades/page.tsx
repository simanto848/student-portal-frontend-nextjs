"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { Loader2, Filter, X, Plus, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function CourseGradesPage() {
    const [grades, setGrades] = useState<CourseGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [isPublished, setIsPublished] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchGrades();
    }, [selectedCourse, selectedBatch, selectedSemester, isPublished]);

    const fetchInitialData = async () => {
        try {
            const [coursesData, batchesData] = await Promise.all([
                courseService.getAllCourses(),
                batchService.getAllBatches()
            ]);
            setCourses(coursesData || []);
            setBatches(batchesData || []);
        } catch (error) {
            toast.error("Failed to load filter data");
        }
    };

    const fetchGrades = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedCourse) params.courseId = selectedCourse;
            if (selectedBatch) params.batchId = selectedBatch;
            if (selectedSemester) params.semester = selectedSemester;
            if (isPublished) params.isPublished = isPublished;

            const data = await courseGradeService.list(params);
            setGrades(Array.isArray(data) ? data : (data as any).grades || []);
        } catch (error) {
            toast.error("Failed to load grades");
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedCourse("");
        setSelectedBatch("");
        setSelectedSemester("");
        setIsPublished("");
    };

    const getStatusBadge = (status: string, workflowStatus?: string) => {
        if (workflowStatus && workflowStatus !== 'draft') {
            switch (workflowStatus) {
                case 'submitted': return <Badge className="bg-blue-600">Submitted</Badge>;
                case 'approved': return <Badge className="bg-green-600">Approved</Badge>;
                case 'returned': return <Badge variant="destructive">Returned</Badge>;
                case 'return_requested': return <Badge className="bg-yellow-600">Ret-Req</Badge>;
                case 'return_approved': return <Badge className="bg-purple-600">Ret-App</Badge>;
                default: return <Badge variant="outline">{workflowStatus}</Badge>;
            }
        }

        switch (status) {
            case 'calculated': return <Badge className="bg-blue-600">Calculated</Badge>;
            case 'finalized': return <Badge className="bg-green-600">Finalized</Badge>;
            case 'published': return <Badge className="bg-purple-600">Published</Badge>;
            case 'pending': return <Badge variant="secondary">Pending</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Course Grades</h2>
                        <p className="text-muted-foreground">Manage and publish student course grades.</p>
                    </div>
                    <Link href="/dashboard/admin/enrollment/grades/calculate">
                        <Button className="bg-[#3e6253] hover:bg-[#2c463b]">
                            <Plus className="mr-2 h-4 w-4" /> Calculate New
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <SearchableSelect
                                options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="Filter by Course"
                            />
                            <SearchableSelect
                                options={batches.map(b => ({ label: b.name, value: b.id }))}
                                value={selectedBatch}
                                onChange={setSelectedBatch}
                                placeholder="Filter by Batch"
                            />
                            <Input
                                type="number"
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                placeholder="Semester"
                                min={1}
                            />
                            <SearchableSelect
                                options={[
                                    { label: "Published", value: "true" },
                                    { label: "Unpublished", value: "false" }
                                ]}
                                value={isPublished}
                                onChange={setIsPublished}
                                placeholder="Publish Status"
                            />
                        </div>
                        {(selectedCourse || selectedBatch || selectedSemester || isPublished) && (
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                    <X className="mr-2 h-4 w-4" /> Clear Filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#344e41]" />
                                        </TableCell>
                                    </TableRow>
                                ) : grades.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No grade records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    grades.map((grade) => (
                                        <TableRow key={grade.id}>
                                            <TableCell className="font-medium">
                                                {grade.student?.fullName}
                                                <div className="text-xs text-muted-foreground">{grade.student?.studentId}</div>
                                            </TableCell>
                                            <TableCell>{grade.course?.name || "-"}</TableCell>
                                            <TableCell>{grade.batch?.name || "-"}</TableCell>
                                            <TableCell>Semester {grade.semester}</TableCell>
                                            <TableCell>
                                                {grade.totalMarksObtained} / {grade.totalMarks}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-bold">
                                                    {grade.grade || "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(grade.status, grade.workflowStatus)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/dashboard/admin/enrollment/grades/${grade.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/admin/enrollment/grades/${grade.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
