"use client";

import { useState } from "react";
import { SuperAdminSidebar } from "@/components/dashboard/super-admin/SuperAdminSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertsProvider } from "@/contexts/AlertsContext";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <AlertsProvider>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-16' : 'w-64'}
                lg:translate-x-0 bg-slate-950
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                    <SuperAdminSidebar
                        isCollapsed={isCollapsed}
                        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                        onClose={() => setSidebarOpen(false)}
                    />
                </aside>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
                    {/* Mobile Header */}
                    <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sticky top-0 z-30">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <span className="ml-3 font-semibold text-lg">Admin Console</span>
                    </header>

                    <main className="flex-1 p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AlertsProvider>
    );
}
