"use client";

import { Layers, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleProposal } from "./types";
import { ProposalCard } from "./ProposalCard";

interface Props {
    proposals: ScheduleProposal[];
    isLoading: boolean;
    onApply: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ProposalsList({ proposals, isLoading, onApply, onDelete }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                        <Layers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Generated Proposals</h2>
                        <p className="text-sm text-slate-500">Review and apply generated schedules</p>
                    </div>
                </div>
                {proposals.length > 0 && (
                    <Badge className="bg-slate-100 text-slate-600 border-0 font-bold px-3 py-1">
                        {proposals.length} Proposal{proposals.length > 1 ? "s" : ""}
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
                        Generate your first schedule by selecting batches above and clicking &quot;Generate Schedule&quot;
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((proposal) => (
                        <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            onApply={onApply}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
