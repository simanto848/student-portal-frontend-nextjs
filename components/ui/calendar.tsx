"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    const theme = useDashboardTheme();

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4", className)}
            classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4 w-full",
                month_caption: "flex justify-center items-center relative h-10",
                caption_label: "text-sm font-bold text-slate-700",
                nav: "flex items-center gap-1",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "absolute left-0 h-7 w-7 bg-white p-0 border border-slate-200 rounded-lg transition-all",
                    `hover:${theme.colors.sidebar.active} ${theme.colors.sidebar.hover}`
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "absolute right-0 h-7 w-7 bg-white p-0 border border-slate-200 rounded-lg transition-all",
                    `hover:${theme.colors.sidebar.active} ${theme.colors.sidebar.hover}`
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex w-full",
                weekday: "text-slate-400 font-semibold text-xs uppercase flex-1 text-center py-2",
                week: "flex w-full",
                day: "flex-1 flex justify-center py-1",
                day_button: cn(
                    "h-9 w-9 p-0 font-medium rounded-lg text-slate-700 transition-all flex items-center justify-center",
                    `hover:${theme.colors.sidebar.iconBg} ${theme.colors.sidebar.hover}`,
                    `focus:outline-none focus:ring-2 focus:ring-${theme.colors.accent.secondary.replace("bg-", "")}/30`
                ),
                selected: `${theme.colors.accent.primary} text-white font-bold shadow-md hover:opacity-90`,
                today: `${theme.colors.accent.primary} font-bold underline underline-offset-4`,
                outside: "day-outside text-slate-300",
                disabled: "text-slate-300 opacity-50",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") {
                        return <ChevronLeft className={`h-4 w-4 ${theme.colors.accent.primary}`} />;
                    }
                    return <ChevronRight className={`h-4 w-4 ${theme.colors.accent.primary}`} />;
                },
            }}
            {...props}
        />
    );
}
Calendar.displayName = "Calendar";

export { Calendar };
