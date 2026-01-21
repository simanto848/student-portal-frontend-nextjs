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
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
            toast.success("Intelligence Synchronization Complete");
            refetchStats();
        } catch (error) {
            toast.error("Registry synchronization failed");
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
                        isOpen && "bg-white/80 ring-2 ring-[#0088A9]/20",
                        className
                    )}
                >
                    <Bell className={cn("h-6 w-6 transition-colors", unreadCount > 0 ? "text-[#0088A9]" : "text-gray-500")} />
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
                className="w-[calc(100vw-2rem)] xs:w-[380px] sm:w-[400px] p-0 overflow-hidden border border-white/40 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] mt-4 z-[100]"
            >
                <div className="p-6 border-b border-white/20 bg-white/20 dark:bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#0088A9]/20">
                            <Zap className="h-5 w-5 text-[#0088A9]" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Active Updates</span>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            disabled={isMarkingAllRead}
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-[#0088A9] hover:bg-[#0088A9]/10 rounded-xl"
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
                                <Loader2 className="h-10 w-10 text-[#0088A9] animate-spin" />
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Dispatches...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-6 text-center px-10">
                                <div className="h-16 w-16 rounded-[2rem] bg-gray-50 dark:bg-black/20 flex items-center justify-center shadow-inner">
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
                                                "group relative p-5 rounded-[2rem] transition-all duration-300 border border-white/40 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer overflow-hidden shadow-sm hover:shadow-md",
                                                notification.status !== 'read' ? "bg-white dark:bg-gray-800/40" : "bg-white/20"
                                            )}
                                        >
                                            <div className="flex gap-5">
                                                <div className={cn(
                                                    "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm group-hover:scale-110",
                                                    notification.status !== 'read' ? "bg-[#0088A9]/20 text-[#0088A9]" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
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
                                                    <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed break-words">
                                                        {notification.content}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="text-[9px] font-black text-[#0088A9] dark:text-[#0088A9] uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#0088A9]/10">
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
                                className="w-full h-14 text-[10px] font-black uppercase tracking-widest text-[#0088A9] hover:bg-[#0088A9]/5 rounded-[2rem] border border-dashed border-[#0088A9]/30 mt-4"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-lg glass-panel-extreme rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden"
            >
                <div className="p-6 sm:p-8 border-b border-white/20 bg-white/20 dark:bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#0088A9]/20 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-[#0088A9]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0088A9] block">Dispatch Details</span>
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white line-clamp-1">{notification.title}</h3>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-8 sm:p-10">
                    <div className="space-y-8">
                        <div className="flex gap-5 items-start">
                            <div className="h-14 w-14 rounded-3xl bg-[#0088A9]/10 text-[#0088A9] flex items-center justify-center shrink-0 shadow-inner">
                                <MailOpen className="h-7 w-7" />
                            </div>
                            <div className="space-y-2 pt-1 border-l-2 border-[#0088A9]/20 pl-5">
                                <h4 className="text-base font-black tracking-tight text-gray-900 dark:text-white leading-tight">{notification.title}</h4>
                                <p className="text-[10px] font-black text-[#0088A9] uppercase tracking-[0.2em] opacity-70">
                                    {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just Now'}
                                </p>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-white/40 shadow-inner relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="h-12 w-12 text-[#0088A9]" />
                            </div>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words font-medium relative z-10">
                                {notification.content}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/20 dark:bg-black/20 border-t border-white/10 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="rounded-2xl px-10 bg-[#0088A9] text-white hover:bg-[#007899] text-[11px] font-black uppercase tracking-widest h-12 shadow-lg shadow-[#0088A9]/30 transition-all hover:scale-105 active:scale-95"
                    >
                        Acknowledge Dispatch
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
