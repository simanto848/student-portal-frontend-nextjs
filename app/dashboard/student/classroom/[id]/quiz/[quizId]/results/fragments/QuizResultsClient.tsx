"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quizService, quizAttemptService, Quiz, Question, QuizAttempt } from "@/services/classroom/quiz.service";
import StudentLoading from "@/components/StudentLoading";
import { notifyError, notifySuccess } from "@/components/toast";
import {
    Trophy,
    Target,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    RotateCcw,
    Zap,
    TrendingUp,
    ShieldCheck,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function QuizResultsClient() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const workspaceId = params.id as string;
    const quizId = params.quizId as string;
    const attemptId = searchParams.get("attemptId");

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setIsLoading(true);
                const quizData = await quizService.getById(quizId);
                setQuiz(quizData);

                if (attemptId) {
                    const data = await quizAttemptService.getResults(attemptId);
                    setAttempt(data.attempt);
                    setQuestions(data.questions || []);
                    if (data.quiz) setQuiz(data.quiz);
                }
            } catch (error: any) {
                notifyError(error?.message || "Failed to load results");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [quizId, attemptId]);

    if (isLoading) {
        return (
            <StudentLoading />
        );
    }

    if (!attempt) {
        return (
            <GlassCard className="max-w-md mx-auto mt-20 p-12 text-center border-dashed">
                <AlertCircle className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Results Found</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">We couldn't find the results for this quiz attempt.</p>
                <Button
                    onClick={() => router.push(`/dashboard/student/classroom/${workspaceId}/quiz`)}
                    className="w-full h-12 bg-slate-900 hover:bg-[#0088A9] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl"
                >
                    Back to Quizzes
                </Button>
            </GlassCard>
        );
    }

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return "from-[#0088A9] to-blue-600 shadow-[#0088A9]/20";
        if (percentage >= 50) return "from-amber-400 to-orange-500 shadow-amber-200";
        return "from-rose-500 to-red-600 shadow-rose-200";
    };

    const getScoreRank = (percentage: number) => {
        if (percentage >= 90) return "Excellent";
        if (percentage >= 80) return "Very Good";
        if (percentage >= 60) return "Satisfactory";
        if (percentage >= 40) return "Needs Improvement";
        return "Not Graduated";
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <PageHeader
                title="Quiz Results"
                subtitle="Assessment overview and feedback"
                icon={TrendingUp}
                extraActions={
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/student/classroom/${workspaceId}/quiz`)}
                        className="rounded-xl border border-gray-100 bg-white text-[#0088A9] hover:bg-gray-50 font-black uppercase tracking-widest text-[10px]"
                    >
                        <ChevronLeft className="mr-2 h-3.5 w-3.5" />
                        Quiz Hub
                    </Button>
                }
            />

            {/* Score Showcase Hero */}
            <div className="grid gap-6 md:grid-cols-3">
                <GlassCard className={cn(
                    "md:col-span-2 p-0 overflow-hidden border-none shadow-2xl relative bg-gradient-to-br",
                    getScoreColor(attempt.percentage || 0)
                )}>
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                        <Trophy className="h-48 w-48 text-white" />
                    </div>

                    <div className="relative z-10 p-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative">
                            <svg className="h-40 w-40 transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="transparent"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="12"
                                />
                                <motion.circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="transparent"
                                    stroke="white"
                                    strokeWidth="12"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * (attempt.percentage || 0)) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <span className="text-4xl font-black leading-none">{attempt.percentage}%</span>
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Final Score</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left text-white space-y-2">
                            <Badge className="bg-white/20 text-white border-none text-[9px] font-black uppercase tracking-widest px-3 mb-2">
                                {attempt.status.replace("_", " ")}
                            </Badge>
                            <h2 className="text-3xl font-black uppercase tracking-tight leading-none">{getScoreRank(attempt.percentage || 0)}</h2>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">{quiz?.title}</p>
                            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 opacity-70" />
                                    <span className="text-xs font-black">{attempt.score} / {attempt.maxScore} POINTS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 opacity-70" />
                                    <span className="text-xs font-black">PROGRESS LOGGED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="p-6 bg-slate-900 text-white border-none shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-[#0088A9] flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quiz Summary</p>
                                <p className="text-[10px] font-bold text-[#0088A9]">Verified</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Attempts Used</span>
                                <span className="font-black text-sm">#1 / {quiz?.maxAttempts}</span>
                            </div>
                            <Button
                                onClick={() => router.push(`/dashboard/student/classroom/${workspaceId}/quiz/${quizId}`)}
                                disabled={(quiz?.maxAttempts || 0) <= 1}
                                className="w-full h-11 bg-white text-slate-900 border-none hover:bg-gray-100 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                            >
                                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                Retake Quiz
                            </Button>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border-cyan-100 shadow-lg group hover:bg-cyan-50/30 transition-colors">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Instructor Feedback</p>
                        {attempt.feedback ? (
                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase italic">
                                "{attempt.feedback}"
                            </p>
                        ) : (
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No manual commentary provided</p>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* Answer Detailed Scan */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Zap className="h-5 w-5 text-[#0088A9]" />
                        Question Breakdown
                    </h3>
                    <Badge variant="outline" className="text-[8px] font-black text-slate-500 uppercase border-gray-200">
                        {questions.length} Questions
                    </Badge>
                </div>

                {!quiz?.showCorrectAnswers ? (
                    <GlassCard className="p-16 text-center border-dashed">
                        <ShieldCheck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Review Restriction Active</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                            Detailed review of correct answers has been restricted by the faculty head.
                        </p>
                    </GlassCard>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q, idx) => {
                            const answer = attempt.answers?.find(a => a.questionId === q.id);
                            const isCorrect = answer?.isCorrect === true;
                            const pointsEarned = answer?.pointsAwarded || 0;
                            const isPartiallyCorrect = pointsEarned > 0 && pointsEarned < q.points;

                            return (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlassCard className={cn(
                                        "overflow-hidden border-2 transition-all duration-300",
                                        isCorrect ? "border-[#0088A9]/20" : isPartiallyCorrect ? "border-amber-100" : "border-rose-100"
                                    )}>
                                        <div className="flex flex-col md:flex-row gap-6 p-8">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-xl flex items-center justify-center font-black text-[10px]",
                                                            isCorrect ? "bg-[#0088A9] text-white" : isPartiallyCorrect ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                                                        )}>
                                                            {idx + 1}
                                                        </div>
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200 text-slate-400">
                                                            {q.type.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className={cn(
                                                            "text-sm font-black",
                                                            isCorrect ? "text-[#0088A9]" : isPartiallyCorrect ? "text-amber-600" : "text-rose-600"
                                                        )}>
                                                            {pointsEarned} / {q.points} POINTS
                                                        </span>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</span>
                                                    </div>
                                                </div>

                                                <h4 className="text-md font-black text-slate-800 uppercase leading-snug tracking-tight">
                                                    {q.text}
                                                </h4>

                                                {/* Options View */}
                                                {(q.type.startsWith("mcq") || q.type === "true_false") && (
                                                    <div className="grid gap-3 pt-2">
                                                        {q.options?.map((opt) => {
                                                            const isUserSelected = answer?.selectedOptions?.includes(opt.id);
                                                            const isCorrectOpt = opt.isCorrect;

                                                            return (
                                                                <div
                                                                    key={opt.id}
                                                                    className={cn(
                                                                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                                                                        isCorrectOpt
                                                                            ? "bg-[#0088A9]/5 border-[#0088A9]/20 shadow-sm"
                                                                            : isUserSelected && !isCorrectOpt
                                                                                ? "bg-rose-50 border-rose-200"
                                                                                : "bg-gray-50/50 border-gray-100"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={cn(
                                                                            "h-5 w-5 rounded-lg border flex items-center justify-center",
                                                                            isCorrectOpt ? "bg-[#0088A9] border-[#0088A9] text-white" : isUserSelected ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-gray-200"
                                                                        )}>
                                                                            {isCorrectOpt ? <CheckCircle2 className="h-3 w-3" /> : isUserSelected ? <XCircle className="h-3 w-3" /> : null}
                                                                        </div>
                                                                        <span className={cn(
                                                                            "text-xs font-bold uppercase",
                                                                            isCorrectOpt ? "text-[#0088A9]" : isUserSelected ? "text-rose-700" : "text-slate-600"
                                                                        )}>
                                                                            {opt.text}
                                                                        </span>
                                                                    </div>
                                                                    {isUserSelected && (
                                                                        <Badge variant="secondary" className="bg-slate-900/5 text-slate-500 border-none text-[8px] font-black px-2">
                                                                            YOUR INPUT
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Written Answer View */}
                                                {(q.type === "short_answer" || q.type === "long_answer") && (
                                                    <div className="space-y-4 pt-2">
                                                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Your Answer</p>
                                                            <p className="text-xs font-bold text-slate-800 uppercase leading-relaxed">
                                                                {answer?.writtenAnswer || "No answer provided"}
                                                            </p>
                                                        </div>
                                                        {q.correctAnswer && (
                                                            <div className="p-5 rounded-2xl bg-[#0088A9]/5 border border-[#0088A9]/20">
                                                                <p className="text-[8px] font-black text-[#0088A9] uppercase tracking-widest mb-2">Correct Answer</p>
                                                                <p className="text-xs font-bold text-[#0088A9] uppercase leading-relaxed">
                                                                    {q.correctAnswer}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {answer?.feedback && (
                                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                                                        <HelpCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Question Feedback</p>
                                                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight italic">
                                                                "{answer.feedback}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
