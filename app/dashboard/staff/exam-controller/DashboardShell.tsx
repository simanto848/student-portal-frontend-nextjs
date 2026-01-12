"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ROLE_THEMES, DashboardTheme } from "@/config/themes";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { UserRole } from "@/types/user";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get theme based on user role
    const theme: DashboardTheme = user
        ? ROLE_THEMES[user.role] || ROLE_THEMES.default
        : ROLE_THEMES.default;

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <DashboardThemeProvider>
            <div className={`flex h-screen overflow-hidden ${theme.colors.main.bg}`}>
                {/* Sidebar - Desktop */}
                <aside
                    className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-72"
                        }`}
                >
                    <Sidebar
                        isCollapsed={isCollapsed}
                        toggleCollapse={toggleCollapse}
                        theme={theme}
                    />
                </aside>

                {/* Sidebar - Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-300">
                            <Sidebar
                                onClose={() => setMobileMenuOpen(false)}
                                theme={theme}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Header
                        onMenuClick={() => setMobileMenuOpen(true)}
                        theme={theme}
                    />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                        {children}
                    </main>
                </div>
            </div>
        </DashboardThemeProvider>
    );
}
