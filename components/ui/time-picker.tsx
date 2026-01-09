"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimePickerProps {
    value?: string; // "HH:mm"
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function TimePicker({
    value,
    onChange,
    placeholder = "Select time",
    className,
    disabled = false,
}: TimePickerProps) {
    const [open, setOpen] = React.useState(false);

    // Initial parsing
    const { initialHour, initialMinute, initialPeriod } = React.useMemo(() => {
        if (!value) return { initialHour: "12", initialMinute: "00", initialPeriod: "AM" };
        const [h, m] = value.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        let displayHour = h % 12;
        if (displayHour === 0) displayHour = 12;
        return {
            initialHour: displayHour.toString().padStart(2, "0"),
            initialMinute: m.toString().padStart(2, "0"),
            initialPeriod: period
        };
    }, [value]);

    const [selectedHour, setSelectedHour] = React.useState(initialHour);
    const [selectedMinute, setSelectedMinute] = React.useState(initialMinute);
    const [selectedPeriod, setSelectedPeriod] = React.useState(initialPeriod);

    // Sync state when value changes externally
    React.useEffect(() => {
        if (value) {
            const [h, m] = value.split(":").map(Number);
            const period = h >= 12 ? "PM" : "AM";
            let displayHour = h % 12;
            if (displayHour === 0) displayHour = 12;
            setSelectedHour(displayHour.toString().padStart(2, "0"));
            setSelectedMinute(m.toString().padStart(2, "0"));
            setSelectedPeriod(period);
        }
    }, [value]);

    const handleTimeChange = (type: "hour" | "minute" | "period", newVal: string) => {
        let h = selectedHour;
        let m = selectedMinute;
        let p = selectedPeriod;

        if (type === "hour") h = newVal;
        if (type === "minute") m = newVal;
        if (type === "period") p = newVal;

        setSelectedHour(h);
        setSelectedMinute(m);
        setSelectedPeriod(p);

        // Convert to 24h format for the output
        let hour24 = parseInt(h);
        if (p === "PM" && hour24 < 12) hour24 += 12;
        if (p === "AM" && hour24 === 12) hour24 = 0;

        const outputValue = `${hour24.toString().padStart(2, "0")}:${m}`;
        onChange?.(outputValue);
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0")); // 5-minute increments for cleaner UI
    const periods = ["AM", "PM"];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                        "h-11 w-full justify-start text-left font-medium px-4 rounded-xl bg-slate-50 border-slate-200/60 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all",
                        !value && "text-slate-400",
                        className
                    )}
                    disabled={disabled}
                >
                    <Clock className="mr-2 h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                    {value ? (
                        <span>{`${selectedHour}:${selectedMinute} ${selectedPeriod}`}</span>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden" align="start">
                <div className="flex bg-white h-72">
                    {/* Hours */}
                    <ScrollArea className="w-20 border-r border-slate-100 h-full">
                        <div className="p-2 space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-2 px-1">Hour</div>
                            {hours.map((h) => (
                                <button
                                    key={h}
                                    onClick={() => handleTimeChange("hour", h)}
                                    className={cn(
                                        "w-full py-2 text-sm font-bold rounded-lg transition-all",
                                        selectedHour === h
                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200"
                                            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                    )}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Minutes */}
                    <ScrollArea className="w-20 border-r border-slate-100 h-full">
                        <div className="p-2 space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-2 px-1">Min</div>
                            {minutes.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleTimeChange("minute", m)}
                                    className={cn(
                                        "w-full py-2 text-sm font-bold rounded-lg transition-all",
                                        selectedMinute === m
                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200"
                                            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Period */}
                    <div className="w-20 p-2 space-y-1 bg-slate-50/50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-2 px-1">AM/PM</div>
                        {periods.map((p) => (
                            <button
                                key={p}
                                onClick={() => handleTimeChange("period", p)}
                                className={cn(
                                    "w-full py-2 text-sm font-bold rounded-lg transition-all",
                                    selectedPeriod === p
                                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200"
                                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
