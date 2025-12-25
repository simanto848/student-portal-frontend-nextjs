"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    AlertTriangle,
} from "lucide-react";

export type TicketStatus = "open" | "in_progress" | "pending_user" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

interface StatusBadgeProps {
    status: TicketStatus;
    className?: string;
}

interface PriorityBadgeProps {
    priority: TicketPriority;
    className?: string;
}

const statusConfig: Record<TicketStatus, { label: string; className: string; icon: typeof Clock }> = {
    open: {
        label: "Open",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: AlertCircle,
    },
    in_progress: {
        label: "In Progress",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
    },
    pending_user: {
        label: "Pending User",
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: MessageSquare,
    },
    resolved: {
        label: "Resolved",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
    },
    closed: {
        label: "Closed",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircle,
    },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string; icon: typeof AlertTriangle }> = {
    low: {
        label: "Low",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: AlertTriangle,
    },
    medium: {
        label: "Medium",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: AlertTriangle,
    },
    high: {
        label: "High",
        className: "bg-orange-100 text-orange-700 border-orange-200",
        icon: AlertTriangle,
    },
    urgent: {
        label: "Urgent",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: AlertTriangle,
    },
};

export function TicketStatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
        <Badge
            variant="outline"
            className={cn(config.className, "flex items-center gap-1 font-medium", className)}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

export function TicketPriorityBadge({ priority, className }: PriorityBadgeProps) {
    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
        <Badge
            variant="outline"
            className={cn(config.className, "font-medium", className)}
        >
            {config.label}
        </Badge>
    );
}

export default { TicketStatusBadge, TicketPriorityBadge };
