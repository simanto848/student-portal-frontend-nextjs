"use client";

import { useState } from "react";
import {
    Settings,
    ChevronDown,
    BookOpen,
    Zap,
    Calendar,
    Sun,
    Moon,
    MapPin,
    Clock,
    Info,
    Plus,
    Trash2,
    RotateCcw,
    ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { Classroom } from "./types";
import type { TimeBlock, ShiftTimeConfig, DaySlotConfig } from "@/services/academic/schedule.service";

const ALL_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const SHIFT_WORKING_DAYS: Record<string, string[]> = {
    day: ["Saturday", "Sunday", "Wednesday", "Thursday"],
    evening: ["Tuesday", "Friday"],
};

/** Default multi-block configs — mirrors backend DEFAULT_SHIFT_CONFIG */
export const DEFAULT_SHIFT_TIME_SLOTS: Record<string, ShiftTimeConfig> = {
    day: {
        defaultBlocks: [
            { start: "08:30", end: "13:30" },
            { start: "14:00", end: "17:20" },
        ],
        dayOverrides: {},
    },
    evening: {
        defaultBlocks: [{ start: "18:00", end: "21:40" }],
        dayOverrides: {
            Friday: {
                blocks: [
                    { start: "08:30", end: "13:00" },
                    { start: "14:00", end: "21:40" },
                ],
                classTypeConstraint: "theory",
            },
            Tuesday: {
                blocks: [{ start: "18:00", end: "21:40" }],
                classTypeConstraint: "lab",
            },
        },
    },
};

interface Props {
    show: boolean;
    onToggle: () => void;

    classDurationMinutes: number;
    onClassDurationChange: (v: number) => void;

    labDurationMinutes: number;
    onLabDurationChange: (v: number) => void;

    offDays: string[];
    onOffDaysChange: (days: string[]) => void;

    targetShift: "day" | "evening" | null;

    groupLabsTogether: boolean;
    onGroupLabsChange: (v: boolean) => void;

    /** Multi-block time slot configuration */
    shiftTimeSlots: Record<string, ShiftTimeConfig>;
    onShiftTimeSlotsChange: (slots: Record<string, ShiftTimeConfig>) => void;

    preferredTheoryRoom: string;
    onTheoryRoomChange: (v: string) => void;
    preferredLabRoom: string;
    onLabRoomChange: (v: string) => void;

    classrooms: Classroom[];
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function cloneSlots(slots: Record<string, ShiftTimeConfig>): Record<string, ShiftTimeConfig> {
    return JSON.parse(JSON.stringify(slots));
}

/** Get blocks for a specific day — day override or default */
function getBlocksForDay(cfg: ShiftTimeConfig, day: string): TimeBlock[] {
    return cfg.dayOverrides?.[day]?.blocks ?? cfg.defaultBlocks;
}

function isTheoryOnly(cfg: ShiftTimeConfig, day: string): boolean {
    return cfg.dayOverrides?.[day]?.classTypeConstraint === "theory";
}

function isLabOnly(cfg: ShiftTimeConfig, day: string): boolean {
    return cfg.dayOverrides?.[day]?.classTypeConstraint === "lab";
}

function getClassTypeConstraint(cfg: ShiftTimeConfig, day: string): "theory" | "lab" | undefined {
    return cfg.dayOverrides?.[day]?.classTypeConstraint;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdvancedSettings({
    show,
    onToggle,
    classDurationMinutes,
    onClassDurationChange,
    labDurationMinutes,
    onLabDurationChange,
    offDays,
    onOffDaysChange,
    targetShift,
    groupLabsTogether,
    onGroupLabsChange,
    shiftTimeSlots,
    onShiftTimeSlotsChange,
    preferredTheoryRoom,
    onTheoryRoomChange,
    preferredLabRoom,
    onLabRoomChange,
    classrooms,
}: Props) {
    const [expandedShift, setExpandedShift] = useState<string | null>(null);

    const toggleDay = (day: string) => {
        if (offDays.includes(day)) {
            onOffDaysChange(offDays.filter((d) => d !== day));
        } else {
            onOffDaysChange([...offDays, day]);
        }
    };

    const workingDays = ALL_DAYS.filter((d) => !offDays.includes(d));

    // ── Block manipulation helpers ────────────────────────────────────────────

    /** Update a SPECIFIC block in default blocks */
    const updateDefaultBlock = (shift: string, blockIdx: number, field: "start" | "end", value: string) => {
        const next = cloneSlots(shiftTimeSlots);
        if (!next[shift]) return;
        next[shift].defaultBlocks[blockIdx][field] = value;
        onShiftTimeSlotsChange(next);
    };

    const addDefaultBlock = (shift: string) => {
        const next = cloneSlots(shiftTimeSlots);
        if (!next[shift]) return;
        const last = next[shift].defaultBlocks[next[shift].defaultBlocks.length - 1];
        next[shift].defaultBlocks.push({ start: last?.end || "14:00", end: "17:00" });
        onShiftTimeSlotsChange(next);
    };

    const removeDefaultBlock = (shift: string, blockIdx: number) => {
        const next = cloneSlots(shiftTimeSlots);
        if (!next[shift] || next[shift].defaultBlocks.length <= 1) return;
        next[shift].defaultBlocks.splice(blockIdx, 1);
        onShiftTimeSlotsChange(next);
    };

    /** Create a day-specific override from the current defaults */
    const addDayOverride = (shift: string, day: string) => {
        const next = cloneSlots(shiftTimeSlots);
        if (!next[shift]) return;
        if (!next[shift].dayOverrides) next[shift].dayOverrides = {};
        // Pre-fill with current defaults
        next[shift].dayOverrides![day] = {
            blocks: [...next[shift].defaultBlocks.map((b) => ({ ...b }))],
        };
        onShiftTimeSlotsChange(next);
    };

    const removeDayOverride = (shift: string, day: string) => {
        const next = cloneSlots(shiftTimeSlots);
        if (!next[shift]?.dayOverrides?.[day]) return;
        delete next[shift].dayOverrides![day];
        onShiftTimeSlotsChange(next);
    };

    const updateDayBlock = (shift: string, day: string, blockIdx: number, field: "start" | "end", value: string) => {
        const next = cloneSlots(shiftTimeSlots);
        const dayCfg = next[shift]?.dayOverrides?.[day];
        if (!dayCfg) return;
        dayCfg.blocks[blockIdx][field] = value;
        onShiftTimeSlotsChange(next);
    };

    const addDayBlock = (shift: string, day: string) => {
        const next = cloneSlots(shiftTimeSlots);
        const dayCfg = next[shift]?.dayOverrides?.[day];
        if (!dayCfg) return;
        const last = dayCfg.blocks[dayCfg.blocks.length - 1];
        dayCfg.blocks.push({ start: last?.end || "14:00", end: "17:00" });
        onShiftTimeSlotsChange(next);
    };

    const removeDayBlock = (shift: string, day: string, blockIdx: number) => {
        const next = cloneSlots(shiftTimeSlots);
        const dayCfg = next[shift]?.dayOverrides?.[day];
        if (!dayCfg || dayCfg.blocks.length <= 1) return;
        dayCfg.blocks.splice(blockIdx, 1);
        onShiftTimeSlotsChange(next);
    };

    const toggleTheoryOnly = (shift: string, day: string) => {
        const next = cloneSlots(shiftTimeSlots);
        const dayCfg = next[shift]?.dayOverrides?.[day];
        if (!dayCfg) return;
        // Cycle: none → theory → lab → none
        if (!dayCfg.classTypeConstraint) {
            dayCfg.classTypeConstraint = "theory";
        } else if (dayCfg.classTypeConstraint === "theory") {
            dayCfg.classTypeConstraint = "lab";
        } else {
            delete dayCfg.classTypeConstraint;
        }
        onShiftTimeSlotsChange(next);
    };

    const resetToDefaults = (shift: string) => {
        const next = cloneSlots(shiftTimeSlots);
        next[shift] = JSON.parse(JSON.stringify(DEFAULT_SHIFT_TIME_SLOTS[shift]));
        onShiftTimeSlotsChange(next);
    };

    // ── Shift card renderer ───────────────────────────────────────────────────

    const shiftsToShow = targetShift ? [targetShift] : ["day", "evening"];

    const renderBlockRow = (
        block: TimeBlock,
        idx: number,
        total: number,
        onUpdate: (idx: number, field: "start" | "end", val: string) => void,
        onRemove: (idx: number) => void,
    ) => (
        <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-5 shrink-0">#{idx + 1}</span>
            <div className="flex-1">
                <TimePicker value={block.start} onChange={(v) => onUpdate(idx, "start", v)} />
            </div>
            <span className="text-xs text-slate-400">to</span>
            <div className="flex-1">
                <TimePicker value={block.end} onChange={(v) => onUpdate(idx, "end", v)} />
            </div>
            {total > 1 && (
                <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    title="Remove block"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );

    const renderShiftCard = (shift: string) => {
        const isDay = shift === "day";
        const cfg = shiftTimeSlots[shift];
        if (!cfg) return null;
        const isExpanded = expandedShift === shift;
        const shiftDays = workingDays;
        const overrides = cfg.dayOverrides || {};
        const overriddenDays = Object.keys(overrides);
        const nonOverriddenDays = shiftDays.filter((d) => !overriddenDays.includes(d));

        const accent = isDay
            ? { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", textLight: "text-amber-600", icon: <Sun className="w-4 h-4 text-amber-600" /> }
            : { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", textLight: "text-indigo-600", icon: <Moon className="w-4 h-4 text-indigo-600" /> };

        return (
            <div key={shift} className={`${accent.bg} rounded-xl ${accent.border} border overflow-hidden`}>
                {/* Header */}
                <button
                    type="button"
                    onClick={() => setExpandedShift(isExpanded ? null : shift)}
                    className="w-full flex items-center justify-between p-3"
                >
                    <div className="flex items-center gap-2">
                        {accent.icon}
                        <span className={`text-sm font-semibold ${accent.text}`}>
                            {isDay ? "Day" : "Evening"} Shift
                        </span>
                        <span className={`text-xs ${accent.textLight}`}>
                            ({cfg.defaultBlocks.length} default block{cfg.defaultBlocks.length > 1 ? "s" : ""}
                            {overriddenDays.length > 0 ? `, ${overriddenDays.length} day override${overriddenDays.length > 1 ? "s" : ""}` : ""})
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); resetToDefaults(shift); }}
                            className={`text-xs ${accent.textLight} hover:underline flex items-center gap-1`}
                            title="Reset to defaults"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                        <ChevronRight className={`w-4 h-4 ${accent.textLight} transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                </button>

                {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                        {/* Default blocks */}
                        <div className="bg-white/60 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold ${accent.text}`}>
                                    Default Blocks {nonOverriddenDays.length > 0 && (
                                        <span className="font-normal text-slate-400">
                                            (applies to {nonOverriddenDays.join(", ")})
                                        </span>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => addDefaultBlock(shift)}
                                    className={`text-xs flex items-center gap-1 ${accent.textLight} hover:underline`}
                                >
                                    <Plus className="w-3 h-3" /> Add Block
                                </button>
                            </div>

                            {cfg.defaultBlocks.map((block, idx) =>
                                renderBlockRow(
                                    block, idx, cfg.defaultBlocks.length,
                                    (i, f, v) => updateDefaultBlock(shift, i, f, v),
                                    (i) => removeDefaultBlock(shift, i),
                                )
                            )}
                        </div>

                        {/* Per-day overrides */}
                        {overriddenDays.map((day) => {
                            const dayCfg = overrides[day] as DaySlotConfig;
                            return (
                                <div key={day} className="bg-white/60 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold ${accent.text}`}>{day}</span>
                                            {dayCfg.classTypeConstraint === "theory" && (
                                                <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                                                    Theory only
                                                </span>
                                            )}
                                            {dayCfg.classTypeConstraint === "lab" && (
                                                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                    Lab only
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleTheoryOnly(shift, day)}
                                                className={`text-xs hover:underline ${dayCfg.classTypeConstraint === "theory"
                                                    ? "text-yellow-600"
                                                    : dayCfg.classTypeConstraint === "lab"
                                                        ? "text-blue-600"
                                                        : "text-slate-500"
                                                    }`}
                                            >
                                                {!dayCfg.classTypeConstraint
                                                    ? "Set: Theory only"
                                                    : dayCfg.classTypeConstraint === "theory"
                                                        ? "Set: Lab only"
                                                        : "Set: Any type"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addDayBlock(shift, day)}
                                                className={`text-xs flex items-center gap-1 ${accent.textLight} hover:underline`}
                                            >
                                                <Plus className="w-3 h-3" /> Block
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeDayOverride(shift, day)}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {dayCfg.blocks.map((block, idx) =>
                                        renderBlockRow(
                                            block, idx, dayCfg.blocks.length,
                                            (i, f, v) => updateDayBlock(shift, day, i, f, v),
                                            (i) => removeDayBlock(shift, day, i),
                                        )
                                    )}
                                </div>
                            );
                        })}

                        {/* Add day override */}
                        {shiftDays.filter((d) => !overriddenDays.includes(d)).length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className={`text-xs ${accent.textLight}`}>Add day override:</span>
                                {shiftDays
                                    .filter((d) => !overriddenDays.includes(d))
                                    .map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => addDayOverride(shift, d)}
                                            className={`text-xs px-2 py-1 rounded-md border ${accent.border} ${accent.text} hover:bg-white/80 transition-colors`}
                                        >
                                            + {d}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors"
            >
                <Settings className="w-4 h-4" />
                Advanced Settings
                <ChevronDown className={`w-4 h-4 transition-transform ${show ? "rotate-180" : ""}`} />
            </button>

            {show && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <p className="text-sm text-slate-500">
                        Configure class durations, working days, multi-block time slots, and room preferences.
                    </p>

                    {/* Duration Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-slate-400" />
                                Theory Class Duration
                            </label>
                            <div className="relative w-full">
                                <Input
                                    type="number"
                                    value={classDurationMinutes}
                                    onChange={(e) => onClassDurationChange(parseInt(e.target.value) || 0)}
                                    className="pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    minutes
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-slate-400" />
                                Lab/Project Duration
                            </label>
                            <div className="relative w-full">
                                <Input
                                    type="number"
                                    value={labDurationMinutes}
                                    onChange={(e) => onLabDurationChange(parseInt(e.target.value) || 0)}
                                    className="pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    minutes
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Working Days */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Working Days
                            {targetShift && (
                                <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${targetShift === "day"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-indigo-100 text-indigo-700"
                                    }`}>
                                    {targetShift} shift defaults applied
                                </span>
                            )}
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {ALL_DAYS.map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${offDays.includes(day)
                                        ? "bg-red-100 text-red-700 border-2 border-red-300"
                                        : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                                        }`}
                                >
                                    {day}
                                    <span className="ml-1 text-xs">
                                        {offDays.includes(day) ? "(Off)" : "(Working)"}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400">
                            Working days: {workingDays.join(", ") || "None"}
                        </p>
                    </div>

                    {/* Scheduling Preferences */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-400" />
                            Scheduling Preferences
                        </label>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <label className="text-xs font-semibold text-slate-600">Group Lab Classes</label>
                                <p className="text-xs text-slate-400">
                                    Try to schedule all labs for a batch on the same day
                                </p>
                            </div>
                            <Checkbox
                                checked={groupLabsTogether}
                                onCheckedChange={(checked) => onGroupLabsChange(checked as boolean)}
                                className="data-[state=checked]:bg-violet-600"
                            />
                        </div>
                    </div>

                    {/* Multi-Block Time Slots */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Time Slot Blocks
                            <span className="text-xs font-normal text-slate-400">
                                (add multiple time windows per day)
                            </span>
                        </label>

                        <div className="space-y-3">
                            {shiftsToShow.map((shift) => renderShiftCard(shift))}
                        </div>
                    </div>

                    {/* Room Preferences */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            Room Preferences (Optional)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500">Preferred Theory Room</label>
                                <Select
                                    value={preferredTheoryRoom || "any"}
                                    onValueChange={(v) => onTheoryRoomChange(v === "any" ? "" : v)}
                                >
                                    <SelectTrigger className="bg-white border-slate-200">
                                        <SelectValue placeholder="Any Available Room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any Available Room</SelectItem>
                                        {classrooms
                                            .filter((c) => ["Lecture Hall", "Seminar Room"].includes(c.roomType))
                                            .map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.roomNumber} ({c.capacity} cap)
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500">Preferred Lab Room</label>
                                <Select
                                    value={preferredLabRoom || "any"}
                                    onValueChange={(v) => onLabRoomChange(v === "any" ? "" : v)}
                                >
                                    <SelectTrigger className="bg-white border-slate-200">
                                        <SelectValue placeholder="Any Available Room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any Available Room</SelectItem>
                                        {classrooms
                                            .filter((c) => ["Laboratory", "Computer Lab"].includes(c.roomType))
                                            .map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.roomNumber} ({c.capacity} cap)
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                        <Info className="w-3 h-3" />
                        <span>
                            Theory = {Math.floor(classDurationMinutes / 60)}h {classDurationMinutes % 60}m, Lab ={" "}
                            {Math.floor(labDurationMinutes / 60)}h {labDurationMinutes % 60}m
                            {targetShift && ` · ${targetShift} shift · ${SHIFT_WORKING_DAYS[targetShift].join(", ")}`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
