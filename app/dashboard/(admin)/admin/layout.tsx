"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";
import { AlertsProvider } from "@/contexts/AlertsContext";
import { DashboardThemeProvider } from "@/contexts/DashboardThemeContext";
import { useTeachers } from "@/hooks/queries/useTeacherQueries";
import { studentService } from "@/services/user/student.service";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [stats, setStats] = useState<{ students: number; teachers: number }>({ students: 0, teachers: 0 });

    // Fetch Teachers using Hook
    const { data: teachers } = useTeachers();

    // Fetch Students using Service
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Fetch with limit 1 just to get the total count from pagination
                const { pagination } = await studentService.getAll({ limit: 1 });
                if (pagination?.total) {
                    setStats(prev => ({ ...prev, students: pagination.total }));
                }
            } catch (error) {
                console.error("Failed to fetch student stats:", error);
            }
        };
        fetchStudents();
    }, []);

    // Update stats when teachers data changes
    useEffect(() => {
        if (teachers) {
            setStats(prev => ({ ...prev, teachers: teachers.length }));
        }
    }, [teachers]);

    return (
        <DashboardThemeProvider>
            <AlertsProvider>
                <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50">
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
                            stats={stats}
                        />
                    </aside>

                    {/* Main Content */}
                    <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-72'}`}>
                        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </AlertsProvider>
        </DashboardThemeProvider>
    );
}
