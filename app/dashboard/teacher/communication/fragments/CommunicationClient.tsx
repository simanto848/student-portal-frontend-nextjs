"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
    UserCog
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
};

const formatBatchName = (batch: any) => {
    if (!batch) return "N/A";
    const prefix = batch.shift === "day" ? "D-" : batch.shift === "evening" ? "E-" : "";
    return `${prefix}${batch.name}`;
};

export default function CommunicationClient() {
    const { user } = useAuth();
    const router = useRouter();
    const instructorId = user?.id || user?._id || "";

    // UI State
    const [enteringChat, setEnteringChat] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Dialog State
    const [crDialogOpen, setCrDialogOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

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

    // if (isLoading) {
    //     return <DashboardSkeleton layout="hero-cards" cardCount={6} withLayout={false} />;
    // }

    return (
        <div className="space-y-8 font-display animate-in fade-in duration-500">
            {/* Standard Dashboard Header */}
            <GlassCard className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 shadow-sm backdrop-blur-md">
                            <MessageSquare className="text-[#2dd4bf] w-6 h-6" />
                        </div>
                        Communication Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-1">
                        Manage course discussions and batch announcements.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => { refetchCourses(); refetchBatches(); }}
                        className="h-10 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/20 transition-all hover:scale-105 shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </GlassCard>

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">
                        Failed to load communication groups. Please try again.
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="courses" className="w-full">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <GlassCard className="p-1.5 w-full xl:w-auto overflow-x-auto no-scrollbar">
                        <TabsList className="bg-transparent h-auto p-0 gap-1">
                            <TabsTrigger
                                value="courses"
                                className="h-10 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                My Courses ({filteredCourses.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="batches"
                                className="h-10 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                My Batches ({filteredBatches.length})
                            </TabsTrigger>
                        </TabsList>
                    </GlassCard>

                    <div className="relative flex-1 xl:max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search groups or batches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-11 pl-12 pr-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-[#2dd4bf] text-sm shadow-sm"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="courses" key="courses" className="mt-0 focus-visible:outline-none">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course, idx) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <CourseChatCard
                                            course={course}
                                            onEnterChat={() => handleEnterCourseChat(course)}
                                            isEntering={enteringChat === course.id}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <EmptyState
                                    icon={MessageCircle}
                                    message={searchQuery ? "No matching courses found" : "No courses assigned currently"}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="batches" key="batches" className="mt-0 focus-visible:outline-none">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredBatches.length > 0 ? (
                                filteredBatches.map((batch, idx) => (
                                    <motion.div
                                        key={batch.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <BatchCommunicationCard
                                            batch={batch}
                                            onOpenChat={handleEnterBatchChat}
                                            onManageCR={openManageCR}
                                            enteringChat={enteringChat === batch.id}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <EmptyState
                                    icon={Users}
                                    message={searchQuery ? "No matching batches found" : "You are not a counselor for any batches"}
                                />
                            )}
                        </div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            <CRManagementDialog
                open={crDialogOpen}
                onOpenChange={setCrDialogOpen}
                batch={selectedBatch}
                onSuccess={() => { refetchCourses(); refetchBatches(); }}
            />
        </div>
    );
}

function CourseChatCard({ course, onEnterChat, isEntering }: { course: BatchCourseInstructor, onEnterChat: () => void, isEntering: boolean }) {
    return (
        <GlassCard className="p-0 h-full flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <Badge variant="outline" className="bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20 font-bold px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider backdrop-blur-sm">
                            {course.course?.code || "N/A"}
                        </Badge>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                            {course.course?.name || "Unknown Course"}
                        </h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                        <MessageCircle className="h-5 w-5 text-[#2dd4bf]" />
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center">
                                <Users className="h-4 w-4 text-[#2dd4bf]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Batch</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatBatchName(course.batch)}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-md text-[10px] shadow-sm">
                            Sem {course.semester || "—"}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 px-1">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <Users className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {course.batch?.currentStudents || "0"} Students Enrolled
                        </span>
                    </div>
                </div>

                <Button
                    className="w-full bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl h-11 font-bold uppercase text-xs tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
                    onClick={onEnterChat}
                    disabled={isEntering}
                >
                    {isEntering ? (
                        "Opening..."
                    ) : (
                        <>
                            Open Discussion
                            <ChevronRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </GlassCard>
    );
}

function BatchCommunicationCard({ batch, onOpenChat, onManageCR, enteringChat }: { batch: Batch, onOpenChat: (b: Batch) => void, onManageCR: (b: Batch) => void, enteringChat: boolean }) {
    return (
        <GlassCard className="p-0 h-full flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="h-4 w-4 text-[#2dd4bf]" />
                            <span className="text-[10px] font-bold text-[#2dd4bf] uppercase tracking-widest">
                                Counseling Batch
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">
                            {formatBatchName(batch)}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {(batch.programId as any)?.name || "Program N/A"}
                        </p>
                    </div>
                    <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 border-indigo-100 dark:border-indigo-500/20 font-bold px-2 py-0.5 rounded-lg text-[10px] whitespace-nowrap">
                        {batch.currentSemester}th Semester
                    </Badge>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="h-8 w-8 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-[#2dd4bf]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Enrollment</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{batch.currentStudents || 0} Students</p>
                        </div>
                    </div>

                    {batch.classRepresentativeId ? (
                        <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10">
                            <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                <UserCog className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">Class Representative</p>
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[140px]">
                                    {(batch.classRepresentativeId as any).fullName || "Assigned"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-100/50 dark:border-amber-500/10">
                            <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                <UserCog className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60 dark:text-amber-400/60">Representative</p>
                                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 italic">Not Assigned</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl h-11 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => onManageCR(batch)}
                    >
                        Assist CR
                    </Button>
                    <Button
                        className="flex-[1.5] bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl h-11 font-bold uppercase text-xs tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2"
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
            </div>
        </GlassCard>
    );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700"
        >
            <div className="h-20 w-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
                <Icon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{message}</h3>
            <p className="text-slate-400 mt-1 font-medium text-sm">Try adjusting your filters</p>
        </motion.div>
    );
}
