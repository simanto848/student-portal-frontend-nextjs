"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { assessmentService, AssessmentSubmission, Assessment } from "@/services/enrollment/assessment.service";
import { Loader2, Filter, X, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AssessmentSubmissionsPage() {
    const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [selectedAssessment, setSelectedAssessment] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // Grading State
    const [gradingSubmission, setGradingSubmission] = useState<AssessmentSubmission | null>(null);
    const [gradeData, setGradeData] = useState({ obtainedMarks: 0, feedback: "" });
    const [isGrading, setIsGrading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [selectedAssessment, selectedStatus]);

    const fetchInitialData = async () => {
        try {
            const assessmentsData = await assessmentService.list();
            setAssessments(Array.isArray(assessmentsData) ? assessmentsData : (assessmentsData as any).assessments || []);
        } catch (error) {
            toast.error("Failed to load filter data");
        }
    };

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedAssessment) params.assessmentId = selectedAssessment;
            if (selectedStatus) params.status = selectedStatus;

            const data = await assessmentService.listSubmissions(params);
            setSubmissions(Array.isArray(data) ? data : (data as any).submissions || []);
        } catch (error) {
            toast.error("Failed to load submissions");
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedAssessment("");
        setSelectedStatus("");
    };

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSubmission) return;
        setIsGrading(true);
        try {
            await assessmentService.gradeSubmission(gradingSubmission.id, gradeData);
            toast.success("Submission graded successfully");
            setGradingSubmission(null);
            fetchSubmissions();
        } catch (error: any) {
            toast.error(error.message || "Failed to grade submission");
        } finally {
            setIsGrading(false);
        }
    };

    const openGradingDialog = (submission: AssessmentSubmission) => {
        setGradingSubmission(submission);
        setGradeData({
            obtainedMarks: submission.obtainedMarks || 0,
            feedback: submission.feedback || ""
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Assessment Submissions</h2>
                    <p className="text-muted-foreground">View and grade student submissions across all assessments.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <SearchableSelect
                                options={assessments.map(a => ({ label: a.title, value: a.id }))}
                                value={selectedAssessment}
                                onChange={setSelectedAssessment}
                                placeholder="Filter by Assessment"
                            />
                            <SearchableSelect
                                options={[
                                    { label: "Submitted", value: "submitted" },
                                    { label: "Graded", value: "graded" },
                                    { label: "Late", value: "late" },
                                    { label: "Missed", value: "missed" }
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                placeholder="Filter by Status"
                            />
                            {(selectedAssessment || selectedStatus) && (
                                <div className="flex items-end">
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                        <X className="mr-2 h-4 w-4" /> Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Assessment</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Marks</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#344e41]" />
                                        </TableCell>
                                    </TableRow>
                                ) : submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No submissions found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell className="font-medium">
                                                {submission.student?.fullName}
                                                <div className="text-xs text-muted-foreground">{submission.student?.studentId}</div>
                                            </TableCell>
                                            <TableCell>{submission.assessment?.title}</TableCell>
                                            <TableCell>
                                                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'} className="capitalize">
                                                    {submission.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {submission.obtainedMarks !== undefined ? `${submission.obtainedMarks} / ${submission.assessment?.totalMarks}` : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => openGradingDialog(submission)}>
                                                    <FileText className="mr-2 h-4 w-4" /> Grade
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Grade Submission</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleGradeSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Student</Label>
                                <div className="font-medium">{gradingSubmission?.student?.fullName}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Assessment</Label>
                                <div className="font-medium">{gradingSubmission?.assessment?.title}</div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="obtainedMarks">Marks (Out of {gradingSubmission?.assessment?.totalMarks})</Label>
                                <Input
                                    id="obtainedMarks"
                                    type="number"
                                    value={gradeData.obtainedMarks}
                                    onChange={(e) => setGradeData({ ...gradeData, obtainedMarks: Number(e.target.value) })}
                                    min="0"
                                    max={gradingSubmission?.assessment?.totalMarks}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="feedback">Feedback</Label>
                                <Textarea
                                    id="feedback"
                                    value={gradeData.feedback}
                                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                    placeholder="Enter feedback for the student..."
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                                <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isGrading}>
                                    {isGrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Grade
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
