"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { notifySuccess, notifyError, notifyWarning } from "@/components/toast";
import { ScheduleGenerationOptions, ScheduleValidationResult, ShiftTimeConfig } from "@/services/academic/schedule.service";
import {
    fetchSessions,
    fetchDepartments,
    fetchBatches,
    fetchClassrooms,
    fetchProposals,
    validateSchedulePrerequisites,
    generateSchedule,
    applyProposal,
    deleteProposal,
    closeSchedulesForBatches,
    closeSchedulesForSession,
    getScheduleStatusSummary,
} from "../ai-scheduler/actions";

import {
    Session,
    Department,
    Batch,
    Classroom,
    ScheduleProposal,
    SelectionMode,
    UnassignedCourse,
    UnscheduledCourse,
    ScheduleStatusSummary,
} from "./scheduler/types";

// ── Shift configuration (module-level constants) ──────────────────────────────
const SHIFT_WORKING_DAYS: Record<string, string[]> = {
    day: ["Saturday", "Sunday", "Wednesday", "Thursday"],
    evening: ["Tuesday", "Friday"],
};
const SHIFT_OFF_DAYS: Record<string, string[]> = {
    day: ["Monday", "Tuesday", "Friday"],
    evening: ["Saturday", "Sunday", "Monday", "Wednesday", "Thursday"],
};

import { SchedulerHeader } from "./scheduler/SchedulerHeader";
import { BatchSelector } from "./scheduler/BatchSelector";
import { AdvancedSettings, DEFAULT_SHIFT_TIME_SLOTS } from "./scheduler/AdvancedSettings";
import { ScheduleStatusBar } from "./scheduler/ScheduleStatusBar";
import { GenerateActions } from "./scheduler/GenerateActions";
import { ValidationPanel } from "./scheduler/ValidationPanel";
import { UnscheduledCoursesPanel } from "./scheduler/UnscheduledCoursesPanel";
import { ProposalsList } from "./scheduler/ProposalsList";

export default function AISchedulerClient() {
    // ── Data ──────────────────────────────────────────────────────────────────
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [proposals, setProposals] = useState<ScheduleProposal[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    // ── Selection ─────────────────────────────────────────────────────────────
    const [selectionMode, setSelectionMode] = useState<SelectionMode>("all");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
    const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

    // ── Duration settings ─────────────────────────────────────────────────────
    const [classDurationMinutes, setClassDurationMinutes] = useState<number>(75);
    const [labDurationMinutes, setLabDurationMinutes] = useState<number>(100);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    // ── Scheduling preferences ────────────────────────────────────────────────
    const [targetShift, setTargetShift] = useState<"day" | "evening" | null>(null);
    const [groupLabsTogether, setGroupLabsTogether] = useState<boolean>(true);

    // ── Time settings (off days driven by shift selection) ────────────────────
    const [offDays, setOffDays] = useState<string[]>(["Monday", "Tuesday", "Friday"]);
    const [shiftTimeSlots, setShiftTimeSlots] = useState<Record<string, ShiftTimeConfig>>(
        () => JSON.parse(JSON.stringify(DEFAULT_SHIFT_TIME_SLOTS))
    );

    // ── Room preferences ──────────────────────────────────────────────────────
    const [preferredTheoryRoom, setPreferredTheoryRoom] = useState<string>("");
    const [preferredLabRoom, setPreferredLabRoom] = useState<string>("");

    // ── Loading states ────────────────────────────────────────────────────────
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isClosingSchedules, setIsClosingSchedules] = useState(false);

    // ── Status & results ──────────────────────────────────────────────────────
    const [scheduleStatus, setScheduleStatus] = useState<ScheduleStatusSummary>({ active: 0, closed: 0, archived: 0 });
    const [validationResult, setValidationResult] = useState<ScheduleValidationResult | null>(null);
    const [showValidation, setShowValidation] = useState(false);
    const [unscheduledCourses, setUnscheduledCourses] = useState<UnscheduledCourse[]>([]);
    const [showUnscheduled, setShowUnscheduled] = useState(false);

    // ── Derived ───────────────────────────────────────────────────────────────
    // Filter batches by selected shift first, then by department
    const shiftFilteredBatches = targetShift
        ? batches.filter((b) => (b.shift || "day") === targetShift)
        : batches;

    const filteredBatches = selectedDepartmentId
        ? shiftFilteredBatches.filter((b) => {
            const deptId = typeof b.departmentId === "object" ? b.departmentId.id : b.departmentId;
            return deptId === selectedDepartmentId;
        })
        : shiftFilteredBatches;

    const selectionSummary = (() => {
        const shiftLabel = targetShift ? ` (${targetShift} shift)` : "";
        switch (selectionMode) {
            case "all":
                return `All ${targetShift || ""} batches (${shiftFilteredBatches.length})${shiftLabel}`;
            case "department": {
                const dept = departments.find((d) => d.id === selectedDepartmentId);
                return dept ? `${dept.shortName} - ${filteredBatches.length} batches${shiftLabel}` : "Select department";
            }
            case "single_batch":
            case "multi_batch":
                return selectedBatchIds.length > 0
                    ? `${selectedBatchIds.length} batch${selectedBatchIds.length > 1 ? "es" : ""} selected${shiftLabel}`
                    : "Select batches";
            default:
                return "";
        }
    })();

    // ── Data loaders ──────────────────────────────────────────────────────────
    const loadScheduleStatus = async () => {
        try {
            const status = await getScheduleStatusSummary();
            setScheduleStatus(status);
        } catch {
            // silent fail
        }
    };

    const loadProposals = async (sessionId: string) => {
        setIsLoading(true);
        try {
            const data = await fetchProposals(sessionId);
            setProposals(data);
            loadScheduleStatus();
        } catch {
            notifyError("Failed to load proposals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [sessionData, deptData, classroomData] = await Promise.all([
                    fetchSessions(),
                    fetchDepartments(),
                    fetchClassrooms(),
                ]);
                setSessions(sessionData);
                setDepartments(deptData);
                setClassrooms(classroomData);
                if (sessionData.length > 0) {
                    const active = sessionData.find((s) => s.status) || sessionData[0];
                    setSelectedSessionId(active.id);
                }
            } catch {
                notifyError("Failed to load initial data");
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            loadProposals(selectedSessionId);
            fetchBatches().then(setBatches).catch(() => notifyError("Failed to load batches"));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSessionId]);

    // ── Options builder ───────────────────────────────────────────────────────
    const buildGenerationOptions = useCallback((): ScheduleGenerationOptions => {
        // Always derive working days from offDays
        const workingDays = (["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const)
            .filter(d => !offDays.includes(d));

        const options: ScheduleGenerationOptions = {
            sessionId: selectedSessionId,
            selectionMode,
            classDurationMinutes,
            classDurations: {
                theory: classDurationMinutes,
                lab: labDurationMinutes,
                project: labDurationMinutes,
            },
            workingDays: workingDays as unknown as ScheduleGenerationOptions["workingDays"],
            customTimeSlots: {
                day: shiftTimeSlots.day,
                evening: shiftTimeSlots.evening,
            },
            preferredRooms: {
                theory: preferredTheoryRoom || undefined,
                lab: preferredLabRoom || undefined,
            },
            targetShift: (targetShift || undefined) as "evening" | "day" | undefined,
            groupLabsTogether,
        };

        if (selectionMode === "department" && selectedDepartmentId) {
            options.departmentId = selectedDepartmentId;
        }
        if ((selectionMode === "single_batch" || selectionMode === "multi_batch") && selectedBatchIds.length > 0) {
            options.batchIds = selectedBatchIds;
        }

        return options;
    }, [
        selectedSessionId, selectionMode, selectedDepartmentId, selectedBatchIds,
        classDurationMinutes, labDurationMinutes, offDays, shiftTimeSlots,
        preferredTheoryRoom, preferredLabRoom, targetShift, groupLabsTogether,
    ]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSelectionModeChange = (mode: SelectionMode) => {
        setSelectionMode(mode);
        setSelectedBatchIds([]);
        setValidationResult(null);
        setShowValidation(false);
    };

    const handleShiftChange = (shift: "day" | "evening" | null) => {
        setTargetShift(shift);
        setSelectedBatchIds([]);
        setValidationResult(null);
        setShowValidation(false);
        // Reset time slots to defaults
        setShiftTimeSlots(JSON.parse(JSON.stringify(DEFAULT_SHIFT_TIME_SLOTS)));
        // Auto-update working days based on shift
        if (shift && SHIFT_OFF_DAYS[shift]) {
            setOffDays(SHIFT_OFF_DAYS[shift]);
        } else {
            setOffDays(["Monday", "Tuesday", "Friday"]);
        }
    };

    const handleDepartmentChange = (id: string) => {
        setSelectedDepartmentId(id);
        setSelectedBatchIds([]);
    };

    const handleBatchToggle = (batchId: string) => {
        if (selectionMode === "single_batch") {
            setSelectedBatchIds([batchId]);
        } else {
            setSelectedBatchIds((prev) =>
                prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
            );
        }
    };

    const handleSelectAllBatches = () => {
        setSelectedBatchIds(
            selectedBatchIds.length === filteredBatches.length ? [] : filteredBatches.map((b) => b.id)
        );
    };

    const handleCloseSchedules = async () => {
        if (selectedBatchIds.length === 0) {
            notifyWarning("Please select batches to close schedules for");
            return;
        }
        setIsClosingSchedules(true);
        try {
            const result = await closeSchedulesForBatches(selectedBatchIds);
            notifySuccess(result.message);
            await loadScheduleStatus();
        } catch {
            notifyError("Failed to close schedules");
        } finally {
            setIsClosingSchedules(false);
        }
    };

    const handleCloseSessionSchedules = async () => {
        if (!selectedSessionId) {
            notifyWarning("Please select a session first");
            return;
        }
        setIsClosingSchedules(true);
        try {
            const result = await closeSchedulesForSession(selectedSessionId);
            notifySuccess(result.message);
            await loadScheduleStatus();
        } catch {
            notifyError("Failed to close session schedules");
        } finally {
            setIsClosingSchedules(false);
        }
    };

    const handleValidate = async () => {
        if (!selectedSessionId) return;
        setIsValidating(true);
        setShowValidation(true);
        try {
            const result = await validateSchedulePrerequisites(buildGenerationOptions());
            setValidationResult(result);
            if (result.valid) {
                notifySuccess("Validation passed! Ready to generate schedule.");
            } else {
                notifyWarning("Validation failed. Please fix the issues before generating.");
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            notifyError(err?.message || "Validation failed");
            setValidationResult(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedSessionId) return;
        if (selectionMode === "department" && !selectedDepartmentId) {
            notifyError("Please select a department");
            return;
        }
        if ((selectionMode === "single_batch" || selectionMode === "multi_batch") && selectedBatchIds.length === 0) {
            notifyError("Please select at least one batch");
            return;
        }

        setIsGenerating(true);
        setUnscheduledCourses([]);
        setShowUnscheduled(false);
        try {
            const result = await generateSchedule(buildGenerationOptions());
            const { stats } = result;
            const unscheduled = stats.unscheduledCourses || [];

            if (stats.unscheduled > 0) {
                setUnscheduledCourses(unscheduled);
                setShowUnscheduled(true);
                notifyWarning(`Schedule generated with ${stats.scheduled} classes. ${stats.unscheduled} could not be scheduled.`);
            } else {
                notifySuccess(`Schedule generated successfully! ${stats.scheduled} classes scheduled.`);
            }

            loadProposals(selectedSessionId);
            setShowValidation(false);
            setValidationResult(null);
        } catch (error: unknown) {
            const err = error as { message?: string; unassignedCourses?: UnassignedCourse[]; errors?: string[] };
            if (err.unassignedCourses) {
                setValidationResult({ valid: false, errors: err.errors || [], warnings: [], unassignedCourses: err.unassignedCourses });
                setShowValidation(true);
                notifyError("Cannot generate schedule. Some courses don't have teachers assigned.");
            } else {
                notifyError(err?.message || "Failed to generate schedule");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = async (proposalId: string) => {
        try {
            await applyProposal(proposalId);
            notifySuccess("Schedule applied successfully!");
            loadProposals(selectedSessionId);
        } catch {
            notifyError("Failed to apply proposal");
        }
    };

    const handleDeleteProposal = async (proposalId: string) => {
        if (!confirm("Are you sure you want to delete this proposal?")) return;
        try {
            await deleteProposal(proposalId);
            notifySuccess("Proposal deleted");
            loadProposals(selectedSessionId);
        } catch {
            notifyError("Failed to delete proposal");
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            <SchedulerHeader />

            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden p-0">
                <CardHeader className="bg-linear-to-r from-slate-50 to-slate-100/50 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-xl">
                            <Calendar className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Generate New Schedule</h3>
                            <p className="text-sm text-slate-500">
                                Select session and choose how to group batches for scheduling
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    <BatchSelector
                        sessions={sessions}
                        selectedSessionId={selectedSessionId}
                        onSessionChange={setSelectedSessionId}
                        selectionMode={selectionMode}
                        onSelectionModeChange={handleSelectionModeChange}
                        departments={departments}
                        selectedDepartmentId={selectedDepartmentId}
                        onDepartmentChange={handleDepartmentChange}
                        batches={batches}
                        filteredBatches={filteredBatches}
                        shiftFilteredBatches={shiftFilteredBatches}
                        selectedBatchIds={selectedBatchIds}
                        onBatchToggle={handleBatchToggle}
                        onSelectAllBatches={handleSelectAllBatches}
                        targetShift={targetShift}
                        onShiftChange={handleShiftChange}
                    />

                    <AdvancedSettings
                        show={showAdvancedSettings}
                        onToggle={() => setShowAdvancedSettings((v) => !v)}
                        classDurationMinutes={classDurationMinutes}
                        onClassDurationChange={setClassDurationMinutes}
                        labDurationMinutes={labDurationMinutes}
                        onLabDurationChange={setLabDurationMinutes}
                        offDays={offDays}
                        onOffDaysChange={setOffDays}
                        targetShift={targetShift}
                        groupLabsTogether={groupLabsTogether}
                        onGroupLabsChange={setGroupLabsTogether}
                        shiftTimeSlots={shiftTimeSlots}
                        onShiftTimeSlotsChange={setShiftTimeSlots}
                        preferredTheoryRoom={preferredTheoryRoom}
                        onTheoryRoomChange={setPreferredTheoryRoom}
                        preferredLabRoom={preferredLabRoom}
                        onLabRoomChange={setPreferredLabRoom}
                        classrooms={classrooms}
                    />

                    <ScheduleStatusBar
                        scheduleStatus={scheduleStatus}
                        selectedBatchIds={selectedBatchIds}
                        selectedSessionId={selectedSessionId}
                        isClosingSchedules={isClosingSchedules}
                        onCloseSelected={handleCloseSchedules}
                        onCloseSession={handleCloseSessionSchedules}
                    />

                    <GenerateActions
                        selectionSummary={selectionSummary}
                        selectedSessionId={selectedSessionId}
                        isValidating={isValidating}
                        isGenerating={isGenerating}
                        onValidate={handleValidate}
                        onGenerate={handleGenerate}
                    />
                </CardContent>
            </Card>

            <ValidationPanel show={showValidation} validationResult={validationResult} />

            <UnscheduledCoursesPanel
                courses={showUnscheduled ? unscheduledCourses : []}
                onDismiss={() => setShowUnscheduled(false)}
            />

            <ProposalsList
                proposals={proposals}
                isLoading={isLoading}
                onApply={handleApply}
                onDelete={handleDeleteProposal}
            />
        </div>
    );
}
