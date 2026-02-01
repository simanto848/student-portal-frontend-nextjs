"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { DashboardTheme, ROLE_THEMES } from "@/config/themes";
import { UserRole } from "@/types/user";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

import { AlertsProvider } from "@/contexts/AlertsContext";

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <DashboardThemeProvider>
            <AlertsProvider>
                <DashboardLayoutInner>
                    {children}
                </DashboardLayoutInner>
            </AlertsProvider>
        </DashboardThemeProvider>
    );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user } = useAuth();
    const normalizedRole = user?.role?.toLowerCase() as UserRole;
    const theme = normalizedRole && ROLE_THEMES[normalizedRole]
        ? ROLE_THEMES[normalizedRole]
        : ROLE_THEMES.default;

    const containerStyle = {
        "--theme-primary": theme.colors.accent.secondary.replace("bg-", ""),
        "--theme-text-primary": theme.colors.accent.primary.replace("text-", ""),
        "--theme-bg-main": theme.colors.main.bg.replace("bg-", ""),
        "--theme-sidebar-bg": theme.colors.sidebar.bg.replace("bg-", ""),
        "--theme-header-bg": theme.colors.header.bg.replace("bg-", ""),
    } as React.CSSProperties;

    return (
        <div className={`flex min-h-screen ${theme.colors.main.bg}`} style={containerStyle}>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed on desktop, drawer on mobile */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    theme={theme}
                />
            </aside>

            {/* Main content area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    theme={theme}
                />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
