import { cn } from "@/lib/utils";
import {
    FlaskConical,
    Microscope,
    Users,
    Clock,
    MapPin,
    BookOpen,
    MoreHorizontal
} from "lucide-react";

interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    location: string;
    type: "lecture" | "lab" | "meeting";
}

interface ScheduleListProps {
    items: ScheduleItem[];
    className?: string;
}

export function ScheduleList({ items, className }: ScheduleListProps) {
    const getTypeConfig = (type: string) => {
        switch (type) {
            case "lab":
                return {
                    icon: Microscope,
                    bg: "bg-purple-100",
                    text: "text-purple-700",
                    border: "border-purple-200",
                    label: "Laboratory"
                };
            case "meeting":
                return {
                    icon: Users,
                    bg: "bg-amber-100",
                    text: "text-amber-700",
                    border: "border-amber-200",
                    label: "Meeting"
                };
            default:
                return {
                    icon: BookOpen,
                    bg: "bg-indigo-100",
                    text: "text-indigo-700",
                    border: "border-indigo-200",
                    label: "Lecture"
                };
        }
    };

    return (
        <div className={cn("relative pl-4 space-y-2", className)}>
            {/* Vertical timeline line */}
            <div className="absolute left-8 top-4 bottom-4 w-px bg-slate-200" />

            {items.map((item, index) => {
                const config = getTypeConfig(item.type);
                const Icon = config.icon;

                return (
                    <div key={item.id} className="relative z-10 group">
                        <div className="flex items-start gap-4 p-2 rounded-xl transition-all duration-200 hover:bg-slate-50">
                            {/* Time Column */}
                            <div className="w-16 pt-3 text-right shrink-0">
                                <span className="text-xs font-bold text-slate-700 block text-nowrap">
                                    {item.time.split('-')[0].trim()}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {item.time.split('-')[1]?.trim()}
                                </span>
                            </div>

                            {/* Timeline Node */}
                            <div className="pt-2 relative">
                                <div className={cn(
                                    "h-3 w-3 rounded-full border-2 ring-4 ring-white transition-all duration-200 group-hover:scale-110",
                                    config.bg.replace("bg-", "bg-").replace("100", "500"),
                                    config.border
                                )} />
                            </div>

                            {/* Card Content */}
                            <div className={cn(
                                "flex-1 ml-2 p-4 rounded-xl border bg-white shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-slate-300 group-hover:-translate-y-0.5",
                                "border-slate-100"
                            )}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                config.bg,
                                                config.text
                                            )}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                                            {item.title}
                                        </h4>
                                    </div>
                                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{item.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
