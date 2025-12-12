"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { assessmentService } from "@/services/enrollment/assessment.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { enrollmentService } from "@/services/enrollment/enrollment.service";

export default function StudentAssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(
    null
  );
  const [submitContent, setSubmitContent] = useState("");
  const [submitAttachmentUrl, setSubmitAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const studentId = user.id || user._id;

      // Fetch assessments and submissions
      const [assessmentsRes, submissionsRes] = await Promise.all([
        assessmentService.list({ studentId }),
        assessmentService.listSubmissions({ studentId }),
      ]);

      let assessmentsList: any[] = [];
      if (Array.isArray(assessmentsRes)) {
        assessmentsList = assessmentsRes;
      } else if (
        assessmentsRes &&
        Array.isArray((assessmentsRes as any).assessments)
      ) {
        assessmentsList = (assessmentsRes as any).assessments;
      } else if (
        assessmentsRes &&
        Array.isArray((assessmentsRes as any).data)
      ) {
        assessmentsList = (assessmentsRes as any).data;
      }

      let submissionsList: any[] = [];
      if (Array.isArray(submissionsRes)) {
        submissionsList = submissionsRes;
      } else if (
        submissionsRes &&
        Array.isArray((submissionsRes as any).submissions)
      ) {
        submissionsList = (submissionsRes as any).submissions;
      } else if (
        submissionsRes &&
        Array.isArray((submissionsRes as any).data)
      ) {
        submissionsList = (submissionsRes as any).data;
      }

      setAssessments(assessmentsList);
      setSubmissions(submissionsList);
    } catch (err: any) {
      console.error("Failed to fetch assessments", err);
      setError("Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  };

  const openSubmitDialog = (assessment: any) => {
    setSelectedAssessment(assessment);
    setSubmitContent("");
    setSubmitAttachmentUrl("");
    setSubmitOpen(true);
  };

  const handleSubmitAssessment = async () => {
    if (!user || !selectedAssessment) return;
    try {
      setIsSubmitting(true);
      setError(null);

      const assessmentId = selectedAssessment.id || selectedAssessment._id;
      const courseId =
        typeof selectedAssessment.courseId === "object"
          ? selectedAssessment.courseId?.id || selectedAssessment.courseId?._id
          : selectedAssessment.courseId;
      const batchId =
        typeof selectedAssessment.batchId === "object"
          ? selectedAssessment.batchId?.id || selectedAssessment.batchId?._id
          : selectedAssessment.batchId;

      if (!assessmentId || !courseId || !batchId) {
        setError("Missing assessment identifiers. Please contact support.");
        return;
      }

      const enrollmentsRes = await enrollmentService.listEnrollments({
        courseId,
        batchId,
        status: "active",
      });

      const enrollments = Array.isArray(enrollmentsRes)
        ? (enrollmentsRes as any[])
        : (enrollmentsRes as any)?.enrollments || [];

      const enrollmentId = enrollments?.[0]?.id || enrollments?.[0]?._id;
      if (!enrollmentId) {
        setError(
          "No active enrollment found for this assessment (course/batch)."
        );
        return;
      }

      await assessmentService.submit({
        assessmentId,
        enrollmentId,
        content: submitContent?.trim() ? submitContent.trim() : undefined,
        attachments: submitAttachmentUrl?.trim()
          ? [
              {
                filename:
                  submitAttachmentUrl.trim().split("/").pop() || "attachment",
                url: submitAttachmentUrl.trim(),
              },
            ]
          : undefined,
      });

      setSubmitOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Failed to submit assessment", err);
      setError(err?.message || "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categorize assessments
  const now = new Date();
  const pending = assessments.filter((a) => {
    const dueDate = new Date(a.dueDate);
    const hasSubmission = submissions.some(
      (s) => s.assessmentId === a.id || s.assessmentId === a._id
    );
    return dueDate > now && !hasSubmission && a.status === "published";
  });

  const submitted = assessments.filter((a) => {
    return submissions.some(
      (s) => s.assessmentId === a.id || s.assessmentId === a._id
    );
  });

  const overdue = assessments.filter((a) => {
    const dueDate = new Date(a.dueDate);
    const hasSubmission = submissions.some(
      (s) => s.assessmentId === a.id || s.assessmentId === a._id
    );
    return dueDate < now && !hasSubmission && a.status === "published";
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Assessments & Submissions
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Your assignments and exams
              </h1>
              <p className="text-white/75 max-w-2xl">
                Track pending assessments, submit work, and view graded results.
              </p>
              <div className="flex gap-3 flex-wrap pt-1">
                <Button
                  size="sm"
                  className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <div className="rounded-2xl bg-yellow-500/20 backdrop-blur p-4 shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Pending
                </p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-2xl font-bold">{pending.length}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-green-500/20 backdrop-blur p-4 shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Submitted
                </p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-2xl font-bold">{submitted.length}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-red-500/20 backdrop-blur p-4 shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Overdue
                </p>
                <div className="flex items-end gap-1 mt-2">
                  <span className="text-2xl font-bold">{overdue.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {overdue.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have {overdue.length} overdue assessment(s). Please submit
              them as soon as possible.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="pending">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({submitted.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdue.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#3e6253]" /> Pending
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pending.length > 0 ? (
                  pending.map((assessment) => {
                    const dueDate = new Date(assessment.dueDate);
                    const course =
                      typeof assessment.courseId === "object"
                        ? assessment.courseId
                        : null;
                    const daysLeft = Math.ceil(
                      (dueDate.getTime() - now.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={assessment.id}
                        className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-[#1a3d32]">
                                {assessment.title}
                              </p>
                              <Badge
                                className={
                                  daysLeft <= 2
                                    ? "bg-red-100 text-red-700"
                                    : daysLeft <= 5
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-700"
                                }
                              >
                                {daysLeft} days left
                              </Badge>
                              <Badge variant="outline">
                                {assessment.assessmentType?.name ||
                                  "Assessment"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {course?.code || "N/A"} -{" "}
                              {course?.name || "Unknown Course"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {dueDate.toLocaleDateString()}
                              </span>
                              <span>
                                Max Score: {assessment.maxScore || "N/A"}
                              </span>
                              <span>Weight: {assessment.weightage || 0}%</span>
                            </div>
                            {assessment.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {assessment.description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]"
                            onClick={() => {
                              openSubmitDialog(assessment);
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Submit
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending assessments. Great job!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#3e6253]" /> Submitted
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {submitted.length > 0 ? (
                  submitted.map((assessment) => {
                    const submission = submissions.find(
                      (s) =>
                        s.assessmentId === assessment.id ||
                        s.assessmentId === assessment._id
                    );
                    const course =
                      typeof assessment.courseId === "object"
                        ? assessment.courseId
                        : null;
                    const isGraded = submission?.status === "graded";

                    return (
                      <div
                        key={assessment.id}
                        className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-[#1a3d32]">
                                {assessment.title}
                              </p>
                              <Badge className="bg-green-100 text-green-700">
                                Submitted
                              </Badge>
                              {isGraded && (
                                <Badge className="bg-blue-100 text-blue-700">
                                  Graded
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {course?.code || "N/A"} -{" "}
                              {course?.name || "Unknown Course"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Submitted:{" "}
                                {submission?.submittedAt
                                  ? new Date(
                                      submission.submittedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                              {isGraded &&
                                submission?.marksObtained != null && (
                                  <span className="font-semibold text-[#3e6253]">
                                    Score: {submission.marksObtained}/
                                    {assessment.maxScore || "N/A"}
                                  </span>
                                )}
                            </div>
                            {isGraded && submission?.marksObtained != null && (
                              <Progress
                                value={
                                  (submission.marksObtained /
                                    (assessment.maxScore || 100)) *
                                  100
                                }
                                className="mt-3"
                              />
                            )}
                            {submission?.feedback && (
                              <p className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
                                Feedback: {submission.feedback}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[#1a3d32] border-[#3e6253] hover:bg-[#3e6253]/10"
                            onClick={() => {
                              window.alert("View submission details");
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No submitted assessments yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" /> Overdue
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdue.length > 0 ? (
                  overdue.map((assessment) => {
                    const dueDate = new Date(assessment.dueDate);
                    const course =
                      typeof assessment.courseId === "object"
                        ? assessment.courseId
                        : null;
                    const daysOverdue = Math.ceil(
                      (now.getTime() - dueDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={assessment.id}
                        className="rounded-xl border border-red-200 bg-red-50/50 p-4 hover:bg-red-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-[#1a3d32]">
                                {assessment.title}
                              </p>
                              <Badge className="bg-red-100 text-red-700">
                                {daysOverdue} days overdue
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {course?.code || "N/A"} -{" "}
                              {course?.name || "Unknown Course"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 text-red-600 font-semibold">
                                <Clock className="h-3 w-3" />
                                Was due: {dueDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              openSubmitDialog(assessment);
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Late
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No overdue assessments. Keep it up!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assessment</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.title || "Provide your submission details."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                placeholder="Write your submission (optional)"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Attachment URL</label>
              <Input
                value={submitAttachmentUrl}
                onChange={(e) => setSubmitAttachmentUrl(e.target.value)}
                placeholder="https://... (optional)"
              />
              <p className="text-xs text-muted-foreground">
                If provided, it must be a publicly accessible URL.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmitOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]"
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
