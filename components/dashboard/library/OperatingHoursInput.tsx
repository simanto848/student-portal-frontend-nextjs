import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePicker } from "@/components/ui/time-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckSquare, Square, RotateCcw } from "lucide-react";
import type { OperatingHours } from "@/services/library/types";

interface OperatingHoursInputProps {
    value?: OperatingHours;
    onChange: (value: OperatingHours) => void;
}

const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

const DEFAULT_HOURS = {
    open: "09:00",
    close: "17:00",
    isOpen: true,
};

export function OperatingHoursInput({ value, onChange }: OperatingHoursInputProps) {
    // Initialize internal state
    const [schedule, setSchedule] = useState<OperatingHours>(() => {
        const initial: OperatingHours = {};
        const safeValue = value || {};
        DAYS.forEach((day) => {
            initial[day] = safeValue[day] || {
                ...DEFAULT_HOURS,
                isOpen: day !== "sunday" && day !== "saturday"
            };
        });
        return initial;
    });

    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [batchOpen, setBatchOpen] = useState(DEFAULT_HOURS.open);
    const [batchClose, setBatchClose] = useState(DEFAULT_HOURS.close);

    // Sync state to parent when it changes
    useEffect(() => {
        onChange(schedule);
    }, [schedule]); // eslint-disable-line react-hooks/exhaustive-deps

    const updateDay = (day: string, field: string, newVal: any) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: newVal,
            },
        }));
    };

    const toggleDaySelection = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const toggleAllSelection = () => {
        if (selectedDays.length === DAYS.length) {
            setSelectedDays([]);
        } else {
            setSelectedDays(DAYS);
        }
    };

    const applyBatch = () => {
        if (selectedDays.length === 0) return;

        setSchedule((prev) => {
            const next = { ...prev };
            selectedDays.forEach((day) => {
                next[day] = {
                    ...next[day],
                    open: batchOpen,
                    close: batchClose,
                    isOpen: true // Auto-open if setting time? Maybe user keeps it closed? Let's keep existing isOpen unless user wants to force open.
                    // Actually user implies "give a time", so usually implies opening. 
                    // Let's explicitly ONLY set times, but maybe we should ensure it's open?
                    // "if user want they can give a time for all the selected days"
                    // Let's assume just time.
                };
            });
            return next;
        });
    };

    const applyBatchOpenClose = (isOpen: boolean) => {
        if (selectedDays.length === 0) return;
        setSchedule((prev) => {
            const next = { ...prev };
            selectedDays.forEach((day) => {
                next[day] = { ...next[day], isOpen };
            });
            return next;
        });
    };

    return (
        <div className="space-y-6">
            {/* Batch Operations Card */}
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={toggleAllSelection}
                                className="pl-0 hover:bg-transparent text-slate-600"
                            >
                                {selectedDays.length === DAYS.length ? (
                                    <CheckSquare className="h-4 w-4 mr-2" />
                                ) : (
                                    <Square className="h-4 w-4 mr-2" />
                                )}
                                {selectedDays.length === DAYS.length ? "Deselect All" : "Select All Days"}
                            </Button>
                            <span className="text-xs text-slate-400">({selectedDays.length} selected)</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => applyBatchOpenClose(true)}
                                disabled={selectedDays.length === 0}
                                className="h-8 text-xs"
                            >
                                Mark Open
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => applyBatchOpenClose(false)}
                                disabled={selectedDays.length === 0}
                                className="h-8 text-xs"
                            >
                                Mark Closed
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-end gap-3 opacity-90">
                        <div className="w-full md:flex-1 space-y-1.5">
                            <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Batch Open Time</Label>
                            <TimePicker value={batchOpen} onChange={setBatchOpen} placeholder="09:00" />
                        </div>
                        <div className="w-full md:flex-1 space-y-1.5">
                            <Label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Batch Close Time</Label>
                            <TimePicker value={batchClose} onChange={setBatchClose} placeholder="17:00" />
                        </div>
                        <Button
                            type="button"
                            onClick={applyBatch}
                            disabled={selectedDays.length === 0}
                            className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white"
                        >
                            Apply to Selected
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {DAYS.map((day) => {
                    // Safe access to day config
                    const dayConfig = schedule[day] || { ...DEFAULT_HOURS, isOpen: false };
                    const isOpen = !!dayConfig.isOpen;
                    const isSelected = selectedDays.includes(day);

                    return (
                        <div
                            key={day}
                            className={`group flex flex-col md:flex-row gap-4 items-center p-3 rounded-xl border transition-all duration-200 ${isSelected ? "ring-2 ring-teal-500/20 border-teal-500/50" : isOpen ? "bg-white border-slate-200" : "bg-slate-50 border-transparent opacity-75 hover:opacity-100"
                                }`}
                        >
                            {/* Checkbox & Switch */}
                            <div className="w-full md:w-48 flex items-center justify-between md:justify-start gap-4">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleDaySelection(day)}
                                        className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                                    />
                                    <Label className="capitalize font-semibold text-slate-700 min-w-[80px]">
                                        {day}
                                    </Label>
                                </div>
                                <Switch
                                    checked={isOpen}
                                    onCheckedChange={(checked) => updateDay(day, "isOpen", checked)}
                                />
                            </div>

                            {/* Times */}
                            <div className="flex-1 w-full grid grid-cols-2 gap-3">
                                {isOpen ? (
                                    <>
                                        <div className="relative">
                                            <TimePicker
                                                value={dayConfig.open}
                                                onChange={(val) => updateDay(day, "open", val)}
                                                className="bg-white border-slate-200"
                                            />
                                        </div>
                                        <div className="relative">
                                            <TimePicker
                                                value={dayConfig.close}
                                                onChange={(val) => updateDay(day, "close", val)}
                                                className="bg-white border-slate-200"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-2 flex items-center justify-center h-11 bg-slate-100/50 rounded-lg text-sm text-slate-400 italic">
                                        Closed
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
