"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  assessmentService,
  Assessment,
  AssessmentSubmission,
} from "@/services/enrollment/assessment.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import {
  Loader2,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface StudentAssessmentViewProps {
  courseId: string;
  batchId: string;
  studentId: string;
}

export function StudentAssessmentView({
  courseId,
  batchId,
  studentId,
}: StudentAssessmentViewProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Submission Form State
  const [submissionContent, setSubmissionContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, [courseId, batchId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assessmentsData, submissionsData, enrollmentsData] =
        await Promise.all([
          assessmentService.list({ courseId, batchId, status: "published" }),
          assessmentService.listSubmissions({ courseId, batchId, studentId }),
          enrollmentService.listEnrollments({
            courseId,
            batchId,
            studentId,
            limit: 1,
          }),
        ]);
      setAssessments(assessmentsData.assessments || []);
      setSubmissions(submissionsData.submissions || []);
      const firstEnrollment = enrollmentsData?.enrollments?.[0];
      setEnrollmentId(firstEnrollment?.id || null);
    } catch (error) {
      toast.error("Failed to fetch assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmission = (assessmentId: string) => {
    return submissions.find((s) => s.assessmentId === assessmentId);
  };

  const handleOpenSubmission = (assessment: Assessment) => {
    const submission = getSubmission(assessment.id);
    setSelectedAssessment(assessment);
    if (submission) {
      setSubmissionContent(submission.content || "");
      setFileUrl(submission.attachments?.[0] || "");
    } else {
      setSubmissionContent("");
      setFileUrl("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;
    if (!enrollmentId) {
      toast.error("Enrollment not found for this course");
      return;
    }
    if (!submissionContent && !fileUrl) {
      toast.error("Please provide content or a file URL");
      return;
    }

    setIsSubmitting(true);
    try {
      await assessmentService.submit({
        assessmentId: selectedAssessment.id,
        enrollmentId,
        content: submissionContent,
        attachments: fileUrl
          ? [
              {
                filename: fileUrl.split("/").pop() || "attachment",
                url: fileUrl,
              },
            ]
          : [],
      });
      toast.success("Assessment submitted successfully");
      setSelectedAssessment(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
          </div>
        ) : assessments.length > 0 ? (
          assessments.map((assessment) => {
            const submission = getSubmission(assessment.id);
            const isSubmitted = !!submission;
            const isGraded = submission?.status === "graded";
            const isLate =
              assessment.dueDate &&
              new Date() > new Date(assessment.dueDate) &&
              !isSubmitted;

            return (
              <Card key={assessment.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {assessment.title}
                    </CardTitle>
                    {isGraded ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {submission.obtainedMarks}/{assessment.totalMarks}
                      </span>
                    ) : isSubmitted ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Submitted
                      </span>
                    ) : isLate ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Missing
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Assigned
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    Due:{" "}
                    {assessment.dueDate
                      ? format(new Date(assessment.dueDate), "MMM d, yyyy")
                      : "No due date"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {assessment.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isSubmitted ? "outline" : "default"}
                    onClick={() => handleOpenSubmission(assessment)}
                  >
                    {isSubmitted ? "View Submission" : "Start Assessment"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p>No assessments available at this time.</p>
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedAssessment}
        onOpenChange={(open) => !open && setSelectedAssessment(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAssessment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Answer</Label>
              <Textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                disabled={
                  getSubmission(selectedAssessment?.id!)?.status === "graded"
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Attachment URL (Optional)</Label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                disabled={
                  getSubmission(selectedAssessment?.id!)?.status === "graded"
                }
              />
            </div>

            {getSubmission(selectedAssessment?.id!)?.status === "graded" && (
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-800 mb-1">Feedback</h4>
                <p className="text-sm text-green-700">
                  {getSubmission(selectedAssessment?.id!)?.feedback ||
                    "No feedback provided."}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedAssessment(null)}
            >
              Close
            </Button>
            {getSubmission(selectedAssessment?.id!)?.status !== "graded" && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#3e6253] hover:bg-[#2c463b]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
