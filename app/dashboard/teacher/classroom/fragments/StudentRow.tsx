"use client";

import { Button } from "@/components/ui/button";
import { User, ArrowRight, Hash } from "lucide-react";
import { Student } from "@/services/user/student.service";
import { getImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";

interface StudentRowProps {
    student: Student;
    onViewDetails: (id: string) => void;
}

export function StudentRow({ student, onViewDetails }: StudentRowProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.01, x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-white border-2 border-slate-50 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-slate-200/30 transition-all group"
        >
            <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
                    {student.profile?.profilePicture ? (
                        <img
                            src={getImageUrl(student.profile.profilePicture)}
                            alt={student.fullName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-xl">
                            {student.fullName ? student.fullName.charAt(0).toUpperCase() : "S"}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-base font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                        {student.fullName || "Unknown Student"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Hash className="w-3 h-3 text-indigo-400" />
                        {student.registrationNumber || "N/A"}
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(student.id)}
                className="h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 group/btn transition-all active:scale-95"
            >
                View Profile
                <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
        </motion.div>
    );
}
