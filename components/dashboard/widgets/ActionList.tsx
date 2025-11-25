import { Button } from "@/components/ui/button";
import { AlertCircle, MessageSquare, FileText } from "lucide-react";

interface ActionItem {
    id: string;
    type: "grade" | "message" | "form";
    title: string;
    subtitle: string;
    actionLabel: string;
}

interface ActionListProps {
    items: ActionItem[];
}

export function ActionList({ items }: ActionListProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "grade": return <AlertCircle className="h-5 w-5 text-[#3e6253]" />;
            case "message": return <MessageSquare className="h-5 w-5 text-[#3e6253]" />;
            case "form": return <FileText className="h-5 w-5 text-[#3e6253]" />;
            default: return <AlertCircle className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-0 divide-y">
            {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 py-4">
                    <div className="mt-1">
                        {getIcon(item.type)}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-[#1a3d32]">{item.title}</p>
                        <p className="text-sm font-medium text-[#1a3d32] mb-1">{item.subtitle}</p>
                        <Button variant="link" className="p-0 h-auto text-[#3e6253] font-bold hover:text-[#2c4a3e]">
                            {item.actionLabel}
                        </Button>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-[#8c9e8c]" />
                </div>
            ))}
        </div>
    );
}
