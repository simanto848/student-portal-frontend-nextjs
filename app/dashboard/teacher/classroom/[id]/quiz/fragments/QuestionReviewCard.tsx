"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/services/classroom/quiz.service";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, Info } from "lucide-react";
import { motion } from "framer-motion";

interface QuestionReviewCardProps {
    question: Question;
    index: number;
}

export function QuestionReviewCard({ question, index }: QuestionReviewCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="border-2 border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/30 hover:border-indigo-500/20 transition-all duration-300 p-0">
                <CardHeader className="pb-4 bg-slate-50/50 px-8 py-6 border-b-2 border-slate-50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-5">
                            <div className="h-10 w-10 shrink-0 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-600/30">
                                {index + 1}
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-black text-slate-900 leading-snug">
                                    {question.text}
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-white text-slate-500 border-2 border-slate-100 rounded-lg font-black text-[9px] uppercase tracking-widest px-3">
                                        {question.type.replace("_", " ").toUpperCase()}
                                    </Badge>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-3 h-3" />
                                        {question.points} Points
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-600 border-none rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                            Level {index % 3 + 1}
                        </Badge>
                    </div>
                </CardHeader>

                {question.options && question.options.length > 0 && (
                    <CardContent className="px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((option, optIdx) => (
                                <div
                                    key={option.id || `opt-${optIdx}`}
                                    className={cn(
                                        "relative p-5 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center gap-4 overflow-hidden group/opt",
                                        option.isCorrect
                                            ? "bg-emerald-50/50 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                                            : "bg-slate-50 border-slate-100/50 hover:bg-slate-100/50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm transition-all duration-300",
                                            option.isCorrect
                                                ? "bg-emerald-500 text-white scale-110"
                                                : "bg-white text-slate-400 group-hover/opt:text-indigo-600 shadow-slate-200/50"
                                        )}
                                    >
                                        {String.fromCharCode(65 + optIdx)}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-sm font-bold transition-colors leading-relaxed",
                                            option.isCorrect ? "text-emerald-700" : "text-slate-600"
                                        )}
                                    >
                                        {option.text}
                                    </span>

                                    {option.isCorrect && (
                                        <div className="ml-auto bg-emerald-500 text-white rounded-lg p-1">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}

                {question.explanation && (
                    <div className="px-8 py-5 border-t-2 border-slate-50 bg-indigo-50/30 flex items-center gap-4">
                        <div className="h-8 w-8 rounded-xl bg-white border-2 border-indigo-100 flex items-center justify-center shrink-0">
                            <Info className="w-4 h-4 text-indigo-500" />
                        </div>
                        <p className="text-[11px] font-bold text-indigo-700/80 leading-relaxed italic">
                            <span className="font-black uppercase tracking-widest mr-2 text-[9px] opacity-60">Explanation:</span>
                            {question.explanation}
                        </p>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
