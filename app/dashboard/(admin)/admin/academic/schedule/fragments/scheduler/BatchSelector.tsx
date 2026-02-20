"use client";

import { Calendar, Layers, Building2, Users, GraduationCap, Sun, Moon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Session, Department, Batch, SelectionMode, batchDisplayName } from "./types";

interface Props {
    sessions: Session[];
    selectedSessionId: string;
    onSessionChange: (id: string) => void;

    selectionMode: SelectionMode;
    onSelectionModeChange: (mode: SelectionMode) => void;

    departments: Department[];
    selectedDepartmentId: string;
    onDepartmentChange: (id: string) => void;

    batches: Batch[];
    filteredBatches: Batch[];
    shiftFilteredBatches: Batch[];
    selectedBatchIds: string[];
    onBatchToggle: (id: string) => void;
    onSelectAllBatches: () => void;

    /** null = not yet selected */
    targetShift: "day" | "evening" | null;
    onShiftChange: (shift: "day" | "evening" | null) => void;
}

const SHIFT_WORKING_DAYS = {
    day: ["Saturday", "Sunday", "Wednesday", "Thursday"],
    evening: ["Tuesday", "Friday"],
};

export function BatchSelector({
    sessions,
    selectedSessionId,
    onSessionChange,
    selectionMode,
    onSelectionModeChange,
    departments,
    selectedDepartmentId,
    onDepartmentChange,
    batches,
    filteredBatches,
    shiftFilteredBatches,
    selectedBatchIds,
    onBatchToggle,
    onSelectAllBatches,
    targetShift,
    onShiftChange,
}: Props) {
    return (
        <div className="space-y-6">
            {/* Step 1 – Session + Shift Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Session */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Academic Session
                    </label>
                    <Select value={selectedSessionId} onValueChange={onSessionChange}>
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

                {/* Shift Selector – primary control */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Sun className="w-4 h-4 text-slate-400" />
                        Shift
                        <span className="text-xs font-normal text-slate-400">(determines working days)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {/* Auto */}
                        <button
                            type="button"
                            onClick={() => onShiftChange(null)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-medium ${targetShift === null
                                    ? "border-violet-500 bg-violet-50 text-violet-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            <span>Auto</span>
                            <span className="text-xs font-normal opacity-70">All batches</span>
                        </button>

                        {/* Day */}
                        <button
                            type="button"
                            onClick={() => onShiftChange("day")}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-medium ${targetShift === "day"
                                    ? "border-amber-500 bg-amber-50 text-amber-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                }`}
                        >
                            <Sun className="w-4 h-4" />
                            <span>Day</span>
                            <span className="text-xs font-normal opacity-70">Sat·Sun·Wed·Thu</span>
                        </button>

                        {/* Evening */}
                        <button
                            type="button"
                            onClick={() => onShiftChange("evening")}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-medium ${targetShift === "evening"
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                }`}
                        >
                            <Moon className="w-4 h-4" />
                            <span>Evening</span>
                            <span className="text-xs font-normal opacity-70">Tue·Fri</span>
                        </button>
                    </div>

                    {/* Active day indicator */}
                    {targetShift && (
                        <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${targetShift === "day" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
                            }`}>
                            {targetShift === "day" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                            <span className="font-medium">Working days:</span>
                            {SHIFT_WORKING_DAYS[targetShift].map((d) => (
                                <Badge
                                    key={d}
                                    variant="secondary"
                                    className={`text-xs px-1.5 py-0 ${targetShift === "day"
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-indigo-100 text-indigo-800"
                                        }`}
                                >
                                    {d}
                                </Badge>
                            ))}
                            <span className="ml-auto font-medium">
                                {shiftFilteredBatches.length} batch{shiftFilteredBatches.length !== 1 ? "es" : ""}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Step 2 – Batch Selection Mode */}
            <Tabs
                value={selectionMode}
                onValueChange={(v) => onSelectionModeChange(v as SelectionMode)}
            >
                <TabsList className="grid grid-cols-4 h-12 p-1 bg-slate-100 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Layers className="w-4 h-4 mr-2" />
                        All Batches
                    </TabsTrigger>
                    <TabsTrigger value="department" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Building2 className="w-4 h-4 mr-2" />
                        By Department
                    </TabsTrigger>
                    <TabsTrigger value="multi_batch" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Users className="w-4 h-4 mr-2" />
                        Multiple Batches
                    </TabsTrigger>
                    <TabsTrigger value="single_batch" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Single Batch
                    </TabsTrigger>
                </TabsList>

                {/* All Batches */}
                <TabsContent value="all" className="mt-4">
                    <div className={`p-4 rounded-xl border ${targetShift === "day"
                            ? "bg-amber-50 border-amber-100"
                            : targetShift === "evening"
                                ? "bg-indigo-50 border-indigo-100"
                                : "bg-violet-50 border-violet-100"
                        }`}>
                        <div className="flex items-center gap-3">
                            {targetShift === "day" ? (
                                <Sun className="w-5 h-5 text-amber-600" />
                            ) : targetShift === "evening" ? (
                                <Moon className="w-5 h-5 text-indigo-600" />
                            ) : (
                                <Layers className="w-5 h-5 text-violet-600" />
                            )}
                            <div>
                                <p className={`font-medium ${targetShift === "day" ? "text-amber-900" :
                                        targetShift === "evening" ? "text-indigo-900" : "text-violet-900"
                                    }`}>
                                    {targetShift ? `All ${targetShift.charAt(0).toUpperCase() + targetShift.slice(1)} Shift Batches` : "All Active Batches"}
                                </p>
                                <p className={`text-sm ${targetShift === "day" ? "text-amber-600" :
                                        targetShift === "evening" ? "text-indigo-600" : "text-violet-600"
                                    }`}>
                                    Schedule will be generated for all {shiftFilteredBatches.length}{targetShift ? ` ${targetShift}` : ""} batches
                                    {targetShift && ` on ${SHIFT_WORKING_DAYS[targetShift].join(", ")}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* By Department */}
                <TabsContent value="department" className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Select Department
                        </label>
                        <Select value={selectedDepartmentId} onValueChange={onDepartmentChange}>
                            <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                <SelectValue placeholder="Select department..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-[300px]">
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.shortName} - {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedDepartmentId && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-700">
                                <strong>{filteredBatches.length}</strong> {targetShift || ""} batches will be scheduled for this department
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Multiple Batches */}
                <TabsContent value="multi_batch" className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">
                            Select Batches ({selectedBatchIds.length} selected)
                            {targetShift && (
                                <span className={`ml-2 text-xs font-normal ${targetShift === "day" ? "text-amber-600" : "text-indigo-600"
                                    }`}>
                                    — {targetShift} shift only
                                </span>
                            )}
                        </label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSelectAllBatches}
                            className="text-violet-600 hover:text-violet-700"
                        >
                            {selectedBatchIds.length === filteredBatches.length ? "Deselect All" : "Select All"}
                        </Button>
                    </div>

                    {/* Department Filter */}
                    <Select
                        value={selectedDepartmentId || "all"}
                        onValueChange={(v) => onDepartmentChange(v === "all" ? "" : v)}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-10 w-64">
                            <SelectValue placeholder="Filter by department..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.shortName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                        {filteredBatches.map((batch) => {
                            const isSelected = selectedBatchIds.includes(batch.id);
                            const batchShift = batch.shift || "day";
                            return (
                                <div
                                    key={batch.id}
                                    onClick={() => onBatchToggle(batch.id)}
                                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${isSelected
                                            ? batchShift === "evening"
                                                ? "border-indigo-500 bg-indigo-50"
                                                : "border-amber-500 bg-amber-50"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={isSelected}
                                            className={`${batchShift === "evening"
                                                    ? "data-[state=checked]:bg-indigo-600"
                                                    : "data-[state=checked]:bg-amber-600"
                                                }`}
                                        />
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {batch.code || batchDisplayName(batch.name, batch.shift)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Sem {batch.currentSemester} • {batch.currentStudents} students
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Single Batch */}
                <TabsContent value="single_batch" className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            Select Batch
                            {targetShift && (
                                <span className={`text-xs font-normal ${targetShift === "day" ? "text-amber-600" : "text-indigo-600"
                                    }`}>
                                    ({targetShift} shift)
                                </span>
                            )}
                        </label>
                        <Select
                            value={selectedBatchIds[0] || ""}
                            onValueChange={(v) => onBatchToggle(v)}
                        >
                            <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                <SelectValue placeholder="Select a batch..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-[300px]">
                                {shiftFilteredBatches.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                        {batch.code || batchDisplayName(batch.name, batch.shift)} - Semester{" "}
                                        {batch.currentSemester} ({batch.currentStudents} students)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

