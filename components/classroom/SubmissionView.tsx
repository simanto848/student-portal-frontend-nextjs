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
import { Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";
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

                {/* Attachments would go here */}
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
                            <div className="space-y-2">
                                <Label>Files (Optional)</Label>
                                <Input
                                    type="file"
                                    multiple
                                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                />
                            </div>
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
