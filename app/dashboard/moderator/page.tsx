"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/widgets/StatCard";
import { ActivityList } from "@/components/dashboard/widgets/ActivityList";
import { ActionTable } from "@/components/dashboard/widgets/ActionTable";
import { Flag, MessageSquare, ShieldAlert, UserX, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ModeratorDashboard() {
    const stats = [
        { title: "Password Reset Requests", value: "24", change: { value: "+4", trend: "up" as const } },
        { title: "Locked Accounts", value: "15", change: { value: "-2", trend: "down" as const } },
        { title: "Identity Verifications", value: "8", change: { value: "High", trend: "up" as const } },
        { title: "Active Tickets", value: "12", change: { value: "Stable", trend: "neutral" as const } },
    ];

    const moderationLog = [
        { id: "1", type: "warning" as const, title: "Reset password for Student @john_doe", time: "30 mins ago" },
        { id: "2", type: "ban" as const, title: "Unlocked account for Faculty @dr_smith", time: "2 hours ago" },
        { id: "3", type: "resolution" as const, title: "Resolved login issue for Staff #4521", time: "4 hours ago" },
        { id: "4", type: "approval" as const, title: "Approved profile photo update", time: "Yesterday" },
    ];

    // Adapting ActionTable for Reports
    const pendingReports = [
        { id: "1", request: "Password Reset", requestor: "Student: Jane Doe", date: "2024-07-21" },
        { id: "2", request: "Account Lockout", requestor: "Faculty: Dr. Alan", date: "2024-07-21" },
        { id: "3", request: "Email Change Request", requestor: "Staff: Sarah C.", date: "2024-07-20" },
        { id: "4", request: "Login Failure Investigation", requestor: "System Alert", date: "2024-07-19" },
    ];

    const modPanels = [
        { title: "Manage Students", icon: UserX, count: "View All" },
        { title: "Manage Faculty", icon: UserX, count: "View All" },
        { title: "Manage Staff", icon: UserX, count: "View All" },
        { title: "Support Tickets", icon: MessageSquare, count: "15 Open" },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Moderator Dashboard</h1>
                    <p className="text-muted-foreground">User Account Support & Management</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                    <div className="col-span-2">
                        <Card className="h-full">
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4 text-[#1a3d32] flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5" /> Account Requests
                                </h3>
                                <ActionTable
                                    items={pendingReports}
                                    onApprove={(id) => console.log("Resolve", id)}
                                    onDeny={(id) => console.log("Escalate", id)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-span-1 space-y-4">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4 text-[#1a3d32] flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" /> Quick Actions
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {modPanels.map((panel) => (
                                        <div key={panel.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                            <div className="flex items-center gap-3">
                                                <panel.icon className="h-5 w-5 text-[#1a3d32]" />
                                                <span className="font-medium text-sm">{panel.title}</span>
                                            </div>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{panel.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4 text-[#1a3d32]">Support Log</h3>
                                <ActivityList items={moderationLog.map(item => ({ ...item, type: item.type as any }))} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
