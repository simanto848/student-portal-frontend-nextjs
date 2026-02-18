"use client";

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
    Layers,
    Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePicker } from "@/components/ui/time-picker";
import { Classroom } from "./types";

const ALL_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

interface Props {
    show: boolean;
    onToggle: () => void;

    classDurationMinutes: number;
    onClassDurationChange: (v: number) => void;

    labDurationMinutes: number;
    onLabDurationChange: (v: number) => void;

    offDays: string[];
    onOffDaysChange: (days: string[]) => void;

    targetShift: string | null;
    onTargetShiftChange: (v: string | null) => void;

    groupLabsTogether: boolean;
    onGroupLabsChange: (v: boolean) => void;

    dayStartTime: string;
    onDayStartChange: (v: string) => void;
    dayEndTime: string;
    onDayEndChange: (v: string) => void;
    breakStartTime: string;
    onBreakStartChange: (v: string) => void;
    breakEndTime: string;
    onBreakEndChange: (v: string) => void;
    eveningStartTime: string;
    onEveningStartChange: (v: string) => void;
    eveningEndTime: string;
    onEveningEndChange: (v: string) => void;

    preferredTheoryRoom: string;
    onTheoryRoomChange: (v: string) => void;
    preferredLabRoom: string;
    onLabRoomChange: (v: string) => void;

    classrooms: Classroom[];
}

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
    onTargetShiftChange,
    groupLabsTogether,
    onGroupLabsChange,
    dayStartTime,
    onDayStartChange,
    dayEndTime,
    onDayEndChange,
    breakStartTime,
    onBreakStartChange,
    breakEndTime,
    onBreakEndChange,
    eveningStartTime,
    onEveningStartChange,
    eveningEndTime,
    onEveningEndChange,
    preferredTheoryRoom,
    onTheoryRoomChange,
    preferredLabRoom,
    onLabRoomChange,
    classrooms,
}: Props) {
    const toggleDay = (day: string) => {
        if (offDays.includes(day)) {
            onOffDaysChange(offDays.filter((d) => d !== day));
        } else {
            onOffDaysChange([...offDays, day]);
        }
    };

    return (
        <div className="space-y-3">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors"
            >
                <Settings className="w-4 h-4" />
                Class Duration Settings
                <ChevronDown className={`w-4 h-4 transition-transform ${show ? "rotate-180" : ""}`} />
            </button>

            {show && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <p className="text-sm text-slate-500">
                        Set the duration for each class type. Default is 1 hour 15 minutes for theory classes.
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

                    {/* Off Days */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Off Days (No Classes)
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
                            Working days:{" "}
                            {ALL_DAYS.filter((d) => !offDays.includes(d)).join(", ") || "None"}
                        </p>
                    </div>

                    {/* Scheduling Preferences */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-400" />
                            Scheduling Preferences
                        </label>

                        {/* Shift Override */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <label className="text-xs font-semibold text-slate-600">Shift Override</label>
                            <p className="text-xs text-slate-400">
                                Force all batches to use a specific shift, or use each batch&apos;s natural shift
                            </p>
                            <Select
                                value={targetShift || "auto"}
                                onValueChange={(v) => onTargetShiftChange(v === "auto" ? null : v)}
                            >
                                <SelectTrigger className="bg-white border-slate-200 h-9">
                                    <SelectValue placeholder="Select shift mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-slate-400" />
                                            <span>Auto (Use Batch&apos;s Natural Shift)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="day">
                                        <div className="flex items-center gap-2">
                                            <Sun className="w-4 h-4 text-amber-500" />
                                            <span>Force Day Shift</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="evening">
                                        <div className="flex items-center gap-2">
                                            <Moon className="w-4 h-4 text-indigo-500" />
                                            <span>Force Evening Shift</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Lab Grouping */}
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

                    {/* Custom Time Slots */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Custom Time Slots
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Day Shift */}
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sun className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm font-semibold text-amber-800">Day Shift</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-slate-500">Start</label>
                                        <TimePicker value={dayStartTime} onChange={onDayStartChange} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">End</label>
                                        <TimePicker value={dayEndTime} onChange={onDayEndChange} />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-amber-200/50">
                                    <span className="text-xs font-semibold text-amber-800 mb-1 block">Break Time</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-slate-500">Start</label>
                                            <TimePicker value={breakStartTime} onChange={onBreakStartChange} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">End</label>
                                            <TimePicker value={breakEndTime} onChange={onBreakEndChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Evening Shift */}
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Moon className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-semibold text-indigo-800">Evening Shift</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-slate-500">Start</label>
                                        <TimePicker value={eveningStartTime} onChange={onEveningStartChange} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">End</label>
                                        <TimePicker value={eveningEndTime} onChange={onEveningEndChange} />
                                    </div>
                                </div>
                            </div>
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
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
