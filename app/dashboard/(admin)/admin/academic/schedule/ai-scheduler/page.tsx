"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Sparkles,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Layers,
    ArrowRight,
    Zap,
    Sun,
    Moon,
    Building2
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { sessionService } from "@/services/academic/session.service";
import { scheduleService } from "@/services/academic/schedule.service";
import { departmentService } from "@/services/academic/department.service";
import { Session, ScheduleProposal, Department } from "@/services/academic/types";
import Link from "next/link";

export default function AISchedulerPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [proposals, setProposals] = useState<ScheduleProposal[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadSessions();
        loadDepartments();
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            loadProposals(selectedSessionId);
        }
    }, [selectedSessionId]);

    const loadDepartments = async () => {
        try {
            const data = await departmentService.getAllDepartments();
            setDepartments(data);
        } catch (error) {
            notifyError("Failed to load departments");
        }
    };

    const loadSessions = async () => {
        try {
            const data = await sessionService.getAllSessions();
            setSessions(data);
            if (data.length > 0) {
                const active = data.find(s => s.status) || data[0];
                setSelectedSessionId(active.id);
            }
        } catch (error) {
            notifyError("Failed to load sessions");
        }
    };

    const loadProposals = async (sessionId: string) => {
        setIsLoading(true);
        try {
            const data = await scheduleService.getProposals(sessionId);
            setProposals(data);
        } catch (error) {
            notifyError("Failed to load proposals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedSessionId) return;
        setIsGenerating(true);
        try {
            const deptId = selectedDepartmentId === "all" ? undefined : selectedDepartmentId;
            await scheduleService.generateSchedule(selectedSessionId, deptId);
            notifySuccess("Schedule generated successfully!");
            loadProposals(selectedSessionId);
        } catch (error: any) {
            notifyError(error?.message || "Failed to generate schedule. Ensure data exists.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = async (proposalId: string) => {
        try {
            await scheduleService.applyProposal(proposalId);
            notifySuccess("Schedule applied/published successfully!");
            loadProposals(selectedSessionId);
        } catch (error) {
            notifyError("Failed to apply proposal");
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    text: 'text-emerald-600',
                    icon: CheckCircle,
                    label: 'APPLIED'
                };
            case 'rejected':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    text: 'text-red-600',
                    icon: AlertCircle,
                    label: 'REJECTED'
                };
            default:
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    text: 'text-amber-600',
                    icon: Clock,
                    label: 'PENDING'
                };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-purple-300/20 blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">AI Class Routine Generator</h1>
                                <p className="text-white/70 mt-1">
                                    Automatically generate optimized class schedules using Gemini AI
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Sun className="w-4 h-4 text-amber-300" />
                                <span className="text-sm font-medium">Day: 08:00 - 15:00</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Moon className="w-4 h-4 text-blue-300" />
                                <span className="text-sm font-medium">Evening: 15:30 - 21:00</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Zap className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-medium">Smart Conflict Detection</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Card */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden p-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-xl">
                                <Calendar className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Generate New Schedule</h3>
                                <p className="text-sm text-slate-500">Select session and department to generate AI-optimized routine</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="w-full lg:w-1/3 space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    Academic Session
                                </label>
                                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                        <SelectValue placeholder="Select session..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {sessions.map((session) => (
                                            <SelectItem key={session.id} value={session.id}>
                                                {session.name} ({session.year})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full lg:w-1/3 space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    Department (Optional)
                                </label>
                                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl max-h-[300px]">
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.shortName} - {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedSessionId || isGenerating}
                                className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-violet-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating Schedule...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Generate with AI
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Proposals Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <Layers className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Generated Proposals</h2>
                                <p className="text-sm text-slate-500">Review and apply AI-generated schedules</p>
                            </div>
                        </div>
                        {proposals.length > 0 && (
                            <Badge className="bg-slate-100 text-slate-600 border-0 font-bold px-3 py-1">
                                {proposals.length} Proposal{proposals.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative p-6 bg-white rounded-full shadow-xl">
                                    <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-slate-500 font-medium">Loading proposals...</p>
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-100 rounded-2xl mb-4">
                                <Sparkles className="w-10 h-10 text-violet-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">No Proposals Yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Generate your first AI-powered schedule by selecting a session above and clicking "Generate with AI"
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {proposals.map((proposal) => {
                                const statusConfig = getStatusConfig(proposal.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <Card
                                        key={proposal.id}
                                        className="group relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 bg-white rounded-2xl p-0"
                                    >
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${proposal.status === 'approved' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                                            proposal.status === 'rejected' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                                                'bg-gradient-to-b from-amber-400 to-amber-600'
                                            }`} />

                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/dashboard/admin/academic/schedule/ai-scheduler/proposals/${proposal.id}`}
                                                        className="font-bold text-lg text-slate-800 hover:text-violet-600 transition-colors block truncate"
                                                    >
                                                        Proposal #{proposal.id.substring(0, 8)}
                                                    </Link>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        {new Date(proposal.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-bold text-[10px] px-2 py-1`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {proposal.metadata?.itemCount || 0} Classes
                                                    </span>
                                                </div>
                                            </div>

                                            {proposal.status === 'pending' && (
                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/dashboard/admin/academic/schedule/ai-scheduler/proposals/${proposal.id}`}
                                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={() => handleApply(proposal.id)}
                                                        className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                                                    >
                                                        Apply
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {proposal.status === 'approved' && (
                                                <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-semibold">
                                                    <CheckCircle className="w-5 h-5" />
                                                    Active Schedule
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
