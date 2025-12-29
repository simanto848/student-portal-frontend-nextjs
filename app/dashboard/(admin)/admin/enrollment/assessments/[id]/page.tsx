"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { assessmentService, Assessment, AssessmentSubmission } from "@/services/enrollment/assessment.service";
import { Loader2, Pencil, Trash2, CheckCircle, XCircle, FileText, Award } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function AssessmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Grading State
    const [gradingSubmission, setGradingSubmission] = useState<AssessmentSubmission | null>(null);
    const [gradeData, setGradeData] = useState({ obtainedMarks: 0, feedback: "" });
    const [isGrading, setIsGrading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchData(params.id as string);
        }
    }, [params.id]);

    const fetchData = async (id: string) => {
        setIsLoading(true);
        try {
            const [assessmentData, submissionsData] = await Promise.all([
                assessmentService.getById(id),
                assessmentService.getAssessmentSubmissions(id)
            ]);
            setAssessment(assessmentData);
            setSubmissions(submissionsData || []);
        } catch (error) {
            toast.error("Failed to load assessment details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (action: 'publish' | 'close' | 'mark-graded') => {
        if (!assessment) return;
        try {
            if (action === 'publish') await assessmentService.publish(assessment.id);
            if (action === 'close') await assessmentService.close(assessment.id);
            if (action === 'mark-graded') await assessmentService.markGraded(assessment.id);

            toast.success(`Assessment ${action}ed successfully`);
            fetchData(assessment.id);
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action} assessment`);
        }
    };

    const handleDelete = async () => {
        if (!assessment || !confirm("Are you sure you want to delete this assessment?")) return;
        try {
            await assessmentService.delete(assessment.id);
            toast.success("Assessment deleted successfully");
            router.push("/dashboard/admin/enrollment/assessments");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete assessment");
        }
    };

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSubmission) return;
        setIsGrading(true);
        try {
            await assessmentService.gradeSubmission(gradingSubmission.id, gradeData);
            toast.success("Submission graded successfully");
            setGradingSubmission(null);
            fetchData(assessment!.id);
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

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>
            </DashboardLayout>
        );
    }

    if (!assessment) {
        return (
            <DashboardLayout>
                <div className="text-center p-8 text-muted-foreground">Assessment not found</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">{assessment.title}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Badge variant="outline">{assessment.type?.name}</Badge>
                            <span>•</span>
                            <span>{(assessment as any).course?.name}</span>
                            <span>•</span>
                            <span>{(assessment as any).batch?.name}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {assessment.status === 'draft' && (
                            <Button onClick={() => handleStatusChange('publish')} className="bg-blue-600 hover:bg-blue-700">
                                <CheckCircle className="mr-2 h-4 w-4" /> Publish
                            </Button>
                        )}
                        {assessment.status === 'published' && (
                            <Button onClick={() => handleStatusChange('close')} variant="destructive">
                                <XCircle className="mr-2 h-4 w-4" /> Close
                            </Button>
                        )}
                        {assessment.status === 'closed' && (
                            <Button onClick={() => handleStatusChange('mark-graded')} className="bg-purple-600 hover:bg-purple-700">
                                <Award className="mr-2 h-4 w-4" /> Mark Graded
                            </Button>
                        )}
                        <Link href={`/dashboard/admin/enrollment/assessments/${assessment.id}/edit`}>
                            <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button variant="outline" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Marks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{assessment.totalMarks}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Passing Marks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{assessment.passingMarks}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Weightage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{assessment.weightPercentage}%</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{assessment.description || "No description provided."}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Status</span>
                                    <Badge className="capitalize">{assessment.status}</Badge>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Due Date</span>
                                    <span>{assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : "No due date"}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Created By</span>
                                    <span>{(assessment as any).createdBy?.fullName || "Unknown"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="submissions">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Submitted At</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Marks</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No submissions yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            submissions.map((submission) => (
                                                <TableRow key={submission.id}>
                                                    <TableCell className="font-medium">
                                                        {submission.student?.fullName}
                                                        <div className="text-xs text-muted-foreground">{submission.student?.studentId}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'} className="capitalize">
                                                            {submission.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {submission.obtainedMarks !== undefined ? `${submission.obtainedMarks} / ${assessment.totalMarks}` : "-"}
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
                    </TabsContent>
                </Tabs>

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
                                <Label htmlFor="obtainedMarks">Marks (Out of {assessment.totalMarks})</Label>
                                <Input
                                    id="obtainedMarks"
                                    type="number"
                                    value={gradeData.obtainedMarks}
                                    onChange={(e) => setGradeData({ ...gradeData, obtainedMarks: Number(e.target.value) })}
                                    min="0"
                                    max={assessment.totalMarks}
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
