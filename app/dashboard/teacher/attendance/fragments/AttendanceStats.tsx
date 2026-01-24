"use client";

import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, AlertCircle, Users } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AttendanceStatsProps {
    summary: {
        total: number;
        present: number;
        absent: number;
        late: number;
        excused: number;
    };
}

export function AttendanceStats({ summary }: AttendanceStatsProps) {
    const stats = [
        {
            label: "Present",
            value: summary.present,
            total: summary.total,
            icon: CheckCircle2,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
            progressColor: "bg-emerald-500",
            shadow: "shadow-emerald-500/20"
        },
        {
            label: "Absent",
            value: summary.absent,
            total: summary.total,
            icon: XCircle,
            color: "text-rose-400",
            bgColor: "bg-rose-500/10",
            progressColor: "bg-rose-500",
            shadow: "shadow-rose-500/20"
        },
        {
            label: "Late",
            value: summary.late,
            total: summary.total,
            icon: Clock,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            progressColor: "bg-amber-500",
            shadow: "shadow-amber-500/20"
        },
        {
            label: "Excused",
            value: summary.excused,
            total: summary.total,
            icon: AlertCircle,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
            progressColor: "bg-blue-500",
            shadow: "shadow-blue-500/20"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                    }}
                >
                    <GlassCard className={cn(
                        "relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300",
                        stat.shadow
                    )}>
                        <div className={`absolute top-0 right-0 h-24 w-24 rounded-full ${stat.progressColor} opacity-[0.05] blur-2xl -mr-10 -mt-10 transition-opacity group-hover:opacity-10`} />

                        <div className="p-5 relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {stat.value}
                                        <span className="text-[10px] text-slate-400 font-medium ml-1">/ {stat.total || 0}</span>
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-slate-400">Rate</span>
                                    <span className={stat.color}>
                                        {summary.total > 0 ? Math.round((stat.value / summary.total) * 100) : 0}%
                                    </span>
                                </div>
                                <Progress
                                    value={summary.total > 0 ? (stat.value / summary.total) * 100 : 0}
                                    className="h-1.5 bg-slate-100 dark:bg-slate-700/50"
                                    indicatorClassName={cn(stat.progressColor)}
                                />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    );
}
