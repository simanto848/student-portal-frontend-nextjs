"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, MessageSquare, Clock } from "lucide-react";
import { StreamItem } from "@/services/classroom/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface StreamItemCardProps {
    item: StreamItem;
}

export function StreamItemCard({ item }: StreamItemCardProps) {
    const theme = useDashboardTheme();
    const isAssignment = item.type === "assignment";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={`group border border-slate-200 bg-white hover:${theme.colors.accent.primary.replace('text-', 'border-')}/30 hover:shadow-xl hover:shadow-slate-200/40 transition-all rounded-3xl overflow-hidden`}>
                <CardContent className="p-6">
                    <div className="flex gap-5">
                        <div className={`h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${isAssignment
                            ? `${theme.colors.accent.primary.replace('text-', 'bg-')}/10 ${theme.colors.accent.primary} border border-${theme.colors.accent.primary.replace('text-', '')}/20`
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}>
                            {isAssignment ? (
                                <FileText className="h-6 w-6" />
                            ) : (
                                <MessageSquare className="h-6 w-6" />
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-black text-slate-800 tracking-tight">
                                    <span className={theme.colors.accent.primary}>{item.actorName}</span>
                                    <span className="text-slate-400 font-bold mx-2">
                                        {item.type === 'assignment' ? 'shared a new assignment with the class' : 'shared new learning materials'}
                                    </span>
                                </p>
                                <div className="flex items-center gap-1.5 text-sm font-black text-slate-400 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                                </div>
                            </div>

                            <h4 className="text-lg font-black text-slate-900 leading-tight">
                                {item.title || item.entityTitle}
                            </h4>

                            {(item.assignment?.description || item.material?.content) && (
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 line-clamp-3">
                                    {item.assignment?.description || item.material?.content}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
