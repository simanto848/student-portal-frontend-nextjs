/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
    Bell,
    CheckCircle2,
    Trash2,
    MailOpen,
    Mail,
    Inbox,
    Zap,
    ExternalLink,
    Loader2,
    X,
    Badge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationCenter, useNotificationStats } from "@/hooks/queries/useNotificationQueries";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NotificationDropdownProps {
    className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
    const {
        notifications,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isMarkingAllRead,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useNotificationCenter();

    const { stats, refetch: refetchStats } = useNotificationStats();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await markAllAsRead.mutateAsync();
            toast.success("Notification list cleared");
            refetchStats();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Notification synchronization failed");
        }
    };

    const unreadCount = stats?.unread || 0;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-12 w-12 rounded-2xl transition-all hover:bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md group",
                        isOpen && "bg-white/80 ring-2 ring-primary-nexus/20",
                        className
                    )}
                >
                    <Bell className={cn("h-6 w-6 transition-colors", unreadCount > 0 ? "text-primary-nexus" : "text-gray-500")} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 bg-red-500 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-sm text-[10px] font-black text-white">
                            {unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notification Feed</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[calc(100vw-2rem)] xs:w-[380px] sm:w-[400px] p-0 overflow-hidden border border-white/40 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-4xl sm:rounded-[2.5rem] mt-4 z-100"
            >
                <div className="p-6 border-b border-white/20 bg-white/20 dark:bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary-nexus/20">
                            <Zap className="h-5 w-5 text-primary-nexus" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Active Updates</span>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            disabled={isMarkingAllRead}
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-primary-nexus hover:bg-primary-nexus/10 rounded-xl"
                        >
                            {isMarkingAllRead ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                            Clear List
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[450px]">
                    <div className="p-4 space-y-3">
                        {isLoading ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-6">
                                <Loader2 className="h-10 w-10 text-primary-nexus animate-spin" />
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Dispatches...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-6 text-center px-10">
                                <div className="h-16 w-16 rounded-4xl bg-gray-50 dark:bg-black/20 flex items-center justify-center shadow-inner">
                                    <Inbox className="h-8 w-8 text-gray-200" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">Terminal Clear</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">No new intel recorded on this frequency</p>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {notifications.map((notification) => {
                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedNotification(notification);
                                                if (notification.status !== 'read') {
                                                    markAsRead.mutate(notification.id);
                                                }
                                            }}
                                            className={cn(
                                                "group relative p-5 rounded-4xl transition-all duration-300 border border-white/40 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer overflow-hidden shadow-sm hover:shadow-md",
                                                notification.status !== 'read' ? "bg-white dark:bg-gray-800/40" : "bg-white/20"
                                            )}
                                        >
                                            <div className="flex gap-5">
                                                <div className={cn(
                                                    "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:scale-110",
                                                    notification.status !== 'read' ? "bg-primary-nexus/20 text-primary-nexus" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                                )}>
                                                    {notification.status === 'read' ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                                                </div>

                                                <div className="flex-1 min-w-0 pr-10">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h5 className={cn(
                                                            "text-sm font-black tracking-tight line-clamp-1 block w-full",
                                                            notification.status !== 'read' ? "text-gray-900 dark:text-white" : "text-gray-500"
                                                        )}>
                                                            {notification.title}
                                                        </h5>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed wrap-break-word">
                                                        {notification.content}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="text-[9px] font-black text-primary-nexus dark:text-primary-nexus uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary-nexus/10">
                                                            {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just Now'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification.mutate(notification.id);
                                                        }}
                                                        className="h-9 w-9 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}

                        {hasNextPage && (
                            <Button
                                variant="ghost"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="w-full h-14 text-[10px] font-black uppercase tracking-widest text-primary-nexus hover:bg-primary-nexus/5 rounded-4xl border border-dashed border-primary-nexus/30 mt-4"
                            >
                                {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <ExternalLink className="h-4 w-4 mr-3" />}
                                Synchronize History
                            </Button>
                        )}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>

            {/* Notification Detail Modal */}
            <DetailModal
                notification={selectedNotification}
                onClose={() => setSelectedNotification(null)}
            />
        </DropdownMenu>
    );
}

function DetailModal({ notification, onClose }: { notification: any, onClose: () => void }) {
    if (!notification) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] dark:bg-black/60"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg glass-panel-extreme rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 overflow-hidden bg-white/95 dark:bg-gray-950/95"
            >
                {/* Modal Header */}
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#0088A9]/10 dark:bg-[#0088A9]/20 flex items-center justify-center shadow-inner">
                            <Zap className="h-6 w-6 text-[#0088A9]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0088A9] block mb-0.5">{notification.type}</span>
                            <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white line-clamp-1">{notification.title}</h3>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-11 w-11 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all focus:ring-0"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Modal Body */}
                <div className="p-8 sm:p-10">
                    <div className="space-y-8">
                        <div className="flex gap-6 items-start">
                            <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-[#0088A9] to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xl shadow-[#0088A9]/20">
                                <MailOpen className="h-8 w-8" />
                            </div>
                            <div className="space-y-2 pt-1 border-l-2 border-[#0088A9]/20 pl-6">
                                <h4 className="text-lg font-black tracking-tight text-gray-900 dark:text-white leading-tight">{notification.title}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#0088A9] animate-pulse" />
                                    <p className="text-[10px] font-black text-[#0088A9] uppercase tracking-[0.2em]">
                                        {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just Now'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-inner relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <Zap className="h-20 w-20 text-[#0088A9]" />
                            </div>
                            <div
                                className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words font-medium relative z-10"
                                dangerouslySetInnerHTML={{ __html: notification.content }}
                            />
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-3 items-center px-2">
                            <Badge className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-xl">
                                ID: {notification.id ? notification.id.substring(0, 12) : 'N/A'}
                            </Badge>
                            <Badge className="bg-[#0088A9]/10 text-[#0088A9] hover:bg-[#0088A9]/20 text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-xl border-0">
                                {notification.priority || 'Standard'} Priority
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="rounded-2xl px-12 bg-gradient-to-r from-[#0088A9] to-indigo-600 text-white hover:scale-105 active:scale-95 text-[11px] font-black uppercase tracking-widest h-14 shadow-xl shadow-[#0088A9]/30 border-0 transition-all"
                    >
                        Close
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
