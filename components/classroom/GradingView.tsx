"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { assignmentService } from "@/services/classroom/assignment.service";
import { submissionService } from "@/services/classroom/submission.service";
import { Assignment, Submission, GradeSubmissionDto } from "@/services/classroom/types";
import { Loader2, CheckCircle, XCircle, FileText, AlertCircle, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { notifySuccess, notifyError } from "@/components/toast";

interface GradingViewProps {
    assignmentId: string;
}

export function GradingView({ assignmentId }: GradingViewProps) {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Grading Dialog State
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState<number>(0);
    const [isGrading, setIsGrading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            const [assignmentData, submissionsData] = await Promise.all([
                assignmentService.getById(assignmentId),
                submissionService.listByAssignment(assignmentId)
            ]);
            setAssignment(assignmentData);
            setSubmissions(submissionsData);
        } catch (error) {
            console.error("Failed to load grading data", error);
            notifyError("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGradeClick = (submission: Submission) => {
        setSelectedSubmission(submission);
        setGrade(submission.grade || 0);
    };

    const handleSaveGrade = async () => {
        if (!selectedSubmission) return;

        setIsGrading(true);
        try {
            const gradeData: GradeSubmissionDto = {
                grade: grade
            };

            const updatedSubmission = await submissionService.grade(selectedSubmission.id, gradeData);

            // Update local state without losing populated data
            setSubmissions(submissions.map(s => {
                if (s.id === updatedSubmission.id) {
                    return { ...updatedSubmission, studentId: s.studentId }; // Preserve populated studentId
                }
                return s;
            }));

            notifySuccess("Grade saved successfully");
            setSelectedSubmission(null);
        } catch (error: any) {
            notifyError(error.message || "Failed to save grade");
        } finally {
            setIsGrading(false);
        }
    };

    const handleDownloadFile = async (file: any) => {
        try {
            const blob = await submissionService.downloadSubmittedFile(file);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            notifyError("Failed to download file");
        }
    };

    // Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'other'>('other');
    const [previewName, setPreviewName] = useState<string>("");

    const handleClosePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setPreviewType('other');
        setPreviewName("");
    };

    const handleFileAction = async (file: any) => {
        const fileName = file.name || "file";
        const extension = fileName.split('.').pop()?.toLowerCase();

        // Define previewable types
        const isPdf = extension === 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || "");

        if (isPdf || isImage) {
            try {
                // Fetch blob for preview
                const blob = await submissionService.downloadSubmittedFile(file);
                const url = window.URL.createObjectURL(blob);

                setPreviewUrl(url);
                setPreviewType(isPdf ? 'pdf' : 'image');
                setPreviewName(fileName);
            } catch (error) {
                console.error("Failed to load preview", error);
                notifyError("Failed to load preview");
            }
        } else {
            // Fallback to download
            await handleDownloadFile(file);
        }
    };

    const getStudentName = (submission: Submission) => (submission.studentId as any)?.fullName || "Unknown Student";
    const getStudentEmail = (submission: Submission) => (submission.studentId as any)?.email || "No email";
    const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>;
    }

    if (!assignment) return <div>Assignment not found</div>;

    const turnedInCount = submissions.filter(s => s.status !== 'missing' && s.status !== 'none' && s.status !== 'draft').length;
    const missingCount = submissions.filter(s => s.status === 'missing').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;

    return (
        <div className="space-y-8 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-3xl font-black text-[#1a3d32] bg-gradient-to-r from-[#1a3d32] to-[#3e6253] bg-clip-text text-transparent">
                        {assignment.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                            Max Score: {assignment.maxScore}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                            Due: {assignment.dueAt ? format(new Date(assignment.dueAt), "MMM d, yyyy") : "No Due Date"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-center group cursor-default">
                        <span className="block text-3xl font-black text-[#3e6253] group-hover:scale-110 transition-transform duration-300">
                            {turnedInCount}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Turned In</span>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div className="text-center group cursor-default">
                        <span className="block text-3xl font-black text-rose-500 group-hover:scale-110 transition-transform duration-300">
                            {missingCount}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Missing</span>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div className="text-center group cursor-default">
                        <span className="block text-3xl font-black text-[#3e6253] group-hover:scale-110 transition-transform duration-300">
                            {gradedCount}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Graded</span>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                        Student Submissions
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{submissions.length}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="w-[30%] pl-6">Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 bg-slate-50 rounded-full">
                                                <FileText className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No submissions yet</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((submission) => {
                                    const studentName = getStudentName(submission);
                                    const studentEmail = getStudentEmail(submission);
                                    return (
                                        <TableRow key={submission.id} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                        {getInitials(studentName)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{studentName}</div>
                                                        <div className="text-xs text-slate-400 font-medium">{studentEmail}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {submission.status === 'missing' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider border border-rose-100">
                                                        <AlertCircle className="w-3 h-3" /> Missing
                                                    </span>
                                                ) : submission.late ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider border border-orange-100">
                                                        <XCircle className="w-3 h-3" /> Late
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                                                        <CheckCircle className="w-3 h-3" /> On Time
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-500 font-medium text-sm">
                                                {submission.submittedAt ? format(new Date(submission.submittedAt), "MMM d, h:mm a") : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {submission.status === 'graded' ? (
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-black text-slate-800 text-lg">{submission.grade}</span>
                                                        <span className="text-xs text-slate-400 font-medium">/ {assignment.maxScore}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm italic font-medium">--</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleGradeClick(submission)}
                                                    className="font-bold bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-[#3e6253] hover:text-white hover:border-[#3e6253] transition-all"
                                                >
                                                    Grade / Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DialogContent className="sm:max-w-[700px] overflow-hidden p-0 gap-0 rounded-2xl bg-[#fafafa]">
                    <DialogHeader className="p-6 bg-white border-b border-slate-100">
                        <DialogTitle className="flex items-center gap-3">
                            <span className="text-xl font-black text-slate-900">Grading</span>
                            {selectedSubmission && (
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                    {getStudentName(selectedSubmission)}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="flex flex-col md:flex-row h-full max-h-[70vh]">
                            {/* Left Side: Submission Content */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Answer</Label>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm leading-relaxed text-slate-700 min-h-[120px]">
                                        {selectedSubmission.textAnswer || <span className="italic text-slate-400">No text explanation provided.</span>}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                        Attachments
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-600">
                                            {selectedSubmission.files?.length || 0}
                                        </span>
                                    </Label>

                                    {selectedSubmission.files && selectedSubmission.files.length > 0 ? (
                                        <div className="grid gap-2">
                                            {selectedSubmission.files.map((file, i) => {
                                                const ext = file.name?.split('.').pop()?.toLowerCase();
                                                const canPreview = ext === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || "");

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleFileAction(file)}
                                                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition-all text-left group"
                                                    >
                                                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700">{file.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-blue-400">
                                                                {canPreview ? "Click to preview" : "Click to download"}
                                                            </p>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                            No files attached
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Grading Controls */}
                            <div className="w-full md:w-[320px] bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-6">
                                <div>
                                    <Label htmlFor="grade" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Score</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <Input
                                                id="grade"
                                                type="number"
                                                min="0"
                                                max={assignment.maxScore}
                                                value={grade}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    if (val <= assignment.maxScore) {
                                                        setGrade(val);
                                                    }
                                                }}
                                                className="h-14 text-2xl font-black text-center bg-white border-slate-200 focus:border-[#3e6253] focus:ring-[#3e6253] rounded-xl"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                                / {assignment.maxScore}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium text-center">
                                        Enter a score between 0 and {assignment.maxScore}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <Button
                                        onClick={handleSaveGrade}
                                        disabled={isGrading}
                                        className="w-full h-12 bg-[#3e6253] text-white hover:bg-[#2c4a3e] rounded-xl font-bold text-base shadow-lg shadow-[#3e6253]/20"
                                    >
                                        {isGrading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Publish Grade"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setSelectedSubmission(null)}
                                        className="w-full h-10 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* File Preview Dialog */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && handleClosePreview()}>
                <DialogContent className="w-[95vw] h-[95vh] max-w-none p-0 gap-0 overflow-hidden bg-slate-950 border-slate-800 shadow-2xl flex flex-col">
                    <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 flex flex-row items-center justify-between shrink-0">
                        <DialogTitle className="text-slate-100 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-[#2dd4bf]" />
                            </div>
                            <div>
                                <span className="block text-base font-bold truncate max-w-md tracking-tight">{previewName || "File Preview"}</span>
                                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Preview Mode</span>
                            </div>
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClosePreview}
                            className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <XCircle className="h-6 w-6" />
                        </Button>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden relative p-1">
                        {previewType === 'pdf' ? (
                            <iframe
                                src={previewUrl!}
                                className="w-full h-full rounded-none border-none bg-white shadow-sm"
                                title="PDF Preview"
                            />
                        ) : previewType === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewUrl!}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-2xl"
                            />
                        ) : (
                            <div className="text-center text-slate-500">
                                <AlertCircle className="h-20 w-20 mx-auto mb-6 opacity-20" />
                                <p className="font-medium text-lg">Preview unavailable for this file type</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
