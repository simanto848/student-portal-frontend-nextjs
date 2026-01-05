"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Building2, ShieldCheck, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { systemService, DatabaseStats } from "@/services/system.service";

export default function UsersManagementPage() {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await systemService.getDatabaseStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const userCategories = [
        {
            title: "Administrators",
            description: "Manage system admins and school administrators",
            icon: ShieldCheck,
            count: stats?.counts?.admins || 0,
            href: "/dashboard/super-admin/users/admins",
            color: "text-red-600",
            bgColor: "bg-red-100"
        },
        {
            title: "Faculty Members",
            description: "Teachers, professors, and academic staff",
            icon: GraduationCap,
            count: stats?.counts?.teachers || 0,
            href: "/dashboard/super-admin/users/faculty",
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Support Staff",
            description: "Operational staff, librarians, and diverse roles",
            icon: Building2,
            count: stats?.counts?.staff || 0,
            href: "/dashboard/super-admin/users/staff",
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        },
        {
            title: "Students",
            description: "Enrolled students across all departments",
            icon: Users,
            count: stats?.counts?.students || 0,
            href: "/dashboard/super-admin/users/students",
            color: "text-green-600",
            bgColor: "bg-green-100"
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Overview of all system users by category</p>
                    </div>
                    <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {userCategories.map((category) => (
                        <div key={category.title} className="group relative">
                            <Link href={category.href}>
                                <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className={`p-3 rounded-lg ${category.bgColor}`}>
                                            <category.icon className={`h-6 w-6 ${category.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle>{category.title}</CardTitle>
                                            <CardDescription>
                                                {loading ? "Loading..." : `${category.count.toLocaleString()} Active Users`}
                                            </CardDescription>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {category.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
