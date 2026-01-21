"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizAttempt } from "@/services/classroom/quiz.service";
import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    Clock,
    ChevronRight,
    AlertCircle,
    GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface SubmissionRowProps {
    student: {
        fullName: string;
        registrationNumber: string;
        id: string;
        profilePicture?: string;
    };
    attempt?: QuizAttempt;
    hasAttempted: boolean;
    onView: (attemptId: string) => void;
    index: number;
}

const rowVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.4,
            ease: "easeOut" as const,
        },
    }),
};

const progressVariants = {
    hidden: { width: 0 },
    visible: (percentage: number) => ({
        width: `${percentage}%`,
        transition: { delay: 0.3, duration: 1, ease: "easeOut" as const },
    }),
};

const avatarVariants = {
    hover: { scale: 1.1, transition: { type: "spring" as const, stiffness: 300 } },
};

export function SubmissionRow({
    student,
    attempt,
    hasAttempted,
    onView,
    index,
}: SubmissionRowProps) {
    const isGraded = attempt?.status === "graded";
    const isPending = attempt?.status === "submitted";
    const theme = useDashboardTheme();

    return (
        <motion.div
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
            <div className={cn(
                "group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/60 transition-all duration-300 shadow-sm",
                `hover:border-${theme.colors.accent.primary.replace('text-', '')}/30 hover:shadow-xl`
            )}>
                <div className="flex items-center gap-5">
                    <motion.div
                        variants={avatarVariants}
                        whileHover="hover"
                        className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-white overflow-hidden flex items-center justify-center text-slate-400 shadow-lg relative"
                    >
                        {student.profilePicture ? (
                            <img
                                src={getImageUrl(student.profilePicture)}
                                alt={student.fullName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <span className={`font-black text-xl ${theme.colors.accent.primary}`}>
                                {student.fullName.substring(0, 1).toUpperCase()}
                            </span>
                        )}
                    </motion.div>
                    <div>
                        <motion.h4
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                            className={`font-black text-slate-900 group-hover:${theme.colors.accent.primary} transition-colors text-lg`}
                        >
                            {student.fullName}
                        </motion.h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" />
                                {student.registrationNumber}
                            </span>
                            {hasAttempted && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {attempt?.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
                                </motion.span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    {hasAttempted ? (
                        <>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-3">
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring" as const }}
                                        className="text-lg font-black text-slate-900"
                                    >
                                        {attempt?.percentage}%
                                    </motion.span>
                                    <div className="w-28 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            variants={progressVariants}
                                            initial="hidden"
                                            animate="visible"
                                            custom={attempt?.percentage || 0}
                                            className={cn(
                                                "h-full rounded-full",
                                                (attempt?.percentage || 0) >= 80 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                                                    (attempt?.percentage || 0) >= 50 ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-rose-400 to-rose-500"
                                            )}
                                        />
                                    </div>
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Score Achieved
                                </p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Badge
                                    className={cn(
                                        "rounded-full px-4 py-1.5 border-none font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-md",
                                        isGraded ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700" :
                                            isPending ? "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700" : "bg-slate-50 text-slate-600"
                                    )}
                                >
                                    {isGraded ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                        <AlertCircle className="w-3.5 h-3.5" />
                                    )}
                                    {isGraded ? "Graded" : "Pending"}
                                </Badge>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={() => attempt && onView(attempt.id)}
                                    className={`h-12 px-6 rounded-xl border-none text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-2 ${theme.colors.accent.secondary} hover:opacity-90`}
                                >
                                    View Details
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-end gap-1 px-5 py-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
                        >
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                NOT ATTEMPTED
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
