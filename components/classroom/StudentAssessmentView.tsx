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
import { downloadBlob } from "@/lib/download";
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchData();
  }, [courseId, batchId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch assessments and submissions - enrollment is optional
      const [assessmentsData, submissionsData] = await Promise.all([
        assessmentService.list({ courseId, batchId, status: "published" }),
        assessmentService.listSubmissions({ courseId, batchId, studentId }),
      ]);

      setAssessments(
        Array.isArray(assessmentsData)
          ? assessmentsData
          : assessmentsData.assessments || []
      );
      setSubmissions(
        Array.isArray(submissionsData)
          ? submissionsData
          : submissionsData.submissions || []
      );

      // Try to get enrollment ID (optional - student may not be enrolled)
      try {
        const enrollmentsData = await enrollmentService.listEnrollments({
          courseId,
          batchId,
          studentId,
          limit: 1,
        });
        const firstEnrollment = enrollmentsData?.enrollments?.[0];
        setEnrollmentId(firstEnrollment?.id || null);
      } catch {
        // Student may not be enrolled - that's okay
        setEnrollmentId(null);
      }
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
      setSelectedFiles([]);
    } else {
      setSubmissionContent("");
      setSelectedFiles([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;
    if (!submissionContent && selectedFiles.length === 0) {
      toast.error("Please provide content or attach a file");
      return;
    }

    setIsSubmitting(true);
    try {
      const existingSubmission = getSubmission(selectedAssessment.id);

      const formData = new FormData();
      formData.append("assessmentId", selectedAssessment.id);
      if (enrollmentId) formData.append("enrollmentId", enrollmentId); // Optional
      if (submissionContent) formData.append("content", submissionContent);
      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      if (existingSubmission?.id && existingSubmission.status !== "graded") {
        await assessmentService.updateSubmissionWithFiles(existingSubmission.id, formData);
      } else {
        await assessmentService.submitWithFiles(formData);
      }
      toast.success("Assessment submitted successfully");
      setSelectedAssessment(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAttachment = async (
    attachment: NonNullable<AssessmentSubmission["attachments"]>[number]
  ) => {
    const url = attachment.url || attachment.fileUrl;
    if (!url) {
      toast.error("Attachment is missing a download URL");
      return;
    }
    const filename = attachment.filename || attachment.fileName || "attachment";
    try {
      const blob = await assessmentService.downloadSubmissionAttachment(url);
      downloadBlob(blob, filename);
    } catch (error) {
      toast.error("Failed to download attachment");
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
              <Label>Attachments (Optional)</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedFiles(files);
                }}
                disabled={
                  getSubmission(selectedAssessment?.id!)?.status === "graded"
                }
              />
              {selectedFiles.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  {selectedFiles.map((f) => f.name).join(", ")}
                </div>
              ) : null}
            </div>

            {getSubmission(selectedAssessment?.id!)?.attachments &&
              (getSubmission(selectedAssessment?.id!)?.attachments?.length || 0) >
              0 ? (
              <div className="space-y-2">
                <Label>Submitted Attachments</Label>
                <div className="space-y-2">
                  {getSubmission(selectedAssessment?.id!)?.attachments?.map(
                    (att, idx) => (
                      <div
                        key={att.id || idx}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="text-sm truncate">
                          {att.filename || att.fileName || "attachment"}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadAttachment(att)}
                        >
                          Download
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : null}

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
