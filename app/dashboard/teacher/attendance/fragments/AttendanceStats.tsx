"use client";

import { Card, CardContent } from "@/components/ui/card";
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
                    <Card className={cn(
                        "relative border-none bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:bg-slate-900 hover:-translate-y-1.5",
                        stat.shadow,
                        "shadow-2xl ring-1 ring-white/10"
                    )}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none`} />
                        <div className={`absolute top-0 right-0 h-32 w-32 rounded-full ${stat.progressColor} opacity-[0.05] blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-20`} />

                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.color} transition-all duration-500 group-hover:scale-110 ring-1 ring-white/5`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-white tracking-tighter">
                                        {stat.value}
                                        <span className="text-xs text-slate-500 font-bold ml-1.5 uppercase">of {stat.total || 0}</span>
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                                    <span className="text-slate-500">Rate</span>
                                    <span className={stat.color}>
                                        {summary.total > 0 ? Math.round((stat.value / summary.total) * 100) : 0}%
                                    </span>
                                </div>
                                <Progress
                                    value={summary.total > 0 ? (stat.value / summary.total) * 100 : 0}
                                    className="h-1 bg-white/5 rounded-full"
                                    indicatorClassName={cn(stat.progressColor, "shadow-[0_0_10px_rgba(255,255,255,0.1)]")}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
