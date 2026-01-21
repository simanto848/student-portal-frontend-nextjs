import { useState, useMemo } from "react";
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
    Sparkles,
    Search,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
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
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface QuizListClientProps {
    quizzes: Quiz[];
    workspaceId: string;
    refresh: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 },
    },
};

export function QuizListClient({
    quizzes,
    workspaceId,
    refresh,
}: QuizListClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredQuizzes = useMemo(() => {
        if (!searchQuery) return quizzes;
        const query = searchQuery.toLowerCase();
        return quizzes.filter(
            (q) =>
                q.title.toLowerCase().includes(query) ||
                q.description?.toLowerCase().includes(query)
        );
    }, [quizzes, searchQuery]);

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
            colorClass: theme.colors.accent.primary,
            bgClass: theme.colors.sidebar.active,
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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-12"
        >
            <PageHeader
                title="Quiz Management"
                subtitle="Create, manage, and track student quizzes and performance."
                icon={Sparkles}
                extraActions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refresh}
                            className={`hidden sm:flex items-center gap-2 border-slate-200 text-slate-600 hover:${theme.colors.accent.primary} hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/5 rounded-xl transition-all h-11`}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button
                            onClick={() =>
                                router.push(
                                    `/dashboard/teacher/classroom/${workspaceId}/quiz/create`,
                                )
                            }
                            className={`h-11 px-6 rounded-xl ${theme.colors.accent.secondary} border-none text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2`}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Quiz</span>
                        </Button>
                    </div>
                }
            />

            <QuizStats stats={statItems} />

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:max-w-md group">
                    <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:${theme.colors.accent.primary} transition-colors`} />
                    <Input
                        placeholder="Search quizzes..."
                        className={`pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Badge variant="secondary" className={`${theme.colors.accent.primary.replace('text-', 'bg-')}/10 ${theme.colors.accent.primary} hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/20 rounded-lg px-3 py-1 text-xs font-semibold`}>
                        {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'Result' : 'Results'}
                    </Badge>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {filteredQuizzes.length === 0 ? (
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col items-center justify-center py-24 rounded-[3rem] bg-gradient-to-br from-slate-50 via-white to-slate-50 border-4 border-dashed border-slate-100 shadow-inner"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className={`h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-xl border-2 border-slate-50 ${theme.colors.accent.primary}`}
                        >
                            <ClipboardList className="h-12 w-12" />
                        </motion.div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">
                            {searchQuery ? "No Matching Quizzes" : "No Quizzes Found"}
                        </h3>
                        <p className="text-slate-500 font-bold mb-8 text-center max-w-sm px-6">
                            {searchQuery
                                ? "We couldn't find any quizzes matching your search terms."
                                : "You haven't created any quizzes yet. Start by creating your first quiz for student assessment."}
                        </p>
                        {!searchQuery && (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/teacher/classroom/${workspaceId}/quiz/create`,
                                        )
                                    }
                                    className={`h-11 px-8 rounded-xl ${theme.colors.accent.secondary} border-none text-white font-bold text-xs uppercase tracking-wider shadow-2xl transition-all flex items-center gap-3`}
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Create Your First Quiz
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredQuizzes.map((quiz, index) => (
                            <motion.div key={quiz.id || `quiz-${index}`} variants={itemVariants}>
                                <QuizCard
                                    quiz={quiz}
                                    workspaceId={workspaceId}
                                    onPublish={handlePublish}
                                    onClose={handleClose}
                                    onDelete={setDeleteQuiz}
                                    index={index}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <AlertDialog open={!!deleteQuiz} onOpenChange={() => setDeleteQuiz(null)}>
                <AlertDialogContent className="max-w-md rounded-[2.5rem] border-slate-100 p-8 shadow-2xl bg-white/95 backdrop-blur-sm">
                    <AlertDialogHeader>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-4 mb-4"
                        >
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center text-rose-600 shadow-lg shadow-rose-100 border-2 border-rose-50">
                                <AlertCircle className="h-7 w-7" />
                            </div>
                            <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                Delete Quiz?
                            </AlertDialogTitle>
                        </motion.div>
                        <AlertDialogDescription className="text-slate-500 font-bold leading-relaxed">
                            You are about to permanently delete{" "}
                            <span className="text-slate-900 italic font-black">
                                &quot;{deleteQuiz?.title}&quot;
                            </span>
                            . This action will irreversibly remove all questions, student attempts, and associated analytics.
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-rose-100/50 border-2 border-rose-100 flex items-center gap-3"
                            >
                                <Trash2 className="h-5 w-5 text-rose-500 shrink-0" />
                                <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest leading-none">
                                    This action cannot be undone
                                </span>
                            </motion.div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-8">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="rounded-xl h-12 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-xl h-12 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200"
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
        </motion.div >
    );
}
