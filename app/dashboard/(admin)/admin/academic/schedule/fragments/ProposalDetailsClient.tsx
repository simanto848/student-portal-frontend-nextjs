"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ScheduleProposal } from "@/services/academic/types";
import { notifySuccess, notifyError } from "@/components/toast";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    Users,
    BookOpen,
    Sparkles,
    Loader2,
    ChevronDown,
    Layers,
    Sun,
    Moon,
    Zap,
    User2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchProposalById, applyProposal } from "../ai-scheduler/actions";

interface ProposalScheduleItem {
    batchName?: string;
    batchId?: string;
    batchShift?: string;
    daysOfWeek?: string[];
    startTime?: string;
    endTime?: string;
    courseName?: string;
    courseCode?: string;
    sessionCourseId?: string;
    roomName?: string;
    classroomId?: string;
    teacherName?: string;
    teacherId?: string;
    classType?: string;
}

const dayColors: Record<string, string> = {
    Saturday: "bg-violet-100 text-violet-700 border-violet-200",
    Sunday: "bg-blue-100 text-blue-700 border-blue-200",
    Monday: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Tuesday: "bg-amber-100 text-amber-700 border-amber-200",
    Wednesday: "bg-rose-100 text-rose-700 border-rose-200",
    Thursday: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Friday: "bg-gray-100 text-gray-700 border-gray-200",
};

interface ProposalDetailsClientProps {
    proposalId: string;
}

export default function ProposalDetailsClient({ proposalId }: ProposalDetailsClientProps) {
    const router = useRouter();
    const [proposal, setProposal] = useState<ScheduleProposal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (proposalId) {
            loadProposal(proposalId);
        }
    }, [proposalId]);

    const loadProposal = async (id: string) => {
        try {
            const data = await fetchProposalById(id);
            setProposal(data);
            if (data?.scheduleData) {
                const batches = new Set(data.scheduleData.map(item => item.batchName || item.batchId));
                const initialExpandState: Record<string, boolean> = {};
                batches.forEach(b => initialExpandState[b as string] = true);
                setExpandedBatches(initialExpandState);
            }
        } catch (error) {
            notifyError("Failed to load proposal details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!proposal) return;
        try {
            setIsApplying(true);
            await applyProposal(proposal.id);
            notifySuccess("Schedule applied successfully!");
            router.push('/dashboard/admin/academic/schedule/ai-scheduler');
        } catch (error) {
            notifyError("Failed to apply schedule");
        } finally {
            setIsApplying(false);
        }
    };

    const groupedSchedules = useMemo<Record<string, { items: ProposalScheduleItem[], shift: string }>>(() => {
        if (!proposal?.scheduleData) return {};

        return proposal.scheduleData.reduce((acc, item) => {
            const batchName = item.batchName || item.batchId || "Unassigned";
            if (!acc[batchName]) {
                acc[batchName] = {
                    items: [],
                    shift: item.batchShift || 'day'
                };
            }
            acc[batchName].items.push(item as ProposalScheduleItem);
            return acc;
        }, {} as Record<string, { items: ProposalScheduleItem[], shift: string }>);
    }, [proposal]);

    const toggleBatch = (batchName: string) => {
        setExpandedBatches(prev => ({
            ...prev,
            [batchName]: !prev[batchName]
        }));
    };

    // Calculate stats
    const stats = useMemo(() => {
        if (!proposal?.scheduleData) return { total: 0, dayShift: 0, eveningShift: 0, batches: 0 };

        const items = proposal.scheduleData as ProposalScheduleItem[];
        const dayShift = items.filter(i => {
            const hour = parseInt(i.startTime?.split(':')[0] || '0');
            return hour < 15;
        }).length;

        return {
            total: items.length,
            dayShift,
            eveningShift: items.length - dayShift,
            batches: Object.keys(groupedSchedules).length
        };
    }, [proposal, groupedSchedules]);

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div className="animate-pulse">
                    <div className="h-40 bg-gradient-to-r from-slate-200 to-slate-100 rounded-3xl mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <div className="h-8 bg-slate-100 rounded-xl w-48" />
                        <div className="h-64 bg-slate-50 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="p-6 bg-slate-100 rounded-3xl mb-6">
                    <Sparkles className="w-16 h-16 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Proposal Not Found</h2>
                <p className="text-slate-500 mb-6 max-w-md text-center">
                    The proposal you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button
                    onClick={() => router.back()}
                    className="bg-violet-600 hover:bg-violet-700 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const statusConfig = {
        pending: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: Clock, label: "Pending Review" },
        approved: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle2, label: "Applied" },
        rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: Clock, label: "Rejected" },
    };

    const currentStatus = statusConfig[proposal.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = currentStatus.icon;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-purple-300/20 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                                <Sparkles className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">AI Schedule Proposal</h1>
                                <p className="text-white/60 font-mono text-sm mt-1">
                                    ID: {proposal.id}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 rounded-xl"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        {proposal.status !== 'approved' && (
                            <Button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="bg-white text-violet-600 hover:bg-violet-50 rounded-xl font-bold shadow-lg"
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Apply Schedule
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={`${currentStatus.bg} ${currentStatus.border} border-2 rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] p-0`}>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${currentStatus.bg}`}>
                                <StatusIcon className={`w-5 h-5 ${currentStatus.text}`} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Status</p>
                                <p className={`font-bold ${currentStatus.text}`}>{currentStatus.label}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] p-0">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-violet-100">
                                <Layers className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Classes</p>
                                <p className="font-bold text-slate-800">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] p-0">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-100">
                                <Sun className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Day Shift</p>
                                <p className="font-bold text-slate-800">{stats.dayShift} classes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] p-0">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-100">
                                <Moon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Evening Shift</p>
                                <p className="font-bold text-slate-800">{stats.eveningShift} classes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Batch Schedules */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Batch Schedules</h2>
                            <p className="text-sm text-slate-500">{stats.batches} batches with assigned classes</p>
                        </div>
                    </div>
                </div>

                {Object.entries(groupedSchedules).map(([batchName, { items, shift }]) => (
                    <Card key={batchName} className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl p-0">
                        <button
                            onClick={() => toggleBatch(batchName)}
                            className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-violet-100 rounded-xl">
                                    <Users className="w-5 h-5 text-violet-600" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-lg text-slate-800">{batchName}</h4>
                                        <Badge className={`${shift === 'evening'
                                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                            : 'bg-amber-100 text-amber-700 border-amber-200'
                                            } border font-semibold text-[10px] px-2 py-0.5`}>
                                            {shift === 'evening' ? (
                                                <><Moon className="w-3 h-3 mr-1" /> Evening</>
                                            ) : (
                                                <><Sun className="w-3 h-3 mr-1" /> Day</>
                                            )}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-0.5">{items.length} classes scheduled</p>
                                </div>
                            </div>
                            <div className={`p-2 rounded-lg bg-white shadow-sm transform transition-transform duration-200 ${expandedBatches[batchName] ? 'rotate-180' : ''}`}>
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            </div>
                        </button>

                        {expandedBatches[batchName] && (
                            <div className="border-t border-slate-100">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Day & Time</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {items.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-violet-50/30 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {item.daysOfWeek?.map((day, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${dayColors[day] || dayColors.Saturday}`}
                                                                    >
                                                                        {day}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                                                                <Clock className="w-4 h-4 text-violet-500" />
                                                                {item.startTime} - {item.endTime}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-700 font-semibold block">{item.courseName || item.sessionCourseId}</span>
                                                                {item.classType && (
                                                                    <span className="text-xs text-slate-400">{item.classType}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                                                <User2 className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <span className="text-slate-600 font-medium">{item.teacherName || 'Not Assigned'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                                                                <MapPin className="w-4 h-4 text-emerald-600" />
                                                            </div>
                                                            <span className="text-slate-600 font-medium">{item.roomName || item.classroomId}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}

                {proposal.scheduleData.length === 0 && (
                    <div className="bg-slate-50 rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
                            <Zap className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No schedule items found in this proposal.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
