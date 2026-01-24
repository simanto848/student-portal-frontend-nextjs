"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Search,
    Plus,
    Send,
    Users,
    Clock,
    RefreshCw,
    Inbox,
    MessageSquare,
    Info,
    AlertTriangle,
    ChevronRight,
    Filter,
    Trash2,
    MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { notifySuccess, notifyError } from "@/components/toast";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { useNotificationCenter } from "@/hooks/queries/useNotificationQueries";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { notificationService, NotificationItem } from "@/services/notification/notification.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

type FilterType = "all" | "unread" | "read";
type TabType = "inbox" | "sent";

const TYPE_ICONS: Record<string, any> = {
    alert: AlertTriangle,
    emergency: AlertTriangle,
    info: Info,
    announcement: MegapixelSquare,
    batch: Users,
    batch_students: Users,
    default: Bell,
};

function MegapixelSquare(props: any) {
    return <MessageSquare {...props} />;
}

interface NotificationListClientProps {
    initialNotifications: NotificationItem[];
    initialSentNotifications: NotificationItem[];
    initialUnreadCount: number;
}

export default function NotificationListClient({
    initialNotifications,
    initialSentNotifications,
    initialUnreadCount,
}: NotificationListClientProps) {
    const theme = useDashboardTheme();
    const [activeTab, setActiveTab] = useState<TabType>("inbox");
    const [filter, setFilter] = useState<FilterType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sentNotifications, setSentNotifications] = useState<NotificationItem[]>(initialSentNotifications);
    const [isLoadingSent, setIsLoadingSent] = useState(false);

    const accentPrimary = theme.colors.accent.primary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/10';

    const {
        notifications,
        refetch,
        markAsRead,
        markAllAsRead,
        isMarkingRead,
        isMarkingAllRead,
    } = useNotificationCenter(undefined, {
        initialData: { notifications: initialNotifications }
    });

    const { isConnected, reconnect } = useNotificationSocket({
        enabled: true,
        onNotificationReceived: (notification) => {
            notifySuccess(`New Signal: ${notification.title}`, {
                position: "top-right",
            });
            refetch();
        },
    });

    const unreadCount = initialUnreadCount;

    const fetchSent = useCallback(async () => {
        setIsLoadingSent(true);
        try {
            const result = await notificationService.getSent({ limit: 50 });
            setSentNotifications(result.items || []);
        } catch (err) {
            console.error("Failed to fetch sent:", err);
        } finally {
            setIsLoadingSent(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "sent") {
            fetchSent();
        }
    }, [activeTab, fetchSent]);

    const filteredNotifications = useMemo(() => {
        let list = [...notifications];
        if (filter === "unread") list = list.filter(n => !(n.status === "read" || n.isRead));
        if (filter === "read") list = list.filter(n => (n.status === "read" || n.isRead));

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(n =>
                n.title.toLowerCase().includes(q) ||
                n.content.toLowerCase().includes(q)
            );
        }

        return list.sort((a, b) =>
            new Date(b.publishedAt || b.createdAt || 0).getTime() -
            new Date(a.publishedAt || a.createdAt || 0).getTime()
        );
    }, [notifications, filter, searchQuery]);

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section - Updated to match teacher dashboard */}
            <div className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="text-[#2dd4bf] w-5 h-5" />
                        <span className="text-xs font-bold text-[#2dd4bf] uppercase tracking-widest">
                            Communications Hub
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Notifi<span className="text-[#2dd4bf]">cations</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Stay updated with system alerts and broadcast messages to your students.
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-[11px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className={isConnected ? 'text-emerald-600' : 'text-red-600'}>
                                {isConnected ? 'Real-time Linked' : 'Connection Lost'}
                            </span>
                            {!isConnected && (
                                <button onClick={reconnect} className="text-[#2dd4bf] underline ml-1 hover:text-[#26b3a2]">
                                    Reconnect
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard/teacher/notifications/create">
                        <Button className="h-14 px-8 bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl font-black uppercase text-xs tracking-widest w-full transition-all active:scale-95 flex items-center gap-3">
                            <Plus className="h-5 w-5" />
                            Create New Notification
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => markAllAsRead.mutate()}
                            disabled={unreadCount === 0 || isMarkingAllRead}
                            className="flex-1 h-12 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                            Mark All Read
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                refetch();
                                if (activeTab === "sent") fetchSent();
                            }}
                            className="h-12 w-12 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700/50 p-0"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 mb-6">
                    <TabsList className="h-14 p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-200/50 dark:border-slate-700 w-full md:w-auto">
                        <TabsTrigger
                            value="inbox"
                            className="h-11 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=hover]:text-[#2dd4bf] data-[state=active]:border-[#2dd4bf]/20 active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <Inbox className="h-4 w-4" />
                                Inbox
                                {unreadCount > 0 && (
                                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#2dd4bf] text-[10px] text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="sent"
                            className="h-11 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=hover]:text-[#2dd4bf] data-[state=active]:border-[#2dd4bf]/20 active:scale-95"
                        >
                            <div className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                Outbox
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === "inbox" && (
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Filter messages..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-12 pl-12 pr-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-[#2dd4bf]/20"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-12 w-12 rounded-xl p-0 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:text-[#2dd4bf]">
                                        <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                                    <DropdownMenuItem onClick={() => setFilter('all')} className="rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700">
                                        All Messages
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('unread')} className="rounded-xl font-bold text-xs uppercase tracking-widest text-[#2dd4bf] hover:bg-[#2dd4bf]/10">
                                        Unread Only
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilter('read')} className="rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700">
                                        Read Only
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <TabsContent value="inbox" className="mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((n, idx) => (
                                    <NotificationCard
                                        key={n.id}
                                        notification={n}
                                        index={idx}
                                        onMarkAsRead={() => markAsRead.mutate(n.id)}
                                        isMarkingRead={isMarkingRead}
                                        themeAccent={accentPrimary}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    icon={searchQuery || filter !== 'all' ? Filter : Inbox}
                                    title={searchQuery || filter !== 'all' ? "No Matches Found" : "All Caught Up!"}
                                    description={searchQuery || filter !== 'all'
                                        ? "No notifications match your current search or filters. Try adjusting them."
                                        : "You have no notifications in your inbox right now. Check back later!"
                                    }
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="sent" className="mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 gap-4">
                        {isLoadingSent ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-[#2dd4bf] mb-4" />
                                <p className="font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-xs text-center">
                                    Synchronizing outbox...
                                </p>
                            </div>
                        ) : sentNotifications.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {sentNotifications.map((n, idx) => (
                                    <SentNotificationCard
                                        key={n.id}
                                        notification={n}
                                        index={idx}
                                        themeAccent={accentPrimary}
                                    />
                                ))}
                            </AnimatePresence>
                        ) : (
                            <EmptyState
                                icon={Send}
                                title="Outbox Empty"
                                description="You haven't sent any broadcast messages yet. Use the broadcast button to reach your students."
                                action={{
                                    label: "Create New Notification",
                                    href: "/dashboard/teacher/notifications/create"
                                }}
                            />
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function NotificationCard({
    notification,
    index,
    onMarkAsRead,
    isMarkingRead,
    themeAccent
}: {
    notification: NotificationItem;
    index: number;
    onMarkAsRead: () => void;
    isMarkingRead: boolean;
    themeAccent: string;
}) {
    const isRead = notification.status === "read" || notification.isRead;
    const type = notification.targetType || "default";
    const Icon = TYPE_ICONS[type] || TYPE_ICONS.default;

    // Auto-mark visibility logic
    const cardRef = useRef<HTMLDivElement>(null);
    const markedRef = useRef(false);

    useEffect(() => {
        if (isRead) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !markedRef.current) {
                const timer = setTimeout(() => {
                    if (!markedRef.current) {
                        markedRef.current = true;
                        onMarkAsRead();
                    }
                }, 2000); // 2 second view time
                return () => clearTimeout(timer);
            }
        }, { threshold: 0.8 });

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [isRead, onMarkAsRead]);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
        >
            <Card className={`glass-panel group relative overflow-hidden transition-all duration-300 rounded-3xl border-slate-200/50 dark:border-slate-700 hover:shadow-lg hover:border-[#2dd4bf]/30 hover:-translate-y-1 ${!isRead ? 'bg-[#2dd4bf]/5 dark:bg-[#2dd4bf]/10' : 'bg-white/50 dark:bg-slate-800/50'}`}>
                {!isRead && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2dd4bf] rounded-full" />
                )}
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${!isRead ? 'bg-[#2dd4bf] text-white shadow-lg shadow-teal-200 dark:shadow-teal-600/20' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'} transition-all group-hover:scale-110`}>
                            <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-1 mb-2">
                                <h3 className={`text-base font-bold tracking-tight ${!isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {notification.title}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(notification.publishedAt || notification.createdAt || ""), { addSuffix: true })}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <MoreVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                                            {!isRead && (
                                                <DropdownMenuItem onClick={onMarkAsRead} disabled={isMarkingRead} className="font-bold text-xs uppercase tracking-widest text-[#2dd4bf] hover:bg-[#2dd4bf]/10">
                                                    Mark as Read
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="font-bold text-xs uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                Delete Permanent
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <p className={`text-sm leading-relaxed mb-4 ${!isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'} line-clamp-2`}>
                                {notification.content}
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 px-2.5 py-0.5 rounded-lg">
                                    {notification.targetType?.replace('_', ' ') || 'General'}
                                </Badge>
                                {!isRead && (
                                    <Badge className="bg-[#2dd4bf] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border-0">
                                        Unread
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center self-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-5 w-5 text-[#2dd4bf]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function SentNotificationCard({
    notification,
    index,
    themeAccent
}: {
    notification: NotificationItem;
    index: number;
    themeAccent: string;
}) {
    const isPublished = notification.status === "published";
    const readPercentage = notification.totalRecipients && notification.totalRecipients > 0
        ? Math.round(((notification.readCount || 0) / notification.totalRecipients) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
        >
            <Card className="glass-panel group relative overflow-hidden bg-white/50 dark:bg-slate-800/50 hover:shadow-lg hover:border-[#2dd4bf]/30 transition-all duration-300 rounded-3xl border-slate-200/50 dark:border-slate-700 hover:-translate-y-1 p-0">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-2xl ${isPublished ? 'bg-[#2dd4bf]/10 text-[#2dd4bf]' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'}`}>
                                <Send className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white mb-0.5">
                                        {notification.title}
                                    </h3>
                                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest border-0 rounded-lg px-2 py-0.5 ${isPublished ? 'bg-[#2dd4bf]/10 text-[#2dd4bf]' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'}`}>
                                        {notification.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                                    {notification.content}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(notification.publishedAt || notification.createdAt || ""), { addSuffix: true })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3" />
                                        {notification.totalRecipients || 0} Recipients
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isPublished && (
                            <div className="flex flex-col gap-2 min-w-[140px]">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1">
                                    <span className="text-slate-400 dark:text-slate-500">Read Status</span>
                                    <span className="text-[#2dd4bf]">{readPercentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-full">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${readPercentage}%` }}
                                        className="h-full bg-[#2dd4bf] rounded-full"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center">
                                    {notification.readCount || 0} Learners
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function EmptyState({ icon: Icon, title, description, action }: any) {
    return (
        <div className="py-24 flex flex-col items-center justify-center glass-panel rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 text-center px-6">
                {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-center px-6 max-w-sm mb-8">
                {description}
            </p>
            {action && (
                <Link href={action.href}>
                    <Button className="h-12 bg-[#2dd4bf] hover:bg-[#26b3a2] text-white px-8 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-all">
                        {action.label}
                    </Button>
                </Link>
            )}
        </div>
    );
}
