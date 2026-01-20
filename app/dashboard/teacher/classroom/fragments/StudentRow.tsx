"use client";

import { Button } from "@/components/ui/button";
import { User, ArrowRight, Hash } from "lucide-react";
import { Student } from "@/services/user/student.service";
import { getImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface StudentRowProps {
    student: Student;
    onViewDetails: (id: string) => void;
}

export function StudentRow({ student, onViewDetails }: StudentRowProps) {
    const theme = useDashboardTheme();

    return (
        <motion.div
            whileHover={{ scale: 1.01, x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`flex items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 hover:${theme.colors.accent.primary.replace('text-', 'border-')}/30 hover:shadow-lg hover:shadow-slate-200/30 transition-all group`}
        >
            <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl ${theme.colors.accent.primary.replace('text-', 'bg-')}/5 border border-${theme.colors.accent.primary.replace('text-', '')}/20 shadow-sm overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500`}>
                    {student.profile?.profilePicture ? (
                        <img
                            src={getImageUrl(student.profile.profilePicture)}
                            alt={student.fullName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className={`h-full w-full flex items-center justify-center ${theme.colors.accent.primary.replace('text-', 'bg-')}/5 ${theme.colors.accent.primary} font-black text-xl`}>
                            {student.fullName ? student.fullName.charAt(0).toUpperCase() : "S"}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className={`text-base font-black text-slate-900 tracking-tight leading-none group-hover:${theme.colors.accent.primary} transition-colors`}>
                        {student.fullName || "Unknown Student"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Hash className={`w-3 h-3 ${theme.colors.accent.primary}`} />
                        {student.registrationNumber || "N/A"}
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(student.id)}
                className={`h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:${theme.colors.accent.primary} hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/10 group/btn transition-all active:scale-95`}
            >
                View Profile
                <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
        </motion.div>
    );
}
