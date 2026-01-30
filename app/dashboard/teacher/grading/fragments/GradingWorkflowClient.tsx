"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    Search,
    Plus,
    RefreshCw,
    FileText,
    Clock,
    ArrowRight,
    GraduationCap,
    Info,
    Inbox,
    Target,
    AlertCircle,
    ShieldCheck,
    Send,
    Eye,
    Edit3,
    CheckCircle2,
    RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import OTPConfirmationDialog from "@/components/ui/OTPConfirmationDialog";
import { notifySuccess, notifyError } from "@/components/toast";

import { useGradingWorkflow } from "@/hooks/queries/useTeacherQueries";
import { ResultWorkflow, courseGradeService } from "@/services/enrollment/courseGrade.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { isTeacherUser } from "@/types/user";
import CommitteeReviewTab from "./CommitteeReviewTab";

type TabType = "all" | "pending" | "submitted" | "returned" | "approved" | "committee";

interface GradingWorkflowClientProps {
    initialWorkflows: ResultWorkflow[];
}

export default function GradingWorkflowClient({
    initialWorkflows
}: GradingWorkflowClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = useDashboardTheme();

    // Get initial tab from URL or default to "all"
    const initialTab = (searchParams.get('tab') as TabType) || "all";
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [searchQuery, setSearchQuery] = useState("");

    const accentPrimary = theme.colors.accent.primary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/10';

    const { user } = useAuth();
    const isCommitteeMember = user && isTeacherUser(user) && user.isExamCommitteeMember;

    // Update URL when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab as TabType);
        const url = new URL(window.location.href);
        if (tab === "all") {
            url.searchParams.delete('tab');
        } else {
            url.searchParams.set('tab', tab);
        }
        router.replace(url.pathname + url.search, { scroll: false });
    };

    // Map tab to backend status filter
    const statusFilter = useMemo(() => {
        switch (activeTab) {
            case "pending": return "pending";
            case "submitted": return "submitted_to_committee";
            case "returned": return "returned_to_teacher";
            case "approved": return "committee_approved";
            default: return undefined;
        }
    }, [activeTab]);

    // Always fetch all workflows - we filter client-side for proper tab functionality
    const {
        data: fetchedWorkflows = [],
        isLoading: isQueryLoading,
        isError,
        error,
        refetch,
    } = useGradingWorkflow(
        activeTab === "committee" ? undefined : undefined, // Always fetch all for teacher view
        { initialData: initialWorkflows }
    );

    const [workflows, setWorkflows] = useState<ResultWorkflow[]>([]);
    const [isEnriching, setIsEnriching] = useState(false);

    // Effect to enrich data when fetchedWorkflows changes
    // Effect to enrich data when fetchedWorkflows changes
    useEffect(() => {
        const enrich = async () => {
            if (!fetchedWorkflows.length) {
                setWorkflows([]);
                return;
            }

            setIsEnriching(true);
            const uniqueCourseIds = new Set<string>();
            const uniqueBatchIds = new Set<string>();

            fetchedWorkflows.forEach(w => {
                if (!w.grade?.course?.name && w.courseId) uniqueCourseIds.add(w.courseId);
                if (!w.grade?.batch?.name && !w.grade?.batch?.code && w.batchId) uniqueBatchIds.add(w.batchId);
            });

            // If nothing to enrich, just set
            if (uniqueCourseIds.size === 0 && uniqueBatchIds.size === 0) {
                setWorkflows(fetchedWorkflows);
                setIsEnriching(false);
                return;
            }

            try {
                // We use import() here or rely on imported services if top-level
                // Ideally imports are top-level. I will assume they are or will add them.
                const { courseService } = await import("@/services/academic/course.service");
                const { batchService } = await import("@/services/academic/batch.service");

                const coursePromises = Array.from(uniqueCourseIds).map(id =>
                    courseService.getCourseById(id).then(res => ({ id, data: res })).catch(() => ({ id, data: null }))
                );
                const batchPromises = Array.from(uniqueBatchIds).map(id =>
                    batchService.getBatchById(id).then(res => ({ id, data: res })).catch(() => ({ id, data: null }))
                );

                const [courses, batches] = await Promise.all([
                    Promise.all(coursePromises),
                    Promise.all(batchPromises)
                ]);

                const courseMap = courses.reduce((acc, curr) => {
                    if (curr.data) acc[curr.id] = curr.data;
                    return acc;
                }, {} as Record<string, any>);

                const batchMap = batches.reduce((acc, curr) => {
                    if (curr.data) acc[curr.id] = curr.data;
                    return acc;
                }, {} as Record<string, any>);

                const enriched = fetchedWorkflows.map(w => ({
                    ...w,
                    grade: {
                        ...w.grade,
                        course: w.grade?.course?.name ? w.grade.course : (courseMap[w.courseId] || w.grade?.course),
                        batch: (w.grade?.batch?.code || w.grade?.batch?.name) ? w.grade.batch : (batchMap[w.batchId] ? { ...batchMap[w.batchId], code: batchMap[w.batchId].name } : w.grade?.batch),
                        semester: w.semester
                    }
                }));
                const typedEnriched: any[] = enriched; // Temporary cast to fix type error during enrichment
                setWorkflows(typedEnriched as ResultWorkflow[]);
            } catch (err) {
                console.error("Enrichment failed", err);
                setWorkflows(fetchedWorkflows);
            } finally {
                setIsEnriching(false);
            }
        };

        enrich();
    }, [fetchedWorkflows]);

    const isLoading = isQueryLoading || isEnriching;

    // Filter workflows based on active tab status
    const filteredWorkflows = useMemo(() => {
        let list = [...workflows];

        // Apply status filter based on active tab
        if (activeTab !== "all" && activeTab !== "committee") {
            list = list.filter(w => {
                const status = w.status?.toUpperCase();
                switch (activeTab) {
                    case "pending":
                        // Pending = DRAFT or WITH_INSTRUCTOR (not yet submitted)
                        return status === 'DRAFT' || status === 'WITH_INSTRUCTOR' || status === 'PENDING';
                    case "submitted":
                        // In Review = SUBMITTED_TO_COMMITTEE
                        return status === 'SUBMITTED_TO_COMMITTEE';
                    case "returned":
                        // Returned = RETURNED_TO_TEACHER
                        return status === 'RETURNED_TO_TEACHER';
                    case "approved":
                        // Approved = COMMITTEE_APPROVED or PUBLISHED
                        return status === 'COMMITTEE_APPROVED' || status === 'PUBLISHED';
                    default:
                        return true;
                }
            });
        }

        // Apply search query filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(w =>
                w.grade?.course?.name?.toLowerCase().includes(q) ||
                w.grade?.course?.code?.toLowerCase().includes(q) ||
                w.actionBy?.toLowerCase().includes(q)
            );
        }

        return list.sort((a, b) =>
            new Date(b.updatedAt || b.actionAt || 0).getTime() - new Date(a.updatedAt || a.actionAt || 0).getTime()
        );
    }, [workflows, searchQuery, activeTab]);

    // Get empty state content based on active tab
    const getEmptyStateContent = () => {
        switch (activeTab) {
            case "pending":
                return {
                    icon: <Edit3 className="h-10 w-10 text-amber-400 dark:text-amber-500" />,
                    title: "No Pending Workflows",
                    description: "You have no courses with grades pending submission. Start by entering grades for your assigned courses.",
                    iconBg: "bg-amber-50 dark:bg-amber-900/20"
                };
            case "submitted":
                return {
                    icon: <Clock className="h-10 w-10 text-indigo-400 dark:text-indigo-500" />,
                    title: "No Courses In Review",
                    description: "No grades are currently awaiting committee review. Submit your completed grades for approval.",
                    iconBg: "bg-indigo-50 dark:bg-indigo-900/20"
                };
            case "returned":
                return {
                    icon: <RotateCcw className="h-10 w-10 text-rose-400 dark:text-rose-500" />,
                    title: "No Returned Workflows",
                    description: "Great! None of your submissions have been returned. Keep up the good work!",
                    iconBg: "bg-rose-50 dark:bg-rose-900/20"
                };
            case "approved":
                return {
                    icon: <CheckCircle2 className="h-10 w-10 text-emerald-400 dark:text-emerald-500" />,
                    title: "No Approved Results",
                    description: "No grades have been approved yet. Submitted grades will appear here once approved by the committee.",
                    iconBg: "bg-emerald-50 dark:bg-emerald-900/20"
                };
            default:
                return {
                    icon: <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-600" />,
                    title: "No Workflows Found",
                    description: searchQuery ? "No results match your search criteria." : "There are currently no grading workflows to display.",
                    iconBg: "bg-slate-50 dark:bg-slate-800"
                };
        }
    };

    const emptyState = getEmptyStateContent();

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 p-8 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/50">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-50/50 dark:bg-indigo-900/20 blur-3xl opacity-50" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-xl ${accentBgSubtle} ${accentPrimary}`}>
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentPrimary}`}>
                                Academic Governance
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Result<span className={accentPrimary}> Workflow</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-lg">
                            Track the progression of your submitted grades through the review and approval committee.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => router.push("/dashboard/teacher/courses")}
                            className={`h-14 px-8 ${accentPrimary.replace('text-', 'bg-')} hover:opacity-90 text-white shadow-xl shadow-indigo-600/20 rounded-2xl font-black uppercase text-xs tracking-[0.15em] w-full transition-all active:scale-95 flex items-center gap-3`}
                        >
                            <Plus className="h-5 w-5" />
                            Input New Grades
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            className="h-12 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Sync Status
                        </Button>
                    </div>
                </div>
            </div>

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold text-xs uppercase tracking-widest">
                        {error instanceof Error ? error.message : "Synchronization failed. Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 mb-6">
                    <TabsList className="h-14 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-full md:w-auto">
                        <TabsTrigger
                            value="all"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-lg active:scale-95"
                        >
                            Pending
                        </TabsTrigger>
                        <TabsTrigger
                            value="submitted"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-lg active:scale-95"
                        >
                            In Review
                        </TabsTrigger>
                        <TabsTrigger
                            value="returned"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-lg active:scale-95"
                        >
                            Returned
                        </TabsTrigger>
                        <TabsTrigger
                            value="approved"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-lg active:scale-95"
                        >
                            Approved
                        </TabsTrigger>
                        {isCommitteeMember && (
                            <TabsTrigger
                                value="committee"
                                className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 data-[state=active]:shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Committee
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {activeTab !== "committee" && (
                        <div className="relative flex-1 md:w-80 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Find course or instructor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl font-medium focus:ring-indigo-500/20"
                            />
                        </div>
                    )}
                </div>

                {/* Committee Review Tab Content */}
                {activeTab === "committee" && isCommitteeMember ? (
                    <CommitteeReviewTab />
                ) : (
                    <div className="space-y-4">
                        {/* Results Count Bar */}
                        {!isLoading && filteredWorkflows.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    Showing <span className="text-indigo-600 dark:text-indigo-400">{filteredWorkflows.length}</span> workflow{filteredWorkflows.length !== 1 ? 's' : ''}
                                </span>
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery("")}
                                        className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                        Clear search
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                                <RefreshCw className="h-10 w-10 text-indigo-400 dark:text-indigo-500 animate-spin mb-6" />
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                                    Loading Workflows...
                                </h3>
                                <p className="text-slate-400 dark:text-slate-500 font-medium">
                                    Fetching your grading workflow data
                                </p>
                            </div>
                        )}

                        {/* Workflow Cards Grid */}
                        {!isLoading && (
                            <div className="grid grid-cols-1 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredWorkflows.length > 0 ? (
                                        filteredWorkflows.map((workflow, idx) => (
                                            <WorkflowCard
                                                key={workflow.id || workflow._id || `workflow-${idx}`}
                                                workflow={workflow}
                                                index={idx}
                                                themeAccent={accentPrimary}
                                                onRefresh={refetch}
                                            />
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700"
                                        >
                                            <div className={`h-24 w-24 rounded-[2.5rem] ${emptyState.iconBg} flex items-center justify-center mb-6`}>
                                                {emptyState.icon}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2 text-center px-6">
                                                {emptyState.title}
                                            </h3>
                                            <p className="text-slate-400 dark:text-slate-500 font-medium text-center px-6 max-w-sm mb-8">
                                                {emptyState.description}
                                            </p>
                                            {(activeTab === "pending" || activeTab === "all") && (
                                                <Button
                                                    onClick={() => router.push("/dashboard/teacher/courses")}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Go to My Courses
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </Tabs>
        </div>
    );
}

interface WorkflowCardProps {
    workflow: ResultWorkflow;
    index: number;
    themeAccent: string;
    onRefresh: () => void;
}

function WorkflowCard({
    workflow,
    index,
    themeAccent,
    onRefresh
}: WorkflowCardProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);

    const courseName = workflow.grade?.course?.name || workflow.grade?.course?.title || "Unknown Course";
    const courseCode = workflow.grade?.course?.code || "";
    const batchCode = workflow.grade?.batch?.code || workflow.grade?.batch?.name || "";
    const status = workflow.status;
    const courseId = workflow.courseId || workflow.grade?.course?.id || workflow.grade?.course?._id;
    const batchId = workflow.batchId || workflow.grade?.batch?.id || workflow.grade?.batch?._id;
    const semester = workflow.semester || workflow.grade?.semester;

    // Get status-specific styling
    const getStatusStyles = () => {
        switch (status) {
            case 'DRAFT':
            case 'WITH_INSTRUCTOR':
                return {
                    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
                    iconColor: 'text-amber-500 dark:text-amber-400',
                    borderHover: 'hover:border-amber-200 dark:hover:border-amber-800'
                };
            case 'SUBMITTED_TO_COMMITTEE':
                return {
                    iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
                    iconColor: 'text-indigo-500 dark:text-indigo-400',
                    borderHover: 'hover:border-indigo-200 dark:hover:border-indigo-800'
                };
            case 'RETURNED_TO_TEACHER':
                return {
                    iconBg: 'bg-rose-50 dark:bg-rose-900/20',
                    iconColor: 'text-rose-500 dark:text-rose-400',
                    borderHover: 'hover:border-rose-200 dark:hover:border-rose-800'
                };
            case 'COMMITTEE_APPROVED':
                return {
                    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
                    iconColor: 'text-emerald-500 dark:text-emerald-400',
                    borderHover: 'hover:border-emerald-200 dark:hover:border-emerald-800'
                };
            case 'PUBLISHED':
                return {
                    iconBg: 'bg-sky-50 dark:bg-sky-900/20',
                    iconColor: 'text-sky-500 dark:text-sky-400',
                    borderHover: 'hover:border-sky-200 dark:hover:border-sky-800'
                };
            default:
                return {
                    iconBg: 'bg-slate-50 dark:bg-slate-800',
                    iconColor: 'text-slate-400 dark:text-slate-500',
                    borderHover: 'hover:border-indigo-100 dark:hover:border-indigo-900'
                };
        }
    };

    const styles = getStatusStyles();

    // Handle submit to committee
    const handleSubmitToCommittee = async (otp: string) => {
        if (!courseId || !batchId || !semester) {
            notifyError("Missing course information");
            return;
        }

        setIsSubmitting(true);
        try {
            await courseGradeService.submitToCommittee({
                courseId: String(courseId),
                batchId: String(batchId),
                semester: Number(semester)
            });
            notifySuccess("Successfully submitted to Exam Committee");
            setOtpDialogOpen(false);
            onRefresh();
        } catch (error: any) {
            notifyError(error?.message || "Failed to submit to committee");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Navigate to course detail (grading tab)
    const goToGradingPage = () => {
        // Find the assignment ID for this course
        router.push(`/dashboard/teacher/courses?search=${courseCode}`);
    };

    // Get action buttons based on status
    const renderActions = () => {
        const canSubmit = status === 'DRAFT' || status === 'RETURNED_TO_TEACHER' || status === 'WITH_INSTRUCTOR';
        const isInReview = status === 'SUBMITTED_TO_COMMITTEE';
        const isApproved = status === 'COMMITTEE_APPROVED';
        const isPublished = status === 'PUBLISHED';

        return (
            <TooltipProvider>
                <div className="flex items-center gap-2">
                    {/* Edit/Enter Marks - only for pending/returned */}
                    {canSubmit && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={goToGradingPage}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-colors"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Marks</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Submit to Committee - only for pending/returned */}
                    {canSubmit && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => setOtpDialogOpen(true)}
                                    variant="ghost"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Submit to Committee</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* View Status - for in review */}
                    {isInReview && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={goToGradingPage}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                                >
                                    <Clock className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Awaiting Committee Review</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* View Details - for approved/published */}
                    {(isApproved || isPublished) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={goToGradingPage}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View Details</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Arrow to navigate */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={goToGradingPage}
                                variant="ghost"
                                className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Go to Course</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        );
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
            >
                <Card className={`group relative overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300 rounded-4xl border-slate-200/60 dark:border-slate-700/60 ${styles.borderHover} p-0`}>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`p-4 rounded-2xl ${styles.iconBg} ${styles.iconColor} group-hover:scale-110 transition-all duration-300`}>
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                            {courseName}
                                        </h3>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg">
                                            {courseCode}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
                                        <GraduationCap className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <span>Batch {batchCode}</span>
                                        <span className="mx-1">•</span>
                                        <span>Semester {semester}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <Info className="h-3 w-3" />
                                            Last Action: <span className="text-slate-600 dark:text-slate-300">{workflow.actionBy || "System"}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Target className="h-3 w-3" />
                                            {workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</span>
                                    <StatusBadge status={status} size="lg" pill />
                                </div>

                                {renderActions()}
                            </div>
                        </div>

                        {/* Comments/Return Reason */}
                        {workflow.comments && (
                            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100/50 dark:border-rose-800/50">
                                <div className="flex items-start gap-2">
                                    <RotateCcw className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Return Comment:</p>
                                        <p className="text-xs text-rose-600/80 dark:text-rose-300 italic leading-relaxed">
                                            &quot;{workflow.comments}&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* OTP Dialog for Submit */}
            <OTPConfirmationDialog
                isOpen={otpDialogOpen}
                onClose={() => setOtpDialogOpen(false)}
                onConfirm={handleSubmitToCommittee}
                purpose="result_submission"
                title="Submit to Exam Committee"
                description={`You are about to submit the grades for ${courseName} (${courseCode}) to the Exam Committee for review. This action requires OTP verification.`}
            />
        </>
    );
}
