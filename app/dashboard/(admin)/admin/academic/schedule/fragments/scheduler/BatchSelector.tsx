"use client";

import { Calendar, Layers, Building2, Users, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    selectedBatchIds: string[];
    onBatchToggle: (id: string) => void;
    onSelectAllBatches: () => void;
}

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
    selectedBatchIds,
    onBatchToggle,
    onSelectAllBatches,
}: Props) {
    return (
        <div className="space-y-6">
            {/* Session Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            </div>

            {/* Selection Mode Tabs */}
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
                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                        <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-violet-600" />
                            <div>
                                <p className="font-medium text-violet-900">All Active Batches</p>
                                <p className="text-sm text-violet-600">
                                    Schedule will be generated for all {batches.length} active batches
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
                                <strong>{filteredBatches.length}</strong> batches will be scheduled for this department
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Multiple Batches */}
                <TabsContent value="multi_batch" className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">
                            Select Batches ({selectedBatchIds.length} selected)
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
                            return (
                                <div
                                    key={batch.id}
                                    onClick={() => onBatchToggle(batch.id)}
                                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${isSelected
                                        ? "border-violet-500 bg-violet-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={isSelected}
                                            className="data-[state=checked]:bg-violet-600"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {batchDisplayName(batch.code || batch.name, batch.shift)}
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
                        </label>
                        <Select
                            value={selectedBatchIds[0] || ""}
                            onValueChange={(v) => onBatchToggle(v)}
                        >
                            <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                <SelectValue placeholder="Select a batch..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-[300px]">
                                {batches.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                        {batchDisplayName(batch.code || batch.name, batch.shift)} - Semester{" "}
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
