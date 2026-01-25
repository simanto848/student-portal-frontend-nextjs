"use client";

import React from "react";
import {
    Bell,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { NotificationItem } from "@/services/notification/notification.service";
import { formatDistanceToNow as formatTime } from "date-fns";
import { cn } from "@/lib/utils";

interface TeacherNotificationProps {
    notifications: NotificationItem[];
    unreadCount: number;
    onMarkAllRead: () => void;
    isMounted: boolean;
}

export function TeacherNotification({
    notifications,
    unreadCount,
    onMarkAllRead,
    isMounted
}: TeacherNotificationProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-[#2dd4bf] ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm relative transition-all cursor-pointer group"
                >
                    <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] sm:w-80 p-0 mr-4 rounded-2xl border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 overflow-hidden" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-[#2dd4bf] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                {unreadCount} NEW
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-[10px] font-black text-[#2dd4bf] hover:text-[#26b3a2] uppercase tracking-widest transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map((n, idx) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "px-5 py-4 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-all cursor-pointer border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 relative group",
                                    !n.isRead && "bg-[#2dd4bf]/5 dark:bg-[#2dd4bf]/5"
                                )}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2dd4bf] opacity-60" />
                                )}
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className={cn(
                                        "text-sm tracking-tight line-clamp-1 flex-1",
                                        !n.isRead ? "font-black text-slate-950 dark:text-white" : "font-bold text-slate-600 dark:text-slate-400"
                                    )}>
                                        {n.title}
                                    </h4>
                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-3 uppercase tracking-tighter" suppressHydrationWarning>
                                        {n.createdAt ? formatTime(new Date(n.createdAt), { addSuffix: false }) : ""}
                                    </span>
                                </div>
                                <div
                                    className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium"
                                    dangerouslySetInnerHTML={{ __html: n.content }}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                            <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                                <Bell className="w-6 h-6 text-slate-200 dark:text-slate-700" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active signals</p>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => window.location.href = '/dashboard/teacher/notifications'}
                        className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em] hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/30 hover:text-[#2dd4bf] transition-all shadow-sm"
                    >
                        View All Notifications
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
