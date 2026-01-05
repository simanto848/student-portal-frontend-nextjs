"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Quiz,
    Question,
    QuizAttempt,
    quizService,
} from "@/services/classroom/quiz.service";
import { Student } from "@/services/user/student.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import {
    Users,
    FileCheck,
    Edit,
    Play,
    Lock,
    Trophy,
    Award,
    TrendingUp,
    AlertTriangle,
    FileText,
    Settings,
    BarChart3,
    BarChart,
    Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizHeader } from "./QuizHeader";
import { QuizStats } from "./QuizStats";
import { QuizSettingsCard } from "./QuizSettingsCard";
import { QuestionReviewCard } from "./QuestionReviewCard";
import { SubmissionRow } from "./SubmissionRow";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuizDetailClientProps {
    quiz: Quiz;
    questions: Question[];
    submissions: QuizAttempt[];
    batchStudents: Student[];
    workspaceId: string;
    refresh: () => void;
}

export function QuizDetailClient({
    quiz,
    questions,
    submissions,
    batchStudents,
    workspaceId,
    refresh,
}: QuizDetailClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("analytics");

    const handlePublish = async () => {
        try {
            const res = await quizService.publish(quiz.id);
            notifySuccess(getSuccessMessage(res, "Quiz published successfully"));
            refresh();
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to publish quiz"));
        }
    };

    const handleClose = async () => {
        try {
            const res = await quizService.close(quiz.id);
            notifySuccess(getSuccessMessage(res, "Quiz closed successfully"));
            refresh();
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to close quiz"));
        }
    };

    const avgScore =
        submissions.length > 0
            ? Math.round(
                submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) /
                submissions.length,
            )
            : 0;

    const passedCount = submissions.filter((s) => s.isPassed).length;
    const pendingCount = submissions.filter((s) => s.status === "submitted").length;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    const statItems = [
        {
            label: "Submissions",
            value: submissions.length,
            icon: Users,
            colorClass: "text-indigo-600",
            bgClass: "bg-indigo-50",
        },
        {
            label: "Average Score",
            value: `${avgScore}%`,
            icon: TrendingUp,
            colorClass: "text-amber-600",
            bgClass: "bg-amber-50",
        },
        {
            label: "Passed Students",
            value: passedCount,
            icon: Award,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-50",
        },
        {
            label: "Pending Review",
            value: pendingCount,
            icon: AlertTriangle,
            colorClass: "text-rose-600",
            bgClass: "bg-rose-50",
        },
    ];

    // Submission logic for merging student list
    const submissionMap = new Map<string, QuizAttempt>();
    submissions.forEach((sub) => {
        const existing = submissionMap.get(sub.studentId);
        if (!existing || (sub.submittedAt && (!existing.submittedAt || sub.submittedAt > existing.submittedAt))) {
            submissionMap.set(sub.studentId, sub);
        }
    });

    const allStudentsStatus = batchStudents.map((student) => ({
        studentId: student.id,
        fullName: student.fullName,
        registrationNumber: student.registrationNumber,
        hasAttempted: submissionMap.has(student.id),
        submission: submissionMap.get(student.id),
    }));

    submissions.forEach((sub) => {
        if (!allStudentsStatus.find((s) => s.studentId === sub.studentId)) {
            allStudentsStatus.push({
                studentId: sub.studentId,
                fullName: `Student ${sub.studentId.slice(-6).toUpperCase()}`,
                registrationNumber: "EXT-QUIZ",
                hasAttempted: true,
                submission: sub,
            });
        }
    });

    allStudentsStatus.sort((a, b) => {
        if (a.hasAttempted && !b.hasAttempted) return -1;
        if (!a.hasAttempted && b.hasAttempted) return 1;
        return a.fullName.localeCompare(b.fullName);
    });

    return (
        <div className="space-y-12 pb-12 overflow-hidden">
            <QuizHeader
                title={quiz.title}
                subtitle={quiz.description || "Quiz Details"}
                backHref={`/dashboard/teacher/classroom/${workspaceId}/quiz`}
                breadcrumbs={[
                    {
                        label: "Classroom",
                        href: `/dashboard/teacher/classroom/${workspaceId}`,
                    },
                    {
                        label: "Quizzes",
                        href: `/dashboard/teacher/classroom/${workspaceId}/quiz`,
                    },
                    { label: "Detail" },
                ]}
                icon={Trophy}
                badgeText={`Status: ${quiz.status.toUpperCase()}`}
                action={
                    <div className="flex items-center gap-3">
                        {quiz.status === "draft" && (
                            <>
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}/edit`
                                        )
                                    }
                                    variant="outline"
                                    className="h-14 px-8 rounded-2xl border-2 border-slate-100 bg-white font-black text-[11px] uppercase tracking-[0.2em] text-slate-600 hover:text-indigo-600 hover:border-indigo-500/30 transition-all"
                                >
                                    <Edit className="h-4 w-4 mr-3" />
                                    Modify
                                </Button>
                                <Button
                                    onClick={handlePublish}
                                    disabled={questions.length === 0}
                                    className="h-14 px-8 rounded-2xl bg-indigo-600 border-none hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95"
                                >
                                    <Play className="h-4 w-4 mr-3" />
                                    Publish
                                </Button>
                            </>
                        )}
                        {quiz.status === "published" && (
                            <Button
                                onClick={handleClose}
                                className="h-14 px-8 rounded-2xl bg-rose-600 border-none hover:bg-rose-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-rose-200 transition-all active:scale-95"
                            >
                                <Lock className="h-4 w-4 mr-3" />
                                Close Quiz
                            </Button>
                        )}
                    </div>
                }
            />

            <QuizStats stats={statItems} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="relative">
                    <TabsList className="bg-white border-2 border-slate-100 rounded-[1.5rem] p-1.5 h-auto shadow-xl shadow-slate-200/40 sticky top-4 z-10 w-full md:w-auto">
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl gap-3 px-6 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger
                            value="questions"
                            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl gap-3 px-6 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400"
                        >
                            <Layout className="h-4 w-4" />
                            Questions ({questions.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="submissions"
                            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl gap-3 px-6 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 relative"
                        >
                            <Users className="h-4 w-4" />
                            Submissions ({submissions.length})
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-black animate-bounce shadow-lg">
                                    {pendingCount}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="analytics" className="space-y-8 outline-none mt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <QuizSettingsCard quiz={quiz} />

                        {submissions.length > 0 && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Score Distribution</h3>
                                    <div className="h-px flex-1 bg-slate-100 mx-8" />
                                </div>

                                <div className="grid gap-4">
                                    {[
                                        { label: "Top Performers", min: 90, max: 100, color: "bg-indigo-600", text: "text-indigo-600" },
                                        { label: "High Pass", min: 70, max: 89, color: "bg-emerald-500", text: "text-emerald-500" },
                                        { label: "Average Range", min: 50, max: 69, color: "bg-amber-500", text: "text-amber-500" },
                                        { label: "Needs Improvement", min: 0, max: 49, color: "bg-rose-500", text: "text-rose-500" },
                                    ].map((range, rIdx) => {
                                        const count = submissions.filter(
                                            (s) => s.percentage !== null && s.percentage >= range.min && s.percentage <= range.max
                                        ).length;
                                        const percentage = submissions.length > 0 ? (count / submissions.length) * 100 : 0;
                                        return (
                                            <div key={`range-${rIdx}`} className="p-6 rounded-3xl bg-white border-2 border-slate-50 shadow-lg shadow-slate-100/50 flex flex-col md:flex-row md:items-center gap-6 group hover:border-indigo-100 transition-all duration-300">
                                                <div className="w-48 shrink-0">
                                                    <p className={cn("text-[10px] font-black uppercase tracking-widest", range.text)}>{range.label}</p>
                                                    <p className="text-xs font-bold text-slate-400 mt-1">{range.min}-{range.max}% range</p>
                                                </div>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={cn("h-full rounded-full shadow-sm", range.color)}
                                                    />
                                                </div>
                                                <div className="w-20 text-right">
                                                    <span className="text-xl font-black text-slate-900 leading-none">{count}</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Students</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-8 outline-none mt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Question List</h3>
                            <div className="h-px flex-1 bg-slate-100 mx-8" />
                            <Badge className="bg-indigo-50 text-indigo-700 border-none rounded-full px-4 font-black text-[9px] uppercase tracking-widest">
                                Total Points: {totalPoints}
                            </Badge>
                        </div>

                        {questions.length === 0 ? (
                            <div className="py-24 rounded-[3rem] bg-slate-50 border-4 border-dashed border-white flex flex-col items-center justify-center text-center">
                                <div className="h-20 w-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-200 mb-6">
                                    <FileText className="h-10 w-10" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2">No Questions</h4>
                                <p className="text-slate-500 font-bold max-w-xs px-6">No questions have been added to this quiz yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {questions.map((q, idx) => (
                                    <QuestionReviewCard key={`q-item-${idx}`} question={q} index={idx} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </TabsContent>

                <TabsContent value="submissions" className="space-y-8 outline-none mt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Student List</h3>
                            <div className="h-px flex-1 bg-slate-100 mx-8" />
                        </div>

                        <div className="grid gap-4">
                            {allStudentsStatus.map((s, idx) => (
                                <SubmissionRow
                                    key={`sub-row-${s.studentId}-${idx}`}
                                    student={{
                                        fullName: s.fullName,
                                        registrationNumber: s.registrationNumber,
                                        id: s.studentId,
                                    }}
                                    attempt={s.submission}
                                    hasAttempted={s.hasAttempted}
                                    onView={(id) => router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}/grade/${id}`)}
                                    index={idx}
                                />
                            ))}
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
