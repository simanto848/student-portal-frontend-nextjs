import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: {
        value: string;
        trend: "up" | "down";
    };
    className?: string;
}

export function StatCard({ title, value, change, className }: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <p className={cn("text-xs flex items-center mt-1",
                        change.trend === "up" ? "text-green-600" : "text-red-600"
                    )}>
                        {change.trend === "up" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {change.value}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
