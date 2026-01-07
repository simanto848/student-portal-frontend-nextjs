"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Quiz, quizService } from "@/services/classroom/quiz.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import {
    Plus,
    Target,
    TrendingUp,
    CheckCircle,
    BookOpen,
    ClipboardList,
    AlertCircle,
    Trash2,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { QuizStats } from "./QuizStats";
import { QuizCard } from "./QuizCard";
import { QuizHeader } from "./QuizHeader";
import { motion, AnimatePresence } from "framer-motion";

interface QuizListClientProps {
    quizzes: Quiz[];
    workspaceId: string;
    refresh: () => void;
}

export function QuizListClient({
    quizzes,
    workspaceId,
    refresh,
}: QuizListClientProps) {
    const router = useRouter();
    const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handlePublish = async (quiz: Quiz) => {
        try {
            await quizService.publish(quiz.id);
            notifySuccess("Quiz published successfully");
            refresh();
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to publish quiz");
            notifyError(message);
        }
    };

    const handleClose = async (quiz: Quiz) => {
        try {
            await quizService.close(quiz.id);
            notifySuccess("Quiz closed successfully");
            refresh();
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to close quiz");
            notifyError(message);
        }
    };

    const handleDelete = async () => {
        if (!deleteQuiz) return;
        try {
            setIsDeleting(true);
            await quizService.delete(deleteQuiz.id);
            notifySuccess("Quiz deleted successfully");
            setDeleteQuiz(null);
            refresh();
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to delete quiz");
            notifyError(message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Stats calculations
    const totalQuizzes = quizzes.length;
    const publishedQuizzes = quizzes.filter((q) => q.status === "published").length;
    const totalSubmissions = quizzes.reduce((sum, q) => sum + (q.submittedCount || 0), 0);
    const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0);

    const statItems = [
        {
            label: "Published",
            value: publishedQuizzes,
            icon: CheckCircle,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-50",
        },
        {
            label: "Total Quizzes",
            value: totalQuizzes,
            icon: BookOpen,
            colorClass: "text-indigo-600",
            bgClass: "bg-indigo-50",
        },
        {
            label: "Total Questions",
            value: totalQuestions,
            icon: Target,
            colorClass: "text-amber-600",
            bgClass: "bg-amber-50",
        },
        {
            label: "Student Submissions",
            value: totalSubmissions,
            icon: TrendingUp,
            colorClass: "text-rose-600",
            bgClass: "bg-rose-50",
        },
    ];

    return (
        <div className="space-y-12 pb-12">
            <QuizHeader
                title="Quiz Management"
                subtitle="Create, manage, and track student quizzes and performance."
                backHref={`/dashboard/teacher/classroom/${workspaceId}`}
                breadcrumbs={[
                    {
                        label: "Classroom",
                        href: `/dashboard/teacher/classroom/${workspaceId}`,
                    },
                    { label: "Quizzes" },
                ]}
                action={
                    <Button
                        onClick={() =>
                            router.push(
                                `/dashboard/teacher/classroom/${workspaceId}/quiz/create`,
                            )
                        }
                        className="h-14 px-8 rounded-2xl bg-slate-900 border-none hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-3"
                    >
                        <Plus className="h-5 w-5" />
                        Create New Quiz
                    </Button>
                }
            />

            <QuizStats stats={statItems} />

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] italic">
                        Your Quizzes
                    </h2>
                    <div className="h-px flex-1 bg-slate-100 mx-8" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full shadow-sm">
                        {quizzes.length} Items Found
                    </span>
                </div>

                <AnimatePresence mode="popLayout">
                    {quizzes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-24 rounded-[3rem] bg-slate-50 border-4 border-dashed border-white shadow-2xl"
                        >
                            <div className="h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-xl text-slate-200">
                                <ClipboardList className="h-12 w-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">
                                No Quizzes Found
                            </h3>
                            <p className="text-slate-500 font-bold mb-8 text-center max-w-sm px-6">
                                You haven&apos;t created any quizzes yet. Start by creating your first quiz for student assessment.
                            </p>
                            <Button
                                onClick={() =>
                                    router.push(
                                        `/dashboard/teacher/classroom/${workspaceId}/quiz/create`,
                                    )
                                }
                                className="h-14 px-10 rounded-2xl bg-indigo-600 border-none hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Plus className="h-5 w-5" />
                                Create Your First Quiz
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {quizzes.map((quiz, index) => (
                                <QuizCard
                                    key={quiz.id || `quiz-${index}`}
                                    quiz={quiz}
                                    workspaceId={workspaceId}
                                    onPublish={handlePublish}
                                    onClose={handleClose}
                                    onDelete={setDeleteQuiz}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <AlertDialog open={!!deleteQuiz} onOpenChange={() => setDeleteQuiz(null)}>
                <AlertDialogContent className="max-w-md rounded-[2.5rem] border-slate-100 p-8 shadow-2xl">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border-2 border-rose-50">
                                <AlertCircle className="h-7 w-7" />
                            </div>
                            <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                Delete Quiz?
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-slate-500 font-bold leading-relaxed">
                            You are about to permanently delete{" "}
                            <span className="text-slate-900 italic font-black">
                                &quot;{deleteQuiz?.title}&quot;
                            </span>
                            . This action will irreversibly remove all questions, student attempts, and associated analytics.
                            <div className="mt-4 p-4 rounded-2xl bg-rose-50/50 border-2 border-rose-100 flex items-center gap-3">
                                <Trash2 className="h-5 w-5 text-rose-500 shrink-0" />
                                <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest leading-none">
                                    This action cannot be undone
                                </span>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-8">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-xl h-12 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200"
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </div>
                            ) : (
                                "Confirm Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
