"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    MessageSquare,
    Users,
    AlertCircle,
    Search,
    RefreshCw,
    MessageCircle,
    ChevronRight,
    GraduationCap,
    UserCog,
    BookOpen,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { CRManagementDialog } from "@/components/dashboard/communication/CRManagementDialog";

import { useAuth } from "@/contexts/AuthContext";
import { batchCourseInstructorService } from "@/services/enrollment/batchCourseInstructor.service";
import { batchService } from "@/services/academic/batch.service";
import { chatService } from "@/services/communication/chat.service";
import { Batch } from "@/services/academic/types";
import { BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { cn } from "@/lib/utils";

// Query keys
const communicationKeys = {
    all: ["teacher-communication"] as const,
    courses: (instructorId: string) => [...communicationKeys.all, "courses", instructorId] as const,
    batches: (counselorId: string) => [...communicationKeys.all, "batches", counselorId] as const,
    chatGroups: (userId: string) => [...communicationKeys.all, "chat-groups", userId] as const,
};

const formatBatchName = (batch: any) => {
    if (!batch) return "N/A";
    const prefix = batch.shift === "day" ? "D-" : batch.shift === "evening" ? "E-" : "";
    return `${prefix}${batch.name}`;
};

type TabType = "courses" | "batches";

interface ChatGroupInfo {
    id: string;
    type: string;
    batchId?: string;
    courseId?: string;
    lastMessage?: {
        content: string;
        createdAt: string;
        senderId: string;
    };
    unreadCount?: number;
}

export default function CommunicationClient() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const instructorId = user?.id || user?._id || "";

    // Get initial tab from URL or default to "courses"
    const initialTab = (searchParams.get('tab') as TabType) || "courses";
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    // UI State
    const [enteringChat, setEnteringChat] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Update URL when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab as TabType);
        const url = new URL(window.location.href);
        if (tab === "courses") {
            url.searchParams.delete('tab');
        } else {
            url.searchParams.set('tab', tab);
        }
        router.replace(url.pathname + url.search, { scroll: false });
    };

    // Dialog State
    const [crDialogOpen, setCrDialogOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

    // Fetch Chat Groups for unread counts
    const {
        data: chatGroups = [],
        refetch: refetchChatGroups,
    } = useQuery({
        queryKey: communicationKeys.chatGroups(instructorId),
        queryFn: () => chatService.listMyChatGroups(),
        enabled: !!instructorId,
        refetchInterval: 30000, // Refresh every 30 seconds for unread updates
    });

    // Fetch Courses
    const {
        data: courses = [],
        isLoading: coursesLoading,
        isError: coursesError,
        refetch: refetchCourses,
    } = useQuery({
        queryKey: communicationKeys.courses(instructorId),
        queryFn: () => batchCourseInstructorService.getInstructorCourses(instructorId),
        enabled: !!instructorId,
    });

    // Fetch Batches
    const {
        data: batches = [],
        isLoading: batchesLoading,
        isError: batchesError,
        refetch: refetchBatches,
    } = useQuery({
        queryKey: communicationKeys.batches(instructorId),
        queryFn: () => batchService.getAllBatches({ counselorId: instructorId }),
        enabled: !!instructorId,
    });

    const isLoading = coursesLoading || batchesLoading;
    const isError = coursesError || batchesError;

    // Map chat groups to courses/batches for unread info
    const chatGroupMap = useMemo(() => {
        const map: Record<string, ChatGroupInfo> = {};
        chatGroups.forEach((group: any) => {
            const key = group.courseId
                ? `course-${group.courseId}-${group.batchId}`
                : `batch-${group.batchId}`;
            map[key] = {
                id: group.id || group._id,
                type: group.type,
                batchId: group.batchId,
                courseId: group.courseId,
                lastMessage: group.lastMessage,
                unreadCount: group.unreadCount || 0,
            };
        });
        return map;
    }, [chatGroups]);

    // Calculate total unread
    const totalUnreadCourses = useMemo(() => {
        return courses.reduce((acc, course) => {
            const key = `course-${course.courseId}-${course.batchId}`;
            return acc + (chatGroupMap[key]?.unreadCount || 0);
        }, 0);
    }, [courses, chatGroupMap]);

    const totalUnreadBatches = useMemo(() => {
        return batches.reduce((acc, batch) => {
            const key = `batch-${batch.id}`;
            return acc + (chatGroupMap[key]?.unreadCount || 0);
        }, 0);
    }, [batches, chatGroupMap]);

    const filteredCourses = useMemo(() => {
        if (!searchQuery) return courses;
        const query = searchQuery.toLowerCase();
        return courses.filter(
            (c) =>
                c.course?.name?.toLowerCase().includes(query) ||
                c.course?.code?.toLowerCase().includes(query) ||
                c.batch?.name?.toLowerCase().includes(query)
        );
    }, [courses, searchQuery]);

    const filteredBatches = useMemo(() => {
        if (!searchQuery) return batches;
        const query = searchQuery.toLowerCase();
        return batches.filter((b) => b.name?.toLowerCase().includes(query));
    }, [batches, searchQuery]);

    const handleEnterCourseChat = async (course: BatchCourseInstructor) => {
        if (!course.sessionId) {
            toast.error("Error: Course session ID is missing.");
            return;
        }

        setEnteringChat(course.id);
        try {
            const chatGroup = await chatService.getOrCreateCourseChatGroup({
                batchId: course.batchId,
                courseId: course.courseId,
                sessionId: course.sessionId,
                instructorId: instructorId,
            });

            router.push(`/dashboard/teacher/communication/chat/${chatGroup.id}?type=CourseChatGroup`);
        } catch (error) {
            console.error("Enter chat error:", error);
            toast.error("Failed to enter chat.");
        } finally {
            setEnteringChat(null);
        }
    };

    const handleEnterBatchChat = async (batch: Batch) => {
        setEnteringChat(batch.id);
        try {
            const chatGroup = await chatService.getOrCreateBatchChatGroup({
                batchId: batch.id,
                counselorId: instructorId,
            });
            router.push(`/dashboard/teacher/communication/chat/${chatGroup.id}?type=BatchChatGroup`);
        } catch (error) {
            console.error("Enter chat error:", error);
            toast.error("Failed to enter chat.");
        } finally {
            setEnteringChat(null);
        }
    };

    const openManageCR = (batch: Batch) => {
        setSelectedBatch(batch);
        setCrDialogOpen(true);
    };

    const handleRefresh = () => {
        refetchCourses();
        refetchBatches();
        refetchChatGroups();
    };

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-[#14b8a6] flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-[#2dd4bf]/10 text-[#2dd4bf] border-none px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Communication
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Message Center
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                            Connect with your students through course and batch discussions
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="h-11 px-5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#2dd4bf]/5 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <QuickStatCard
                    label="Course Chats"
                    value={courses.length}
                    icon={BookOpen}
                    color="teal"
                    unread={totalUnreadCourses}
                />
                <QuickStatCard
                    label="Batch Chats"
                    value={batches.length}
                    icon={Users}
                    color="indigo"
                    unread={totalUnreadBatches}
                />
                <QuickStatCard
                    label="Active Chats"
                    value={chatGroups.length}
                    icon={MessageCircle}
                    color="emerald"
                />
            </div>

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50 text-rose-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">
                        Failed to load communication groups. Please try again.
                    </AlertDescription>
                </Alert>
            )}

            {/* Tabs & Content */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <TabsList className="h-12 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700 w-full md:w-auto">
                        <TabsTrigger
                            value="courses"
                            className="h-10 px-6 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#2dd4bf] data-[state=active]:shadow-md relative"
                        >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Courses
                            {totalUnreadCourses > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-[#2dd4bf] text-white text-[10px] font-black flex items-center justify-center">
                                    {totalUnreadCourses > 99 ? '99+' : totalUnreadCourses}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="batches"
                            className="h-10 px-6 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-[#2dd4bf] data-[state=active]:shadow-md relative"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Batches
                            {totalUnreadBatches > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-[#2dd4bf] text-white text-[10px] font-black flex items-center justify-center">
                                    {totalUnreadBatches > 99 ? '99+' : totalUnreadBatches}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative flex-1 md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/50"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="courses" key="courses" className="mt-0 focus-visible:outline-none">
                        {filteredCourses.length > 0 ? (
                            <div className="space-y-3">
                                {filteredCourses.map((course, idx) => {
                                    const chatKey = `course-${course.courseId}-${course.batchId}`;
                                    const chatInfo = chatGroupMap[chatKey];
                                    return (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <CourseChatRow
                                                course={course}
                                                chatInfo={chatInfo}
                                                onEnterChat={() => handleEnterCourseChat(course)}
                                                isEntering={enteringChat === course.id}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={MessageCircle}
                                title={searchQuery ? "No matching courses" : "No courses assigned"}
                                description={searchQuery ? "Try adjusting your search" : "You don't have any course discussions yet"}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="batches" key="batches" className="mt-0 focus-visible:outline-none">
                        {filteredBatches.length > 0 ? (
                            <div className="space-y-3">
                                {filteredBatches.map((batch, idx) => {
                                    const chatKey = `batch-${batch.id}`;
                                    const chatInfo = chatGroupMap[chatKey];
                                    return (
                                        <motion.div
                                            key={batch.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <BatchChatRow
                                                batch={batch}
                                                chatInfo={chatInfo}
                                                onOpenChat={() => handleEnterBatchChat(batch)}
                                                onManageCR={() => openManageCR(batch)}
                                                isEntering={enteringChat === batch.id}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Users}
                                title={searchQuery ? "No matching batches" : "No batches assigned"}
                                description={searchQuery ? "Try adjusting your search" : "You are not a counselor for any batches"}
                            />
                        )}
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            <CRManagementDialog
                open={crDialogOpen}
                onOpenChange={setCrDialogOpen}
                batch={selectedBatch}
                onSuccess={handleRefresh}
            />
        </div>
    );
}

// Quick Stat Card Component
function QuickStatCard({
    label,
    value,
    icon: Icon,
    color,
    unread
}: {
    label: string;
    value: number;
    icon: any;
    color: 'teal' | 'indigo' | 'amber' | 'emerald';
    unread?: number;
}) {
    const colors = {
        teal: 'bg-[#2dd4bf]/10 text-[#2dd4bf]',
        indigo: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10',
        amber: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10',
        emerald: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10',
    };

    return (
        <Card className="p-4 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", colors[color])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
                </div>
            </div>
            {unread !== undefined && unread > 0 && (
                <div className="absolute top-3 right-3">
                    <span className="flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-[#2dd4bf] text-white text-[10px] font-black animate-pulse">
                        {unread > 99 ? '99+' : unread}
                    </span>
                </div>
            )}
        </Card>
    );
}

// Course Chat Row Component
function CourseChatRow({
    course,
    chatInfo,
    onEnterChat,
    isEntering
}: {
    course: BatchCourseInstructor;
    chatInfo?: ChatGroupInfo;
    onEnterChat: () => void;
    isEntering: boolean;
}) {
    const hasUnread = (chatInfo?.unreadCount || 0) > 0;
    const lastMessage = chatInfo?.lastMessage;

    return (
        <Card
            className={cn(
                "group p-0 overflow-hidden border-slate-200 dark:border-slate-700 rounded-2xl transition-all cursor-pointer hover:shadow-lg hover:border-[#2dd4bf]/30",
                hasUnread && "border-l-4 border-l-[#2dd4bf] bg-[#2dd4bf]/[0.02]"
            )}
            onClick={onEnterChat}
        >
            <div className="flex items-center gap-4 p-4">
                {/* Icon Section */}
                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                    hasUnread
                        ? "bg-[#2dd4bf] text-white shadow-lg shadow-teal-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-[#2dd4bf]/10 group-hover:text-[#2dd4bf]"
                )}>
                    <MessageCircle className="h-6 w-6" />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20 font-bold px-2 py-0 text-[10px] uppercase tracking-wider">
                                    {course.course?.code || "N/A"}
                                </Badge>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0 text-[10px]">
                                    Sem {course.semester || "—"}
                                </Badge>
                            </div>
                            <h3 className={cn(
                                "text-base font-bold text-slate-900 dark:text-white leading-tight truncate",
                                hasUnread && "text-[#2dd4bf]"
                            )}>
                                {course.course?.name || "Unknown Course"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Users className="h-3 w-3 text-slate-400" />
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {formatBatchName(course.batch)} • {course.batch?.currentStudents || 0} students
                                </span>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            {hasUnread ? (
                                <span className="flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-[#2dd4bf] text-white text-[10px] font-black">
                                    {chatInfo!.unreadCount! > 99 ? '99+' : chatInfo!.unreadCount}
                                </span>
                            ) : lastMessage ? (
                                <span className="text-[10px] font-medium text-slate-400">
                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Last Message Preview */}
                    {lastMessage && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-2 pl-0.5">
                            {lastMessage.content}
                        </p>
                    )}
                </div>

                {/* Arrow */}
                <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    "bg-transparent group-hover:bg-[#2dd4bf] text-slate-300 group-hover:text-white"
                )}>
                    {isEntering ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <ArrowRight className="h-4 w-4" />
                    )}
                </div>
            </div>
        </Card>
    );
}

// Batch Chat Row Component
function BatchChatRow({
    batch,
    chatInfo,
    onOpenChat,
    onManageCR,
    isEntering
}: {
    batch: Batch;
    chatInfo?: ChatGroupInfo;
    onOpenChat: () => void;
    onManageCR: () => void;
    isEntering: boolean;
}) {
    const hasUnread = (chatInfo?.unreadCount || 0) > 0;
    const lastMessage = chatInfo?.lastMessage;
    const hasCR = !!batch.classRepresentativeId;

    return (
        <Card
            className={cn(
                "group p-0 overflow-hidden border-slate-200 dark:border-slate-700 rounded-2xl transition-all",
                hasUnread && "border-l-4 border-l-indigo-500 bg-indigo-500/[0.02]"
            )}
        >
            <div className="flex items-center gap-4 p-4">
                {/* Icon Section */}
                <div
                    className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all",
                        hasUnread
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                    )}
                    onClick={onOpenChat}
                >
                    <Users className="h-6 w-6" />
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpenChat}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                    Counseling Batch
                                </span>
                            </div>
                            <h3 className={cn(
                                "text-base font-bold text-slate-900 dark:text-white leading-tight",
                                hasUnread && "text-indigo-600"
                            )}>
                                {formatBatchName(batch)}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {(batch.programId as any)?.name || "Program"} • {batch.currentStudents || 0} students
                                </span>
                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 font-bold px-2 py-0 text-[10px]">
                                    Sem {batch.currentSemester}
                                </Badge>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            {hasUnread ? (
                                <span className="flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-black">
                                    {chatInfo!.unreadCount! > 99 ? '99+' : chatInfo!.unreadCount}
                                </span>
                            ) : lastMessage ? (
                                <span className="text-[10px] font-medium text-slate-400">
                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Last Message Preview */}
                    {lastMessage && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-2 pl-0.5">
                            {lastMessage.content}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* CR Status Indicator */}
                    <div
                        className={cn(
                            "h-10 px-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all text-xs font-bold",
                            hasCR
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100"
                                : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100"
                        )}
                        onClick={(e) => { e.stopPropagation(); onManageCR(); }}
                        title={hasCR ? "Manage CR" : "Assign CR"}
                    >
                        <UserCog className="h-4 w-4" />
                        <span className="hidden sm:inline">{hasCR ? "CR" : "No CR"}</span>
                    </div>

                    {/* Open Chat Button */}
                    <Button
                        size="sm"
                        className="h-10 px-4 bg-[#2dd4bf] hover:bg-[#26b3a2] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-500/20 transition-all"
                        onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
                        disabled={isEntering}
                    >
                        {isEntering ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Chat
                                <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// Empty State Component
function EmptyState({
    icon: Icon,
    title,
    description
}: {
    icon: any;
    title: string;
    description: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700"
        >
            <div className="h-20 w-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                <Icon className="h-9 w-9 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{title}</h3>
            <p className="text-slate-400 mt-2 font-medium text-sm text-center max-w-sm">{description}</p>
        </motion.div>
    );
}
