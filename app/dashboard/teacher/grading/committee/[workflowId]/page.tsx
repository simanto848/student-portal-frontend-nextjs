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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

interface TheoryMarks {
    attendance?: number | string | null;
    midterm?: number | string | null;
    continuousAssessment?: number | string | null;
    finalExam?: number | string | null;
}

interface LabMarks {
    labReports?: number | string | null;
    attendance?: number | string | null;
    finalLab?: number | string | null;
}

interface StudentGradeDetail {
    studentId: string;
    enrollmentId: string;
    totalMarksObtained: number;
    grade?: string;
    letterGrade?: string;
    gradePoint: number;
    student: {
        fullName: string;
        registrationNumber: string;
    };
    courseType?: "theory" | "lab" | "combined";
    theoryMarks?: TheoryMarks;
    labMarks?: LabMarks;
}

export default function CommitteeWorkflowDetail() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const workflowId = params.workflowId as string;

    const [workflow, setWorkflow] = useState<ResultWorkflow | null>(null);
    const [grades, setGrades] = useState<StudentGradeDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [viewStudent, setViewStudent] = useState<StudentGradeDetail | null>(null);

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

            // Fetch Grades
            const response = await api.get('/enrollment/grades', {
                params: {
                    batchId: wf.grade?.batch?._id || wf.batchId,
                    courseId: wf.grade?.course?._id || wf.courseId
                }
            });
            const gradesData = response.data.data?.students || response.data.data || [];
            setGrades(Array.isArray(gradesData) ? gradesData : []);

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
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">Pending Review</Badge>;
            case 'COMMITTEE_APPROVED':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Approved</Badge>;
            case 'PUBLISHED':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Published</Badge>;
            case 'RETURNED_TO_TEACHER':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Returned</Badge>;
            case 'WITH_INSTRUCTOR':
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200">With Instructor</Badge>;
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
                    className="w-fit pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800"
                    onClick={() => router.push('/dashboard/teacher/grading?tab=committee')}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Committee Review
                </Button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(workflow.status)}
                            <span className="text-sm text-slate-500 font-medium">
                                Last updated: {format(new Date(workflow.updatedAt), "MMM d, yyyy h:mm a")}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            {workflow.grade?.course?.name || "Unknown Course"}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                <GraduationCap className="h-4 w-4 text-slate-500" />
                                <span className="font-bold">Batch:</span>
                                <span>{workflow.grade?.batch?.code || workflow.grade?.batch?.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <span className="font-bold">Semester:</span>
                                <span>{workflow.semester}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <span className="font-bold">Code:</span>
                                <span>{workflow.grade?.course?.code}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
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
                                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
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
                            <div className="flex items-center gap-2 px-3 py-2 text-slate-500 text-sm italic">
                                <Shield className="h-4 w-4" />
                                Waiting for instructor submission
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <Card className="border-slate-200 shadow-sm overflow-hidden p-0">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <CardTitle className="text-lg font-bold text-slate-800">Detailed Grade Report</CardTitle>
                    <CardDescription>
                        Complete list of student grades and breakdown. Click on a student to view detailed marks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="pl-6 w-[40%]">Student</TableHead>
                                <TableHead className="w-[20%]">Registration</TableHead>
                                <TableHead className="text-right w-[15%]">Total Marks</TableHead>
                                <TableHead className="text-right w-[10%]">Grade</TableHead>
                                <TableHead className="text-right pr-6 w-[15%]">GPA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grades.length > 0 ? (
                                grades.map((grade) => (
                                    <TableRow
                                        key={grade.studentId}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => setViewStudent(grade)}
                                    >
                                        <TableCell className="pl-6 font-medium text-slate-700">
                                            <div className="flex flex-col">
                                                <span>{grade.student?.fullName || "Unknown"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm font-mono">{grade.student?.registrationNumber || "-"}</TableCell>
                                        <TableCell className="text-right font-medium">{grade.totalMarksObtained}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={`font-bold ${(grade.letterGrade || grade.grade) === 'F' ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-700'}`}>
                                                {grade.letterGrade || grade.grade || "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 font-mono text-slate-500">{grade.gradePoint?.toFixed(2) || "-"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                        No grades available for this course yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Student Marks Breakdown Dialog */}
            <Dialog open={!!viewStudent} onOpenChange={(open) => !open && setViewStudent(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Marks Breakdown</DialogTitle>
                        <DialogDescription>
                            Detailed score for {viewStudent?.student?.fullName} ({viewStudent?.student?.registrationNumber})
                        </DialogDescription>
                    </DialogHeader>

                    {viewStudent && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Score</p>
                                    <p className="text-2xl font-black text-slate-900">{viewStudent.totalMarksObtained}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Grade Point</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <Badge className="text-lg px-3 py-1 bg-indigo-600 font-bold">{viewStudent.letterGrade || viewStudent.grade || "-"}</Badge>
                                        <span className="text-xl font-medium text-slate-600">{viewStudent.gradePoint?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {(viewStudent.courseType === 'theory' || viewStudent.courseType === 'combined') && viewStudent.theoryMarks && (
                                    <div className="space-y-3">
                                        <h5 className="font-bold text-sm text-slate-700 border-b pb-2">Theory Component</h5>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Attendance</span>
                                                <span className="font-medium">{viewStudent.theoryMarks.attendance ?? '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Midterm</span>
                                                <span className="font-medium">{viewStudent.theoryMarks.midterm ?? '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Continuous Assessment</span>
                                                <span className="font-medium">{viewStudent.theoryMarks.continuousAssessment ?? '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 font-bold">Final Exam</span>
                                                <span className="font-bold">{viewStudent.theoryMarks.finalExam ?? '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(viewStudent.courseType === 'lab' || viewStudent.courseType === 'combined') && viewStudent.labMarks && (
                                    <div className="space-y-3">
                                        <h5 className="font-bold text-sm text-slate-700 border-b pb-2">Lab Component</h5>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Lab Reports</span>
                                                <span className="font-medium">{viewStudent.labMarks.labReports ?? '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Attendance</span>
                                                <span className="font-medium">{viewStudent.labMarks.attendance ?? '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 font-bold">Final Lab</span>
                                                <span className="font-bold">{viewStudent.labMarks.finalLab ?? '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setViewStudent(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Comment Dialog */}
            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return Result to Teacher</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for returning this result. This will be visible to the course instructor.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Discrepancy in Question 4 marks..."
                        value={returnComment}
                        onChange={(e) => setReturnComment(e.target.value)}
                        className="min-h-[100px]"
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
