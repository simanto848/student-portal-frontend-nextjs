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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DashboardSkeleton } from "@/components/dashboard/shared";
import { BatchCommunicationCard } from "@/components/dashboard/communication/BatchCommunicationCard";
import { CRManagementDialog } from "@/components/dashboard/communication/CRManagementDialog";

import { useAuth } from "@/contexts/AuthContext";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { batchCourseInstructorService } from "@/services/enrollment/batchCourseInstructor.service";
import { batchService } from "@/services/academic/batch.service";
import { chatService } from "@/services/communication/chat.service";
import { Batch } from "@/services/academic/types";
import { BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";

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
    const theme = useDashboardTheme();
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

    if (isLoading) {
        return <DashboardSkeleton layout="hero-cards" cardCount={6} withLayout={false} />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Communication Hub"
                subtitle="Manage course chats and batch communications"
                icon={MessageSquare}
                extraActions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { refetchCourses(); refetchBatches(); }}
                        className={`hidden sm:flex items-center gap-2 border-slate-200 text-slate-600 hover:${theme.colors.accent.primary} hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/5 rounded-xl transition-all`}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                }
            />

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">
                        Failed to load communication groups. Please try again.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:max-w-md group">
                    <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:${theme.colors.accent.primary} transition-colors`} />
                    <Input
                        placeholder="Search groups or batches..."
                        className={`pl-10 h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="courses" className="w-full">
                <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
                    <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 inline-flex min-w-max">
                        <TabsTrigger
                            value="courses"
                            className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}
                        >
                            My Courses ({filteredCourses.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="batches"
                            className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}
                        >
                            My Batches ({filteredBatches.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="courses" key="courses" className="mt-0 focus-visible:outline-none">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => (
                                    <CourseChatCard
                                        key={course.id}
                                        course={course}
                                        theme={theme}
                                        onEnterChat={() => handleEnterCourseChat(course)}
                                        isEntering={enteringChat === course.id}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    icon={MessageCircle}
                                    message={searchQuery ? "No matching courses found" : "No courses assigned currently"}
                                    theme={theme}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="batches" key="batches" className="mt-0 focus-visible:outline-none">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredBatches.length > 0 ? (
                                filteredBatches.map((batch) => (
                                    <BatchCommunicationCard
                                        key={batch.id}
                                        batch={batch}
                                        onOpenChat={handleEnterBatchChat}
                                        onManageCR={openManageCR}
                                        enteringChat={enteringChat === batch.id}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    icon={Users}
                                    message={searchQuery ? "No matching batches found" : "You are not a counselor for any batches"}
                                    theme={theme}
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

function CourseChatCard({ course, onEnterChat, isEntering, theme }: { course: BatchCourseInstructor, onEnterChat: () => void, isEntering: boolean, theme: any }) {
    const accentPrimary = theme.colors.accent.primary;
    const accentSecondary = theme.colors.accent.secondary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/5';

    return (
        <Card className={`group flex flex-col bg-white border-slate-200/60 shadow-sm hover:shadow-xl hover:${accentPrimary.replace('text-', 'border-')}/20 transition-all duration-300 overflow-hidden rounded-[2rem] p-0`}>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <Badge variant="outline" className={`${accentBgSubtle} ${accentPrimary} border-indigo-100 font-black px-2.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider`}>
                            {course.course?.code || "N/A"}
                        </Badge>
                        <CardTitle className={`text-lg font-black text-slate-800 leading-tight line-clamp-2 group-hover:${accentPrimary} transition-colors`}>
                            {course.course?.name || "Unknown Course"}
                        </CardTitle>
                    </div>
                    <div className={`p-3 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:${accentSecondary} transition-colors`}>
                        <MessageCircle className={`h-5 w-5 ${accentPrimary} group-hover:text-white`} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-xl ${accentBgSubtle} flex items-center justify-center`}>
                                <Users className={`h-4 w-4 ${accentPrimary}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch</p>
                                <p className="text-sm font-bold text-slate-900">{formatBatchName(course.batch)}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-white text-slate-500 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            Sem {course.semester || "—"}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 px-1">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                    <Users className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                            {course.batch?.currentStudents || "0"} Students Induced
                        </span>
                    </div>
                </div>

                <Button
                    className={`nav-btn-shine w-full mt-6 ${accentSecondary} hover:opacity-90 text-white shadow-lg shadow-indigo-600/10 rounded-2xl h-12 font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2`}
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
            </CardContent>
        </Card>
    );
}

function EmptyState({ icon: Icon, message, theme }: { icon: any, message: string, theme: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200"
        >
            <div className="h-20 w-20 bg-slate-50 flex items-center justify-center rounded-[2rem] mb-6">
                <Icon className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">{message}</h3>
            <p className="text-slate-400 mt-1 font-bold text-sm uppercase tracking-wider">Try adjusting your filters</p>
        </motion.div>
    );
}
