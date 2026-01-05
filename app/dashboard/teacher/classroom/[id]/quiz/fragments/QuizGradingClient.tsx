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
    ArrowLeft,
    Loader2,
    CheckCircle2,
    XCircle,
    Save,
    User,
    Clock,
    GraduationCap,
    Shield,
    FileText,
    MessageSquare,
    Sparkles,
    Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizHeader } from "./QuizHeader";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizGradingClientProps {
    quiz: Quiz;
    questions: Question[];
    attempt: QuizAttempt;
    student: Student | null;
    workspaceId: string;
    refresh: () => void;
}

export function QuizGradingClient({
    quiz,
    questions,
    attempt,
    student,
    workspaceId,
    refresh,
}: QuizGradingClientProps) {
    const router = useRouter();
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

    return (
        <div className="space-y-12 pb-24">
            <QuizHeader
                title="Grade Submission"
                subtitle={`Reviewing answers for ${student?.fullName || 'Anonymous Student'}`}
                backHref={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`}
                breadcrumbs={[
                    { label: "Classroom", href: `/dashboard/teacher/classroom/${workspaceId}` },
                    { label: "Quizzes", href: `/dashboard/teacher/classroom/${workspaceId}/quiz` },
                    { label: quiz.title, href: `/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}` },
                    { label: "Evaluation" }
                ]}
                icon={GraduationCap}
                badgeText="Grading"
                action={
                    <Button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="h-14 px-8 rounded-2xl bg-indigo-600 border-none hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save All Grades
                    </Button>
                }
            />

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Candidate Spotlight */}
                <Card className="border-none rounded-[3rem] bg-slate-900 text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                    <CardContent className="p-10 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] bg-white text-slate-900 flex items-center justify-center font-black text-3xl italic shadow-2xl border-4 border-slate-800">
                                    {student?.fullName.substring(0, 1).toUpperCase() || "A"}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">{student?.fullName || `Student #${attempt.studentId.slice(-8).toUpperCase()}`}</h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5" /> {student?.registrationNumber || "EXT-QUIZ"}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" /> Attempt #{attempt.attemptNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-700 text-right min-w-[200px]">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Score</p>
                                <div className="flex items-baseline justify-end gap-2">
                                    <span className="text-5xl font-black text-white">{totalAwarded}</span>
                                    <span className="text-xl font-black text-slate-600">/ {quiz.maxScore}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-6 items-center text-xs font-bold text-slate-400 italic">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase text-slate-500 not-italic">TIMESTAMP:</span>
                                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "UNDEFINED"}
                            </div>
                            {attempt.isAutoSubmitted && (
                                <Badge variant="secondary" className="bg-amber-500 text-white border-none rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                    Auto Submitted
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Questions List */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Question Grading</h3>
                        <div className="h-px flex-1 bg-slate-100 mx-8" />
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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className={cn(
                                        "border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/40 transition-all duration-500",
                                        isCorrect === true ? "border-emerald-500/20" :
                                            isCorrect === false ? "border-rose-500/20" : "border-slate-100"
                                    )}>
                                        <CardHeader className="p-8 bg-slate-50/50 border-b-2 border-slate-50">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-5">
                                                    <div className={cn(
                                                        "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-lg",
                                                        isCorrect === true ? "bg-emerald-500 shadow-emerald-500/20" :
                                                            isCorrect === false ? "bg-rose-500 shadow-rose-500/20" : "bg-slate-900"
                                                    )}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-lg font-black text-slate-900 leading-snug">{question.text}</h4>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <Badge className="bg-white text-slate-500 border-2 border-slate-100 font-black text-[9px] uppercase px-3 py-1">
                                                                {question.type.replace("_", " ").toUpperCase()}
                                                            </Badge>
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{question.points} Points</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-8">
                                            {/* Answer Visualization */}
                                            {(question.type.startsWith("mcq") || question.type === "true_false") && (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {question.options?.map((option) => {
                                                        const wasSelected = answer?.selectedOptions?.includes(option.id);
                                                        const isOptionCorrect = option.isCorrect;
                                                        return (
                                                            <div
                                                                key={option.id}
                                                                className={cn(
                                                                    "p-4 rounded-2xl border-2 transition-all flex items-center gap-4 relative overflow-hidden",
                                                                    wasSelected && isOptionCorrect ? "bg-emerald-50 border-emerald-500/30" :
                                                                        wasSelected && !isOptionCorrect ? "bg-rose-50 border-rose-500/30" :
                                                                            isOptionCorrect ? "bg-slate-50 border-emerald-500/10 italic" : "bg-slate-50 border-slate-100/50 opacity-60"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0",
                                                                    wasSelected ? (isOptionCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "bg-white text-slate-300"
                                                                )}>
                                                                    {isOptionCorrect ? <CheckCircle2 className="w-5 h-5" /> : (wasSelected ? <XCircle className="w-5 h-5" /> : null)}
                                                                </div>
                                                                <span className={cn("text-sm font-bold", wasSelected ? "text-slate-900" : "text-slate-500")}>{option.text}</span>
                                                                {wasSelected && (
                                                                    <span className="text-[9px] font-black uppercase text-indigo-400 absolute top-2 right-4 tracking-tighter">Student Answer</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {(question.type === "short_answer" || question.type === "long_answer") && (
                                                <div className="p-8 rounded-3xl bg-slate-50 border-2 border-slate-100 shadow-inner relative group">
                                                    <div className="absolute top-4 right-8">
                                                        <FileText className="w-6 h-6 text-slate-200" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Student Answer</p>
                                                    <p className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-wrap">
                                                        {answer?.writtenAnswer || <span className="italic opacity-30">NO RESPONSE PROVIDED</span>}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Evaluation Controls */}
                                            <div className="bg-indigo-50/30 p-8 rounded-[2rem] border-2 border-indigo-100/50 space-y-6">
                                                <div className="flex flex-col md:flex-row gap-6 md:items-end">
                                                    <div className="w-40">
                                                        <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Score Awarded</Label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={question.points}
                                                                value={grade.points}
                                                                onChange={(e) => handleGradeChange(question.id, "points", parseInt(e.target.value) || 0)}
                                                                disabled={isAutoGraded}
                                                                className="h-14 rounded-2xl border-2 border-indigo-100 bg-white font-black text-xl text-indigo-700 focus:border-indigo-500 px-6"
                                                            />
                                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-indigo-200 uppercase text-[10px]">PTS</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Feedback</Label>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Provide feedback for student..."
                                                                value={grade.feedback}
                                                                onChange={(e) => handleGradeChange(question.id, "feedback", e.target.value)}
                                                                className="h-14 rounded-2xl border-2 border-indigo-100 bg-white font-bold text-slate-700 px-6 pr-12 italic"
                                                            />
                                                            <MessageSquare className="w-5 h-5 text-indigo-200 absolute right-6 top-1/2 -translate-y-1/2" />
                                                        </div>
                                                    </div>
                                                    {!isAutoGraded && (
                                                        <Button
                                                            onClick={() => handleSaveGrade(question.id)}
                                                            disabled={isSaving}
                                                            className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95"
                                                        >
                                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                                            Save Grade
                                                        </Button>
                                                    )}
                                                </div>
                                                {isAutoGraded && (
                                                    <p className="text-[10px] font-bold text-emerald-600/80 italic flex items-center gap-2">
                                                        <Trophy className="w-3.5 h-3.5" /> This question was graded automatically. Manual override is disabled.
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
