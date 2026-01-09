"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Button } from "@/components/ui/button";
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
    Zap,
    ChevronRight,
    ArrowLeft
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
import { motion, AnimatePresence } from "framer-motion";

export default function QuizListClient() {
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
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-cyan-500 animate-pulse" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Assessment Replicas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Quiz Section"
                subtitle="Evaluate your progress & claim credentials"
                icon={ClipboardList}
                extraActions={
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/student/classroom/${workspaceId}`)}
                        className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-black uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                        Return to Classroom
                    </Button>
                }
            />

            <div className="grid gap-6">
                {quizzes.length === 0 ? (
                    <GlassCard className="p-24 flex flex-col items-center justify-center border-dashed">
                        <ClipboardList className="h-16 w-16 text-slate-100 mb-6" />
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">No Evaluations Detected</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your faculty hasn't published any quizzes yet</p>
                    </GlassCard>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {quizzes.map((quiz, idx) => {
                                const { inProgress, completed, attemptsRemaining, bestScore } = getQuizStatus(quiz);
                                const canAttempt = attemptsRemaining > 0 || !!inProgress;

                                return (
                                    <motion.div
                                        key={quiz.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <GlassCard className="overflow-hidden group hover:border-cyan-200/50 transition-all duration-300 flex flex-col h-full">
                                            <div className="p-6 flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                        <Zap className="h-6 w-6" />
                                                    </div>
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter text-cyan-500 border-cyan-100">
                                                        {quiz.duration} MIN
                                                    </Badge>
                                                </div>

                                                <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-cyan-600 transition-colors uppercase mb-2 line-clamp-1">{quiz.title}</h3>
                                                {quiz.description && (
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-2 mb-6">{quiz.description}</p>
                                                )}

                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Items</p>
                                                        <div className="flex items-center gap-1.5 font-black text-slate-700 text-sm">
                                                            <FileCheck className="h-3.5 w-3.5 text-cyan-500" />
                                                            {quiz.questionCount}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Reruns</p>
                                                        <div className="flex items-center gap-1.5 font-black text-slate-700 text-sm">
                                                            <RotateCcw className="h-3.5 w-3.5 text-cyan-500" />
                                                            {attemptsRemaining}
                                                        </div>
                                                    </div>
                                                </div>

                                                {completed.length > 0 && (
                                                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white relative overflow-hidden group/score shadow-lg shadow-cyan-200">
                                                        <div className="absolute right-0 bottom-0 p-2 opacity-10 group-hover/score:scale-125 transition-transform duration-700">
                                                            <Trophy className="h-12 w-12" />
                                                        </div>
                                                        <div className="relative z-10 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[8px] font-black text-cyan-100 uppercase tracking-widest mb-1 leading-none">Best Rank</p>
                                                                <p className="text-2xl font-black leading-none">{bestScore}%</p>
                                                            </div>
                                                            <Badge variant="secondary" className="bg-white/20 text-white border-none text-[8px] font-black">
                                                                {completed.length} LOGS
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}

                                                {inProgress && (
                                                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                                                <Timer className="h-4 w-4 animate-pulse" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Active Link</p>
                                                                <p className="text-[10px] font-bold text-amber-800">Attempt in Progress</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest px-4"
                                                            onClick={() => router.push(`/dashboard/student/classroom/${workspaceId}/quiz/${quiz.id}`)}
                                                        >
                                                            Resume
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-6 pb-6 mt-auto">
                                                {!inProgress && (
                                                    <Button
                                                        className={canAttempt
                                                            ? "w-full h-12 bg-slate-900 border-none hover:bg-cyan-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 group/btn"
                                                            : "w-full h-12 bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl cursor-not-allowed"
                                                        }
                                                        disabled={!canAttempt}
                                                        onClick={() => setStartingQuiz(quiz)}
                                                    >
                                                        {canAttempt ? (
                                                            <>
                                                                <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                                                                {completed.length > 0 ? "Rerun Assessment" : "Initiate Assessment"}
                                                                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock className="h-3.5 w-3.5 mr-2" />
                                                                Evaluations Exhausted
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AlertDialog open={!!startingQuiz} onOpenChange={() => !isStarting && setStartingQuiz(null)}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-cyan-100 rounded-[2rem] p-8 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white">
                                <Zap className="h-5 w-5" />
                            </div>
                            Initiate Assessment
                        </AlertDialogTitle>
                        <div className="space-y-6 pt-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Target Module</p>
                                <p className="text-lg font-black text-slate-800 uppercase leading-none">{startingQuiz?.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Timer className="h-3.5 w-3.5 text-cyan-600" />
                                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Window</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-800 uppercase">{startingQuiz?.duration} Mins</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileCheck className="h-3.5 w-3.5 text-cyan-600" />
                                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Nodes</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-800 uppercase">{startingQuiz?.questionCount} Questions</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider leading-relaxed">
                                    Once synchronized, the nexus timer cannot be paused. Ensure localized stability before proceeding.
                                </p>
                            </div>

                            {startingQuiz?.instructions && (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Protocol Instructions</p>
                                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase">{startingQuiz.instructions}</p>
                                </div>
                            )}
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-8 flex gap-3">
                        <AlertDialogCancel
                            disabled={isStarting}
                            className="flex-1 h-12 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                        >
                            Abort
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStartQuiz}
                            disabled={isStarting}
                            className="flex-[1.5] h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-200"
                        >
                            {isStarting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Synchronize & Start
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
