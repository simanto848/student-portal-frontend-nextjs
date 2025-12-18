"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  quizService,
  questionService,
  Quiz,
  Question,
  QuizAttempt,
} from "@/services/classroom/quiz.service";
import { workspaceService } from "@/services/classroom/workspace.service";
import { studentService, Student } from "@/services/user/student.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import {
  ArrowLeft,
  Clock,
  Users,
  FileCheck,
  Edit,
  Play,
  Lock,
  Loader2,
  Trophy,
  CheckCircle2,
  Home,
  ChevronRight,
  Calendar,
  Settings,
  BarChart3,
  Eye,
  Award,
  TrendingUp,
  AlertTriangle,
  FileText,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-slate-500",
    textColor: "text-slate-700",
    bgLight: "bg-slate-100",
    gradient: "from-slate-500 to-slate-600",
  },
  published: {
    label: "Published",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgLight: "bg-emerald-100",
    gradient: "from-emerald-500 to-emerald-600",
  },
  closed: {
    label: "Closed",
    color: "bg-rose-500",
    textColor: "text-rose-700",
    bgLight: "bg-rose-100",
    gradient: "from-rose-500 to-rose-600",
  },
};

export default function TeacherQuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<QuizAttempt[]>([]);
  const [batchStudents, setBatchStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [quizId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [quizData, questionData, submissionData, workspace] =
        await Promise.all([
          quizService.getById(quizId),
          questionService.listByQuiz(quizId),
          quizService.getSubmissions(quizId),
          workspaceService.getById(workspaceId),
        ]);
      setQuiz(quizData);
      setQuestions(questionData);
      setSubmissions(submissionData);

      if (workspace.batchId) {
        try {
          const { students } = await studentService.getAll({
            batchId: workspace.batchId,
            limit: 500,
          });
          setBatchStudents(students);
        } catch (e) {
          console.error("Failed to fetch batch students:", e);
        }
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load quiz");
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await quizService.publish(quizId);
      const message = getSuccessMessage(res, "Quiz published successfully");
      notifySuccess(message);
      fetchData();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to publish quiz");
      notifyError(message);
    }
  };

  const handleClose = async () => {
    try {
      const res = await quizService.close(quizId);
      const message = getSuccessMessage(res, "Quiz closed successfully");
      notifySuccess(message);
      fetchData();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to close quiz");
      notifyError(message);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#588157] mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) return null;

  const status = statusConfig[quiz.status];
  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
            submissions.length,
        )
      : 0;

  const passedCount = submissions.filter((s) => s.isPassed).length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;
  const pendingCount = submissions.filter(
    (s) => s.status === "submitted",
  ).length;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard/teacher"
            className="flex items-center gap-1 hover:text-[#588157] transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/dashboard/teacher/classroom/${workspaceId}`}
            className="hover:text-[#588157] transition-colors"
          >
            Classroom
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/dashboard/teacher/classroom/${workspaceId}/quiz`}
            className="hover:text-[#588157] transition-colors"
          >
            Quizzes
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#344e41] font-medium truncate max-w-[200px]">
            {quiz.title}
          </span>
        </nav>

        {/* Header Card */}
        <Card className="overflow-hidden border-0 shadow-lg pt-0">
          <div
            className={cn("bg-gradient-to-r p-6 text-white", status.gradient)}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(
                      `/dashboard/teacher/classroom/${workspaceId}/quiz`,
                    )
                  }
                  className="shrink-0 bg-white/20 hover:bg-white/30 text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      {quiz.title}
                    </h1>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {status.label}
                    </Badge>
                  </div>
                  {quiz.description && (
                    <p className="text-white/80 max-w-xl">{quiz.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/70">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {quiz.duration} minutes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4" />
                      {questions.length} questions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Trophy className="h-4 w-4" />
                      {totalPoints} points
                    </span>
                    {quiz.startAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Starts {new Date(quiz.startAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {quiz.status === "draft" && (
                  <>
                    <Link
                      href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quizId}/edit`}
                    >
                      <Button
                        variant="secondary"
                        className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      onClick={handlePublish}
                      className="gap-2 bg-white text-emerald-600 hover:bg-white/90"
                      disabled={questions.length === 0}
                    >
                      <Play className="h-4 w-4" />
                      Publish
                    </Button>
                  </>
                )}
                {quiz.status === "published" && (
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Lock className="h-4 w-4" />
                    Close Quiz
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <CardContent className="pt-0 -mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Submissions
                      </p>
                      <p className="text-2xl font-bold text-[#344e41]">
                        {submissions.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average</p>
                      <p className="text-2xl font-bold text-[#344e41]">
                        {avgScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Award className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Passed</p>
                      <p className="text-2xl font-bold text-[#344e41]">
                        {passedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-[#344e41]">
                        {pendingCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white border shadow-sm p-1 h-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#588157] data-[state=active]:text-white gap-2 px-4 py-2.5"
            >
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="data-[state=active]:bg-[#588157] data-[state=active]:text-white gap-2 px-4 py-2.5"
            >
              <FileText className="h-4 w-4" />
              Questions ({questions.length})
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="data-[state=active]:bg-[#588157] data-[state=active]:text-white gap-2 px-4 py-2.5 relative"
            >
              <BarChart3 className="h-4 w-4" />
              Submissions ({submissions.length})
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#588157]" />
                    Quiz Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Max Attempts
                      </p>
                      <p className="text-lg font-semibold text-[#344e41]">
                        {quiz.maxAttempts}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Max Score
                      </p>
                      <p className="text-lg font-semibold text-[#344e41]">
                        {quiz.maxScore} pts
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Passing Score
                      </p>
                      <p className="text-lg font-semibold text-[#344e41]">
                        {quiz.passingScore > 0
                          ? `${quiz.passingScore}%`
                          : "Not set"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Time Limit
                      </p>
                      <p className="text-lg font-semibold text-[#344e41]">
                        {quiz.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        Shuffle Questions
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          quiz.shuffleQuestions
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100"
                        }
                      >
                        {quiz.shuffleQuestions ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">
                        Shuffle Options
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          quiz.shuffleOptions
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100"
                        }
                      >
                        {quiz.shuffleOptions ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Show Results
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          quiz.showResultsAfterSubmit
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100"
                        }
                      >
                        {quiz.showResultsAfterSubmit ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#588157]" />
                    Schedule & Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Start Date
                      </p>
                      <p className="text-sm font-semibold text-[#344e41]">
                        {quiz.startAt
                          ? new Date(quiz.startAt).toLocaleString()
                          : "Not set"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        End Date
                      </p>
                      <p className="text-sm font-semibold text-[#344e41]">
                        {quiz.endAt
                          ? new Date(quiz.endAt).toLocaleString()
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                  {quiz.instructions ? (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-2">
                        Instructions
                      </p>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {quiz.instructions}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-gray-50 text-center">
                      <p className="text-sm text-muted-foreground">
                        No instructions provided
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Score Distribution */}
            {submissions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#588157]" />
                    Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        label: "90-100%",
                        min: 90,
                        max: 100,
                        color: "bg-emerald-500",
                      },
                      {
                        label: "70-89%",
                        min: 70,
                        max: 89,
                        color: "bg-blue-500",
                      },
                      {
                        label: "50-69%",
                        min: 50,
                        max: 69,
                        color: "bg-amber-500",
                      },
                      {
                        label: "Below 50%",
                        min: 0,
                        max: 49,
                        color: "bg-rose-500",
                      },
                    ].map((range) => {
                      const count = submissions.filter(
                        (s) =>
                          s.percentage !== null &&
                          s.percentage >= range.min &&
                          s.percentage <= range.max,
                      ).length;
                      const percentage =
                        submissions.length > 0
                          ? (count / submissions.length) * 100
                          : 0;
                      return (
                        <div
                          key={range.label}
                          className="flex items-center gap-4"
                        >
                          <span className="text-sm text-muted-foreground w-24">
                            {range.label}
                          </span>
                          <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                range.color,
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            {questions.length === 0 ? (
              <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-[#588157]/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-[#588157]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#344e41] mb-2">
                    No questions yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Add questions to make this quiz ready for students
                  </p>
                  {quiz.status === "draft" && (
                    <Link
                      href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quizId}/edit`}
                    >
                      <Button className="bg-[#588157] hover:bg-[#3a5a40] text-white gap-2">
                        <Edit className="h-4 w-4" />
                        Add Questions
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {questions.length} questions • {totalPoints} total points
                  </p>
                  {quiz.status === "draft" && (
                    <Link
                      href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quizId}/edit`}
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Questions
                      </Button>
                    </Link>
                  )}
                </div>
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2 bg-gray-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#588157] text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-base text-[#344e41]">
                              {question.text}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {question.type
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {question.points} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    {question.options && question.options.length > 0 && (
                      <CardContent className="pt-4">
                        <div className="grid gap-2">
                          {question.options.map((option, optIdx) => (
                            <div
                              key={option.id}
                              className={cn(
                                "p-3 rounded-lg text-sm flex items-center gap-3 transition-colors",
                                option.isCorrect
                                  ? "bg-emerald-50 border border-emerald-200"
                                  : "bg-gray-50 border border-gray-100",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                                  option.isCorrect
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-200 text-gray-600",
                                )}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span
                                className={
                                  option.isCorrect
                                    ? "font-medium text-emerald-700"
                                    : ""
                                }
                              >
                                {option.text}
                              </span>
                              {option.isCorrect && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            {(() => {
              // Create a merged list of all students with their quiz status
              const submissionMap = new Map<string, QuizAttempt>();
              submissions.forEach((sub) => {
                // Keep the most recent/best submission per student
                const existing = submissionMap.get(sub.studentId);
                if (
                  !existing ||
                  (sub.submittedAt &&
                    (!existing.submittedAt ||
                      sub.submittedAt > existing.submittedAt))
                ) {
                  submissionMap.set(sub.studentId, sub);
                }
              });

              // Create merged student list
              interface StudentQuizStatus {
                studentId: string;
                fullName: string;
                registrationNumber: string;
                hasAttempted: boolean;
                submission?: QuizAttempt;
              }

              const allStudentsStatus: StudentQuizStatus[] = batchStudents.map(
                (student) => ({
                  studentId: student.id,
                  fullName: student.fullName,
                  registrationNumber: student.registrationNumber,
                  hasAttempted: submissionMap.has(student.id),
                  submission: submissionMap.get(student.id),
                }),
              );

              // Add any submissions from students not in batchStudents list
              submissions.forEach((sub) => {
                if (
                  !allStudentsStatus.find((s) => s.studentId === sub.studentId)
                ) {
                  allStudentsStatus.push({
                    studentId: sub.studentId,
                    fullName: `Student #${sub.studentId.slice(-6)}`,
                    registrationNumber: "N/A",
                    hasAttempted: true,
                    submission: sub,
                  });
                }
              });

              // Sort: attempted students first, then non-attempted
              allStudentsStatus.sort((a, b) => {
                if (a.hasAttempted && !b.hasAttempted) return -1;
                if (!a.hasAttempted && b.hasAttempted) return 1;
                return a.fullName.localeCompare(b.fullName);
              });

              if (allStudentsStatus.length === 0) {
                return (
                  <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-white">
                    <CardContent className="py-16 text-center">
                      <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-violet-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#344e41] mb-2">
                        No students found
                      </h3>
                      <p className="text-muted-foreground">
                        No students are enrolled in this batch yet
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              const attemptedCount = allStudentsStatus.filter(
                (s) => s.hasAttempted,
              ).length;
              const notAttemptedCount = allStudentsStatus.filter(
                (s) => !s.hasAttempted,
              ).length;

              return (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {attemptedCount} attempted
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UserX className="h-4 w-4 text-gray-400" />
                      {notAttemptedCount} not attempted
                    </span>
                  </div>

                  <div className="space-y-3">
                    {allStudentsStatus.map((studentStatus) => (
                      <Card
                        key={studentStatus.studentId}
                        className={cn(
                          "overflow-hidden transition-all group",
                          studentStatus.hasAttempted
                            ? "hover:shadow-md"
                            : "opacity-75",
                        )}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {studentStatus.hasAttempted ? (
                                <div
                                  className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                    studentStatus.submission?.percentage !==
                                      null &&
                                      studentStatus.submission?.percentage !==
                                        undefined &&
                                      studentStatus.submission.percentage >= 80
                                      ? "bg-emerald-500"
                                      : studentStatus.submission?.percentage !==
                                            null &&
                                          studentStatus.submission
                                            ?.percentage !== undefined &&
                                          studentStatus.submission.percentage >=
                                            60
                                        ? "bg-amber-500"
                                        : studentStatus.submission
                                              ?.percentage !== null &&
                                            studentStatus.submission
                                              ?.percentage !== undefined
                                          ? "bg-rose-500"
                                          : "bg-gray-400",
                                  )}
                                >
                                  {studentStatus.submission?.percentage !==
                                    null &&
                                  studentStatus.submission?.percentage !==
                                    undefined
                                    ? `${studentStatus.submission.percentage}%`
                                    : "?"}
                                </div>
                              ) : (
                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-sm">
                                  0%
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-[#344e41]">
                                  {studentStatus.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {studentStatus.registrationNumber}
                                  {studentStatus.hasAttempted &&
                                    studentStatus.submission && (
                                      <span className="ml-2">
                                        • Attempt #
                                        {studentStatus.submission.attemptNumber}
                                        •{" "}
                                        {new Date(
                                          studentStatus.submission
                                            .submittedAt ||
                                            studentStatus.submission.startedAt,
                                        ).toLocaleString()}
                                      </span>
                                    )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {studentStatus.hasAttempted &&
                              studentStatus.submission ? (
                                <>
                                  {studentStatus.submission.percentage !==
                                    null && (
                                    <div className="text-right hidden sm:block">
                                      <p className="text-sm text-muted-foreground">
                                        Score
                                      </p>
                                      <p className="font-semibold text-[#344e41]">
                                        {studentStatus.submission.score}/
                                        {studentStatus.submission.maxScore}
                                      </p>
                                    </div>
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "capitalize",
                                      studentStatus.submission.status ===
                                        "graded"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : studentStatus.submission.status ===
                                            "submitted"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-gray-100 text-gray-700",
                                    )}
                                  >
                                    {studentStatus.submission.isAutoSubmitted &&
                                      "Auto-"}
                                    {studentStatus.submission.status}
                                  </Badge>
                                  <Link
                                    href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quizId}/grade/${studentStatus.submission.id}`}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Eye className="h-4 w-4" />
                                      {studentStatus.submission.status ===
                                      "submitted"
                                        ? "Grade"
                                        : "View"}
                                    </Button>
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <div className="text-right hidden sm:block">
                                    <p className="text-sm text-muted-foreground">
                                      Score
                                    </p>
                                    <p className="font-semibold text-gray-400">
                                      0/{quiz?.maxScore || 0}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-500"
                                  >
                                    Not Attempted
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              );
            })()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
