"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    GraduationCap,
    Building2,
    ShieldCheck,
    ChevronRight,
    RefreshCw,
    Plus,
    UserPlus,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { systemService, DatabaseStats } from "@/services/system.service";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { cn } from "@/lib/utils";

interface UserCategory {
    title: string;
    description: string;
    icon: React.ElementType;
    count: number;
    href: string;
    color: string;
    bgColor: string;
    borderColor: string;
    features: string[];
}

export default function UsersManagementPage() {
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await systemService.getDatabaseStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch user stats:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const userCategories: UserCategory[] = [
        {
            title: "Administrators",
            description: "Manage system admins and school administrators with full system access",
            icon: ShieldCheck,
            count: stats?.counts?.admins || 0,
            href: "/dashboard/super-admin/users/admins",
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-100 dark:bg-red-900/30",
            borderColor: "border-red-200 dark:border-red-800",
            features: ["Full Access", "System Config", "User Management"]
        },
        {
            title: "Faculty Members",
            description: "Teachers, professors, and academic staff managing courses and students",
            icon: GraduationCap,
            count: stats?.counts?.teachers || 0,
            href: "/dashboard/super-admin/users/faculty",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
            borderColor: "border-blue-200 dark:border-blue-800",
            features: ["Course Management", "Grade Entry", "Student Supervision"]
        },
        {
            title: "Support Staff",
            description: "Operational staff, librarians, and diverse support roles",
            icon: Building2,
            count: stats?.counts?.staff || 0,
            href: "/dashboard/super-admin/users/staff",
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
            borderColor: "border-orange-200 dark:border-orange-800",
            features: ["Library Access", "Support Tickets", "Resource Management"]
        },
        {
            title: "Students",
            description: "Enrolled students across all departments and programs",
            icon: Users,
            count: stats?.counts?.students || 0,
            href: "/dashboard/super-admin/users/students",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100 dark:bg-green-900/30",
            borderColor: "border-green-200 dark:border-green-800",
            features: ["Course Enrollment", "Grade View", "Resource Access"]
        }
    ];

    const totalUsers = userCategories.reduce((acc, cat) => acc + cat.count, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title="User Management"
                subtitle="Overview of all system users by category with management options"
                icon={Users}
                extraActions={
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={fetchStats}
                            variant="outline"
                            size="sm"
                            className="gap-2 border-slate-200 dark:border-slate-700"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Users"
                    value={totalUsers.toLocaleString()}
                    icon={Users}
                    className="border-l-4 border-l-indigo-500"
                    iconClassName="text-indigo-500"
                    iconBgClassName="bg-indigo-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Students"
                    value={stats?.counts?.students || 0}
                    icon={GraduationCap}
                    className="border-l-4 border-l-green-500"
                    iconClassName="text-green-500"
                    iconBgClassName="bg-green-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Faculty"
                    value={stats?.counts?.teachers || 0}
                    icon={ShieldCheck}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-500"
                    iconBgClassName="bg-blue-500/10"
                    loading={loading}
                />
                <StatsCard
                    title="Staff & Admins"
                    value={(stats?.counts?.staff || 0) + (stats?.counts?.admins || 0)}
                    icon={Building2}
                    className="border-l-4 border-l-orange-500"
                    iconClassName="text-orange-500"
                    iconBgClassName="bg-orange-500/10"
                    loading={loading}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userCategories.map((category) => (
                    <Link key={category.title} href={`${category.href}/create`}>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start gap-2 h-auto py-3 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
                                category.borderColor
                            )}
                        >
                            <div className={cn("p-1.5 rounded-lg", category.bgColor)}>
                                <Plus className={cn("h-4 w-4", category.color)} />
                            </div>
                            <span className="text-sm font-medium">Add {category.title.split(" ")[0]}</span>
                        </Button>
                    </Link>
                ))}
            </div>

            {/* User Categories Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {userCategories.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={category.href} className="block h-full">
                            <Card className={cn(
                                "h-full transition-all duration-300 hover:shadow-lg cursor-pointer group border-slate-200 dark:border-slate-800",
                                category.borderColor
                            )}>
                                <CardHeader className="flex flex-row items-start gap-4 pb-3">
                                    <div className={cn(
                                        "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                                        category.bgColor
                                    )}>
                                        <category.icon className={cn("h-7 w-7", category.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl">{category.title}</CardTitle>
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <CardDescription className="mt-1">
                                            {loading ? (
                                                <span className="animate-pulse">Loading...</span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {category.count.toLocaleString()}
                                                    </span>
                                                    <span>Active Users</span>
                                                </span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {category.description}
                                    </p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2">
                                        {category.features.map((feature) => (
                                            <Badge
                                                key={feature}
                                                variant="secondary"
                                                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                            >
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Action Hint */}
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span>Click to manage {category.title.toLowerCase()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Summary Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                                    User Management Overview
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Total of {totalUsers.toLocaleString()} users across {userCategories.length} categories
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/super-admin/users/students/create">
                                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <UserPlus className="h-4 w-4" />
                                    Quick Add User
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
