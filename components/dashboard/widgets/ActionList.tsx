import { Button } from "@/components/ui/button";
import { AlertCircle, MessageSquare, FileText, Navigation } from "lucide-react";

interface ActionItem {
  id: string;
  type: "grade" | "message" | "form" | "nav";
  title: string;
  subtitle: string;
  actionLabel: string;
  onClick?: () => void;
}

interface ActionListProps {
  items: ActionItem[];
}

export function ActionList({ items }: ActionListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "grade":
        return <AlertCircle className="h-5 w-5 text-indigo-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-indigo-600" />;
      case "form":
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case "nav":
        return <Navigation className="h-5 w-5 text-indigo-600" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-0 divide-y-2 divide-slate-50">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-4 py-6 group hover:bg-slate-50/50 transition-all rounded-2xl px-4 -mx-4">
          <div className="mt-1 p-2 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">{getIcon(item.type)}</div>
          <div className="flex-1">
            <p className="font-black text-slate-800 tracking-tight leading-none mb-1">{item.title}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              {item.subtitle}
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:text-indigo-800"
              onClick={item.onClick}
            >
              {item.actionLabel}
            </Button>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors mt-2" />
        </div>
      ))}
    </div>
  );
}
