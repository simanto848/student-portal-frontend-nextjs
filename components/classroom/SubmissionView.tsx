"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignmentService } from "@/services/classroom/assignment.service";
import { submissionService } from "@/services/classroom/submission.service";
import { Assignment, Submission, SubmitAssignmentDto } from "@/services/classroom/types";
import { Loader2, FileText, CheckCircle, AlertCircle, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { downloadBlob } from "@/lib/download";

interface SubmissionViewProps {
    assignmentId: string;
    studentId: string; // To check if it's the current user's submission
}

export function SubmissionView({ assignmentId, studentId: _studentId }: SubmissionViewProps) {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [textAnswer, setTextAnswer] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            const [assignmentData, mySubmission] = await Promise.all([
                assignmentService.getById(assignmentId),
                submissionService.getMineByAssignment(assignmentId)
            ]);

            setAssignment(assignmentData);

            if (mySubmission) {
                setSubmission(mySubmission);
                setTextAnswer(mySubmission.textAnswer || "");
            }
        } catch (error) {
            console.error("Failed to load submission data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!textAnswer && files.length === 0) {
            toast.error("Please provide a text answer or add files");
            return;
        }

        if (assignment?.requiresFileUpload && files.length === 0) {
            toast.error("File upload is required for this assignment");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = files.length > 0
                ? await (() => {
                    const formData = new FormData();
                    formData.append('textAnswer', textAnswer);
                    files.forEach((file) => {
                        formData.append('files', file);
                    });
                    return submissionService.submitWithFiles(assignmentId, formData);
                })()
                : await (() => {
                    const submitData: SubmitAssignmentDto = { textAnswer };
                    return submissionService.submitOrUpdate(assignmentId, submitData);
                })();

            setSubmission(result);
            setFiles([]);
            toast.success("Assignment submitted successfully");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to submit assignment";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveExistingFile = async (fileId: string) => {
        if (!submission) return;

        // Optimistic UI update or loading state could go here, but for now simple await
        try {
            const updatedSubmission = await submissionService.removeFile(submission.id, fileId);
            setSubmission(updatedSubmission);
            toast.success("File removed");
        } catch (error) {
            toast.error("Failed to remove file");
        }
    };

    const handleDownloadFile = async (index: number) => {
        if (!submission?.files?.[index]) return;
        try {
            const file = submission.files[index];
            const blob = await submissionService.downloadSubmittedFile(file);
            downloadBlob(blob, file.name || 'submission');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to download file';
            toast.error(message);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>;
    }

    if (!assignment) return <div>Assignment not found</div>;

    const isLate = assignment.dueAt && new Date() > new Date(assignment.dueAt);
    const isSubmitted = !!submission;
    const canSubmit = !isSubmitted || (isSubmitted && submission.status !== 'graded');

    return (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#1a3d32]">{assignment.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{assignment.maxScore} points</span>
                        <span>•</span>
                        <span>Due {assignment.dueAt ? format(new Date(assignment.dueAt), "MMM d, yyyy h:mm a") : "No due date"}</span>
                    </div>
                </div>

                <div className="prose max-w-none text-gray-600">
                    <p>{assignment.description}</p>
                </div>

                {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Attachments</Label>
                        <div className="grid gap-2">
                            {assignment.attachments.map((file, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className="justify-start h-auto py-3 px-4 bg-white hover:bg-slate-50 border-slate-200"
                                    onClick={() => {
                                        if (file.id && assignment.id) {
                                            assignmentService.downloadAttachment(assignment.id, file.id, file.name)
                                                .then(blob => downloadBlob(blob, file.name));
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="h-8 w-8 rounded-lg bg-[#3e6253]/10 flex items-center justify-center shrink-0">
                                            <FileText className="h-4 w-4 text-[#3e6253]" />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-medium text-slate-700 truncate">{file.name}</div>
                                            <div className="text-xs text-slate-400">{(file.size ? file.size / 1024 : 0).toFixed(0)} KB</div>
                                        </div>
                                        <div className="text-xs font-bold text-[#3e6253]">Download</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Work</CardTitle>
                    <CardDescription>
                        {isSubmitted ? (
                            <span className="flex items-center text-green-600">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                {submission.status === 'graded' ? `Graded: ${submission.grade}/${assignment.maxScore}` : "Turned in"}
                                {submission.late && <span className="ml-2 text-red-500 text-xs font-bold">LATE</span>}
                            </span>
                        ) : (
                            <span className="flex items-center text-amber-600">
                                <AlertCircle className="mr-1 h-4 w-4" />
                                {isLate ? "Missing" : "Assigned"}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {canSubmit ? (
                        <>
                            <div className="space-y-2">
                                <Label>Text Answer</Label>
                                <Textarea
                                    value={textAnswer}
                                    onChange={(e) => setTextAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={5}
                                />
                            </div>
                            {assignment.requiresFileUpload && (
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold text-slate-900">Attached Files (Required)</Label>

                                    <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 hover:border-[#3e6253] transition-all relative group bg-slate-50/50 min-h-[150px]">
                                        <input
                                            type="file"
                                            multiple
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                                                }
                                            }}
                                        />

                                        <div className="p-6 flex flex-col items-center justify-center text-center w-full">
                                            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <UploadCloud className="h-6 w-6 text-[#3e6253]" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">Click to upload or drag files</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, Word, Images supported</p>
                                        </div>

                                        {/* File List Area */}
                                        {(files.length > 0 || (submission?.files && submission.files.length > 0)) && (
                                            <div className="w-full px-4 pb-4 space-y-2 relative z-20">
                                                <div className="h-px bg-slate-200 w-full mb-3" />
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-left">
                                                    Attached Files ({(files.length + (submission?.files?.length || 0))})
                                                </p>

                                                {/* Previously Uploaded Files */}
                                                {submission?.files?.map((file, idx) => (
                                                    <div
                                                        key={`existing-${idx}`}
                                                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                                                        onClick={(e) => { e.stopPropagation(); handleDownloadFile(idx); }}
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                            <span className="truncate max-w-[200px] font-medium text-slate-700">{file.name}</span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 ml-2">UPLOADED</span>
                                                        </div>
                                                        {submission.status !== 'graded' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (file.id) handleRemoveExistingFile(file.id);
                                                                }}
                                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 ml-2"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Newly Selected Files */}
                                                {files.map((file, idx) => (
                                                    <div key={`new-${idx}`} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm text-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FileText className="h-4 w-4 text-[#3e6253]" />
                                                            <span className="truncate max-w-[200px] font-medium text-slate-700">{file.name}</span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 ml-2">NEW</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent triggering file input
                                                                setFiles(files.filter((_, i) => i !== idx));
                                                            }}
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            {submission?.textAnswer && (
                                <div className="bg-gray-50 p-3 rounded-md text-sm">
                                    <p className="font-medium text-xs text-gray-500 mb-1">Text Answer:</p>
                                    {submission.textAnswer}
                                </div>
                            )}
                            {submission?.files?.map((file, i) => (
                                <Button
                                    key={i}
                                    variant="ghost"
                                    className="justify-start px-0 text-blue-600 hover:text-blue-700"
                                    onClick={() => handleDownloadFile(i)}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {file.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {canSubmit && (
                        <Button
                            className="w-full bg-[#3e6253] text-white hover:bg-[#2c4a3e]"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSubmitted ? "Resubmit" : "Turn in")}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
