"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface QuizStatItemProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: string;
    bgClass: string;
    delay?: number;
}

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (delay: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay,
            duration: 0.5,
            ease: "easeOut" as const,
        },
    }),
};

const iconVariants = {
    hover: {
        scale: 1.15,
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.4 },
    },
};

const valueVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { delay: 0.2, duration: 0.4, type: "spring" as const, stiffness: 200 },
    },
};

export function QuizStatItem({
    label,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    delay = 0,
}: QuizStatItemProps) {
    const theme = useDashboardTheme();

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={delay}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            <Card
                className={cn(
                    "border-slate-100 rounded-3xl bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300",
                    `hover:border-${theme.colors.accent.primary.replace('text-', '')}/20`
                )}
            >
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            variants={iconVariants}
                            whileHover="hover"
                            className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                                bgClass,
                                colorClass,
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Icon className="h-7 w-7 relative z-10" />
                        </motion.div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                                {label}
                            </p>
                            <motion.p
                                variants={valueVariants}
                                initial="hidden"
                                animate="visible"
                                className="text-2xl font-black text-slate-900 tracking-tight"
                            >
                                {value}
                            </motion.p>
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export function QuizStats({ stats }: QuizStatsProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {stats.map((stat, index) => (
                <QuizStatItem key={`${stat.label}-${index}`} {...stat} delay={index * 0.1} />
            ))}
        </motion.div>
    );
}
