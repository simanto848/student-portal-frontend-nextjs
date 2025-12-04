"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { assignmentService } from "@/services/classroom/assignment.service";
import { submissionService } from "@/services/classroom/submission.service";
import { Assignment, Submission, SubmitAssignmentDto } from "@/services/classroom/types";
import { Loader2, Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface SubmissionViewProps {
    assignmentId: string;
    studentId: string; // To check if it's the current user's submission
}

export function SubmissionView({ assignmentId, studentId }: SubmissionViewProps) {
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [textAnswer, setTextAnswer] = useState("");
    // File upload is mocked for now as we don't have a file upload service ready in this context
    // In a real app, we'd upload to S3/Cloudinary and get a URL
    const [fileUrl, setFileUrl] = useState("");

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            const [assignmentData, submissionsData] = await Promise.all([
                assignmentService.getById(assignmentId),
                submissionService.listByAssignment(assignmentId) // This might return all for admin, but for student it should be restricted or we filter
            ]);

            setAssignment(assignmentData);

            // Find my submission
            // Note: In a real student view, the API might return just MY submission or I filter by my ID
            // Assuming listByAssignment returns array, we find ours. 
            // If the API for students returns only their own, we take the first one.
            const mySubmission = submissionsData.find((s: any) => s.studentId === studentId || s.studentId?._id === studentId);

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
        if (!textAnswer && !fileUrl) {
            toast.error("Please provide a text answer or file URL");
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData: SubmitAssignmentDto = {
                textAnswer,
                files: fileUrl ? [{ name: "Submission File", url: fileUrl, type: "link" }] : []
            };

            const result = await submissionService.submitOrUpdate(assignmentId, submitData);
            setSubmission(result);
            toast.success("Assignment submitted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit assignment");
        } finally {
            setIsSubmitting(false);
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
                                <Label>File URL (Optional)</Label>
                                <Input
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    placeholder="https://docs.google.com/..."
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
                                <div key={i} className="flex items-center gap-2 text-sm text-blue-600">
                                    <FileText className="h-4 w-4" />
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {file.name || file.url}
                                    </a>
                                </div>
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
