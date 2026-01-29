"use client";

import { useState, useEffect } from "react";
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
    Edit,
    RefreshCw,
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
    otherAttempts = [],
    student,
    workspaceId,
    refresh,
}: QuizGradingClientProps & { otherAttempts?: QuizAttempt[] }) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [isSaving, setIsSaving] = useState(false);

    // Manual Score State
    const [manualScore, setManualScore] = useState<number>(attempt.score || 0);
    const [graderFeedback, setGraderFeedback] = useState<string>(attempt.graderFeedback || "");

    const handleSaveOverall = async () => {
        try {
            setIsSaving(true);
            await quizAttemptService.gradeOverall(attempt.id, manualScore, graderFeedback);
            notifySuccess("Final score updated successfully");
            refresh();
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to update score"));
        } finally {
            setIsSaving(false);
        }
    };

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

    // Validating state sync with prop changes (Critical for Auto-Regrade)

    useEffect(() => {
        const newGrades: Record<string, { points: number; feedback: string }> = {};
        attempt.answers.forEach((answer) => {
            newGrades[answer.questionId] = {
                points: answer.pointsAwarded ?? 0,
                feedback: answer.feedback || "",
            };
        });
        setGrades(newGrades);
        setManualScore(attempt.score || 0); // Also sync manual score
        setGraderFeedback(attempt.graderFeedback || "");
    }, [attempt]);

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
            // router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`); // Stay on page to see updates
            refresh();
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to save grades"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegrade = async () => {
        try {
            setIsSaving(true);
            await quizAttemptService.regrade(attempt.id);
            notifySuccess("Attempt auto-regraded successfully");
            refresh();
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to regrade attempt"));
        } finally {
            setIsSaving(false);
        }
    };

    const totalAwarded = Object.values(grades).reduce(
        (sum, g) => sum + (g.points || 0),
        0,
    );

    const percentage = quiz.maxScore > 0 ? Math.round((totalAwarded / quiz.maxScore) * 100) : 0;

    // Helper to determine the current attempt number dynamically
    const currentAttemptIndex = (() => {
        const sorted = [...otherAttempts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const index = sorted.findIndex(a => (a.id === attempt.id || (a as any)._id === (attempt as any)._id));
        return index !== -1 ? index + 1 : 1;
    })();

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
                        {otherAttempts.length > 1 && (
                            <div className="mr-4 flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                                {otherAttempts
                                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                    .map((att, index) => {
                                        const attId = att.id || (att as any)._id;
                                        return (
                                            <Button
                                                key={attId}
                                                onClick={() => router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}/grade/${attId}`)}
                                                variant="ghost"
                                                className={cn(
                                                    "h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    (att.id === attempt.id || (att as any)._id === (attempt as any)._id)
                                                        ? "bg-white text-slate-900 shadow-sm"
                                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                                                )}
                                            >
                                                Attempt #{index + 1}
                                            </Button>
                                        );
                                    })}
                            </div>
                        )}
                        <Badge className={`${theme.colors.sidebar.active} ${theme.colors.sidebar.activeText} border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${theme.colors.sidebar.activeText}`}>
                                Status: {attempt.status === 'graded' ? 'Graded' : 'Pending Review'}
                            </span>
                        </Badge>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                onClick={handleRegrade}
                                disabled={isSaving}
                                variant="outline"
                                className={`h-11 px-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 flex items-center gap-2 mr-2`}
                            >
                                <RefreshCw className={cn("w-4 h-4", isSaving && "animate-spin")} />
                                Auto-Regrade
                            </Button>
                        </motion.div>

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
                    <Card className={`border-none rounded-[3rem] bg-white text-slate-900 shadow-xl shadow-slate-200/50 overflow-hidden relative`}>
                        <div className={`absolute top-0 right-0 w-80 h-80 ${theme.colors.accent.secondary}/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none`} />
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
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Attempt #{currentAttemptIndex}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <motion.div
                                    variants={scoreVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 text-right min-w-[220px]"
                                >
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Score</p>
                                    <div className="flex items-baseline justify-end gap-2">
                                        <span className="text-5xl font-black text-slate-900">{totalAwarded}</span>
                                        <span className="text-xl font-black text-slate-400">/ {quiz.maxScore}</span>
                                    </div>
                                    <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 0.8, duration: 1, ease: "easeOut" as const }}
                                            className={cn(
                                                "h-full rounded-full",
                                                percentage >= 80 ? "bg-emerald-500" :
                                                    percentage >= 50 ? "bg-amber-500" :
                                                        "bg-rose-500"
                                            )}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-6 items-center text-xs font-bold text-slate-500 italic">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 not-italic">TIMESTAMP:</span>
                                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "UNDEFINED"}
                                </div>
                                {attempt.isAutoSubmitted && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                        Auto Submitted
                                    </Badge>
                                )}
                                {attempt.isLate && (
                                    <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-none rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest animate-pulse">
                                        LATE SUBMISSION
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Manual Grade Override Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 bg-white shadow-xl overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl ${theme.colors.accent.secondary} flex items-center justify-center text-white shadow-lg shadow-teal-500/20`}>
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-none mb-2">Final Grade Override</h3>
                                    <p className="text-sm font-bold text-slate-500">Manually adjust the final score (e.g., for late penalties)</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-1/3 space-y-4">
                                    <Label className={`text-[10px] font-black ${theme.colors.accent.primary} uppercase tracking-widest`}>Manual Total Score</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={quiz.maxScore}
                                            value={manualScore}
                                            onChange={(e) => setManualScore(parseInt(e.target.value) || 0)}
                                            className="h-16 rounded-2xl border-2 border-slate-200 text-3xl font-black text-slate-900 px-6 focus:border-teal-500 transition-all"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm uppercase">/ {quiz.maxScore}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 italic">
                                        Original Auto-Score: <span className="text-slate-600 not-italic">{totalAwarded}</span>
                                    </p>
                                </div>
                                <div className="flex-1 w-full space-y-4">
                                    <Label className={`text-[10px] font-black ${theme.colors.accent.primary} uppercase tracking-widest`}>Grader Feedback</Label>
                                    <Input
                                        value={graderFeedback}
                                        onChange={(e) => setGraderFeedback(e.target.value)}
                                        placeholder="Reason for score adjustment..."
                                        className="h-16 rounded-2xl border-2 border-slate-200 text-lg font-bold text-slate-700 px-6 focus:border-teal-500 transition-all"
                                    />
                                </div>
                                <div className="self-end">
                                    <Button
                                        onClick={handleSaveOverall}
                                        disabled={isSaving}
                                        className={`h-16 px-8 rounded-2xl ${theme.colors.accent.secondary} text-white font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all`}
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        Update Final Score
                                    </Button>
                                </div>
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
                            // Robust finding of answer: ensure ID comparison handles potential type mismatches (though TS implies strings)
                            const answer = attempt.answers.find((a) => String(a.questionId) === String(question.id));
                            const grade = grades[question.id] || { points: 0, feedback: "" };
                            const isAutoGraded = ["mcq_single", "mcq_multiple", "true_false"].includes(question.type);
                            const isQuestionCorrect = answer?.isCorrect;

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
                                        isQuestionCorrect === true ? "border-emerald-500/30 hover:border-emerald-500/50" :
                                            isQuestionCorrect === false ? "border-rose-500/30 hover:border-rose-500/50" : "border-slate-100 hover:border-slate-200"
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
                                                            isQuestionCorrect === true ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30" :
                                                                isQuestionCorrect === false ? "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30" :
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
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {question.options?.map((option, optIdx) => {
                                                            // Robust Finding: Match by ID OR Text (for legacy/text-stored answers)
                                                            const wasSelected = answer?.selectedOptions?.some((val) =>
                                                                String(val) === String(option.id) ||
                                                                String(val).trim().toLowerCase() === String(option.text).trim().toLowerCase()
                                                            );
                                                            const isActualCorrectAnswer = option.isCorrect;

                                                            return (
                                                                <motion.div
                                                                    key={option.id}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.3 + optIdx * 0.1 }}
                                                                    className={cn(
                                                                        "p-5 rounded-2xl border-2 transition-all flex items-center gap-4 relative overflow-hidden",
                                                                        // Enhanced Visualization Logic
                                                                        isActualCorrectAnswer
                                                                            ? "bg-emerald-50/80 border-emerald-500/50 ring-1 ring-emerald-500/20" // Correct is always Green
                                                                            : (wasSelected
                                                                                ? "bg-rose-50/50 border-rose-500/40" // Selected & Wrong is Red
                                                                                : "bg-slate-50/30 border-slate-100") // Unselected & Wrong is neutral
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm transition-colors",
                                                                        isActualCorrectAnswer
                                                                            ? "bg-emerald-500 text-white"
                                                                            : (wasSelected
                                                                                ? "bg-rose-500 text-white"
                                                                                : "bg-white text-slate-300 border border-slate-200")
                                                                    )}>
                                                                        {isActualCorrectAnswer ? <CheckCircle2 className="w-5 h-5" /> : (wasSelected ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + optIdx))}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className={cn("text-sm font-bold block",
                                                                            isActualCorrectAnswer ? "text-emerald-900" : (wasSelected ? "text-rose-900" : "text-slate-500")
                                                                        )}>{option.text}</span>
                                                                        {isActualCorrectAnswer && <div className="text-[9px] font-black uppercase text-emerald-600 mt-1">Correct Answer</div>}
                                                                        {wasSelected && !isActualCorrectAnswer && <div className="text-[9px] font-black uppercase text-rose-500 mt-1">Student Answer</div>}
                                                                        {wasSelected && isActualCorrectAnswer && <div className="text-[9px] font-black uppercase text-emerald-600 mt-1">Student Answer</div>}
                                                                    </div>
                                                                    {wasSelected && (
                                                                        <span className={`absolute right-4 top-4 text-[9px] font-black uppercase ${isActualCorrectAnswer ? 'text-emerald-600' : 'text-rose-500'} tracking-tighter opacity-20`}>Selected</span>
                                                                    )}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Debug / Fallback for Missing/Mismatched Answers */}
                                                    {(!answer?.selectedOptions || answer.selectedOptions.length === 0) && (
                                                        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200 text-center">
                                                            <p className="text-xs font-bold text-slate-400 italic">Student did not select any option.</p>
                                                        </div>
                                                    )}

                                                    {/* Update Mismatch Logic to respect Text matching too */}
                                                    {answer?.selectedOptions && answer.selectedOptions.length > 0 && !answer.selectedOptions.some(val =>
                                                        question.options?.some(o =>
                                                            String(o.id) === String(val) ||
                                                            String(o.text).trim().toLowerCase() === String(val).trim().toLowerCase()
                                                        )
                                                    ) && (
                                                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                                                <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                                    Answer ID Mismatch (Quiz edited?)
                                                                </p>
                                                                <p className="text-[10px] text-amber-600 mt-1 font-mono">
                                                                    Raw: {JSON.stringify(answer.selectedOptions)}
                                                                </p>
                                                            </div>
                                                        )}
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
                                                    {question.correctAnswer && (
                                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Expected Answer:</p>
                                                            <p className="text-sm font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 inline-block">
                                                                {question.correctAnswer}
                                                            </p>
                                                        </div>
                                                    )}
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
                                                    {isAutoGraded && (
                                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                            <Button
                                                                onClick={() => handleSaveGrade(question.id)}
                                                                disabled={isSaving}
                                                                variant="outline"
                                                                className={`h-14 px-8 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:border-teal-500 hover:text-teal-600 transition-all`}
                                                            >
                                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
                                                                Override Grade
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                {isAutoGraded && (
                                                    <p className="text-[10px] font-bold text-slate-400 italic flex items-center gap-2">
                                                        <Trophy className="w-3.5 h-3.5" /> Auto-graded. You can manually override if needed.
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
        </motion.div >
    );
}
