"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_THEMES } from "@/config/themes";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user } = useAuth();

    // Determine current theme
    const theme = user && ROLE_THEMES[user.role]
        ? ROLE_THEMES[user.role]
        : ROLE_THEMES.default;

    return (
        <div className={`flex min-h-screen ${theme.colors.main.bg}`}>
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
