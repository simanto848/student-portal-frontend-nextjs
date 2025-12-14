"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { quizService, quizAttemptService, Quiz, QuizAttempt } from "@/services/classroom/quiz.service";
import { toast } from "sonner";
import {
    FileCheck,
    Play,
    AlertCircle,
    Loader2,
    ClipboardList,
    Trophy,
    RotateCcw,
    Timer,
    Lock,
} from "lucide-react";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StudentQuizListPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.id as string;

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<Record<string, QuizAttempt[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [startingQuiz, setStartingQuiz] = useState<Quiz | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [workspaceId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const quizList = await quizService.listByWorkspace(workspaceId, "published");
            setQuizzes(quizList);

            // Fetch attempts for each quiz
            const attemptMap: Record<string, QuizAttempt[]> = {};
            await Promise.all(
                quizList.map(async (quiz) => {
                    try {
                        const myAttempts = await quizAttemptService.getMyAttempts(quiz.id);
                        attemptMap[quiz.id] = myAttempts;
                    } catch {
                        attemptMap[quiz.id] = [];
                    }
                })
            );
            setAttempts(attemptMap);
        } catch (error: any) {
            toast.error(error?.message || "Failed to load quizzes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartQuiz = async () => {
        if (!startingQuiz) return;
        try {
            setIsStarting(true);
            router.push(`/dashboard/student/classroom/${workspaceId}/quiz/${startingQuiz.id}`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to start quiz");
            setIsStarting(false);
        }
    };

    const getQuizStatus = (quiz: Quiz) => {
        const quizAttempts = attempts[quiz.id] || [];
        const inProgress = quizAttempts.find((a) => a.status === "in_progress");
        const completed = quizAttempts.filter((a) => ["submitted", "graded", "timed_out"].includes(a.status));
        const attemptsRemaining = quiz.maxAttempts - completed.length;
        const bestScore = completed.length > 0
            ? Math.max(...completed.filter(a => a.percentage !== null).map((a) => a.percentage || 0))
            : null;

        return { inProgress, completed, attemptsRemaining, bestScore };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-[#344e41]">Quizzes & Exams</h2>
                    <p className="text-sm text-muted-foreground">
                        Take quizzes and track your progress
                    </p>
                </div>

                {/* Quiz List */}
                {quizzes.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-[#344e41] mb-2">No quizzes available</h3>
                            <p className="text-sm text-muted-foreground">
                                Your teacher hasn&apos;t published any quizzes yet
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {quizzes.map((quiz) => {
                            const { inProgress, completed, attemptsRemaining, bestScore } = getQuizStatus(quiz);
                            const canAttempt = attemptsRemaining > 0 || !!inProgress;

                            return (
                                <Card key={quiz.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <CardTitle className="text-lg text-[#344e41]">{quiz.title}</CardTitle>
                                                {quiz.description && (
                                                    <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Timer className="h-4 w-4" />
                                                <span>{quiz.duration} min</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <FileCheck className="h-4 w-4" />
                                                <span>{quiz.questionCount} Q</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <RotateCcw className="h-4 w-4" />
                                                <span>{attemptsRemaining} left</span>
                                            </div>
                                        </div>

                                        {/* Score / Status */}
                                        {completed.length > 0 && (
                                            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                                <Trophy className="h-5 w-5 text-amber-500" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Best Score</p>
                                                    <p className="text-2xl font-bold text-[#344e41]">{bestScore}%</p>
                                                </div>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                    {completed.length} attempt{completed.length > 1 ? "s" : ""}
                                                </Badge>
                                            </div>
                                        )}

                                        {inProgress && (
                                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                                <span className="text-sm text-amber-700 flex-1">Quiz in progress</span>
                                                <Link href={`/dashboard/student/classroom/${workspaceId}/quiz/${quiz.id}`}>
                                                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                                                        Continue
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        {!inProgress && (
                                            <Button
                                                className={canAttempt
                                                    ? "w-full bg-[#588157] hover:bg-[#3a5a40] text-white gap-2"
                                                    : "w-full"
                                                }
                                                variant={canAttempt ? "default" : "secondary"}
                                                disabled={!canAttempt}
                                                onClick={() => setStartingQuiz(quiz)}
                                            >
                                                {canAttempt ? (
                                                    <>
                                                        <Play className="h-4 w-4" />
                                                        {completed.length > 0 ? "Retry Quiz" : "Start Quiz"}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="h-4 w-4" />
                                                        No Attempts Left
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Start Quiz Dialog */}
                <AlertDialog open={!!startingQuiz} onOpenChange={() => !isStarting && setStartingQuiz(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-[#588157]" />
                                Start Quiz
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4 text-left">
                                    <p>You are about to start <strong>&quot;{startingQuiz?.title}&quot;</strong></p>
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Timer className="h-4 w-4 text-muted-foreground" />
                                            <span>Duration: <strong>{startingQuiz?.duration} minutes</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                                            <span>Questions: <strong>{startingQuiz?.questionCount}</strong></span>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <p className="text-amber-700 text-sm">
                                            ⚠️ Once started, the timer cannot be paused. Make sure you have enough time to complete the quiz.
                                        </p>
                                    </div>
                                    {startingQuiz?.instructions && (
                                        <div className="text-sm">
                                            <p className="font-medium mb-1">Instructions:</p>
                                            <p className="text-muted-foreground">{startingQuiz.instructions}</p>
                                        </div>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isStarting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleStartQuiz}
                                disabled={isStarting}
                                className="bg-[#588157] hover:bg-[#3a5a40]"
                            >
                                {isStarting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Start Now
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
