"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Building,
    Layers,
    Clock,
    UserCog,
    FileText,
    Settings,
    Shield
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTeachers } from "@/hooks/queries/useTeacherQueries";
import { useCourses } from "@/hooks/queries/useAcademicQueries";
import { studentService } from "@/services/user/student.service";

export default function AdminDashboard() {
    const [stats, setStats] = useState<{
        students: number;
        teachers: number;
        courses: number;
    }>({ students: 0, teachers: 0, courses: 0 });

    const { data: teachers } = useTeachers();
    const { data: courses } = useCourses();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { pagination } = await studentService.getAll({ limit: 1 });
                if (pagination?.total) {
                    setStats(prev => ({ ...prev, students: pagination.total }));
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        setStats(prev => ({
            ...prev,
            teachers: teachers?.length || 0,
            courses: courses?.length || 0
        }));
    }, [teachers, courses]);

    const modules = [
        {
            title: "User Management",
            items: [
                { title: "Students", href: "/dashboard/admin/users/students", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Faculty", href: "/dashboard/admin/users/faculty", icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50" },
                { title: "Moderators", href: "/dashboard/admin/users/moderators", icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
                { title: "Staff", href: "/dashboard/admin/users/staff", icon: UserCog, color: "text-orange-600", bg: "bg-orange-50" },
            ]
        },
        {
            title: "Academic Structure",
            items: [
                { title: "Departments", href: "/dashboard/admin/academic/department", icon: Building, color: "text-indigo-600", bg: "bg-indigo-50" },
                { title: "Programs", href: "/dashboard/admin/academic/program", icon: Layers, color: "text-pink-600", bg: "bg-pink-50" },
                { title: "Batches", href: "/dashboard/admin/academic/batch", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
                { title: "Sessions", href: "/dashboard/admin/academic/session", icon: Calendar, color: "text-violet-600", bg: "bg-violet-50" },
            ]
        },
        {
            title: "Course Management",
            items: [
                { title: "Courses", href: "/dashboard/admin/academic/course", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50" },
                { title: "Syllabus", href: "/dashboard/admin/academic/syllabus", icon: FileText, color: "text-teal-600", bg: "bg-teal-50" },
                { title: "Schedule", href: "/dashboard/admin/academic/schedule", icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
                { title: "Prerequisites", href: "/dashboard/admin/academic/prerequisite", icon: CheckCircle, color: "text-lime-600", bg: "bg-lime-50" },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Institution Dashboard</h1>
                <p className="mt-2 text-slate-500">Welcome to the central administration hub. Manage users, academics, and schedules.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Students</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.students?.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-600">Active students</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Users className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Faculty</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.teachers?.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-600">Active faculty</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Courses</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.courses?.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                                    <span className="text-xs font-medium text-slate-500">All programs</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation Modules */}
            <div className="space-y-6">
                {modules.map((module, index) => (
                    <div key={index} className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-900 pl-1">{module.title}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {module.items.map((item, idx) => (
                                <Link key={idx} href={item.href}>
                                    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 group overflow-hidden relative">
                                        <CardContent className="p-5 flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                <item.icon className={`h-6 w-6 ${item.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                                <p className="text-xs text-slate-500 mt-1">Manage {item.title.toLowerCase()}</p>
                                            </div>
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
