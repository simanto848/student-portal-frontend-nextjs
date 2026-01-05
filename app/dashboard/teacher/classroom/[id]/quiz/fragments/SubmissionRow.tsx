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
    TrendingUp,
    User,
    GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";

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

export function SubmissionRow({
    student,
    attempt,
    hasAttempted,
    onView,
    index,
}: SubmissionRowProps) {
    const isGraded = attempt?.status === "graded";
    const isPending = attempt?.status === "submitted";

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[2rem] bg-white border-2 border-slate-50 hover:border-indigo-100/50 hover:bg-indigo-50/10 transition-all duration-300 shadow-lg shadow-slate-100/50">
                <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 border-2 border-white overflow-hidden flex items-center justify-center text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 group-hover:border-amber-200 transition-all duration-300 shadow-sm italic relative">
                        {student.profilePicture ? (
                            <img
                                src={getImageUrl(student.profilePicture)}
                                alt={student.fullName}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            student.fullName.substring(0, 1).toUpperCase()
                        )}
                        {!student.profilePicture && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition-all duration-300 font-black text-xl italic">
                                {student.fullName.substring(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {student.fullName}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" />
                                {student.registrationNumber}
                            </span>
                            {hasAttempted && (
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {attempt?.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    {hasAttempted ? (
                        <>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-900">
                                        {attempt?.percentage}%
                                    </span>
                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                (attempt?.percentage || 0) >= 80 ? "bg-emerald-500" :
                                                    (attempt?.percentage || 0) >= 50 ? "bg-amber-500" : "bg-rose-500"
                                            )}
                                            style={{ width: `${attempt?.percentage || 0}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Score Percentage
                                </p>
                            </div>

                            <Badge
                                className={cn(
                                    "rounded-full px-4 py-1.5 border-none font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm",
                                    isGraded ? "bg-emerald-50 text-emerald-700" :
                                        isPending ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-600"
                                )}
                            >
                                {isGraded ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                    <AlertCircle className="w-3 h-3" />
                                )}
                                {isGraded ? "Graded" : "Pending"}
                            </Badge>

                            <Button
                                onClick={() => attempt && onView(attempt.id)}
                                className="h-11 px-6 rounded-xl bg-slate-900 border-none hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-2"
                            >
                                View Details
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col items-end gap-1 px-4 py-2 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                NOT ATTEMPTED
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
