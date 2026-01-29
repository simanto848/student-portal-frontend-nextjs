"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Info, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "@/components/dashboard/communication/ChatInterface";
import { chatService } from "@/services/communication/chat.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface ChatClientProps {
    chatGroupId: string;
    chatGroupType: 'BatchChatGroup' | 'CourseChatGroup' | undefined;
}

export default function ChatClient({ chatGroupId, chatGroupType }: ChatClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [headerInfo, setHeaderInfo] = useState<{
        title: string,
        courseCode?: string,
        batchName?: string,
        batchShift?: string,
        batchSemester?: number,
        studentCount?: number,
        type: string
    } | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (chatGroupId) {
                try {
                    const details = await chatService.getChatGroupDetails(chatGroupId);
                    if (details.courseName) {
                        setHeaderInfo({
                            title: details.courseName,
                            courseCode: details.courseCode,
                            batchName: details.batchName,
                            batchShift: details.batchShift,
                            batchSemester: details.batchSemester,
                            studentCount: details.studentCount,
                            type: "Course Chat"
                        });
                    } else if (details.batchName) {
                        const shift = String(details.batchShift || "").toLowerCase();
                        const prefix = shift === 'day' ? 'D-' : shift === 'evening' ? 'E-' : '';
                        const formattedName = `${prefix}${details.batchName}`;

                        setHeaderInfo({
                            title: formattedName,
                            batchName: details.batchName,
                            batchShift: details.batchShift,
                            batchSemester: details.batchSemester,
                            studentCount: details.studentCount,
                            type: "Batch Chat"
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch chat details", error);
                }
            }
        };
        fetchDetails();
    }, [chatGroupId]);

    const accentPrimary = theme.colors.accent.primary;
    const accentSecondary = theme.colors.accent.secondary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/5';

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className={`h-11 w-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:${accentPrimary} hover:${accentBgSubtle} transition-all`}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </motion.div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            {headerInfo?.courseCode && (
                                <Badge variant="outline" className={`${accentBgSubtle} ${accentPrimary} border-indigo-100 dark:border-indigo-900 font-black px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider`}>
                                    {headerInfo.courseCode}
                                </Badge>
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {headerInfo?.type || "Chat Space"}
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            {headerInfo?.title || "Loading conversation..."}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-4 md:gap-6 ml-14 md:ml-0">
                    {/* Detailed Stats */}
                    {headerInfo && (
                        <div className="flex items-center gap-4 md:gap-6 pr-4 md:pr-6 border-r border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Batch details</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className={`p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 ${accentPrimary}`}>
                                        <Users className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {(() => {
                                            const shift = String(headerInfo.batchShift || "").toLowerCase();
                                            const prefix = shift === 'day' ? 'D-' : shift === 'evening' ? 'E-' : '';
                                            return `${prefix}${headerInfo.batchName || ''}`;
                                        })()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Semester</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="p-1 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                        <Clock className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        Sem {headerInfo.batchSemester || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="hidden sm:flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Audience</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                        <MessageSquare className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {headerInfo.studentCount || 0} Students
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 italic">Status</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-black text-slate-700 dark:text-slate-200">Live</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Info className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chat Interface Container */}
            <div className="flex-1 overflow-hidden relative bg-slate-50/20 dark:bg-slate-900/50">
                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white dark:from-slate-900 to-transparent z-10 opacity-60" />
                <ChatInterface
                    chatGroupId={chatGroupId}
                    chatGroupType={chatGroupType}
                />
                <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-10 opacity-60" />
            </div>
        </div>
    );
}
