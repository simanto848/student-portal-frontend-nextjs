"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { scheduleService } from "@/services/academic/schedule.service";
import { ScheduleProposal } from "@/services/academic/types";
import { notifySuccess, notifyError } from "@/components/toast";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Calendar,
    MapPin,
    Users,
    BookOpen,
    Sparkles,
    Loader2,
    ChevronDown,
    ChevronRight,
    Layers
} from "lucide-react";

interface ProposalScheduleItem {
    batchName?: string;
    batchId?: string;
    daysOfWeek?: string[];
    startTime?: string;
    endTime?: string;
    courseName?: string;
    sessionCourseId?: string;
    roomName?: string;
    classroomId?: string;
}


const dayColors: Record<string, string> = {
    Monday: "bg-blue-100 text-blue-700 border-blue-200",
    Tuesday: "bg-purple-100 text-purple-700 border-purple-200",
    Wednesday: "bg-amber-100 text-amber-700 border-amber-200",
    Thursday: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Friday: "bg-rose-100 text-rose-700 border-rose-200",
    Saturday: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Sunday: "bg-gray-100 text-gray-700 border-gray-200",
};

function LoadingSkeleton() {
    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-gray-200 h-48 rounded-xl"></div>
                    <div className="bg-gray-200 h-96 rounded-xl col-span-2"></div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function ProposalDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [proposal, setProposal] = useState<ScheduleProposal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (id) {
            loadProposal(id as string);
        }
    }, [id]);

    const loadProposal = async (proposalId: string) => {
        try {
            const data = await scheduleService.getProposalById(proposalId);
            setProposal(data);
            if (data?.scheduleData) {
                const batches = new Set(data.scheduleData.map(item => item.batchName || item.batchId));
                const initialExpandState: Record<string, boolean> = {};
                batches.forEach(b => initialExpandState[b] = true);
                setExpandedBatches(initialExpandState);
            }
        } catch (error) {
            notifyError("Failed to load proposal details");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!proposal) return;
        try {
            setIsApplying(true);
            await scheduleService.applyProposal(proposal.id);
            notifySuccess("Schedule applied successfully!");
            router.push('/dashboard/staff/program-controller/schedules/ai-scheduler');
        } catch (error) {
            notifyError("Failed to apply schedule");
            console.error(error);
        } finally {
            setIsApplying(false);
        }
    };

    const groupedSchedules = useMemo<Record<string, ProposalScheduleItem[]>>(() => {
        if (!proposal?.scheduleData) return {};

        return proposal.scheduleData.reduce((acc, item) => {
            const batchName = item.batchName || item.batchId || "Unassigned";
            if (!acc[batchName]) {
                acc[batchName] = [];
            }
            acc[batchName].push(item as ProposalScheduleItem);
            return acc;
        }, {} as Record<string, ProposalScheduleItem[]>);
    }, [proposal]);

    const toggleBatch = (batchName: string) => {
        setExpandedBatches(prev => ({
            ...prev,
            [batchName]: !prev[batchName]
        }));
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!proposal) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Proposal Not Found</h2>
                    <p className="text-gray-500 mb-6">The proposal you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => router.push('/dashboard/staff/program-controller/schedules/ai-scheduler')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const statusConfig = {
        pending: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: Clock },
        approved: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
        rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: Clock },
    };

    const currentStatus = statusConfig[proposal.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = currentStatus.icon;

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h1 className="text-3xl font-bold">AI Schedule Proposal</h1>
                            </div>
                            <p className="text-white/80 text-sm font-mono">ID: {proposal.id}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/dashboard/staff/program-controller/schedules/ai-scheduler')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            {proposal.status !== 'approved' && (
                                <button
                                    onClick={handleApply}
                                    disabled={isApplying}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isApplying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Applying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Apply Schedule
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`${currentStatus.bg} ${currentStatus.border} border rounded-xl p-5 transition-transform hover:scale-[1.02]`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${currentStatus.bg}`}>
                                <StatusIcon className={`w-5 h-5 ${currentStatus.text}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className={`font-semibold ${currentStatus.text} uppercase`}>{proposal.status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Generated</p>
                                <p className="font-semibold text-gray-800">{new Date(proposal.metadata.generatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-50">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Classes</p>
                                <p className="font-semibold text-gray-800">{proposal.metadata.itemCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50">
                                <Layers className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Batches</p>
                                <p className="font-semibold text-gray-800">{Object.keys(groupedSchedules).length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grouped Schedule Tables */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">Batch Schedules</h3>
                        <div className="text-sm text-gray-500">
                            {Object.keys(groupedSchedules).length} Batches Found
                        </div>
                    </div>

                    {Object.entries(groupedSchedules).map(([batchName, items]) => (
                        <div key={batchName} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                            <button
                                onClick={() => toggleBatch(batchName)}
                                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-semibold text-gray-900">{batchName}</h4>
                                        <p className="text-sm text-gray-500">{items.length} classes scheduled</p>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-200 ${expandedBatches[batchName] ? 'rotate-180' : ''}`}>
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                </div>
                            </button>

                            {expandedBatches[batchName] && (
                                <div className="border-t border-gray-100">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-white">
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Day & Time</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {items.map((item, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-indigo-50/20 transition-colors duration-150"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {item.daysOfWeek?.map((day, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${dayColors[day] || dayColors.Monday}`}
                                                                        >
                                                                            {day}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {item.startTime} - {item.endTime}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                                                                    <BookOpen className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                                <span className="text-gray-700 font-medium">{item.courseName || item.sessionCourseId}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0">
                                                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                                                </div>
                                                                <span className="text-gray-600 font-medium">{item.roomName || item.classroomId}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {proposal.scheduleData.length === 0 && (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-gray-500">No schedule items found in this proposal.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
