"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { quizAttemptService, Quiz, Question, QuizAttempt } from "@/services/classroom/quiz.service";
import { toast } from "sonner";
import {
    Trophy,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    ArrowLeft,
    AlertCircle,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function QuizResultsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const workspaceId = params.id as string;
    const quizId = params.quizId as string;
    const attemptId = searchParams.get("attemptId");

    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!attemptId) {
            router.back();
            return;
        }

        const fetchResults = async () => {
            try {
                setIsLoading(true);
                const result = await quizAttemptService.getResults(attemptId);
                setAttempt(result.attempt);
                setQuiz(result.quiz);
                setQuestions(result.questions || []);
            } catch (error: any) {
                toast.error(error?.message || "Failed to load results");
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [attemptId, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
            </div>
        );
    }

    if (!attempt) return null;

    const getScoreColor = () => {
        if (attempt.percentage === null) return "text-gray-500";
        if (attempt.percentage >= 80) return "text-green-500";
        if (attempt.percentage >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getScoreBg = () => {
        if (attempt.percentage === null) return "from-gray-500 to-gray-600";
        if (attempt.percentage >= 80) return "from-green-500 to-emerald-600";
        if (attempt.percentage >= 60) return "from-amber-500 to-orange-600";
        return "from-red-500 to-rose-600";
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6 pb-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/student/classroom/${workspaceId}/quiz`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#344e41]">Quiz Results</h1>
                        <p className="text-sm text-muted-foreground">{quiz?.title}</p>
                    </div>
                </div>

                {/* Score Card */}
                <Card className="overflow-hidden">
                    <div className={cn("bg-gradient-to-br p-8 text-white text-center", getScoreBg())}>
                        <Trophy className="h-16 w-16 mx-auto mb-4 opacity-90" />
                        {attempt.percentage !== null ? (
                            <>
                                <p className="text-6xl font-bold mb-2">{attempt.percentage}%</p>
                                <p className="text-xl opacity-90">
                                    {attempt.score} / {attempt.maxScore} points
                                </p>
                            </>
                        ) : (
                            <p className="text-2xl">Pending Grade</p>
                        )}

                        {attempt.isPassed !== null && (
                            <Badge className={cn(
                                "mt-4 text-sm px-4 py-1",
                                attempt.isPassed ? "bg-white/20 text-white" : "bg-red-900/30 text-white"
                            )}>
                                {attempt.isPassed ? "PASSED" : "NOT PASSED"}
                            </Badge>
                        )}
                    </div>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Attempt</p>
                                <p className="text-lg font-semibold text-[#344e41]">#{attempt.attemptNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Submitted</p>
                                <p className="text-lg font-semibold text-[#344e41]">
                                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString() : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant="secondary" className={cn(
                                    attempt.status === "graded" ? "bg-green-100 text-green-700" :
                                        attempt.status === "submitted" ? "bg-amber-100 text-amber-700" :
                                            "bg-gray-100 text-gray-700"
                                )}>
                                    {attempt.status === "graded" ? "Graded" :
                                        attempt.status === "submitted" ? "Pending Review" :
                                            attempt.isAutoSubmitted ? "Auto-Submitted" : attempt.status}
                                </Badge>
                            </div>
                        </div>

                        {attempt.isAutoSubmitted && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                <span className="text-sm text-amber-700">This quiz was auto-submitted due to time limit</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Question Review */}
                {quiz?.allowReviewAfterSubmit && questions.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-[#344e41]">Review Answers</h2>

                        {questions.map((question, index) => {
                            const answer = attempt.answers.find(a => a.questionId === question.id);
                            const isCorrect = answer?.isCorrect;
                            const pointsAwarded = answer?.pointsAwarded ?? 0;

                            return (
                                <Card key={question.id} className={cn(
                                    "overflow-hidden border-l-4",
                                    isCorrect === true ? "border-l-green-500" :
                                        isCorrect === false ? "border-l-red-500" :
                                            "border-l-gray-300"
                                )}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-base font-medium text-[#344e41]">
                                                {index + 1}. {question.text}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isCorrect === true && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                                {isCorrect === false && <XCircle className="h-5 w-5 text-red-500" />}
                                                {isCorrect === null && <AlertCircle className="h-5 w-5 text-amber-500" />}
                                                <Badge variant="outline">
                                                    {pointsAwarded}/{question.points} pts
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* MCQ Options */}
                                        {(question.type.startsWith("mcq") || question.type === "true_false") && (
                                            <div className="space-y-2">
                                                {question.options?.map((option) => {
                                                    const wasSelected = answer?.selectedOptions?.includes(option.id);
                                                    const isCorrectOption = quiz?.showCorrectAnswers && option.isCorrect;

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={cn(
                                                                "p-3 rounded-lg border flex items-center gap-2",
                                                                wasSelected && isCorrectOption ? "bg-green-50 border-green-300" :
                                                                    wasSelected && !isCorrectOption ? "bg-red-50 border-red-300" :
                                                                        isCorrectOption ? "bg-green-50 border-green-300" :
                                                                            "bg-gray-50 border-gray-200"
                                                            )}
                                                        >
                                                            {wasSelected ? (
                                                                isCorrectOption ? (
                                                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                                                                )
                                                            ) : isCorrectOption ? (
                                                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                            ) : (
                                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0" />
                                                            )}
                                                            <span className={cn(
                                                                "text-sm",
                                                                wasSelected && "font-medium"
                                                            )}>{option.text}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Written Answer */}
                                        {(question.type === "short_answer" || question.type === "long_answer") && (
                                            <div className="space-y-2">
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                                                    <p className="text-sm">{answer?.writtenAnswer || <em className="text-gray-400">No answer provided</em>}</p>
                                                </div>
                                                {quiz?.showCorrectAnswers && question.correctAnswer && (
                                                    <div className="p-3 bg-green-50 rounded-lg">
                                                        <p className="text-sm text-muted-foreground mb-1">Expected answer:</p>
                                                        <p className="text-sm text-green-700">{question.correctAnswer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        {answer?.feedback && (
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-700">
                                                    <strong>Feedback:</strong> {answer.feedback}
                                                </p>
                                            </div>
                                        )}

                                        {/* Explanation */}
                                        {quiz?.showCorrectAnswers && question.explanation && (
                                            <div className="p-3 bg-amber-50 rounded-lg">
                                                <p className="text-sm text-amber-700">
                                                    <strong>Explanation:</strong> {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Link href={`/dashboard/student/classroom/${workspaceId}/quiz`}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Quizzes
                        </Button>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
