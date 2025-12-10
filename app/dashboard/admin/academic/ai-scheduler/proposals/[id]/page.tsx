"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { scheduleService } from "@/services/academic/schedule.service";
import { ScheduleProposal } from "@/services/academic/types";
import { toast } from "sonner";

export default function ProposalDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [proposal, setProposal] = useState<ScheduleProposal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (id) {
            loadProposal(id as string);
        }
    }, [id]);

    const loadProposal = async (proposalId: string) => {
        try {
            const data = await scheduleService.getProposalById(proposalId);
            setProposal(data);
        } catch (error) {
            toast.error("Failed to load proposal details");
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
            toast.success("Schedule applied successfully!");
            router.push('/dashboard/admin/academic/ai-scheduler');
        } catch (error) {
            toast.error("Failed to apply schedule");
            console.error(error);
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading proposal details...</div>;
    }

    if (!proposal) {
        return <div className="p-8 text-center text-red-500">Proposal not found</div>;
    }

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Proposal Details</h1>
                        <p className="text-gray-500 text-sm">ID: {proposal.id}</p>
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            Back
                        </button>
                        {proposal.status !== 'approved' && (
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {isApplying ? 'Applying...' : 'Apply Schedule'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border col-span-1">
                        <h3 className="font-semibold mb-4">Metadata</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${proposal.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {proposal.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Generated At</span>
                                <span>{new Date(proposal.metadata.generatedAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Classes</span>
                                <span>{proposal.metadata.itemCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border col-span-1 md:col-span-2">
                        <h3 className="font-semibold mb-4">Schedule Preview</h3>
                        <div className="overflow-auto max-h-[600px]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day & Time</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {proposal.scheduleData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <div className="font-medium text-gray-900">{item.daysOfWeek?.join(", ")}</div>
                                                <div className="text-gray-500">{item.startTime} - {item.endTime}</div>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                <div className="text-gray-900 font-medium">Batch: {item.batchName || item.batchId}</div>
                                                <div className="text-gray-500">Course: {item.courseName || item.sessionCourseId}</div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {item.roomName || item.classroomId}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
