"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    GraduationCap,
    ChevronRight,
    ChevronLeft,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { adminNavigation, NavItem } from "@/config/navigation";

const GROUP_ORDER = ["Overview", "Academic Management", "Enrollment Management", "User Management", "AI System", "Actions"];

interface SidebarStats {
    students: number;
    teachers: number;
}

export function AdminSidebar({
    isCollapsed,
    toggleCollapse,
    className,
    onClose,
    stats
}: {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    className?: string;
    onClose?: () => void;
    stats?: SidebarStats;
}) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    const groupedNavItems = useMemo(() => {
        const groups: Record<string, NavItem[]> = {};
        GROUP_ORDER.forEach(g => { groups[g] = []; });

        adminNavigation.forEach(item => {
            let groupName = "Overview";
            if (item.href?.includes("academic")) {
                groupName = "Academic Management";
            } else if (item.href?.includes("enrollment")) {
                groupName = "Enrollment Management";
            } else if (item.href?.includes("users")) {
                groupName = "User Management";
            } else if (item.href?.includes("face-recognition")) {
                groupName = "AI System";
            } else if (item.href?.includes("approvals") || item.href?.includes("reports") || item.href?.includes("messages")) {
                groupName = "Actions";
            }

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(item);
        });

        return Object.entries(groups)
            .filter(([_, items]) => items.length > 0)
            .sort((a, b) => {
                const indexA = GROUP_ORDER.indexOf(a[0]);
                const indexB = GROUP_ORDER.indexOf(b[0]);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a[0].localeCompare(b[0]);
            })
            .map(([group, items]) => ({ group, items }));
    }, []);

    return (
        <div className={cn(
            "h-full flex flex-col bg-linear-to-b from-amber-50 to-white border-r border-amber-100 shadow-sm transition-all duration-300",
            className
        )}>
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-amber-100 shrink-0 bg-white/80 backdrop-blur-sm">
                <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-full opacity-100")}>
                    <div className="h-9 w-9 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 truncate">Admin Portal</span>
                        <span className="text-xs text-slate-500 truncate">Institution Management</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto text-slate-400 hover:text-slate-600 hover:bg-amber-50 shrink-0 transition-all", isCollapsed && "mx-auto")}
                    onClick={toggleCollapse}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Quick Stats - Only visible when expanded */}
            {!isCollapsed && (
                <div className="p-4 pb-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
                            <p className="text-2xl font-bold text-amber-600">{stats?.students?.toLocaleString() || "..."}</p>
                            <p className="text-xs text-slate-500">Students</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
                            <p className="text-2xl font-bold text-emerald-600">{stats?.teachers?.toLocaleString() || "..."}</p>
                            <p className="text-xs text-slate-500">Teachers</p>
                        </div>
                    </div>
                </div>
            )}

            <Separator className={cn("bg-amber-100", isCollapsed && "hidden")} />

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <div className="px-3 space-y-5">
                    {groupedNavItems.map((group) => (
                        <div key={group.group}>
                            {!isCollapsed && (
                                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {group.group}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));

                                    if (item.children) {
                                        return (
                                            <div key={item.label} className="space-y-1">
                                                <div className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600",
                                                    "hover:bg-amber-50 transition-colors"
                                                )}>
                                                    <item.icon className="h-4 w-4 text-amber-600 shrink-0" />
                                                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                                                </div>
                                                {!isCollapsed && (
                                                    <div className="ml-6 space-y-1">
                                                        {item.children.map((child) => {
                                                            const isChildActive = pathname === child.href;
                                                            return (
                                                                <Link
                                                                    key={child.href}
                                                                    href={child.href}
                                                                    onClick={handleLinkClick}
                                                                    className={cn(
                                                                        "flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                                                        isChildActive
                                                                            ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                                                                            : "text-slate-500 hover:bg-amber-50 hover:text-slate-700"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "h-1.5 w-1.5 rounded-full mr-2 shrink-0",
                                                                        isChildActive ? "bg-white" : "bg-amber-300"
                                                                    )} />
                                                                    <span className="truncate">{child.label}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.href!}
                                            href={item.href!}
                                            onClick={handleLinkClick}
                                        >
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start h-10 mb-1 transition-all duration-200 group relative overflow-hidden",
                                                    isActive
                                                        ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 hover:from-amber-600 hover:to-orange-600"
                                                        : "text-slate-600 hover:bg-amber-50 hover:text-amber-700",
                                                    isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"
                                                )}
                                                title={isCollapsed ? item.label : undefined}
                                            >
                                                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-amber-600")} />
                                                {!isCollapsed && (
                                                    <span className="ml-3 truncate flex-1 text-left">{item.label}</span>
                                                )}
                                                {!isCollapsed && item.badge && (
                                                    <Badge className="ml-auto bg-red-500 text-white hover:bg-red-600">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-amber-100 bg-white/60 backdrop-blur-sm mt-auto">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start h-10 transition-colors text-slate-600 hover:bg-amber-50 hover:text-amber-700",
                            isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"
                        )}
                        onClick={logout}
                        title={isCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
                        {!isCollapsed && <span className="ml-3">Logout</span>}
                    </Button>
                </div>

                {!isCollapsed && (
                    <div className="mt-3 px-3 py-2.5 bg-white rounded-xl border border-amber-100 flex items-center gap-3 shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-amber-200 shrink-0">
                            {user?.fullName?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName || "Admin"}</p>
                            <p className="text-xs text-amber-600 truncate font-medium">Administrator</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
