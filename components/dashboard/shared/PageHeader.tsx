"use client";

import { Button } from "@/components/ui/button";
import { Plus, LucideIcon } from "lucide-react";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { motion } from "framer-motion";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: LucideIcon;
    extraActions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actionLabel, onAction, icon: Icon, extraActions }: PageHeaderProps) {
    const theme = useDashboardTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b ${theme.colors.sidebar.borderSubtle}`}
        >
            <div className="flex items-center gap-3">
                {Icon && (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${theme.colors.sidebar.iconBg.replace('bg-', 'from-')}/40 ${theme.colors.sidebar.iconBg.replace('bg-', 'to-')}/10 shadow-sm border ${theme.colors.sidebar.borderSubtle}`}
                    >
                        <Icon className={`h-6 w-6 ${theme.colors.accent.primary}`} />
                    </motion.div>
                )}
                <div>
                    <h1 className={`text-xl sm:text-2xl font-bold ${theme.colors.header.text}`}>{title}</h1>
                    {subtitle && <p className={`text-sm ${theme.colors.sidebar.text}/70`}>{subtitle}</p>}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {extraActions}
                {actionLabel && onAction && (
                    <Button
                        onClick={onAction}
                        className={`${theme.colors.accent.secondary} hover:opacity-90 text-white shadow-md rounded-lg transition-all duration-200 active:scale-95 w-full sm:w-auto px-6`}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {actionLabel}
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
