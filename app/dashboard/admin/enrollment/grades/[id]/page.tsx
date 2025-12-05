"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courseGradeService, CourseGrade } from "@/services/enrollment/courseGrade.service";
import { Loader2, ArrowLeft, Pencil, CheckCircle, XCircle, Send, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function GradeDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [grade, setGrade] = useState<CourseGrade | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Dialog State
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [requestReturnDialogOpen, setRequestReturnDialogOpen] = useState(false);
    const [dialogNote, setDialogNote] = useState("");

    useEffect(() => {
        if (params.id) fetchGrade(params.id as string);
    }, [params.id]);

    const fetchGrade = async (id: string) => {
        try {
            const data = await courseGradeService.getById(id);
            setGrade(data);
        } catch (error) {
            toast.error("Failed to load grade details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWorkflowAction = async (action: string) => {
        if (!grade) return;
        setIsActionLoading(true);
        try {
            switch (action) {
                case 'submit':
                    await courseGradeService.submitToCommittee(grade.id);
                    toast.success("Grade submitted to committee");
                    break;
                case 'approve':
                    await courseGradeService.approveByCommittee(grade.id);
                    toast.success("Grade approved by committee");
                    break;
                case 'publish':
                    await courseGradeService.publish(grade.id);
                    toast.success("Grade published successfully"); // Direct publish or workflow publish depending on role logic, reusing service publish
                    break;
                case 'unpublish':
                    await courseGradeService.unpublish(grade.id);
                    toast.success("Grade unpublished successfully");
                    break;
                case 'approve-return':
                    await courseGradeService.approveReturnRequest(grade.id);
                    toast.success("Return request approved");
                    break;
            }
            fetchGrade(grade.id);
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action} grade`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReturnSubmit = async () => {
        if (!grade || !dialogNote) return;
        setIsActionLoading(true);
        try {
            await courseGradeService.returnToTeacher(grade.id, dialogNote);
            toast.success("Grade returned to teacher");
            setReturnDialogOpen(false);
            setDialogNote("");
            fetchGrade(grade.id);
        } catch (error: any) {
            toast.error(error.message || "Failed to return grade");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRequestReturnSubmit = async () => {
        if (!grade || !dialogNote) return;
        setIsActionLoading(true);
        try {
            await courseGradeService.requestReturn(grade.id, dialogNote);
            toast.success("Return requested successfully");
            setRequestReturnDialogOpen(false);
            setDialogNote("");
            fetchGrade(grade.id);
        } catch (error: any) {
            toast.error(error.message || "Failed to request return");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>
            </DashboardLayout>
        );
    }

    if (!grade) {
        return (
            <DashboardLayout>
                <div className="text-center p-8 text-muted-foreground">Grade record not found</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Grade Details</h2>
                            <p className="text-muted-foreground">{grade.student?.fullName} - {grade.course?.code}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Edit Action - Only if draft or returned */}
                        {(grade.workflowStatus === 'draft' || grade.workflowStatus === 'returned') && (
                            <Link href={`/dashboard/admin/enrollment/grades/${grade.id}/edit`}>
                                <Button variant="outline">
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Button>
                            </Link>
                        )}

                        {/* Workflow Actions */}
                        {grade.workflowStatus === 'draft' && (
                            <Button onClick={() => handleWorkflowAction('submit')} disabled={isActionLoading}>
                                <Send className="mr-2 h-4 w-4" /> Submit to Committee
                            </Button>
                        )}

                        {(grade.workflowStatus === 'submitted' || grade.workflowStatus === 'return_requested') && (
                            <>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleWorkflowAction('approve')} disabled={isActionLoading}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                </Button>
                                <Button variant="destructive" onClick={() => setReturnDialogOpen(true)} disabled={isActionLoading}>
                                    <RotateCcw className="mr-2 h-4 w-4" /> Return
                                </Button>
                            </>
                        )}

                        {grade.workflowStatus === 'approved' && !grade.isPublished && (
                            <>
                                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleWorkflowAction('publish')} disabled={isActionLoading}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Publish
                                </Button>
                                <Button variant="outline" onClick={() => setRequestReturnDialogOpen(true)} disabled={isActionLoading}>
                                    <AlertTriangle className="mr-2 h-4 w-4" /> Request Return
                                </Button>
                            </>
                        )}

                        {grade.isPublished && (
                            <Button variant="destructive" onClick={() => handleWorkflowAction('unpublish')} disabled={isActionLoading}>
                                <XCircle className="mr-2 h-4 w-4" /> Unpublish
                            </Button>
                        )}

                        {grade.workflowStatus === 'return_requested' && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleWorkflowAction('approve-return')} disabled={isActionLoading}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve Return Request
                            </Button>
                        )}

                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Student</span>
                                <div>
                                    <div>{grade.student?.fullName}</div>
                                    <div className="text-xs text-muted-foreground">{grade.student?.studentId}</div>
                                </div>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Course</span>
                                <div>
                                    <div>{grade.course?.name}</div>
                                    <div className="text-xs text-muted-foreground">{grade.course?.code}</div>
                                </div>
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
                                <span className="font-medium text-muted-foreground">Total Marks</span>
                                <span>{grade.totalMarks}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Marks Obtained</span>
                                <span className="font-bold text-lg">{grade.totalMarksObtained}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Grade</span>
                                <Badge className="text-lg px-3">{grade.grade || "N/A"}</Badge>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Grade Point</span>
                                <span>{grade.gradePoint || "N/A"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status & Remarks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Calculation Status</span>
                                <Badge variant="outline" className="capitalize">{grade.status}</Badge>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Workflow Status</span>
                                <Badge variant="secondary" className="capitalize">{grade.workflowStatus || "Draft"}</Badge>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Published</span>
                                <Badge variant={grade.isPublished ? "default" : "destructive"}>
                                    {grade.isPublished ? "Yes" : "No"}
                                </Badge>
                            </div>
                            <div className="pt-2">
                                <span className="font-medium text-muted-foreground block mb-1">Remarks</span>
                                <p className="text-sm bg-slate-50 p-3 rounded-md border text-muted-foreground">
                                    {grade.remarks || "No remarks provided."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Return Dialog */}
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return to Teacher</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for returning this grade to the teacher.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea
                            value={dialogNote}
                            onChange={(e) => setDialogNote(e.target.value)}
                            placeholder="Enter reason..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReturnSubmit} disabled={!dialogNote || isActionLoading}>
                            Confirm Return
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Return Dialog */}
            <Dialog open={requestReturnDialogOpen} onOpenChange={setRequestReturnDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Return</DialogTitle>
                        <DialogDescription>
                            Request the committee to return this grade for modification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea
                            value={dialogNote}
                            onChange={(e) => setDialogNote(e.target.value)}
                            placeholder="Enter reason..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRequestReturnDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRequestReturnSubmit} disabled={!dialogNote || isActionLoading}>
                            Send Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </DashboardLayout>
    );
}
