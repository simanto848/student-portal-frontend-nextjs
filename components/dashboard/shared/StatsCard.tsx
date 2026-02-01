import { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    loading?: boolean;
    className?: string;
    iconClassName?: string;
    iconBgClassName?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    loading,
    className,
    iconClassName,
    iconBgClassName,
}: StatsCardProps) {
    return (
        <GlassCard className={cn("p-6", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        {loading ? (
                            <div className="h-8 w-24 animate-pulse rounded bg-muted/50" />
                        ) : (
                            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                        )}
                        {trend && !loading && (
                            <span
                                className={cn(
                                    "flex items-center text-xs font-medium",
                                    trend.positive ? "text-green-600" : "text-red-600"
                                )}
                            >
                                {trend.positive ? "+" : ""}
                                {trend.value}%
                            </span>
                        )}
                    </div>
                    {(description || trend) && !loading && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {trend ? trend.label : description}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:scale-110",
                        iconBgClassName || "bg-primary/10",
                    )}
                >
                    <Icon
                        className={cn("h-6 w-6", iconClassName || "text-primary")}
                    />
                </div>
            </div>
        </GlassCard>
    );
}
