import { cn } from "@/lib/utils";
import { FlaskConical, Microscope, Users } from "lucide-react"; // Example icons

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
    const getIcon = (type: string) => {
        switch (type) {
            case "lab": return <Microscope className="h-5 w-5" />;
            case "meeting": return <Users className="h-5 w-5" />;
            default: return <FlaskConical className="h-5 w-5" />;
        }
    };

    return (
        <div className={cn("space-y-6", className)}>
            {items.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                    {/* Timeline line */}
                    {index !== items.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200" />
                    )}

                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a3d32] text-white">
                        {getIcon(item.type)}
                    </div>

                    <div className="flex flex-col pt-1">
                        <span className="font-bold text-[#1a3d32]">{item.title}</span>
                        <span className="text-sm text-gray-500">{item.time} | {item.location}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
