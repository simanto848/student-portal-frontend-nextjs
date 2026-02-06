/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ChevronLeft,
    Check,
    RotateCcw,
    Upload,
    Loader2,
    AlertCircle,
    GraduationCap,
    Calendar,
    FileText,
    Shield,
    ShieldAlert
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { isTeacherUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import OTPConfirmationDialog from "@/components/ui/OTPConfirmationDialog";
import { notifyError, notifySuccess } from "@/components/toast";
import { courseGradeService, ResultWorkflow } from "@/services/enrollment/courseGrade.service";
import { CourseFinalMarksEntry } from "@/components/classroom/CourseFinalMarksEntry";

export default function CommitteeWorkflowDetail() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const workflowId = params.workflowId as string;

    const [workflow, setWorkflow] = useState<ResultWorkflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [otpActionType, setOtpActionType] = useState<'approve' | 'return' | 'publish' | null>(null);

    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
    const [returnComment, setReturnComment] = useState("");

    const isCommitteeMember = user && isTeacherUser(user) && user.isExamCommitteeMember;

    useEffect(() => {
        if (workflowId && isCommitteeMember) {
            fetchData();
        }
    }, [workflowId, isCommitteeMember]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const wf = await courseGradeService.getWorkflowById(workflowId);
            setWorkflow(wf);
        } catch (error) {
            console.error("Failed to fetch details:", error);
            notifyError("Failed to load workflow details.");
        } finally {
            setLoading(false);
        }
    };

    const initiateAction = (action: 'approve' | 'return' | 'publish') => {
        setOtpActionType(action);
        if (action === 'return') {
            setReturnComment("");
            setIsReturnDialogOpen(true);
        } else {
            setOtpDialogOpen(true);
        }
    };

    const confirmReturnComment = () => {
        setIsReturnDialogOpen(false);
        setOtpDialogOpen(true);
    };

    const handleOtpConfirm = async (otp: string) => {
        if (!otpActionType || !workflow) return;

        setOtpDialogOpen(false);
        setActionLoading(otpActionType);

        try {
            let endpoint = '';
            const payload: { otp: string; comment?: string } = { otp };

            switch (otpActionType) {
                case 'approve':
                    endpoint = `/enrollment/committee-results/${workflow._id}/approve`;
                    break;
                case 'publish':
                    endpoint = `/enrollment/committee-results/${workflow._id}/publish`;
                    break;
                case 'return':
                    endpoint = `/enrollment/committee-results/${workflow._id}/return`;
                    payload.comment = returnComment;
                    break;
            }

            await api.post(endpoint, payload);
            notifySuccess(`Result ${otpActionType}ed successfully`);
            fetchData();
        } catch (error: any) {
            notifyError(error.response?.data?.message || `Failed to ${otpActionType} result`);
        } finally {
            setActionLoading(null);
            setOtpActionType(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUBMITTED_TO_COMMITTEE':
                return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800">Pending Review</Badge>;
            case 'COMMITTEE_APPROVED':
                return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800">Approved</Badge>;
            case 'PUBLISHED':
                return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800">Published</Badge>;
            case 'RETURNED_TO_TEACHER':
                return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800">Returned</Badge>;
            case 'WITH_INSTRUCTOR':
                return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700">With Instructor</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    // Access denied for non-committee members
    if (!isCommitteeMember) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                    <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Access Restricted
                    </h1>
                    <p className="max-w-md text-slate-600 dark:text-slate-400">
                        You do not have permission to view this page.
                        This area is restricted to assigned Exam Committee members only.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard/teacher/grading')}>
                    Back to Grading
                </Button>
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <AlertCircle className="h-12 w-12 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-700">Workflow Not Found</h2>
                <Button variant="outline" onClick={() => router.push('/dashboard/teacher/grading')}>Back to Grading</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit pl-0 hover:bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    onClick={() => router.push('/dashboard/teacher/grading?tab=committee')}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Committee Review
                </Button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(workflow.status)}
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Last updated: {format(new Date(workflow.updatedAt), "MMM d, yyyy h:mm a")}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            {workflow.grade?.course?.name || "Unknown Course"}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                <GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span className="font-bold">Batch:</span>
                                <span>
                                    {(() => {
                                        const batch = workflow.grade?.batch;
                                        if (!batch) return "-";
                                        return batch.code
                                            ? (batch.shift
                                                ? `${batch.shift === "evening" ? "E" : "D"}-${batch.name}`
                                                : batch.name)
                                            : batch.name;
                                    })()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span className="font-bold">Semester:</span>
                                <span>{workflow.semester}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span className="font-bold">Code:</span>
                                <span>{workflow.grade?.course?.code}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {workflow.status === 'SUBMITTED_TO_COMMITTEE' && (
                            <>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    onClick={() => initiateAction('approve')}
                                    disabled={!!actionLoading}
                                >
                                    {actionLoading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                    onClick={() => initiateAction('return')}
                                    disabled={!!actionLoading}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Return
                                </Button>
                            </>
                        )}

                        {workflow.status === 'COMMITTEE_APPROVED' && (
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                onClick={() => initiateAction('publish')}
                                disabled={!!actionLoading}
                            >
                                {actionLoading === 'publish' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Publish Result
                            </Button>
                        )}

                        {workflow.status === 'WITH_INSTRUCTOR' && (
                            <div className="flex items-center gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 text-sm italic">
                                <Shield className="h-4 w-4" />
                                Waiting for instructor submission
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Marks View (Reusing Teacher's component in read-only mode) */}
            <CourseFinalMarksEntry
                courseId={workflow.grade?.course?._id || workflow.courseId}
                batchId={workflow.grade?.batch?._id || workflow.batchId}
                semester={workflow.semester}
                isLocked={true}
            />

            {/* Return Comment Dialog */}
            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Return Result to Teacher</DialogTitle>
                        <DialogDescription className="dark:text-slate-400">
                            Please provide a reason for returning this result. This will be visible to the course instructor.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Discrepancy in Question 4 marks..."
                        value={returnComment}
                        onChange={(e) => setReturnComment(e.target.value)}
                        className="min-h-[100px] dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmReturnComment} disabled={!returnComment.trim()}>
                            Proceed to Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <OTPConfirmationDialog
                isOpen={otpDialogOpen}
                onClose={() => setOtpDialogOpen(false)}
                onConfirm={handleOtpConfirm}
                purpose={
                    otpActionType === 'publish' ? 'result_publication' :
                        otpActionType === 'return' ? 'result_return' :
                            'result_approval'
                }
                title={
                    otpActionType === 'approve' ? 'Confirm Approval' :
                        otpActionType === 'publish' ? 'Confirm Publication' :
                            'Confirm Return'
                }
                description={
                    otpActionType === 'approve' ? 'You are approving this result. This action will be recorded.' :
                        otpActionType === 'publish' ? 'You are publishing this result to students. This is a final action.' :
                            'You are returning this result to the teacher. All current approvals will be reset.'
                }
            />
        </div>
    );
}
