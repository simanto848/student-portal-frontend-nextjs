"use client";

import Link from "next/link";
import { CheckCircle, Clock, AlertCircle, Layers, Sparkles, Loader2, AlertTriangle, ArrowRight, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleProposal } from "./types";

interface Props {
    proposal: ScheduleProposal;
    onApply: (id: string) => void;
    onDelete: (id: string) => void;
}

function getStatusConfig(status: string) {
    switch (status) {
        case "approved":
            return {
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                text: "text-emerald-600",
                icon: CheckCircle,
                label: "APPLIED",
            };
        case "rejected":
            return {
                bg: "bg-red-500/10",
                border: "border-red-500/20",
                text: "text-red-600",
                icon: AlertCircle,
                label: "REJECTED",
            };
        default:
            return {
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                text: "text-amber-600",
                icon: Clock,
                label: "PENDING",
            };
    }
}

export function ProposalCard({ proposal, onApply, onDelete }: Props) {
    const statusConfig = getStatusConfig(proposal.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Card className="group relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 bg-white rounded-2xl p-0">
            <div
                className={`absolute top-0 left-0 w-1.5 h-full ${proposal.status === "approved"
                        ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
                        : proposal.status === "rejected"
                            ? "bg-gradient-to-b from-red-400 to-red-600"
                            : "bg-gradient-to-b from-amber-400 to-amber-600"
                    }`}
            />

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
                            {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                    <Badge
                        className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-bold text-[10px] px-2 py-1`}
                    >
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
                    {(proposal.metadata?.unscheduledCount ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-medium">
                                {proposal.metadata?.unscheduledCount ?? 0} failed
                            </span>
                        </div>
                    )}
                </div>

                {proposal.status === "pending" && (
                    <div className="flex gap-3">
                        <Link
                            href={`/dashboard/admin/academic/schedule/ai-scheduler/proposals/${proposal.id}`}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                        >
                            View Details
                        </Link>
                        <button
                            onClick={() => onApply(proposal.id)}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                        >
                            Apply
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {proposal.status === "approved" && (
                    <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Active Schedule
                    </div>
                )}

                {proposal.status === "pending" && (
                    <button
                        onClick={() => onDelete(proposal.id)}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Proposal
                    </button>
                )}
            </CardContent>
        </Card>
    );
}
