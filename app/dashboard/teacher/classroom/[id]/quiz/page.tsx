"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { quizService, Quiz } from "@/services/classroom/quiz.service";
import { toast } from "sonner";
import {
    Plus,
    Clock,
    Users,
    FileCheck,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Play,
    Lock,
    Loader2,
    ClipboardList,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Home,
    ChevronRight,
    Calendar,
    Target,
    TrendingUp,
    BookOpen,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusConfig = {
    draft: {
        label: "Draft",
        color: "bg-slate-500",
        textColor: "text-slate-700",
        bgLight: "bg-slate-100",
        borderColor: "border-slate-200",
        icon: Edit
    },
    published: {
        label: "Published",
        color: "bg-emerald-500",
        textColor: "text-emerald-700",
        bgLight: "bg-emerald-50",
        borderColor: "border-emerald-200",
        icon: CheckCircle
    },
    closed: {
        label: "Closed",
        color: "bg-rose-500",
        textColor: "text-rose-700",
        bgLight: "bg-rose-50",
        borderColor: "border-rose-200",
        icon: Lock
    },
};

export default function QuizListPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.id as string;

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, [workspaceId]);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const data = await quizService.listByWorkspace(workspaceId);
            setQuizzes(data);
        } catch (error: any) {
            toast.error(error?.message || "Failed to load quizzes");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async (quiz: Quiz) => {
        try {
            await quizService.publish(quiz.id);
            toast.success("Quiz published successfully");
            fetchQuizzes();
        } catch (error: any) {
            toast.error(error?.message || "Failed to publish quiz");
        }
    };

    const handleClose = async (quiz: Quiz) => {
        try {
            await quizService.close(quiz.id);
            toast.success("Quiz closed successfully");
            fetchQuizzes();
        } catch (error: any) {
            toast.error(error?.message || "Failed to close quiz");
        }
    };

    const handleDelete = async () => {
        if (!deleteQuiz) return;
        try {
            setIsDeleting(true);
            await quizService.delete(deleteQuiz.id);
            toast.success("Quiz deleted successfully");
            setDeleteQuiz(null);
            fetchQuizzes();
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete quiz");
        } finally {
            setIsDeleting(false);
        }
    };

    // Stats calculations
    const totalQuizzes = quizzes.length;
    const publishedQuizzes = quizzes.filter(q => q.status === "published").length;
    const totalSubmissions = quizzes.reduce((sum, q) => sum + (q.submittedCount || 0), 0);
    const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#588157] mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading quizzes...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        href="/dashboard/teacher"
                        className="flex items-center gap-1 hover:text-[#588157] transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link
                        href={`/dashboard/teacher/classroom/${workspaceId}`}
                        className="hover:text-[#588157] transition-colors"
                    >
                        Classroom
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-[#344e41] font-medium">Quizzes</span>
                </nav>

                {/* Header with Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push(`/dashboard/teacher/classroom/${workspaceId}`)}
                            className="shrink-0 hover:bg-[#588157]/10 hover:border-[#588157]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#344e41] to-[#588157] bg-clip-text text-transparent">
                                Quizzes & Exams
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create, manage, and track student assessments
                            </p>
                        </div>
                    </div>
                    <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/create`}>
                        <Button className="bg-gradient-to-r from-[#588157] to-[#3a5a40] hover:from-[#3a5a40] hover:to-[#344e41] text-white gap-2 shadow-lg hover:shadow-xl transition-all">
                            <Plus className="h-4 w-4" />
                            Create New Quiz
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600/80 font-medium">Total Quizzes</p>
                                    <p className="text-2xl font-bold text-blue-700">{totalQuizzes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-600/80 font-medium">Published</p>
                                    <p className="text-2xl font-bold text-emerald-700">{publishedQuizzes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                    <Target className="h-6 w-6 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-violet-600/80 font-medium">Questions</p>
                                    <p className="text-2xl font-bold text-violet-700">{totalQuestions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-600/80 font-medium">Submissions</p>
                                    <p className="text-2xl font-bold text-amber-700">{totalSubmissions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quiz Grid */}
                {quizzes.length === 0 ? (
                    <Card className="border-dashed border-2 bg-gradient-to-br from-gray-50 to-white">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="h-20 w-20 rounded-full bg-[#588157]/10 flex items-center justify-center mb-6">
                                <ClipboardList className="h-10 w-10 text-[#588157]" />
                            </div>
                            <h3 className="text-xl font-semibold text-[#344e41] mb-2">No quizzes yet</h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Create your first quiz to start assessing your students&apos; knowledge and track their progress.
                            </p>
                            <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/create`}>
                                <Button className="bg-gradient-to-r from-[#588157] to-[#3a5a40] hover:from-[#3a5a40] hover:to-[#344e41] text-white gap-2 shadow-lg">
                                    <Plus className="h-4 w-4" />
                                    Create Your First Quiz
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {quizzes.map((quiz, index) => {
                            const status = statusConfig[quiz.status];
                            const StatusIcon = status.icon;

                            return (
                                <Card
                                    key={quiz.id || `quiz-${index}`}
                                    className={cn(
                                        "group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                        "border-l-4",
                                        status.color.replace("bg-", "border-l-")
                                    )}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            "text-xs font-medium",
                                                            status.bgLight,
                                                            status.textColor
                                                        )}
                                                    >
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {status.label}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg text-[#344e41] line-clamp-1 group-hover:text-[#588157] transition-colors">
                                                    {quiz.title}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2 text-sm">
                                                    {quiz.description || "No description provided"}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {quiz.status === "draft" && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}/edit`)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Quiz
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handlePublish(quiz)}
                                                                className="text-emerald-600"
                                                            >
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Publish Quiz
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {quiz.status === "published" && (
                                                        <DropdownMenuItem onClick={() => handleClose(quiz)}>
                                                            <Lock className="h-4 w-4 mr-2" />
                                                            Close Quiz
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        onClick={() => setDeleteQuiz(quiz)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Quiz
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <Clock className="h-4 w-4 text-gray-500 mb-1" />
                                                <span className="text-sm font-semibold text-[#344e41]">{quiz.duration}</span>
                                                <span className="text-xs text-muted-foreground">minutes</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <FileCheck className="h-4 w-4 text-gray-500 mb-1" />
                                                <span className="text-sm font-semibold text-[#344e41]">{quiz.questionCount}</span>
                                                <span className="text-xs text-muted-foreground">questions</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <Users className="h-4 w-4 text-gray-500 mb-1" />
                                                <span className="text-sm font-semibold text-[#344e41]">{quiz.submittedCount || 0}</span>
                                                <span className="text-xs text-muted-foreground">submissions</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-3 border-t bg-gray-50/50">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {quiz.startAt
                                                        ? `Starts ${new Date(quiz.startAt).toLocaleDateString()}`
                                                        : "No schedule set"
                                                    }
                                                </span>
                                            </div>
                                            <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[#588157] hover:text-[#3a5a40] hover:bg-[#588157]/10 gap-1"
                                                >
                                                    View
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Delete Dialog */}
                <AlertDialog open={!!deleteQuiz} onOpenChange={() => setDeleteQuiz(null)}>
                    <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <AlertDialogTitle className="text-xl">Delete Quiz?</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription asChild>
                                <div className="pt-3 text-sm text-muted-foreground">
                                    <span>
                                        Are you sure you want to delete <span className="font-semibold text-[#344e41]">&quot;{deleteQuiz?.title}&quot;</span>?
                                        This will permanently remove:
                                    </span>
                                    <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                                        <li>All {deleteQuiz?.questionCount || 0} questions</li>
                                        <li>All student attempts and grades</li>
                                        <li>All submission data</li>
                                    </ul>
                                    <p className="mt-3 font-medium text-red-600">This action cannot be undone.</p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel disabled={isDeleting} className="flex-1">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Quiz
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
