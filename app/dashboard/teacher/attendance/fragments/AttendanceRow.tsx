"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { Enrollment } from "@/services/enrollment/enrollment.service";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AttendanceRowProps {
    student: Enrollment;
    state: { status: "present" | "absent" | "late" | "excused"; remarks: string };
    onStatusChange: (status: "present" | "absent" | "late" | "excused") => void;
    onRemarksChange: (remarks: string) => void;
    disabled?: boolean;
    index?: number;
}

export function AttendanceRow({
    student,
    state,
    onStatusChange,
    onRemarksChange,
    disabled,
    index = 0
}: AttendanceRowProps) {
    const statusConfig = [
        {
            id: "present",
            label: "Present",
            icon: Check,
            activeClass: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10",
            inactiveClass: "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 border-emerald-500/20",
        },
        {
            id: "absent",
            label: "Absent",
            icon: X,
            activeClass: "bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-500/20 ring-4 ring-rose-500/10",
            inactiveClass: "text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 border-rose-500/20",
        },
        {
            id: "late",
            label: "Late",
            icon: Clock,
            activeClass: "bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/10",
            inactiveClass: "text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 border-amber-500/20",
        },
        {
            id: "excused",
            label: "Excused",
            icon: AlertCircle,
            activeClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10",
            inactiveClass: "text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 border-blue-500/20",
        },
    ];

    const isError = state.status === 'excused' && !state.remarks?.trim();

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "group transition-colors duration-200 border-b last:border-0",
                isError ? "bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-900/10 dark:hover:bg-rose-900/20 border-rose-200 dark:border-rose-800" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800"
            )}
        >
            <TableCell className="px-6 py-4">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {student.student?.registrationNumber || "N/A"}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                        {student.student?.fullName?.charAt(0) || "?"}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-semibold text-slate-800 dark:text-white truncate max-w-[180px]">
                            {student.student?.fullName || "Unknown"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Valid Record</span>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex justify-center gap-3">
                    {statusConfig.map((config) => (
                        <Button
                            key={config.id}
                            size="sm"
                            variant="outline"
                            disabled={disabled}
                            className={cn(
                                "h-10 w-10 p-0 rounded-2xl transition-all duration-500 border-2",
                                state.status === config.id ? config.activeClass : config.inactiveClass,
                                isError && state.status === 'excused' && "ring-2 ring-rose-500 ring-offset-2"
                            )}
                            onClick={() => onStatusChange(config.id as any)}
                            title={config.label}
                        >
                            <config.icon className="h-5 w-5" />
                        </Button>
                    ))}
                </div>
            </TableCell>
            <TableCell className="pr-6">
                <div className="relative">
                    <Input
                        placeholder={isError ? "Remarks required for Excused..." : "Remarks..."}
                        value={state.remarks}
                        disabled={disabled}
                        onChange={(e) => onRemarksChange(e.target.value)}
                        className={cn(
                            "h-9 bg-transparent focus:bg-white dark:focus:bg-slate-800 rounded-lg text-sm transition-all",
                            isError
                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 placeholder:text-rose-400"
                                : "border-slate-200 dark:border-slate-700"
                        )}
                    />
                    {isError && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none animate-pulse">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    )}
                </div>
            </TableCell>
        </motion.tr>
    );
}
