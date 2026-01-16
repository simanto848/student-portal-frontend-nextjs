"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Clock,
    AlertCircle,
    Calendar as CalendarIcon,
    FileText,
    Users,
    ArrowRight
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatCard } from "@/components/dashboard/widgets/StatCard";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { academicService } from "@/services/academic.service";
import { notifyError } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ExamControllerDashboard() {
    const router = useRouter();
    const theme = useDashboardTheme();

    // State
    const [stats, setStats] = useState({
        activeExams: 0,
        pendingResults: 0,
        totalBatches: 0,
        issuesReported: 0 // Placeholder for now
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [schedulesData, workflowsData, batchesData] = await Promise.all([
                    enrollmentService.getExamSchedules(),
                    enrollmentService.getResultWorkflows(),
                    academicService.getAllBatches()
                ]);

                // 1. Calculate Active Exams (Scheduled for today or future)
                const now = new Date();
                const activeExamsCount = (schedulesData || []).filter((s: any) =>
                    s.date && new Date(s.date) >= new Date(now.setHours(0, 0, 0, 0))
                ).length;

                // 2. Calculate Pending Results (Status not published)
                const pendingResultsCount = (workflowsData || []).filter((w: any) =>
                    w.currentStep !== "PUBLISHED"
                ).length;

                // 3. Total Batches
                const totalBatchesCount = (batchesData || []).length;

                setStats({
                    activeExams: activeExamsCount,
                    pendingResults: pendingResultsCount,
                    totalBatches: totalBatchesCount,
                    issuesReported: 0
                });

                // 4. Synthesize Recent Activity (Combine schedules and workflows, sort by updatedAt or date)
                const activityItems = [
                    ...(schedulesData || []).map((s: any) => ({
                        type: 'schedule',
                        title: `Exam: ${s.examType}`,
                        subtitle: `${format(new Date(s.date), "MMM dd")} - Batch: ${s.batchId}`, // Ideally map batch name
                        date: s.updatedAt || s.createdAt,
                        id: s.id || s._id
                    })),
                    ...(workflowsData || []).map((w: any) => ({
                        type: 'result',
                        title: `Result: ${w.status}`,
                        subtitle: `Updated status`,
                        date: w.updatedAt || w.createdAt,
                        id: w.id || w._id
                    }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5);

                setRecentActivity(activityItems);

            } catch (error) {
                console.error("Dashboard data fetch error:", error);
                notifyError("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container px-6 py-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Exam Controller Dashboard"
                subtitle="Manage schedules, results, and exam operations."
                icon={LayoutDashboard}
            />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Exams"
                    value={isLoading ? "..." : stats.activeExams.toString()}
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                    icon={<CalendarIcon className="h-4 w-4 text-violet-500" />}
                />
                <StatCard
                    title="Results Pending"
                    value={isLoading ? "..." : stats.pendingResults.toString()}
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                    icon={<FileText className="h-4 w-4 text-amber-500" />}
                />
                <StatCard
                    title="Total Batches"
                    value={isLoading ? "..." : stats.totalBatches.toString()}
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                />
                <StatCard
                    title="Issues Reported"
                    value={isLoading ? "..." : stats.issuesReported.toString()}
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                    icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Manage Schedules */}
                        <GlassCard className="p-6 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group" onClick={() => router.push('/dashboard/staff/exam-controller/exam-schedules')}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${theme.colors.sidebar.iconBg}`}>
                                    <CalendarIcon className={`h-6 w-6 ${theme.colors.accent.primary}`} />
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                            </div>
                            <h4 className="text-lg font-bold mb-2">Exam Schedules</h4>
                            <p className="text-muted-foreground text-sm mb-4">Create, edit, and manage exam routines and room allocations.</p>
                            <div className="text-xs font-medium text-violet-600">View Schedules &rarr;</div>
                        </GlassCard>

                        {/* Result Management */}
                        <GlassCard className="p-6 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group" onClick={() => router.push('/dashboard/staff/exam-controller/results')}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-amber-50`}>
                                    <FileText className={`h-6 w-6 text-amber-600`} />
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                            <h4 className="text-lg font-bold mb-2">Results Management</h4>
                            <p className="text-muted-foreground text-sm mb-4">Review submitted grades, approve results, and publish to students.</p>
                            <div className="text-xs font-medium text-amber-600">Manage Results &rarr;</div>
                        </GlassCard>
                    </div>
                </div>

                {/* Right Sidebar - Recent Activity */}
                <div className="space-y-6">
                    <GlassCard className="p-4 h-full">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-violet-500" />
                            Recent Activity
                        </h3>
                        {isLoading ? (
                            <div className="text-sm text-muted-foreground">Loading activity...</div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No recent activity found.</div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start pb-3 border-b last:border-0 border-slate-100">
                                        <div className={`h-2 w-2 mt-2 rounded-full shrink-0 ${item.type === 'schedule' ? 'bg-violet-400' : 'bg-amber-400'}`} />
                                        <div>
                                            <p className="text-sm font-medium">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {item.date ? format(new Date(item.date), "MMM d, h:mm a") : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
