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
    Edit,
    Play,
    Lock,
    Trophy,
    Award,
    TrendingUp,
    AlertTriangle,
    FileText,
    BarChart3,
    Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { QuizStats } from "./QuizStats";
import { QuizSettingsCard } from "./QuizSettingsCard";
import { QuestionReviewCard } from "./QuestionReviewCard";
import { SubmissionRow } from "./SubmissionRow";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface QuizDetailClientProps {
    quiz: Quiz;
    questions: Question[];
    submissions: QuizAttempt[];
    batchStudents: Student[];
    workspaceId: string;
    refresh: () => void;
}

const tabContentVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 },
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

export function QuizDetailClient({
    quiz,
    questions,
    submissions,
    batchStudents,
    workspaceId,
    refresh,
}: QuizDetailClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
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
            colorClass: theme.colors.accent.primary,
            bgClass: theme.colors.sidebar.active,
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
        profilePicture: student.profile?.profilePicture,
        hasAttempted: submissionMap.has(student.id),
        submission: submissionMap.get(student.id),
    }));

    submissions.forEach((sub) => {
        if (!allStudentsStatus.find((s) => s.studentId === sub.studentId)) {
            allStudentsStatus.push({
                studentId: sub.studentId,
                fullName: `Student ${sub.studentId.slice(-6).toUpperCase()}`,
                registrationNumber: "EXT-QUIZ",
                profilePicture: undefined,
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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 pb-12 overflow-hidden"
        >
            <PageHeader
                title={quiz.title}
                subtitle={quiz.description || "Quiz Details"}
                onBack={() => router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz`)}
                icon={Trophy}
                extraActions={
                    <div className="flex items-center gap-3">
                        <Badge className={`${theme.colors.sidebar.active} ${theme.colors.sidebar.activeText} border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${theme.colors.sidebar.activeText}`}>
                                Status: {quiz.status.toUpperCase()}
                            </span>
                        </Badge>
                        {quiz.status === "draft" && (
                            <>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}/edit`
                                            )
                                        }
                                        variant="outline"
                                        className={`h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:${theme.colors.accent.primary} hover:bg-slate-50 transition-all`}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modify
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        onClick={handlePublish}
                                        disabled={questions.length === 0}
                                        className={`h-11 px-6 rounded-xl ${theme.colors.accent.secondary} border-none text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all`}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Publish
                                    </Button>
                                </motion.div>
                            </>
                        )}
                        {quiz.status === "published" && (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={handleClose}
                                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 border-none text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-200 transition-all"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Close Quiz
                                </Button>
                            </motion.div>
                        )}
                    </div>
                }
            />

            <QuizStats stats={statItems} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                >
                    <TabsList className="bg-white/90 backdrop-blur-sm border-2 border-slate-100 rounded-[1.5rem] p-1.5 h-auto shadow-xl shadow-slate-200/40 sticky top-4 z-10 w-full md:w-auto">
                        {[
                            { value: "analytics", icon: BarChart3, label: "Analytics" },
                            { value: "questions", icon: Layout, label: `Questions (${questions.length})` },
                            { value: "submissions", icon: Users, label: `Submissions (${submissions.length})`, badge: pendingCount },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={cn(
                                    "rounded-xl gap-3 px-6 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 relative transition-all duration-300",
                                    `data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg`
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {tab.badge && tab.badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-black shadow-lg"
                                    >
                                        {tab.badge}
                                    </motion.span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </motion.div>

                <AnimatePresence mode="wait">
                    <TabsContent value="analytics" className="space-y-8 outline-none mt-0">
                        <motion.div
                            key="analytics"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-8"
                        >
                            <QuizSettingsCard quiz={quiz} />

                            {submissions.length > 0 && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Score Distribution</h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent mx-8" />
                                    </div>

                                    <div className="grid gap-4">
                                        {[
                                            { label: "Top Performers", min: 90, max: 100, color: theme.colors.accent.secondary, text: theme.colors.accent.primary },
                                            { label: "High Pass", min: 70, max: 89, color: "bg-emerald-500", text: "text-emerald-500" },
                                            { label: "Average Range", min: 50, max: 69, color: "bg-amber-500", text: "text-amber-500" },
                                            { label: "Needs Improvement", min: 0, max: 49, color: "bg-rose-500", text: "text-rose-500" },
                                        ].map((range, rIdx) => {
                                            const count = submissions.filter(
                                                (s) => s.percentage !== null && s.percentage >= range.min && s.percentage <= range.max
                                            ).length;
                                            const percentage = submissions.length > 0 ? (count / submissions.length) * 100 : 0;
                                            return (
                                                <motion.div
                                                    key={`range-${rIdx}`}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: rIdx * 0.1 }}
                                                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                                    className={`p-6 rounded-3xl bg-white/90 backdrop-blur-sm border-2 border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col md:flex-row md:items-center gap-6 group hover:border-${theme.colors.accent.primary.replace('text-', '')}/20 transition-all duration-300`}
                                                >
                                                    <div className="w-48 shrink-0">
                                                        <p className={cn("text-[10px] font-black uppercase tracking-widest", range.text)}>{range.label}</p>
                                                        <p className="text-xs font-bold text-slate-400 mt-1">{range.min}-{range.max}% range</p>
                                                    </div>
                                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ delay: 0.5 + rIdx * 0.1, duration: 0.8, ease: "easeOut" as const }}
                                                            className={cn("h-full rounded-full shadow-sm", range.color)}
                                                        />
                                                    </div>
                                                    <div className="w-24 text-right">
                                                        <motion.span
                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.8 + rIdx * 0.1 }}
                                                            className="text-xl font-black text-slate-900 leading-none"
                                                        >
                                                            {count}
                                                        </motion.span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Students</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>

                <TabsContent value="questions" className="space-y-8 outline-none mt-0">
                    <motion.div
                        key="questions"
                        variants={tabContentVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Question List</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent mx-8" />
                            <Badge className={`${theme.colors.sidebar.active} ${theme.colors.accent.primary} border-none rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest shadow-sm`}>
                                Total Points: {totalPoints}
                            </Badge>
                        </div>

                        {questions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-24 rounded-[3rem] bg-gradient-to-br from-slate-50 to-white border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center shadow-inner"
                            >
                                <div className="h-20 w-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-200 mb-6">
                                    <FileText className="h-10 w-10" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2">No Questions</h4>
                                <p className="text-slate-500 font-bold max-w-xs px-6">No questions have been added to this quiz yet.</p>
                            </motion.div>
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
                        key="submissions"
                        variants={tabContentVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Student List</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent mx-8" />
                        </div>

                        <div className="grid gap-4">
                            {allStudentsStatus.map((s, idx) => (
                                <SubmissionRow
                                    key={`sub-row-${s.studentId}-${idx}`}
                                    student={{
                                        fullName: s.fullName,
                                        registrationNumber: s.registrationNumber,
                                        id: s.studentId,
                                        profilePicture: s.profilePicture,
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
        </motion.div>
    );
}
