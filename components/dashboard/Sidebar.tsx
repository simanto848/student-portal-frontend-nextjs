"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    Settings,
    FileText,
    Bell,
    LogOut,
    GraduationCap,
    Building2,
    Library,
    Database
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const role = user?.role || "student";

    const commonLinks = [
        {
            href: `/dashboard/${role}`,
            label: "Dashboard",
            icon: LayoutDashboard,
        },
    ];

    const roleLinks = {
        admin: [
            { href: "/dashboard/admin/users", label: "User Management", icon: Users },
            { href: "/dashboard/admin/courses", label: "Course Catalog", icon: BookOpen },
            { href: "/dashboard/admin/reports", label: "System Reports", icon: FileText },
            { href: "/dashboard/admin/settings", label: "System Settings", icon: Settings },
        ],
        teacher: [
            { href: "/dashboard/teacher/courses", label: "My Courses", icon: BookOpen },
            { href: "/dashboard/teacher/schedule", label: "Schedule", icon: Calendar },
            { href: "/dashboard/teacher/grading", label: "Grading", icon: FileText },
        ],
        student: [
            { href: "/dashboard/student/classes", label: "My Classes", icon: BookOpen },
            { href: "/dashboard/student/grades", label: "Grades", icon: FileText },
            { href: "/dashboard/student/library", label: "Library", icon: Library },
            { href: "/dashboard/student/payments", label: "Payments", icon: Building2 },
        ],
        staff: [], // Staff dashboard skipped for now
    };

    const links = [...commonLinks, ...(roleLinks[role as keyof typeof roleLinks] || [])];

    return (
        <div className={cn("pb-12 min-h-screen bg-[#1a3d32] text-white", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2 px-4 mb-8">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">
                            Student Portal
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                            >
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 hover:bg-white/10 hover:text-white",
                                        pathname === link.href ? "bg-white/10 text-white" : "text-gray-300"
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 px-7 w-full">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-300 hover:bg-white/10 hover:text-white"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
