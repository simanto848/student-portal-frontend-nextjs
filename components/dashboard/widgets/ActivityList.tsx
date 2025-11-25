import { CheckCircle2, UserPlus, AlertCircle, CloudUpload } from "lucide-react";

interface ActivityItem {
    id: string;
    type: "approval" | "new_user" | "alert" | "backup";
    title: string;
    time: string;
}

interface ActivityListProps {
    items: ActivityItem[];
}

export function ActivityList({ items }: ActivityListProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "approval": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case "new_user": return <UserPlus className="h-5 w-5 text-green-600" />;
            case "alert": return <AlertCircle className="h-5 w-5 text-red-600" />;
            case "backup": return <CloudUpload className="h-5 w-5 text-orange-500" />;
            default: return <CheckCircle2 className="h-5 w-5" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case "approval": return "bg-green-100";
            case "new_user": return "bg-green-100";
            case "alert": return "bg-red-100";
            case "backup": return "bg-orange-100";
            default: return "bg-gray-100";
        }
    };

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className={`flex items-start gap-4 p-4 rounded-lg ${getBgColor(item.type)} bg-opacity-50`}>
                    <div className={`p-2 rounded-full bg-white`}>
                        {getIcon(item.type)}
                    </div>
                    <div>
                        <p className="font-medium text-sm text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
