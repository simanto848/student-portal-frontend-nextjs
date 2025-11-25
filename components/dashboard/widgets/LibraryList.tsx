import { BookOpen, Clock } from "lucide-react";

interface LibraryItem {
    id: string;
    title: string;
    dueDate: string;
    status: "due_soon" | "overdue" | "normal";
}

interface LibraryListProps {
    items: LibraryItem[];
}

export function LibraryList({ items }: LibraryListProps) {
    const getBgColor = (status: string) => {
        switch (status) {
            case "overdue": return "bg-red-50 border-red-100";
            case "due_soon": return "bg-orange-50 border-orange-100";
            default: return "bg-green-50 border-green-100";
        }
    };

    const getTextColor = (status: string) => {
        switch (status) {
            case "overdue": return "text-red-700";
            case "due_soon": return "text-orange-700";
            default: return "text-green-700";
        }
    };

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.id} className={`p-4 rounded-lg border ${getBgColor(item.status)}`}>
                    <div className="flex items-start gap-3">
                        <BookOpen className={`h-5 w-5 mt-0.5 ${getTextColor(item.status)}`} />
                        <div>
                            <p className="font-semibold text-[#1a3d32]">{item.title}</p>
                            <div className={`flex items-center gap-1 text-sm mt-1 ${getTextColor(item.status)}`}>
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{item.status === 'overdue' ? 'Overdue by' : 'Due in'} {item.dueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
