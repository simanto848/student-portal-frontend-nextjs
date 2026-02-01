"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Users,
    Settings,
    LogOut,
    ChevronRight,
    ChevronLeft,
    LayoutDashboard,
    Shield,
    Activity,
    Database,
    FileText,
    Bell,
    Search,
    GraduationCap,
    Globe,
    Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SuperAdminSidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    className?: string;
    onClose?: () => void;
}

import { superAdminNavigation, NavItem } from "@/config/navigation";

const GROUP_ORDER = ["Overview", "User Management", "System", "Monitoring", "Reports"];

interface GroupedNavigation {
    group: string;
    items: NavItem[];
}

export function SuperAdminSidebar({ isCollapsed, toggleCollapse, className, onClose }: SuperAdminSidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    const groupedNavItems = useMemo(() => {
        const groups: Record<string, NavItem[]> = {};
        GROUP_ORDER.forEach(g => { groups[g] = []; });

        superAdminNavigation.forEach(item => {
            const groupName = item.group || "Other";
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
                // If both are in the order list, sort by index
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                // If only A is in list, A comes first
                if (indexA !== -1) return -1;
                // If only B is in list, B comes first
                if (indexB !== -1) return 1;
                // Otherwise alphabetical
                return a[0].localeCompare(b[0]);
            })
            .map(([group, items]) => ({ group, items }));
    }, []);

    return (
        <div className={cn(
            "h-full flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800 transition-all duration-300",
            className
        )}>
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0">
                <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-full opacity-100")}>
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-100 truncate">Admin Console</span>
                        <span className="text-xs text-slate-500 truncate">Super Admin Access</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("ml-auto text-slate-400 hover:text-slate-100 hover:bg-slate-800 shrink-0 transition-all", isCollapsed && "mx-auto")}
                    onClick={toggleCollapse}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Search - Only visible when expanded */}
            {!isCollapsed && (
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            placeholder="Quick jump..."
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <div className="px-3 space-y-6">
                    {groupedNavItems.map((group, idx) => (
                        <div key={group.group}>
                            {!isCollapsed && (
                                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    {group.group}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
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
                                                        ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300"
                                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
                                                    isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"
                                                )}
                                                title={isCollapsed ? item.label : undefined}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeNavIndicator"
                                                        className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    />
                                                )}
                                                <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                                                {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
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
            <div className="p-3 border-t border-slate-800 mt-auto">
                <div className="space-y-1">
                    <Link href="/dashboard/settings" onClick={handleLinkClick}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start h-10 transition-colors",
                                "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
                                isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"
                            )}
                            title={isCollapsed ? "Settings" : undefined}
                        >
                            <Settings className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span className="ml-3">Settings</span>}
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start h-10 transition-colors hover:bg-red-500/10 hover:text-red-400 text-slate-400",
                            isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3"
                        )}
                        onClick={logout}
                        title={isCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span className="ml-3">Logout</span>}
                    </Button>
                </div>

                {!isCollapsed && (
                    <div className="mt-4 px-3 py-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user?.fullName?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName || "Admin"}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
