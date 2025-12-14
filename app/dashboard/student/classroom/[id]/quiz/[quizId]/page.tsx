"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { quizService, quizAttemptService, Quiz, Question, QuizAnswer, QuizAttempt } from "@/services/classroom/quiz.service";
import { toast } from "sonner";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Check,
    AlertTriangle,
    Loader2,
    Send,
    Flag,
    X,
    CheckCircle2,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function TakeQuizPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.id as string;
    const quizId = params.quizId as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
    const hasWarned5Min = useRef(false);
    const hasWarned1Min = useRef(false);

    // Initialize quiz
    useEffect(() => {
        const initQuiz = async () => {
            try {
                setIsLoading(true);

                // Start or resume attempt
                const response = await quizAttemptService.start(quizId);
                setAttempt(response.attempt);
                setQuestions(response.questions);
                setTimeRemaining(response.timeRemaining);

                // Load quiz details
                const quizData = await quizService.getById(quizId);
                setQuiz(quizData);

                // Initialize answers from existing attempt
                const initialAnswers: Record<string, QuizAnswer> = {};
                response.attempt.answers?.forEach((a) => {
                    initialAnswers[a.questionId] = a;
                });
                response.questions.forEach((q) => {
                    if (!initialAnswers[q.id]) {
                        initialAnswers[q.id] = {
                            questionId: q.id,
                            selectedOptions: [],
                            writtenAnswer: "",
                        };
                    }
                });
                setAnswers(initialAnswers);
            } catch (error: any) {
                toast.error(error?.message || "Failed to load quiz");
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        initQuiz();
    }, [quizId, router]);

    // Timer
    useEffect(() => {
        if (timeRemaining <= 0 || !attempt) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1;

                // Warnings
                if (newTime === 300 && !hasWarned5Min.current) {
                    hasWarned5Min.current = true;
                    toast.warning("5 minutes remaining!", { duration: 5000 });
                }
                if (newTime === 60 && !hasWarned1Min.current) {
                    hasWarned1Min.current = true;
                    setShowTimeWarning(true);
                }

                // Auto-submit when time runs out
                if (newTime <= 0) {
                    handleAutoSubmit();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [attempt, timeRemaining]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!attempt) return;

        autoSaveRef.current = setInterval(async () => {
            try {
                await quizAttemptService.saveProgress(attempt.id, Object.values(answers));
            } catch (e) {
                console.error("Auto-save failed:", e);
            }
        }, 30000);

        return () => {
            if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        };
    }, [attempt, answers]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getTimeColor = () => {
        if (timeRemaining <= 60) return "text-red-500 animate-pulse";
        if (timeRemaining <= 300) return "text-amber-500";
        return "text-[#344e41]";
    };

    const handleAnswerChange = (questionId: string, update: Partial<QuizAnswer>) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], ...update },
        }));
    };

    const toggleOption = (questionId: string, optionId: string, isMultiple: boolean) => {
        const current = answers[questionId]?.selectedOptions || [];
        let newSelected: string[];

        if (isMultiple) {
            newSelected = current.includes(optionId)
                ? current.filter((id) => id !== optionId)
                : [...current, optionId];
        } else {
            newSelected = [optionId];
        }

        handleAnswerChange(questionId, { selectedOptions: newSelected });
    };

    const clearSelection = (questionId: string) => {
        handleAnswerChange(questionId, { selectedOptions: [] });
    };

    const toggleFlag = (questionId: string) => {
        setFlaggedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    const getAnsweredCount = () => {
        return questions.filter((q) => {
            const answer = answers[q.id];
            if (!answer) return false;
            if (q.type.startsWith("mcq") || q.type === "true_false") {
                return answer.selectedOptions.length > 0;
            }
            return !!answer.writtenAnswer?.trim();
        }).length;
    };

    const handleAutoSubmit = async () => {
        if (!attempt || isSubmitting) return;
        try {
            setIsSubmitting(true);
            const result = await quizAttemptService.submit(attempt.id, Object.values(answers), true);
            toast.info("Quiz auto-submitted due to time limit");
            router.push(`/dashboard/student/classroom/${workspaceId}/quiz/${quizId}/results?attemptId=${result.attemptId}`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit quiz");
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!attempt || isSubmitting) return;
        try {
            setIsSubmitting(true);
            const result = await quizAttemptService.submit(attempt.id, Object.values(answers), false);
            toast.success("Quiz submitted successfully!");
            router.push(`/dashboard/student/classroom/${workspaceId}/quiz/${quizId}/results?attemptId=${result.attemptId}`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit quiz");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dad7cd] via-white to-[#a3b18a]/20">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#588157] mx-auto" />
                    <p className="text-lg font-medium text-[#344e41]">Loading quiz...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers[currentQuestion?.id];
    const isMultipleChoice = currentQuestion?.type === "mcq_multiple";

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-[#dad7cd] via-white to-[#a3b18a]/20">
                {/* Fixed Timer Header */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="font-semibold text-[#344e41] text-lg truncate max-w-xs">
                                {quiz?.title}
                            </h1>
                            <Badge variant="secondary" className="bg-[#588157]/10 text-[#588157]">
                                {getAnsweredCount()}/{questions.length} answered
                            </Badge>
                        </div>

                        <div className={cn("flex items-center gap-2 font-mono text-xl font-bold", getTimeColor())}>
                            <Clock className="h-5 w-5" />
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                    <Progress
                        value={(getAnsweredCount() / questions.length) * 100}
                        className="h-1"
                    />
                </div>

                {/* Main Content */}
                <div className="pt-20 pb-24 px-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Question Navigation */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {questions.map((q, idx) => {
                                const answer = answers[q.id];
                                const isAnswered = q.type.startsWith("mcq") || q.type === "true_false"
                                    ? (answer?.selectedOptions?.length || 0) > 0
                                    : !!answer?.writtenAnswer?.trim();
                                const isFlagged = flaggedQuestions.has(q.id);
                                const isCurrent = idx === currentIndex;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={cn(
                                            "relative h-10 w-10 rounded-lg font-medium text-sm transition-all",
                                            isCurrent
                                                ? "bg-[#588157] text-white shadow-lg scale-110"
                                                : isAnswered
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-white text-gray-600 hover:bg-gray-100 border"
                                        )}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <Flag className="absolute -top-1 -right-1 h-4 w-4 text-amber-500 fill-amber-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Question Card */}
                        <Card className="shadow-xl border-0 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-[#588157] to-[#3a5a40] text-white">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        Question {currentIndex + 1} of {questions.length}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-white/20 text-white">
                                            {currentQuestion?.points} pts
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "text-white hover:bg-white/20",
                                                flaggedQuestions.has(currentQuestion?.id) && "bg-white/20"
                                            )}
                                            onClick={() => toggleFlag(currentQuestion?.id)}
                                        >
                                            <Flag className={cn(
                                                "h-4 w-4",
                                                flaggedQuestions.has(currentQuestion?.id) && "fill-amber-400 text-amber-400"
                                            )} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Question Text */}
                                <div className="text-lg text-[#344e41] leading-relaxed">
                                    {currentQuestion?.text}
                                </div>

                                {/* Answer Options */}
                                {(currentQuestion?.type.startsWith("mcq") || currentQuestion?.type === "true_false") && (
                                    <div className="space-y-3">
                                        {isMultipleChoice && (
                                            <p className="text-sm text-muted-foreground">Select all that apply</p>
                                        )}
                                        {currentQuestion?.options?.map((option) => {
                                            const isSelected = currentAnswer?.selectedOptions?.includes(option.id);
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => toggleOption(currentQuestion.id, option.id, isMultipleChoice)}
                                                    className={cn(
                                                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                                                        isSelected
                                                            ? "border-[#588157] bg-[#588157]/10"
                                                            : "border-gray-200 hover:border-[#588157]/50 hover:bg-gray-50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                                        isSelected
                                                            ? "border-[#588157] bg-[#588157]"
                                                            : "border-gray-300"
                                                    )}>
                                                        {isSelected && <Check className="h-4 w-4 text-white" />}
                                                    </div>
                                                    <span className={cn(
                                                        "text-base",
                                                        isSelected ? "text-[#344e41] font-medium" : "text-gray-700"
                                                    )}>
                                                        {option.text}
                                                    </span>
                                                </button>
                                            );
                                        })}

                                        {currentAnswer?.selectedOptions?.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground"
                                                onClick={() => clearSelection(currentQuestion.id)}
                                            >
                                                <X className="h-4 w-4 mr-1" /> Clear selection
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Written Answer */}
                                {(currentQuestion?.type === "short_answer" || currentQuestion?.type === "long_answer") && (
                                    <Textarea
                                        placeholder={currentQuestion.type === "short_answer"
                                            ? "Type your answer here..."
                                            : "Write your detailed answer here..."
                                        }
                                        value={currentAnswer?.writtenAnswer || ""}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, { writtenAnswer: e.target.value })}
                                        rows={currentQuestion.type === "long_answer" ? 8 : 3}
                                        className="text-base"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Fixed Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t shadow-lg">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>

                        <Button
                            onClick={() => setShowSubmitDialog(true)}
                            className="bg-[#588157] hover:bg-[#3a5a40] text-white px-8"
                        >
                            <Send className="h-4 w-4 mr-2" /> Submit Quiz
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentIndex === questions.length - 1}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>

                {/* Submit Confirmation Dialog */}
                <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4">
                                    <p>You have answered <strong>{getAnsweredCount()}</strong> out of <strong>{questions.length}</strong> questions.</p>

                                    {getAnsweredCount() < questions.length && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-amber-700 text-sm">
                                                You have {questions.length - getAnsweredCount()} unanswered question(s). Unanswered questions will be marked as incorrect.
                                            </p>
                                        </div>
                                    )}

                                    {flaggedQuestions.size > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            You have {flaggedQuestions.size} flagged question(s) for review.
                                        </p>
                                    )}

                                    <p className="font-medium text-[#344e41]">Are you sure you want to submit?</p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Review Answers</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-[#588157] hover:bg-[#3a5a40]"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Submit Quiz
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Time Warning Dialog */}
                <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                                <AlertTriangle className="h-5 w-5" />
                                1 Minute Remaining!
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Your quiz will be automatically submitted when time runs out. Make sure to save your answers!
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction className="bg-[#588157] hover:bg-[#3a5a40]">
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
