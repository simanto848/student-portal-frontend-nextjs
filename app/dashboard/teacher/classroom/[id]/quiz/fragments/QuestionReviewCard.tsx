"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/services/classroom/quiz.service";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface QuestionReviewCardProps {
    question: Question;
    index: number;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.08,
            duration: 0.5,
            ease: "easeOut" as const,
        },
    }),
};

const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: 0.3 + i * 0.1, duration: 0.4 },
    }),
};

const correctReveal = {
    initial: { scale: 0, rotate: -180 },
    animate: {
        scale: 1,
        rotate: 0,
        transition: { delay: 0.5, type: "spring" as const, stiffness: 200 },
    },
};

export function QuestionReviewCard({ question, index }: QuestionReviewCardProps) {
    const theme = useDashboardTheme();

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card className={cn(
                "border border-slate-200/60 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl shadow-sm transition-all duration-300 p-0",
                `hover:border-${theme.colors.accent.primary.replace('text-', '')}/20 hover:shadow-xl`
            )}>
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-white px-8 py-6 border-b-2 border-slate-50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-5">
                            <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                                className={`h-12 w-12 shrink-0 rounded-2xl ${theme.colors.accent.secondary} text-white flex items-center justify-center font-black text-lg shadow-lg shadow-${theme.colors.accent.primary.replace('text-', '')}/30`}
                            >
                                {index + 1}
                            </motion.div>
                            <div className="space-y-2">
                                <CardTitle className="text-lg font-black text-slate-900 leading-snug">
                                    {question.text}
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-white text-slate-500 border-2 border-slate-100 rounded-lg font-black text-[9px] uppercase tracking-widest px-3 shadow-sm">
                                        {question.type.replace("_", " ").toUpperCase()}
                                    </Badge>
                                    <span className={`text-[10px] font-black ${theme.colors.accent.primary} uppercase tracking-widest flex items-center gap-2`}>
                                        <Sparkles className="w-3 h-3" />
                                        {question.points} Points
                                    </span>
                                </div>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Badge className={`${theme.colors.sidebar.active} ${theme.colors.sidebar.activeText} border-none rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm`}>
                                Q{index + 1}
                            </Badge>
                        </motion.div>
                    </div>
                </CardHeader>

                {question.options && question.options.length > 0 && (
                    <CardContent className="px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((option, optIdx) => (
                                <motion.div
                                    key={option.id || `opt-${optIdx}`}
                                    variants={optionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={optIdx}
                                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                    className={cn(
                                        "relative p-5 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center gap-4 overflow-hidden group/opt cursor-default",
                                        option.isCorrect
                                            ? "bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                            : "bg-slate-50/50 border-slate-100/80 hover:bg-slate-100/70 hover:border-slate-200"
                                    )}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm transition-all duration-300",
                                            option.isCorrect
                                                ? "bg-emerald-500 text-white"
                                                : `bg-white text-slate-400 group-hover/opt:${theme.colors.accent.primary} shadow-slate-200/50`
                                        )}
                                    >
                                        {String.fromCharCode(65 + optIdx)}
                                    </motion.div>
                                    <span
                                        className={cn(
                                            "text-sm font-bold transition-colors leading-relaxed flex-1",
                                            option.isCorrect ? "text-emerald-700" : "text-slate-600"
                                        )}
                                    >
                                        {option.text}
                                    </span>

                                    {option.isCorrect && (
                                        <motion.div
                                            {...correctReveal}
                                            className="bg-emerald-500 text-white rounded-xl p-2 shadow-lg shadow-emerald-500/30"
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                )}

                {question.explanation && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className={`px-8 py-5 border-t-2 border-slate-50 ${theme.colors.sidebar.activeBgSubtle || 'bg-slate-50/50'} flex items-center gap-4`}
                    >
                        <div className={`h-10 w-10 rounded-xl bg-white border-2 border-${theme.colors.accent.primary.replace('text-', '')}/20 flex items-center justify-center shrink-0 shadow-sm`}>
                            <Info className={`w-5 h-5 ${theme.colors.accent.primary}`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Explanation</p>
                            <p className={`text-sm font-bold text-slate-600 leading-relaxed`}>
                                {question.explanation}
                            </p>
                        </div>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
}
