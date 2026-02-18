"use client";

import { Calendar, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleStatusSummary } from "./types";

interface Props {
    scheduleStatus: ScheduleStatusSummary;
    selectedBatchIds: string[];
    selectedSessionId: string;
    isClosingSchedules: boolean;
    onCloseSelected: () => void;
    onCloseSession: () => void;
}

export function ScheduleStatusBar({
    scheduleStatus,
    selectedBatchIds,
    selectedSessionId,
    isClosingSchedules,
    onCloseSelected,
    onCloseSession,
}: Props) {
    return (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-800">Schedule Status</h4>
                </div>
                <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">{scheduleStatus.active} Active</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-slate-600">{scheduleStatus.closed} Closed</span>
                    </span>
                </div>
            </div>

            <p className="text-sm text-amber-700">
                Close schedules before generating new ones to avoid classroom conflicts. Closed schedules won&apos;t
                interfere with new schedule generation.
            </p>

            <div className="flex gap-2">
                <Button
                    onClick={onCloseSelected}
                    disabled={selectedBatchIds.length === 0 || isClosingSchedules}
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                    {isClosingSchedules ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Close Selected Batch Schedules
                </Button>
                <Button
                    onClick={onCloseSession}
                    disabled={!selectedSessionId || isClosingSchedules}
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                    {isClosingSchedules ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Close All Session Schedules
                </Button>
            </div>
        </div>
    );
}
