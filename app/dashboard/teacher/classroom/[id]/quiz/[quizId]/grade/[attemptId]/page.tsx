"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { quizService, questionService, quizAttemptService, Quiz, Question, QuizAttempt } from "@/services/classroom/quiz.service";
import { toast } from "sonner";
import {
    ArrowLeft,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Save,
    User,
    Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GradeSubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.id as string;
    const quizId = params.quizId as string;
    const attemptId = params.attemptId as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [grades, setGrades] = useState<Record<string, { points: number; feedback: string }>>({});

    useEffect(() => {
        fetchData();
    }, [attemptId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [quizData, questionData, attemptResult] = await Promise.all([
                quizService.getById(quizId),
                questionService.listByQuiz(quizId),
                quizAttemptService.getResults(attemptId),
            ]);
            setQuiz(quizData);
            setQuestions(questionData);
            setAttempt(attemptResult.attempt);

            // Initialize grades from existing answers
            const initialGrades: Record<string, { points: number; feedback: string }> = {};
            attemptResult.attempt.answers.forEach((answer) => {
                initialGrades[answer.questionId] = {
                    points: answer.pointsAwarded ?? 0,
                    feedback: answer.feedback || "",
                };
            });
            setGrades(initialGrades);
        } catch (error: any) {
            toast.error(error?.message || "Failed to load submission");
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleGradeChange = (questionId: string, field: "points" | "feedback", value: number | string) => {
        setGrades((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [field]: value,
            },
        }));
    };

    const handleSaveGrade = async (questionId: string) => {
        try {
            setIsSaving(true);
            const grade = grades[questionId];
            await quizAttemptService.gradeAnswer(attemptId, questionId, grade.points, grade.feedback);
            toast.success("Grade saved");
            fetchData();
        } catch (error: any) {
            toast.error(error?.message || "Failed to save grade");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAll = async () => {
        try {
            setIsSaving(true);
            for (const questionId of Object.keys(grades)) {
                const grade = grades[questionId];
                await quizAttemptService.gradeAnswer(attemptId, questionId, grade.points, grade.feedback);
            }
            toast.success("All grades saved");
            router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quizId}`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to save grades");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
            </div>
        );
    }

    if (!quiz || !attempt) return null;

    const totalAwarded = Object.values(grades).reduce((sum, g) => sum + (g.points || 0), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quizId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#344e41]">Grade Submission</h1>
                        <p className="text-sm text-muted-foreground">{quiz.title}</p>
                    </div>
                </div>
                <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save All Grades
                </Button>
            </div>

            {/* Student Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-[#344e41]">Student #{attempt.studentId.slice(-8)}</p>
                                <p className="text-sm text-muted-foreground">Attempt #{attempt.attemptNumber}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-[#344e41]">{totalAwarded}/{quiz.maxScore}</p>
                            <p className="text-sm text-muted-foreground">Points Awarded</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "N/A"}
                        </div>
                        {attempt.isAutoSubmitted && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                Auto-submitted
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Questions & Grading */}
            <div className="space-y-4">
                {questions.map((question, index) => {
                    const answer = attempt.answers.find((a) => a.questionId === question.id);
                    const grade = grades[question.id] || { points: 0, feedback: "" };
                    const isAutoGraded = ["mcq_single", "mcq_multiple", "true_false"].includes(question.type);

                    return (
                        <Card key={question.id} className={cn(
                            "border-l-4",
                            answer?.isCorrect === true ? "border-l-green-500" :
                                answer?.isCorrect === false ? "border-l-red-500" :
                                    "border-l-amber-500"
                        )}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base font-medium text-[#344e41]">
                                        {index + 1}. {question.text}
                                    </CardTitle>
                                    <Badge variant="outline">{question.points} pts max</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Display answer based on type */}
                                {(question.type.startsWith("mcq") || question.type === "true_false") && (
                                    <div className="space-y-2">
                                        {question.options?.map((option) => {
                                            const wasSelected = answer?.selectedOptions?.includes(option.id);
                                            const isCorrect = option.isCorrect;

                                            return (
                                                <div
                                                    key={option.id}
                                                    className={cn(
                                                        "p-3 rounded-lg border flex items-center gap-2",
                                                        wasSelected && isCorrect ? "bg-green-50 border-green-300" :
                                                            wasSelected && !isCorrect ? "bg-red-50 border-red-300" :
                                                                isCorrect ? "bg-green-50/50 border-green-200" :
                                                                    "bg-gray-50 border-gray-200"
                                                    )}
                                                >
                                                    {wasSelected ? (
                                                        isCorrect ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                                                        )
                                                    ) : isCorrect ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0" />
                                                    )}
                                                    <span className={cn("text-sm", wasSelected && "font-medium")}>
                                                        {option.text}
                                                    </span>
                                                    {wasSelected && (
                                                        <Badge variant="secondary" className="ml-auto text-xs">
                                                            Selected
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {(question.type === "short_answer" || question.type === "long_answer") && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Student&apos;s Answer:</p>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {answer?.writtenAnswer || <em className="text-gray-400">No answer provided</em>}
                                        </p>
                                    </div>
                                )}

                                {/* Grading Section */}
                                <div className="bg-blue-50/50 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-32">
                                            <Label htmlFor={`points-${question.id}`}>Points</Label>
                                            <Input
                                                id={`points-${question.id}`}
                                                type="number"
                                                min={0}
                                                max={question.points}
                                                value={grade.points}
                                                onChange={(e) => handleGradeChange(question.id, "points", parseInt(e.target.value) || 0)}
                                                className="mt-1"
                                                disabled={isAutoGraded}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label htmlFor={`feedback-${question.id}`}>Feedback (optional)</Label>
                                            <Input
                                                id={`feedback-${question.id}`}
                                                placeholder="Add feedback for the student..."
                                                value={grade.feedback}
                                                onChange={(e) => handleGradeChange(question.id, "feedback", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        {!isAutoGraded && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSaveGrade(question.id)}
                                                disabled={isSaving}
                                                className="mt-6"
                                            >
                                                Save
                                            </Button>
                                        )}
                                    </div>
                                    {isAutoGraded && (
                                        <p className="text-xs text-muted-foreground">
                                            This question was auto-graded based on the correct answer.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between sticky bottom-4">
                <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quizId}`}>
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Quiz
                    </Button>
                </Link>
                <Button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save All & Complete
                </Button>
            </div>
        </div>
    );
}
