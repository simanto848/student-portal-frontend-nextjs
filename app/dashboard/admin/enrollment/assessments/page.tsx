"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { assessmentService, Assessment, AssessmentType } from "@/services/enrollment/assessment.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { Loader2, Plus, Eye, Pencil, Filter, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function AssessmentsPage() {
    const router = useRouter();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter Data
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [types, setTypes] = useState<AssessmentType[]>([]);

    // Filter State
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchAssessments();
    }, [selectedCourse, selectedBatch, selectedType, selectedStatus]);

    const fetchInitialData = async () => {
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
            toast.error("Failed to load filter data");
        }
    };

    const fetchAssessments = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedCourse) params.courseId = selectedCourse;
            if (selectedBatch) params.batchId = selectedBatch;
            if (selectedType) params.typeId = selectedType;
            if (selectedStatus) params.status = selectedStatus;

            const data = await assessmentService.list(params);
            setAssessments(Array.isArray(data) ? data : (data as any).assessments || []);
        } catch (error) {
            toast.error("Failed to load assessments");
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedCourse("");
        setSelectedBatch("");
        setSelectedType("");
        setSelectedStatus("");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published': return <Badge className="bg-green-600">Published</Badge>;
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            case 'closed': return <Badge variant="destructive">Closed</Badge>;
            case 'graded': return <Badge className="bg-blue-600">Graded</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Assessments</h2>
                        <p className="text-muted-foreground">Manage course assessments, quizzes, and exams.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/admin/enrollment/assessments/submissions">
                            <Button variant="outline">Submissions</Button>
                        </Link>
                        <Link href="/dashboard/admin/enrollment/assessments/types">
                            <Button variant="outline">Manage Types</Button>
                        </Link>
                        <Link href="/dashboard/admin/enrollment/assessments/create">
                            <Button className="bg-[#3e6253] hover:bg-[#2c463b]">
                                <Plus className="mr-2 h-4 w-4" /> Create Assessment
                            </Button>
                        </Link>
                    </div>
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
                            <SearchableSelect
                                options={types.map(t => ({ label: t.name, value: t.id }))}
                                value={selectedType}
                                onChange={setSelectedType}
                                placeholder="Filter by Type"
                            />
                            <SearchableSelect
                                options={[
                                    { label: "Draft", value: "draft" },
                                    { label: "Published", value: "published" },
                                    { label: "Closed", value: "closed" },
                                    { label: "Graded", value: "graded" }
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                placeholder="Filter by Status"
                            />
                        </div>
                        {(selectedCourse || selectedBatch || selectedType || selectedStatus) && (
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
                                    <TableHead>Title</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#344e41]" />
                                        </TableCell>
                                    </TableRow>
                                ) : assessments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No assessments found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assessments.map((assessment) => (
                                        <TableRow key={assessment.id}>
                                            <TableCell className="font-medium">{assessment.title}</TableCell>
                                            <TableCell>{(assessment as any).course?.name || "-"}</TableCell>
                                            <TableCell>{(assessment as any).batch?.name || "-"}</TableCell>
                                            <TableCell>{assessment.type?.name || "-"}</TableCell>
                                            <TableCell>{assessment.totalMarks}</TableCell>
                                            <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/dashboard/admin/enrollment/assessments/${assessment.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dashboard/admin/enrollment/assessments/${assessment.id}/edit`}>
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
