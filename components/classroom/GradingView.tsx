"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { assignmentService } from "@/services/classroom/assignment.service";
import { submissionService } from "@/services/classroom/submission.service";
import { Assignment, Submission, GradeSubmissionDto } from "@/services/classroom/types";
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
            toast.error("Failed to load data");
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

            setSubmissions(submissions.map(s => s.id === updatedSubmission.id ? updatedSubmission : s));
            toast.success("Grade saved successfully");
            setSelectedSubmission(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to save grade");
        } finally {
            setIsGrading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>;
    }

    if (!assignment) return <div>Assignment not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#1a3d32]">{assignment.title}</h2>
                    <p className="text-muted-foreground">Max Score: {assignment.maxScore}</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-2xl">{submissions.length}</span>
                        <span className="text-muted-foreground">Turned In</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-2xl">{submissions.filter(s => s.status === 'graded').length}</span>
                        <span className="text-muted-foreground">Graded</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No submissions yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">
                                            {/* Ideally we fetch student name, but for now ID or populated field if available */}
                                            {/* Assuming studentId might be populated or just ID */}
                                            {(submission.studentId as any)?.fullName || (submission.studentId as any)?.email || submission.studentId}
                                        </TableCell>
                                        <TableCell>
                                            {submission.late ? (
                                                <span className="text-red-500 font-medium text-xs">Late</span>
                                            ) : (
                                                <span className="text-green-600 font-medium text-xs">On Time</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {submission.submittedAt ? format(new Date(submission.submittedAt), "MMM d, h:mm a") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {submission.status === 'graded' ? (
                                                <span className="font-bold">{submission.grade}/{assignment.maxScore}</span>
                                            ) : (
                                                <span className="text-muted-foreground italic">Not graded</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleGradeClick(submission)}>
                                                Grade
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Student Answer</Label>
                                <div className="bg-gray-50 p-4 rounded-md text-sm min-h-[100px]">
                                    {selectedSubmission.textAnswer || "No text answer provided."}
                                </div>
                            </div>

                            {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Attachments</Label>
                                    <div className="space-y-2">
                                        {selectedSubmission.files.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-blue-600">
                                                <FileText className="h-4 w-4" />
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {file.name || file.url}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="grade">Grade (Max: {assignment.maxScore})</Label>
                                    <Input
                                        id="grade"
                                        type="number"
                                        min="0"
                                        max={assignment.maxScore}
                                        value={grade}
                                        onChange={(e) => setGrade(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveGrade} disabled={isGrading} className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
                                    {isGrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Grade"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
