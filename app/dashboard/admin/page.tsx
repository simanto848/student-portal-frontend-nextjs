"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/widgets/StatCard";
import { SystemHealth } from "@/components/dashboard/widgets/SystemHealth";
import { EnrollmentChart } from "@/components/dashboard/widgets/EnrollmentChart";
import { ActivityList } from "@/components/dashboard/widgets/ActivityList";
import { ActionTable } from "@/components/dashboard/widgets/ActionTable";
import { Users, BookOpen, FileText, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
    const stats = [
        { title: "Total Active Students", value: "12,456", change: { value: "+2.5%", trend: "up" as const } },
        { title: "Total Faculty Members", value: "832", change: { value: "+1.2%", trend: "up" as const } },
        { title: "Active Courses", value: "1,102", change: { value: "+5.0%", trend: "up" as const } },
        { title: "System Uptime", value: "99.98%", change: { value: "+0.01%", trend: "up" as const } },
    ];

    const activities = [
        { id: "1", type: "approval" as const, title: 'Course "Intro to AI" approved', time: "1 hour ago" },
        { id: "2", type: "new_user" as const, title: "New faculty account created", time: "3 hours ago" },
        { id: "3", type: "alert" as const, title: "Login failures detected", time: "5 hours ago" },
        { id: "4", type: "backup" as const, title: "System backup completed", time: "Yesterday" },
    ];

    const actionItems = [
        { id: "1", request: 'New Course: "Intro to AI"', requestor: "Dr. Alan Grant", date: "2024-07-21" },
        { id: "2", request: 'Faculty Account: "Ellie Sattler"', requestor: "HR Department", date: "2024-07-20" },
        { id: "3", request: 'Syllabus Update: "CS101"', requestor: "Prof. Ian Malcolm", date: "2024-07-19" },
        { id: "4", request: "New User Registration", requestor: "System", date: "2024-07-18" },
    ];

    const managementPanels = [
        { title: "User Management", icon: Users },
        { title: "Course Catalog", icon: BookOpen },
        { title: "System Reports", icon: FileText },
        { title: "System Settings", icon: Settings },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Administrator Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, Admin!</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                <SystemHealth />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4">
                        <EnrollmentChart />
                    </div>
                    <div className="col-span-3">
                        <Card className="h-full">
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4 text-[#1a3d32]">Recent Activity</h3>
                                <ActivityList items={activities} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <div>
                        <h3 className="text-xl font-bold text-[#1a3d32] mb-4">Action Required</h3>
                        <ActionTable
                            items={actionItems}
                            onApprove={(id) => console.log("Approve", id)}
                            onDeny={(id) => console.log("Deny", id)}
                        />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#1a3d32] mb-4">Management Panels</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {managementPanels.map((panel) => (
                                <Card key={panel.title} className="hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center p-6 h-40">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                        <panel.icon className="h-6 w-6 text-[#1a3d32]" />
                                    </div>
                                    <span className="font-medium text-[#1a3d32]">{panel.title}</span>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
