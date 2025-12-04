"use client";

import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, BookOpen, FileText, ClipboardCheck, Settings } from "lucide-react";

export default function EnrollmentDashboardPage() {
    const router = useRouter();

    const cards = [
        {
            title: "Enrollments",
            description: "Manage student enrollments in batches and courses.",
            icon: Users,
            href: "/dashboard/admin/enrollment/enrollments",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Instructors",
            description: "Assign teachers to courses and batches.",
            icon: GraduationCap,
            href: "/dashboard/admin/enrollment/instructors",
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Assessment Types",
            description: "Configure assessment types (Quiz, Midterm, Final).",
            icon: Settings,
            href: "/dashboard/admin/enrollment/assessments/types",
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Grade Workflow",
            description: "Review and approve grades submitted by teachers.",
            icon: ClipboardCheck,
            href: "/dashboard/admin/enrollment/grades/workflow",
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Enrollment Management</h1>
                    <p className="text-muted-foreground">
                        Manage student enrollments, course instructors, assessments, and grades.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <Card key={card.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(card.href)}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className={`p-3 rounded-full ${card.bgColor}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{card.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{card.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
