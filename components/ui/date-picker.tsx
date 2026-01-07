"use client";

import * as React from "react";
import { format, getYear, setYear, getMonth, setMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
    date?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({
    date,
    onChange,
    placeholder = "Pick a date",
    className,
}: DatePickerProps) {
    const [calendarMonth, setCalendarMonth] = React.useState<Date>(date || new Date());

    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 100;
        const endYear = currentYear + 10;
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleYearChange = (year: string) => {
        const newDate = setYear(calendarMonth, parseInt(year));
        setCalendarMonth(newDate);
    };

    const handleMonthChange = (month: string) => {
        const monthIndex = months.indexOf(month);
        const newDate = setMonth(calendarMonth, monthIndex);
        setCalendarMonth(newDate);
    };

    const handleSelect = (selectedDate: Date | undefined) => {
        onChange?.(selectedDate);
        if (selectedDate) {
            setCalendarMonth(selectedDate);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "h-14 w-full justify-start text-left font-bold px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-indigo-500/30 hover:bg-white transition-all group",
                        !date && "text-slate-400",
                        className
                    )}
                >
                    <CalendarIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border border-slate-200 shadow-xl overflow-hidden" align="start">
                <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-100">
                    <Select
                        value={getYear(calendarMonth).toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="h-9 w-[90px] bg-white border-slate-200 rounded-lg font-semibold text-sm focus:ring-0 focus:border-indigo-400">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-slate-200 shadow-lg max-h-[200px]">
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()} className="font-medium text-sm hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer">
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={months[getMonth(calendarMonth)]}
                        onValueChange={handleMonthChange}
                    >
                        <SelectTrigger className="h-9 w-[110px] bg-white border-slate-200 rounded-lg font-semibold text-sm focus:ring-0 focus:border-indigo-400">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-slate-200 shadow-lg">
                            {months.map((month) => (
                                <SelectItem key={month} value={month} className="font-medium text-sm hover:bg-indigo-50 hover:text-indigo-700 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer">
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    hideNavigation
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
