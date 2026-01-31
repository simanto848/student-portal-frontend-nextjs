"use client";

import React, { useState } from "react";
import {
    Bell,
    X,
    MailOpen,
    Zap
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "@/services/notification/notification.service";
import { formatDistanceToNow as formatTime } from "date-fns";
import { cn } from "@/lib/utils";

interface TeacherNotificationProps {
    notifications: NotificationItem[];
    unreadCount: number;
    onMarkAllRead: () => void;
    onMarkRead: (id: string) => void;
    isMounted: boolean;
}

export function TeacherNotification({
    notifications,
    unreadCount,
    onMarkAllRead,
    onMarkRead,
    isMounted
}: TeacherNotificationProps) {
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

    const handleNotificationClick = (n: NotificationItem) => {
        setSelectedNotification(n);
        if (!n.isRead) {
            onMarkRead(n.id);
        }
    };

    return (
        <>
            {isMounted && (
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
                                        key={n.id || `notification-${idx}`}
                                        onClick={() => handleNotificationClick(n)}
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
            )}

            {/* Notification Detail Modal */}
            <AnimatePresence>
                {selectedNotification && (
                    <DetailModal
                        notification={selectedNotification}
                        onClose={() => setSelectedNotification(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

function DetailModal({ notification, onClose }: { notification: any, onClose: () => void }) {
    if (!notification) return null;

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                key="modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg glass-panel-extreme rounded-4xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden bg-white dark:bg-slate-900"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#2dd4bf]/20 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-[#2dd4bf]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#2dd4bf] block">Notification Overview</span>
                            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white line-clamp-1">{notification.title}</h3>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="flex gap-5 items-start">
                            <div className="h-14 w-14 rounded-3xl bg-[#2dd4bf]/10 text-[#2dd4bf] flex items-center justify-center shrink-0 shadow-inner">
                                <MailOpen className="h-7 w-7" />
                            </div>
                            <div className="space-y-2 pt-1 border-l-2 border-[#2dd4bf]/20 pl-5">
                                <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">{notification.title}</h4>
                                <p className="text-[10px] font-black text-[#2dd4bf] uppercase tracking-[0.2em] opacity-70">
                                    {notification.createdAt ? formatTime(new Date(notification.createdAt), { addSuffix: true }) : 'Just Now'}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-4xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-inner relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap className="h-12 w-12 text-[#2dd4bf]" />
                            </div>
                            <div
                                className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium relative z-10"
                                dangerouslySetInnerHTML={{ __html: notification.content }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
