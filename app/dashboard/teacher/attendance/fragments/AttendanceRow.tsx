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

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group transition-all duration-300 hover:bg-slate-50/80 border-b border-slate-100/50"
        >
            <TableCell className="px-8 py-5">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-2.5 py-1 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {student.student?.registrationNumber || "N/A"}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-indigo-50 to-slate-50 flex items-center justify-center text-indigo-600 font-black text-xs ring-1 ring-slate-200 group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-indigo-200">
                        {student.student?.fullName?.charAt(0) || "?"}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                            {student.student?.fullName || "Unknown"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Record Valid</span>
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
                                state.status === config.id ? config.activeClass : config.inactiveClass
                            )}
                            onClick={() => onStatusChange(config.id as any)}
                            title={config.label}
                        >
                            <config.icon className="h-5 w-5" />
                        </Button>
                    ))}
                </div>
            </TableCell>
            <TableCell className="px-8">
                <Input
                    placeholder="Add operational remarks..."
                    value={state.remarks}
                    disabled={disabled}
                    onChange={(e) => onRemarksChange(e.target.value)}
                    className="h-11 bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 rounded-2xl transition-all group-hover:border-slate-200 md:w-full font-medium"
                />
            </TableCell>
        </motion.tr>
    );
}
