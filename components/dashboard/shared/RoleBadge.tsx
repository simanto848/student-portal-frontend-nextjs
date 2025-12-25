"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, UserCog, BookOpenCheck, GraduationCap, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminRole = "super_admin" | "admin" | "moderator";
export type UserType = "student" | "teacher" | "staff" | "admin";

interface RoleBadgeProps {
    role: AdminRole | UserType | string;
    size?: "sm" | "md" | "lg";
    showIcon?: boolean;
    className?: string;
}

const roleConfig: Record<string, { label: string; className: string; icon: typeof Shield }> = {
    super_admin: {
        label: "Super Admin",
        className: "bg-purple-600 hover:bg-purple-700 text-white",
        icon: ShieldCheck,
    },
    admin: {
        label: "Admin",
        className: "bg-emerald-600 hover:bg-emerald-700 text-white",
        icon: Shield,
    },
    moderator: {
        label: "Moderator",
        className: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: UserCog,
    },
    student: {
        label: "Student",
        className: "bg-sky-500 hover:bg-sky-600 text-white",
        icon: GraduationCap,
    },
    teacher: {
        label: "Teacher",
        className: "bg-amber-600 hover:bg-amber-700 text-white",
        icon: BookOpenCheck,
    },
    staff: {
        label: "Staff",
        className: "bg-slate-600 hover:bg-slate-700 text-white",
        icon: Users,
    },
};

const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
};

const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
};

export function RoleBadge({ role, size = "md", showIcon = true, className }: RoleBadgeProps) {
    const config = roleConfig[role] || {
        label: role?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown",
        className: "bg-slate-500 hover:bg-slate-600 text-white",
        icon: User,
    };

    const Icon = config.icon;

    return (
        <Badge
            className={cn(
                config.className,
                sizeClasses[size],
                "flex items-center gap-1 font-medium",
                className
            )}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {config.label}
        </Badge>
    );
}

export default RoleBadge;
