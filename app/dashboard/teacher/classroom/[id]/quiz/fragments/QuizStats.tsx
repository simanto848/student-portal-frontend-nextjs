"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface QuizStatItemProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: string;
    bgClass: string;
    delay?: number;
}

export function QuizStatItem({
    label,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    delay = 0,
}: QuizStatItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card
                className={cn(
                    "border-2 border-slate-100 rounded-[2rem] bg-white shadow-xl shadow-slate-200/40 overflow-hidden group hover:border-indigo-500/20 transition-all duration-300",
                )}
            >
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                                bgClass,
                                colorClass,
                            )}
                        >
                            <Icon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">
                                {label}
                            </p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                                {value}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

interface QuizStatsProps {
    stats: {
        label: string;
        value: string | number;
        icon: LucideIcon;
        colorClass: string;
        bgClass: string;
    }[];
}

export function QuizStats({ stats }: QuizStatsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <QuizStatItem key={`${stat.label}-${index}`} {...stat} delay={index * 0.1} />
            ))}
        </div>
    );
}
