"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    Search,
    Plus,
    RefreshCw,
    FileText,
    MessageSquare,
    Clock,
    AlertTriangle,
    ChevronRight,
    Filter,
    ArrowRight,
    GraduationCap,
    Info,
    Inbox,
    Target,
    Zap,
    Sparkles,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/StatusBadge";

import { useGradingWorkflowDashboard } from "@/hooks/queries/useTeacherQueries";
import { ResultWorkflow } from "@/services/enrollment/courseGrade.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

type TabType = "all" | "pending" | "submitted" | "returned" | "approved";

interface GradingWorkflowClientProps {
    initialWorkflows: ResultWorkflow[];
}

export default function GradingWorkflowClient({
    initialWorkflows
}: GradingWorkflowClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterByCourse, setFilterByCourse] = useState<string>("all");

    const accentPrimary = theme.colors.accent.primary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/10';

    const {
        all,
        pending,
        submitted,
        returned,
        approved,
        isLoading,
        isError,
        error,
        refetch,
    } = useGradingWorkflowDashboard(undefined, {
        initialData: initialWorkflows
    });

    const workflows = useMemo(() => {
        switch (activeTab) {
            case "pending": return pending;
            case "submitted": return submitted;
            case "returned": return returned;
            case "approved": return approved;
            default: return all;
        }
    }, [activeTab, all, pending, submitted, returned, approved]);

    const filteredWorkflows = useMemo(() => {
        let list = [...workflows];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(w =>
                w.grade?.course?.name?.toLowerCase().includes(q) ||
                w.grade?.course?.code?.toLowerCase().includes(q) ||
                w.actionBy?.toLowerCase().includes(q)
            );
        }
        return list.sort((a, b) =>
            new Date(b.actionAt || 0).getTime() - new Date(a.actionAt || 0).getTime()
        );
    }, [workflows, searchQuery]);

    const stats = [
        { label: 'Total', value: all.length, icon: ClipboardList, color: 'text-slate-500', bg: 'bg-slate-50' },
        { label: 'Pending', value: pending.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Submitted', value: submitted.length, icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Returned', value: returned.length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Approved', value: approved.length, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-2xl shadow-indigo-500/5">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl opacity-50" />

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
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Result<span className={accentPrimary}> Workflow</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg">
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
                            className="h-12 border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Sync Status
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-10">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`${stat.bg} rounded-2xl p-4 border border-white shadow-sm flex flex-col gap-1`}
                        >
                            <div className="flex items-center justify-between">
                                <stat.icon className={`h-4 w-4 ${stat.color} opacity-60`} />
                                <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">{stat.label}</span>
                        </motion.div>
                    ))}
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

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 mb-6">
                    <TabsList className="h-14 p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/50 w-full md:w-auto">
                        <TabsTrigger
                            value="all"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg active:scale-95"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="pending"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg active:scale-95"
                        >
                            Pending
                        </TabsTrigger>
                        <TabsTrigger
                            value="submitted"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg active:scale-95"
                        >
                            In Review
                        </TabsTrigger>
                        <TabsTrigger
                            value="returned"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-lg active:scale-95"
                        >
                            Returned
                        </TabsTrigger>
                        <TabsTrigger
                            value="approved"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg active:scale-95"
                        >
                            Approved
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative flex-1 md:w-80 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Find course or instructor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 pl-12 pr-4 bg-white border-slate-200 rounded-2xl font-medium focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredWorkflows.length > 0 ? (
                            filteredWorkflows.map((workflow, idx) => (
                                <WorkflowCard
                                    key={workflow.id}
                                    workflow={workflow}
                                    index={idx}
                                    themeAccent={accentPrimary}
                                />
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-6">
                                    <Inbox className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 text-center px-6">
                                    No Workflows Found
                                </h3>
                                <p className="text-slate-400 font-medium text-center px-6 max-w-sm mb-8">
                                    {searchQuery ? "No results match your search criteria." : "There are currently no grading workflows to display in this category."}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </Tabs>
        </div>
    );
}

function WorkflowCard({
    workflow,
    index,
    themeAccent
}: {
    workflow: ResultWorkflow;
    index: number;
    themeAccent: string;
}) {
    const router = useRouter();
    const courseName = workflow.grade?.course?.name || "Unknown Course";
    const courseCode = workflow.grade?.course?.code || "";
    const batchCode = workflow.grade?.batch?.code || workflow.grade?.batch?.name || "";
    const status = workflow.status;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
        >
            <Card className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 rounded-[2rem] border-slate-200/60 hover:border-indigo-100 p-0">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:scale-110 transition-all duration-300`}>
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-lg font-black tracking-tight text-slate-900">
                                        {courseName}
                                    </h3>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-100 bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg">
                                        {courseCode}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-4">
                                    <GraduationCap className="h-4 w-4 text-slate-400" />
                                    <span>Batch {batchCode}</span>
                                    <span className="mx-1">•</span>
                                    <span>Semester {workflow.grade?.semester}</span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Info className="h-3 w-3" />
                                        Last Action By: <span className="text-slate-600">{workflow.actionBy || "System"}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Target className="h-3 w-3" />
                                        {workflow.actionAt ? new Date(workflow.actionAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : "Pending"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Status</span>
                                <StatusBadge status={status} size="lg" pill />
                            </div>

                            <Button
                                onClick={() => router.push(`/dashboard/teacher/courses/${workflow.grade?.courseId}`)}
                                variant="ghost"
                                className="h-12 w-12 rounded-2xl flex items-center justify-center hover:bg-slate-100 p-0 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {workflow.comments && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-500 italic leading-relaxed">
                                    "{workflow.comments}"
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

