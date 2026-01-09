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
                        "relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all hover:bg-slate-100",
                        isOpen && "bg-slate-100 ring-2 ring-cyan-100",
                        className
                    )}
                >
                    <Bell className={cn("h-5 w-5 transition-colors", unreadCount > 0 ? "text-cyan-600" : "text-slate-500")} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span>
                        </span>
                    )}
                    <span className="sr-only">Notification Feed</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[380px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl rounded-[1.5rem]"
            >
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Notification Feed</span>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            disabled={isMarkingAllRead}
                            className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 hover:bg-white/10 rounded-lg"
                        >
                            {isMarkingAllRead ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                            Clear All
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-1">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-8">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                    <Inbox className="h-6 w-6 text-slate-200" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Feed Terminal Clear</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No new dispatches at this frequency</p>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {notifications.map((notification) => {
                                    return (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedNotification(notification);
                                                if (notification.status !== 'read') {
                                                    markAsRead.mutate(notification.id);
                                                }
                                            }}
                                            className={cn(
                                                "group relative p-4 rounded-2xl transition-all duration-300 border border-transparent hover:bg-slate-50 cursor-pointer overflow-hidden",
                                                notification.status !== 'read' ? "bg-cyan-50/20 border-cyan-50" : "bg-transparent"
                                            )}
                                        >
                                            <div className="flex gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                                    notification.status !== 'read' ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {notification.status === 'read' ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                                                </div>

                                                <div className="flex-1 min-w-0 pr-8">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <h5 className={cn(
                                                            "text-[11px] font-black uppercase tracking-tight line-clamp-1 block w-full",
                                                            notification.status !== 'read' ? "text-slate-900" : "text-slate-500"
                                                        )}>
                                                            {notification.title}
                                                        </h5>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-500 line-clamp-1 leading-snug break-words">
                                                        {notification.content}
                                                    </p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                        {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just Now'}
                                                    </p>
                                                </div>

                                                <div className="absolute right-3 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification.mutate(notification.id);
                                                        }}
                                                        className="h-7 w-7 rounded-lg bg-white shadow-sm border border-rose-100 text-rose-500 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
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
                                className="w-full h-12 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 hover:bg-cyan-50/50 rounded-2xl"
                            >
                                {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-3 w-3 mr-2" />}
                                Load Synchronization
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
                className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border-none overflow-hidden"
            >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 block">Intelligence Dispatch</span>
                            <h3 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">{notification.title}</h3>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="h-12 w-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                                <MailOpen className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">{notification.title}</h4>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just Now'}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-600 leading-relaxed break-words font-medium">
                                {notification.content}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="rounded-xl px-8 bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest h-10 shadow-lg shadow-slate-900/20"
                    >
                        Acknowledge
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
