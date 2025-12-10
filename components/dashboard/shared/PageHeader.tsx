import { Button } from "@/components/ui/button";
import { Plus, LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: LucideIcon;
    extraActions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actionLabel, onAction, icon: Icon, extraActions }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#a3b18a]/30">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-lg bg-[#588157]/20">
                        <Icon className="h-6 w-6 text-[#344e41]" />
                    </div>
                )}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#344e41]">{title}</h1>
                    {subtitle && <p className="text-sm text-[#344e41]/60">{subtitle}</p>}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {extraActions}
                {actionLabel && onAction && (
                    <Button
                        onClick={onAction}
                        className="bg-[#588157] hover:bg-[#3a5a40] text-white shadow-sm w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
