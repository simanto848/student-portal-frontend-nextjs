"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Bell,
    CheckCircle2,
    Trash2,
    Search,
    Filter,
    Inbox,
    AlertCircle,
    MailOpen,
    Mail,
    TrendingUp,
    Zap,
    MoreHorizontal
} from "lucide-react";
import {
    useNotificationCenter,
    useNotificationStats
} from "@/hooks/queries/useNotificationQueries";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function NotificationManagementClient() {
    const { user } = useAuth();
    const {
        notifications,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotificationCenter();

    const { data: stats, refetch: refetchStats } = useNotificationStats();

    // Connect to real-time updates
    useNotificationSocket(user?.id || "");

    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredNotifications = useMemo(() => {
        let result = notifications;
        if (filter === "unread") result = result.filter(n => !n.isRead);
        if (filter === "read") result = result.filter(n => n.isRead);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.content.toLowerCase().includes(query)
            );
        }
        return result;
    }, [notifications, filter, searchQuery]);

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead.mutateAsync();
            toast.success("Intelligence feed synchronized (All marked as read)");
            refetchStats();
        } catch (error) {
            toast.error("Failed to update notification registry");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                <p className="text-slate-500 font-bold animate-pulse">Scanning communication frequencies...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Intelligence Center"
                subtitle="Real-time broadcast and personal communication node."
                icon={Bell}
                extraActions={
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-black uppercase tracking-widest text-[10px]"
                        onClick={handleMarkAllRead}
                        disabled={markAllAsRead.isPending || stats?.unreadCount === 0}
                    >
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                        Acknowledge All
                    </Button>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200">
                            <Inbox className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Signals</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{stats?.totalCount || 0}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-600 shadow-lg shadow-cyan-200">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Unread</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{stats?.unreadCount || 0}</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500 shadow-lg shadow-amber-200">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Priority</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">High</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 flex h-12">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${filter === "all" ? "bg-white text-cyan-600 shadow-lg" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        Standard
                    </button>
                    <button
                        onClick={() => setFilter("unread")}
                        className={`px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${filter === "unread" ? "bg-white text-cyan-600 shadow-lg" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter("read")}
                        className={`px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${filter === "read" ? "bg-white text-cyan-600 shadow-lg" : "text-slate-500 hover:text-slate-800"}`}
                    >
                        Archived
                    </button>
                </div>

                <div className="relative w-full md:w-[350px]">
                    <Search className="h-4 w-4 text-cyan-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Search Intelligence Feed..."
                        className="pl-11 bg-white/40 backdrop-blur-sm border-cyan-100 rounded-[1.2rem] h-12 focus:ring-cyan-500/20 active:scale-[0.99] transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification, idx) => (
                            <motion.div
                                key={notification.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: idx * 0.03 }}
                            >
                                <GlassCard className={`p-6 group relative overflow-visible border-l-4 transition-all duration-300 ${!notification.isRead ? 'border-l-cyan-500 bg-cyan-50/10' : 'border-l-transparent bg-white/40'}`}>
                                    <div className="flex items-start gap-5">
                                        <div className={`p-3 rounded-2xl shadow-sm transition-colors ${!notification.isRead ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {notification.isRead ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`font-black text-sm tracking-tight truncate pr-10 ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                                                {notification.content}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2">
                                            {!notification.isRead && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => markAsRead.mutate(notification.id)}
                                                    className="h-8 w-8 rounded-lg bg-white/50 border border-cyan-100 text-cyan-600 hover:bg-cyan-50"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (window.confirm("Delete this dispatch?")) {
                                                        deleteNotification.mutate(notification.id);
                                                    }
                                                }}
                                                className="h-8 w-8 rounded-lg bg-white/50 border border-rose-100 text-rose-500 hover:bg-rose-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {!notification.isRead && (
                                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-cyan-500 animate-pulse group-hover:hidden" />
                                    )}
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center">
                            <Bell className="h-12 w-12 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No signals detected in registry</p>
                        </div>
                    )}
                </AnimatePresence>

                {hasNextPage && (
                    <div className="pt-8 flex justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-black uppercase tracking-widest text-[10px] px-8 py-6 h-auto shadow-sm"
                        >
                            {isFetchingNextPage ? "Synchronizing..." : "Download More Data"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
