"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, Building2, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function UsersManagementPage() {
    const userCategories = [
        {
            title: "Administrators",
            description: "Manage system admins and school administrators",
            icon: ShieldCheck,
            count: 18,
            href: "/dashboard/super-admin/users/admins",
            color: "text-red-600",
            bgColor: "bg-red-100"
        },
        {
            title: "Faculty Members",
            description: "Teachers, professors, and academic staff",
            icon: GraduationCap,
            count: 842,
            href: "/dashboard/super-admin/users/faculty",
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Support Staff",
            description: "Operational staff, librarians, and diverse roles",
            icon: Building2,
            count: 320,
            href: "/dashboard/super-admin/users/staff",
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        },
        {
            title: "Students",
            description: "Enrolled students across all departments",
            icon: Users,
            count: 12543,
            href: "/dashboard/super-admin/users/students",
            color: "text-green-600",
            bgColor: "bg-green-100"
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Overview of all system users by category</p>
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
                                            <CardDescription>{category.count.toLocaleString()} Active Users</CardDescription>
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
