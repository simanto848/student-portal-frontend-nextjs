"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, MessageSquare, GraduationCap, ChevronRight } from "lucide-react";
import { Batch } from "@/services/academic/types";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { motion } from "framer-motion";

interface BatchCommunicationCardProps {
    batch: Batch;
    onOpenChat: (batch: Batch) => void;
    onManageCR: (batch: Batch) => void;
    enteringChat: boolean;
}

const formatBatchName = (batch: any) => {
    if (!batch) return "N/A";
    const shift = String(batch.shift || "").toLowerCase();
    const prefix = shift === "day" ? "D-" : shift === "evening" ? "E-" : "";
    return `${prefix}${batch.name}`;
};

export function BatchCommunicationCard({ batch, onOpenChat, onManageCR, enteringChat }: BatchCommunicationCardProps) {
    const theme = useDashboardTheme();
    const accentPrimary = theme.colors.accent.primary;
    const accentSecondary = theme.colors.accent.secondary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/5';

    return (
        <Card className={`group flex flex-col bg-white border-slate-200/60 shadow-sm hover:shadow-xl hover:${accentPrimary.replace('text-', 'border-')}/20 transition-all duration-300 overflow-hidden rounded-[2rem] p-0`}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className={`h-4 w-4 ${accentPrimary}`} />
                            <span className={`text-[10px] font-black ${accentPrimary} uppercase tracking-widest`}>
                                Counseling Batch
                            </span>
                        </div>
                        <CardTitle className={`text-lg font-black text-slate-800 leading-tight line-clamp-1 group-hover:${accentPrimary} transition-colors`}>
                            {formatBatchName(batch)}
                        </CardTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {(batch.programId as any)?.name || "Program N/A"}
                        </p>
                    </div>
                    <Badge variant="outline" className={`${accentBgSubtle} ${accentPrimary} border-indigo-100 font-bold px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap`}>
                        {batch.currentSemester}th Semester
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className={`h-8 w-8 rounded-xl ${accentBgSubtle} flex items-center justify-center`}>
                            <Users className={`h-4 w-4 ${accentPrimary}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Enrollment</p>
                            <p className="text-sm font-bold text-slate-900">{batch.currentStudents || 0} Students</p>
                        </div>
                    </div>

                    {batch.classRepresentativeId ? (
                        <div className={`flex items-center gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50`}>
                            <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <UserCog className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Class Representative</p>
                                <p className="text-sm font-bold text-emerald-700 truncate max-w-[140px]">
                                    {(batch.classRepresentativeId as any).fullName || "Assigned"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                            <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
                                <UserCog className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Representative</p>
                                <p className="text-sm font-bold text-amber-700 italic">Not Assigned</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        className="flex-1 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl h-12 hover:bg-slate-50"
                        onClick={() => onManageCR(batch)}
                    >
                        Assist CR
                    </Button>
                    <Button
                        className={`nav-btn-shine flex-[1.5] ${accentSecondary} hover:opacity-90 text-white shadow-lg shadow-indigo-600/10 rounded-2xl h-12 font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2`}
                        onClick={() => onOpenChat(batch)}
                        disabled={enteringChat}
                    >
                        {enteringChat ? "..." : (
                            <>
                                Open Chat
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
