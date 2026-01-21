"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Quiz } from "@/services/classroom/quiz.service";
import { cn } from "@/lib/utils";
import {
    Clock,
    FileCheck,
    Users,
    Calendar,
    ChevronRight,
    MoreVertical,
    Eye,
    Edit,
    Play,
    Lock,
    Trash2,
    Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface QuizCardProps {
    quiz: Quiz;
    workspaceId: string;
    onPublish: (quiz: Quiz) => void;
    onClose: (quiz: Quiz) => void;
    onDelete: (quiz: Quiz) => void;
    index: number;
}

const statusConfig = {
    draft: {
        label: "Draft",
        color: "bg-slate-500",
        textColor: "text-slate-700",
        bgLight: "bg-slate-100",
        icon: Edit,
    },
    published: {
        label: "Published",
        color: "bg-emerald-500",
        textColor: "text-emerald-700",
        bgLight: "bg-emerald-50",
        icon: Play,
    },
    closed: {
        label: "Closed",
        color: "bg-rose-500",
        textColor: "text-rose-700",
        bgLight: "bg-rose-50",
        icon: Lock,
    },
};

export function QuizCard({
    quiz,
    workspaceId,
    onPublish,
    onClose,
    onDelete,
    index,
}: QuizCardProps) {
    const status = statusConfig[quiz.status];
    const StatusIcon = status.icon;
    const theme = useDashboardTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group h-full"
        >
            <Card className={cn(
                "border-slate-200/60 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col",
                `hover:border-${theme.colors.accent.primary.replace('text-', '')}/20`
            )}>
                <CardHeader className="pb-4 space-y-4">
                    <div className="flex items-start justify-between">
                        <Badge
                            variant="outline"
                            className={cn(
                                "rounded-lg px-2.5 py-0.5 border-none font-bold text-xs uppercase tracking-tight flex items-center gap-2",
                                status.bgLight,
                                status.textColor,
                            )}
                        >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl">
                                <DropdownMenuItem
                                    className={`rounded-xl font-bold text-slate-600 gap-3 p-3 focus:${theme.colors.sidebar.active} focus:${theme.colors.sidebar.activeText} cursor-pointer`}
                                    asChild
                                >
                                    <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`}>
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Link>
                                </DropdownMenuItem>

                                {quiz.status === "draft" && (
                                    <>
                                        <DropdownMenuItem
                                            className={`rounded-xl font-bold text-slate-600 gap-3 p-3 focus:${theme.colors.sidebar.active} focus:${theme.colors.sidebar.activeText} cursor-pointer`}
                                            asChild
                                        >
                                            <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                                Edit Quiz
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="rounded-xl font-bold text-emerald-600 gap-3 p-3 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
                                            onClick={() => onPublish(quiz)}
                                        >
                                            <Play className="h-4 w-4" />
                                            Publish Quiz
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {quiz.status === "published" && (
                                    <DropdownMenuItem
                                        className="rounded-xl font-bold text-rose-600 gap-3 p-3 focus:bg-rose-50 focus:text-rose-700 cursor-pointer"
                                        onClick={() => onClose(quiz)}
                                    >
                                        <Lock className="h-4 w-4" />
                                        Close Quiz
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator className="my-2 bg-slate-100" />

                                <DropdownMenuItem
                                    className="rounded-xl font-bold text-red-600 gap-3 p-3 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                    onClick={() => onDelete(quiz)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Quiz
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div>
                        <CardTitle className={`text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:${theme.colors.accent.primary} transition-colors line-clamp-2`}>
                            {quiz.title}
                        </CardTitle>
                        {quiz.description && (
                            <p className="text-slate-500 font-medium text-xs mt-2 line-clamp-2 leading-relaxed">
                                {quiz.description}
                            </p>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="pb-6 mt-auto">
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 group-hover:bg-white transition-colors">
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors shadow-sm border border-slate-100">
                                <Clock className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 uppercase">
                                {quiz.duration}m
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 border-x border-slate-200/50">
                            <div className={`h-8 w-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:${theme.colors.accent.primary} transition-colors shadow-sm border border-slate-100`}>
                                <FileCheck className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 uppercase">
                                {quiz.questionCount}q
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shadow-sm border border-slate-100">
                                <Users className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 uppercase">
                                {quiz.submittedCount || 0}
                            </span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                            {quiz.startAt
                                ? new Date(quiz.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                : "PENDING"}
                        </span>
                    </div>

                    <Link href={`/dashboard/teacher/classroom/${workspaceId}/quiz/${quiz.id}`}>
                        <Button
                            size="sm"
                            className={`rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-wider ${theme.colors.accent.secondary} text-white hover:opacity-90 transition-all shadow-md shadow-teal-500/10 gap-2`}
                        >
                            Details
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
