"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    quizAttemptService,
    Quiz,
    Question,
    QuizAttempt,
} from "@/services/classroom/quiz.service";
import { Student } from "@/services/user/student.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    Save,
    Clock,
    GraduationCap,
    Shield,
    FileText,
    MessageSquare,
    Sparkles,
    Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getImageUrl } from "@/lib/utils";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface QuizGradingClientProps {
    quiz: Quiz;
    questions: Question[];
    attempt: QuizAttempt;
    student: Student | null;
    workspaceId: string;
    refresh: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.08,
            duration: 0.5,
            ease: "easeOut" as const,
        },
    }),
};

const scoreVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { delay: 0.5, type: "spring" as const, stiffness: 200 },
    },
};

export function QuizGradingClient({
    quiz,
    questions,
    attempt,
    student,
    workspaceId,
    refresh,
}: QuizGradingClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [isSaving, setIsSaving] = useState(false);
    const [grades, setGrades] = useState<
        Record<string, { points: number; feedback: string }>
    >(() => {
        const initial: Record<string, { points: number; feedback: string }> = {};
        attempt.answers.forEach((answer) => {
            initial[answer.questionId] = {
                points: answer.pointsAwarded ?? 0,
                feedback: answer.feedback || "",
            };
        });
        return initial;
    });

    const handleGradeChange = (
        questionId: string,
        field: "points" | "feedback",
        value: number | string,
    ) => {
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
            await quizAttemptService.gradeAnswer(
                attempt.id,
                questionId,
                grade.points,
                grade.feedback,
            );
            notifySuccess("Grade saved successfully");
            refresh();
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to save grade"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAll = async () => {
        try {
            setIsSaving(true);
            for (const questionId of Object.keys(grades)) {
                const grade = grades[questionId];
                await quizAttemptService.gradeAnswer(
                    attempt.id,
                    questionId,
                    grade.points,
                    grade.feedback,
                );
            }
            notifySuccess("All grades saved successfully");
            router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`);
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to save grades"));
        } finally {
            setIsSaving(false);
        }
    };

    const totalAwarded = Object.values(grades).reduce(
        (sum, g) => sum + (g.points || 0),
        0,
    );

    const percentage = quiz.maxScore > 0 ? Math.round((totalAwarded / quiz.maxScore) * 100) : 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 pb-24"
        >
            <PageHeader
                title="Grade Submission"
                subtitle={`Reviewing answers for ${student?.fullName || 'Anonymous Student'}`}
                onBack={() => router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`)}
                icon={GraduationCap}
                extraActions={
                    <div className="flex items-center gap-3">
                        <Badge className={`${theme.colors.sidebar.active} ${theme.colors.sidebar.activeText} border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${theme.colors.sidebar.activeText}`}>
                                Status: Grading
                            </span>
                        </Badge>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={handleSaveAll}
                                disabled={isSaving}
                                className={`h-11 px-6 rounded-xl ${theme.colors.accent.secondary} border-none text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2`}
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save All Grades
                            </Button>
                        </motion.div>
                    </div>
                }
            />

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Candidate Spotlight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className={`border-none rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl overflow-hidden relative`}>
                        <div className={`absolute top-0 right-0 w-80 h-80 ${theme.colors.accent.secondary}/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none`} />
                        <div className={`absolute bottom-0 left-0 w-64 h-64 ${theme.colors.accent.secondary}/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none`} />
                        <CardContent className="p-10 relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 3 }}
                                        className="h-20 w-20 rounded-[2rem] bg-white text-slate-900 flex items-center justify-center font-black text-3xl italic shadow-2xl border-4 border-slate-700 overflow-hidden relative group"
                                    >
                                        {student?.profile?.profilePicture ? (
                                            <img
                                                src={getImageUrl(student.profile.profilePicture)}
                                                alt={student.fullName}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <span className={theme.colors.accent.primary}>
                                                {student?.fullName.substring(0, 1).toUpperCase() || "A"}
                                            </span>
                                        )}
                                    </motion.div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">{student?.fullName || `Student #${attempt.studentId.slice(-8).toUpperCase()}`}</h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className={`text-[10px] font-black ${theme.colors.accent.primary} uppercase tracking-widest flex items-center gap-2`}>
                                                <Shield className="w-3.5 h-3.5" /> {student?.registrationNumber || "EXT-QUIZ"}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" /> Attempt #{attempt.attemptNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <motion.div
                                    variants={scoreVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-700/50 text-right min-w-[220px]"
                                >
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Score</p>
                                    <div className="flex items-baseline justify-end gap-2">
                                        <span className="text-5xl font-black text-white">{totalAwarded}</span>
                                        <span className="text-xl font-black text-slate-600">/ {quiz.maxScore}</span>
                                    </div>
                                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 0.8, duration: 1, ease: "easeOut" as const }}
                                            className={cn(
                                                "h-full rounded-full",
                                                percentage >= 80 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                                                    percentage >= 50 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                                        "bg-gradient-to-r from-rose-400 to-rose-500"
                                            )}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-wrap gap-6 items-center text-xs font-bold text-slate-400 italic">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-500 not-italic">TIMESTAMP:</span>
                                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "UNDEFINED"}
                                </div>
                                {attempt.isAutoSubmitted && (
                                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-none rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                        Auto Submitted
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Questions List */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Question Grading</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent mx-8" />
                    </div>

                    <div className="grid gap-6">
                        {questions.map((question, index) => {
                            const answer = attempt.answers.find((a) => a.questionId === question.id);
                            const grade = grades[question.id] || { points: 0, feedback: "" };
                            const isAutoGraded = ["mcq_single", "mcq_multiple", "true_false"].includes(question.type);
                            const isCorrect = answer?.isCorrect;

                            return (
                                <motion.div
                                    key={question.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index}
                                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                >
                                    <Card className={cn(
                                        "border-2 rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/40 transition-all duration-500",
                                        isCorrect === true ? "border-emerald-500/30 hover:border-emerald-500/50" :
                                            isCorrect === false ? "border-rose-500/30 hover:border-rose-500/50" : "border-slate-100 hover:border-slate-200"
                                    )}>
                                        <CardHeader className="p-8 bg-gradient-to-r from-slate-50/80 to-white border-b-2 border-slate-50">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-5">
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -90 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                                        className={cn(
                                                            "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg",
                                                            isCorrect === true ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30" :
                                                                isCorrect === false ? "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30" :
                                                                    "bg-gradient-to-br from-slate-700 to-slate-900"
                                                        )}
                                                    >
                                                        {index + 1}
                                                    </motion.div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-lg font-black text-slate-900 leading-snug">{question.text}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <Badge className="bg-white text-slate-500 border-2 border-slate-100 font-black text-[9px] uppercase px-3 py-1 shadow-sm">
                                                                {question.type.replace("_", " ").toUpperCase()}
                                                            </Badge>
                                                            <span className={`text-[10px] font-black ${theme.colors.accent.primary} uppercase tracking-widest`}>{question.points} Points</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-8">
                                            {/* Answer Visualization */}
                                            {(question.type.startsWith("mcq") || question.type === "true_false") && (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {question.options?.map((option, optIdx) => {
                                                        const wasSelected = answer?.selectedOptions?.includes(option.id);
                                                        const isOptionCorrect = option.isCorrect;
                                                        return (
                                                            <motion.div
                                                                key={option.id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.3 + optIdx * 0.1 }}
                                                                className={cn(
                                                                    "p-5 rounded-2xl border-2 transition-all flex items-center gap-4 relative overflow-hidden",
                                                                    wasSelected && isOptionCorrect ? "bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-emerald-500/40" :
                                                                        wasSelected && !isOptionCorrect ? "bg-gradient-to-r from-rose-50 to-rose-50/50 border-rose-500/40" :
                                                                            isOptionCorrect ? "bg-slate-50/50 border-emerald-500/20" : "bg-slate-50/50 border-slate-100"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm",
                                                                    wasSelected ? (isOptionCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "bg-white text-slate-300"
                                                                )}>
                                                                    {isOptionCorrect ? <CheckCircle2 className="w-5 h-5" /> : (wasSelected ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + optIdx))}
                                                                </div>
                                                                <span className={cn("text-sm font-bold flex-1", wasSelected ? "text-slate-900" : "text-slate-500")}>{option.text}</span>
                                                                {wasSelected && (
                                                                    <span className={`text-[9px] font-black uppercase ${theme.colors.accent.primary} tracking-tighter`}>Selected</span>
                                                                )}
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {(question.type === "short_answer" || question.type === "long_answer") && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 shadow-inner relative"
                                                >
                                                    <div className="absolute top-4 right-8">
                                                        <FileText className="w-6 h-6 text-slate-200" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Student Answer</p>
                                                    <p className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">
                                                        {answer?.writtenAnswer || <span className="italic opacity-30">NO RESPONSE PROVIDED</span>}
                                                    </p>
                                                </motion.div>
                                            )}

                                            {/* Evaluation Controls */}
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className={`p-8 rounded-[2rem] border-2 space-y-6 ${theme.colors.sidebar.activeBgSubtle} border-${theme.colors.accent.primary.replace('text-', '')}/20`}
                                            >
                                                <div className="flex flex-col md:flex-row gap-6 md:items-end">
                                                    <div className="w-40">
                                                        <Label className={`text-[10px] font-black ${theme.colors.accent.primary} uppercase tracking-widest mb-2 block`}>Score Awarded</Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={question.points}
                                                                value={grade.points}
                                                                onChange={(e) => handleGradeChange(question.id, "points", parseInt(e.target.value) || 0)}
                                                                disabled={isAutoGraded}
                                                                className={`h-14 rounded-2xl border-2 border-${theme.colors.accent.primary.replace('text-', '')}/30 bg-white font-black text-xl ${theme.colors.accent.primary} focus:border-${theme.colors.accent.primary.replace('text-', '')} px-6`}
                                                            />
                                                            <span className={`absolute right-6 top-1/2 -translate-y-1/2 font-black ${theme.colors.accent.primary} opacity-30 uppercase text-[10px]`}>PTS</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className={`text-[10px] font-black ${theme.colors.accent.primary} uppercase tracking-widest mb-2 block`}>Feedback</Label>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Provide feedback for student..."
                                                                value={grade.feedback}
                                                                onChange={(e) => handleGradeChange(question.id, "feedback", e.target.value)}
                                                                className={`h-14 rounded-2xl border-2 border-${theme.colors.accent.primary.replace('text-', '')}/30 bg-white font-bold text-slate-700 px-6 pr-12 italic`}
                                                            />
                                                            <MessageSquare className={`w-5 h-5 ${theme.colors.accent.primary} opacity-30 absolute right-6 top-1/2 -translate-y-1/2`} />
                                                        </div>
                                                    </div>
                                                    {!isAutoGraded && (
                                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                            <Button
                                                                onClick={() => handleSaveGrade(question.id)}
                                                                disabled={isSaving}
                                                                className={`h-14 px-8 rounded-2xl ${theme.colors.accent.secondary} text-white font-black text-[10px] uppercase tracking-widest shadow-xl`}
                                                            >
                                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                                Save Grade
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                {isAutoGraded && (
                                                    <p className="text-[10px] font-bold text-emerald-600/80 italic flex items-center gap-2">
                                                        <Trophy className="w-3.5 h-3.5" /> This question was graded automatically. Manual override is disabled.
                                                    </p>
                                                )}
                                            </motion.div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
