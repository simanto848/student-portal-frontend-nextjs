"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertsProvider } from "@/contexts/AlertsContext";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <AlertsProvider>
            <div className="flex min-h-screen bg-linear-to-br from-slate-50 via-amber-50/30 to-slate-50">
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
                ${isCollapsed ? 'w-16' : 'w-72'}
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                    <AdminSidebar
                        isCollapsed={isCollapsed}
                        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                        onClose={() => setSidebarOpen(false)}
                    />
                </aside>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-72'}`}>
                    {/* Mobile Header */}
                    <header className="lg:hidden h-16 bg-white border-b border-amber-100 flex items-center px-4 sticky top-0 z-30">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <span className="ml-3 font-semibold text-lg text-slate-800">Admin Portal</span>
                        <div className="ml-auto flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5 text-slate-500" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                            </Button>
                        </div>
                    </header>

                    {/* Desktop Header */}
                    <header className="hidden lg:flex h-16 items-center justify-between px-6 bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    className="w-80 bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-all"
                                    placeholder="Search students, courses, teachers..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-amber-50">
                                <Bell className="h-5 w-5" />
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 text-white text-[10px]">
                                    8
                                </Badge>
                            </Button>
                            <div className="h-6 w-px bg-slate-200" />
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-slate-800">Admin User</p>
                                    <p className="text-xs text-slate-500">Administrator</p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-amber-200">
                                    <AvatarImage src="/placeholder.svg" />
                                    <AvatarFallback className="bg-linear-to-br from-amber-500 to-orange-500 text-white font-semibold">
                                        A
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AlertsProvider>
    );
}
