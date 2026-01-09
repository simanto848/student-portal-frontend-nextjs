"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
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
    Zap,
    Trophy,
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
import { motion, AnimatePresence } from "framer-motion";

export default function QuizAttemptClient() {
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

    useEffect(() => {
        const initQuiz = async () => {
            try {
                setIsLoading(true);
                const response = await quizAttemptService.start(quizId);
                setAttempt(response.attempt);
                setQuestions(response.questions || []);
                setTimeRemaining(response.timeRemaining);

                const quizData = await quizService.getById(quizId);
                setQuiz(quizData);

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

    useEffect(() => {
        if (timeRemaining <= 0 || !attempt) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1;
                if (newTime === 300 && !hasWarned5Min.current) {
                    hasWarned5Min.current = true;
                    toast.warning("5 minutes remaining!", { duration: 5000 });
                }
                if (newTime === 60 && !hasWarned1Min.current) {
                    hasWarned1Min.current = true;
                    setShowTimeWarning(true);
                }
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
        if (timeRemaining <= 60) return "text-rose-500 animate-pulse";
        if (timeRemaining <= 300) return "text-amber-500";
        return "text-cyan-600";
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
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin" />
                    <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-cyan-500 animate-pulse" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Synchronizing Neural Link...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers[currentQuestion?.id];
    const isMultipleChoice = currentQuestion?.type === "mcq_multiple";
    const progress = (getAnsweredCount() / questions.length) * 100;

    return (
        <div className="min-h-screen bg-transparent pb-32">
            {/* Immersive Header */}
            <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
                <GlassCard className="max-w-5xl mx-auto p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-white/5">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-900/40">
                                <Zap className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-black text-sm uppercase tracking-tight truncate max-w-[200px] md:max-w-xs">
                                    {quiz?.title}
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nexus Session Active</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Answered</p>
                                <p className="text-sm font-black font-mono">{getAnsweredCount()} / {questions.length}</p>
                            </div>
                            <div className={cn("flex flex-col items-center md:items-end font-mono", getTimeColor())}>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Window</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-lg font-black leading-none">{formatTime(timeRemaining)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </GlassCard>
            </div>

            {/* Main Content Arena */}
            <div className="pt-32 px-4 max-w-4xl mx-auto space-y-8">
                {/* Tactical Question Map */}
                <div className="flex flex-wrap gap-2.5 justify-center">
                    {questions.map((q, idx) => {
                        const answer = answers[q.id];
                        const isAnswered = q.type.startsWith("mcq") || q.type === "true_false"
                            ? (answer?.selectedOptions?.length || 0) > 0
                            : !!answer?.writtenAnswer?.trim();
                        const isFlagged = flaggedQuestions.has(q.id);
                        const isCurrent = idx === currentIndex;

                        return (
                            <motion.button
                                key={q.id}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "relative h-11 w-11 rounded-2xl font-black text-[10px] uppercase transition-all duration-300 shadow-sm",
                                    isCurrent
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200 ring-4 ring-slate-100"
                                        : isAnswered
                                            ? "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-100"
                                            : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                                )}
                            >
                                {idx + 1}
                                {isFlagged && (
                                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                        <Flag className="h-2 w-2 text-white fill-white" />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Question Terminal Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <GlassCard className="p-0 overflow-hidden border-none shadow-2xl">
                            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-[10px] text-cyan-600">
                                        Q{currentIndex + 1}
                                    </div>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-slate-400 border-slate-200">
                                        Node {currentIndex + 1} of {questions.length}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-cyan-500 text-white border-none text-[9px] font-black h-5 px-2 rounded-full uppercase">
                                        {currentQuestion?.points} CREDITS
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 w-8 p-0 rounded-lg transition-all",
                                            flaggedQuestions.has(currentQuestion?.id) ? "bg-amber-50 text-amber-600" : "text-slate-300 hover:text-slate-500"
                                        )}
                                        onClick={() => toggleFlag(currentQuestion?.id)}
                                    >
                                        <Flag className={cn("h-4 w-4", flaggedQuestions.has(currentQuestion?.id) && "fill-current")} />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-relaxed uppercase">
                                    {currentQuestion?.text}
                                </h2>

                                {(currentQuestion?.type.startsWith("mcq") || currentQuestion?.type === "true_false") && (
                                    <div className="grid gap-4">
                                        {isMultipleChoice && (
                                            <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <AlertTriangle className="h-3 w-3" />
                                                Multiple Conduits Selectable
                                            </p>
                                        )}
                                        {currentQuestion?.options?.map((option) => {
                                            const isSelected = currentAnswer?.selectedOptions?.includes(option.id);
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => toggleOption(currentQuestion.id, option.id, isMultipleChoice)}
                                                    className={cn(
                                                        "group w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 flex items-center gap-5",
                                                        isSelected
                                                            ? "border-cyan-500 bg-cyan-50/50 shadow-lg shadow-cyan-100 scale-[1.02]"
                                                            : "border-slate-100 hover:border-cyan-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-7 w-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                                                        isSelected
                                                            ? "border-cyan-500 bg-cyan-500 text-white rotate-12 scale-110"
                                                            : "border-slate-200 group-hover:border-cyan-300"
                                                    )}>
                                                        {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[15px] font-bold transition-colors",
                                                        isSelected ? "text-cyan-900" : "text-slate-600 group-hover:text-slate-800"
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
                                                className="w-fit text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-cyan-600 mt-4"
                                                onClick={() => clearSelection(currentQuestion.id)}
                                            >
                                                <X className="h-3 w-3 mr-1.5" /> Purge Selection
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {(currentQuestion?.type === "short_answer" || currentQuestion?.type === "long_answer") && (
                                    <div className="relative group/input">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-5 group-focus-within/input:opacity-20 transition-opacity duration-500" />
                                        <Textarea
                                            placeholder={currentQuestion.type === "short_answer"
                                                ? "Type specific conduit response..."
                                                : "Input comprehensive structural analysis..."
                                            }
                                            value={currentAnswer?.writtenAnswer || ""}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, { writtenAnswer: e.target.value })}
                                            rows={currentQuestion.type === "long_answer" ? 10 : 4}
                                            className="relative z-10 w-full bg-white/50 border-slate-100 focus:border-cyan-500 rounded-2xl p-6 text-sm font-bold uppercase transition-all duration-300 resize-none shadow-inner"
                                        />
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Tactical Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
                <GlassCard className="max-w-4xl mx-auto p-4 flex items-center justify-between border-none shadow-2xl bg-slate-900/90 backdrop-blur-2xl">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="h-12 w-12 md:w-auto md:px-6 rounded-2xl border-none text-white hover:bg-white/10 disabled:opacity-30 flex items-center transition-all"
                    >
                        <ChevronLeft className="h-5 w-5 md:mr-2" />
                        <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">Retreat</span>
                    </Button>

                    <Button
                        onClick={() => setShowSubmitDialog(true)}
                        className="h-14 md:h-12 px-10 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-900/50 transition-all duration-300 active:scale-95 flex items-center gap-2 group/submit"
                    >
                        <Send className="h-4 w-4 group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1 transition-transform" />
                        Finalize Assessment
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIndex === questions.length - 1}
                        className="h-12 w-12 md:w-auto md:px-6 rounded-2xl border-none text-white hover:bg-white/10 disabled:opacity-30 flex items-center transition-all"
                    >
                        <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">Advance</span>
                        <ChevronRight className="h-5 w-5 md:ml-2" />
                    </Button>
                </GlassCard>
            </div>

            {/* Decision Dialogs */}
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-cyan-100 rounded-[2rem] p-8 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white">
                                <Send className="h-5 w-5" />
                            </div>
                            Terminate & Upload
                        </AlertDialogTitle>
                        <div className="space-y-6 pt-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100">
                                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Answered</p>
                                    <p className="text-xl font-black text-slate-800 uppercase">{getAnsweredCount()} / {questions.length}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Flagged</p>
                                    <p className="text-xl font-black text-slate-800 uppercase">{flaggedQuestions.size} ITEMS</p>
                                </div>
                            </div>

                            {getAnsweredCount() < questions.length && (
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider leading-relaxed">
                                        Warning: {questions.length - getAnsweredCount()} items remain unaddressed. This will impact final rank significantly.
                                    </p>
                                </div>
                            )}

                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Are you ready to commit your current nexus state?</p>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-8 flex gap-3">
                        <AlertDialogCancel
                            disabled={isSubmitting}
                            className="flex-1 h-12 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                        >
                            Return
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-[1.5] h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-200"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Commit Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-rose-100 rounded-[2rem] p-8 max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-rose-600 uppercase tracking-tight flex items-center gap-3">
                            <Clock className="h-6 w-6 animate-pulse" />
                            CRITICAL WINDOW
                        </AlertDialogTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed pt-2">
                            Less than 60 seconds of terminal stability remaining. System will auto-commit at T-minus 0.
                        </p>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-6">
                        <AlertDialogAction className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest">
                            Acknowledge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
