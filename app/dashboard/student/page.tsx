"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScheduleList } from "@/components/dashboard/widgets/ScheduleList";
import { GradeCircle } from "@/components/dashboard/widgets/GradeCircle";
import { LibraryList } from "@/components/dashboard/widgets/LibraryList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Calendar, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentDashboard() {
    const { user } = useAuth();

    const scheduleItems = [
        { id: "1", title: "CS101: Intro to Computer Science", time: "10:00 AM", location: "Building A, Room 210", type: "lecture" as const },
        { id: "2", title: "MATH203: Calculus II", time: "1:00 PM", location: "Science Hall, Room 105", type: "lecture" as const },
        { id: "3", title: "HIST110: World History", time: "3:30 PM", location: "Online via Zoom", type: "lecture" as const },
    ];

    const grades = [
        { subject: "CS101", grade: "A", percentage: 91, color: "#3e6253" },
        { subject: "MATH203", grade: "A", percentage: 94, color: "#3e6253" },
        { subject: "HIST110", grade: "B+", percentage: 88, color: "#3e6253" },
    ];

    const libraryItems = [
        { id: "1", title: "The Art of Computer Programming", dueDate: "2 days", status: "due_soon" as const },
        { id: "2", title: "A Brief History of Time", dueDate: "1 day", status: "overdue" as const },
        { id: "3", title: "Introduction to Algorithms", dueDate: "14 days", status: "normal" as const },
    ];

    const notifications = [
        { id: "1", title: "Tuition Payment Due", message: "The deadline for Fall semester tuition is approaching.", time: "2 hours ago", icon: CreditCard },
        { id: "2", title: "Assignment Graded", message: 'Your CS101 assignment "Binary Trees" has been graded.', time: "1 day ago", icon: Megaphone },
        { id: "3", title: "Campus Career Fair", message: "Don't miss the annual career fair this Friday in the main hall.", time: "3 days ago", icon: Calendar },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Good Morning, {user?.fullName?.split(' ')[0] || "Student"}!</h1>
                        <p className="text-muted-foreground">Here&apos;s your summary for today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">Register for Classes</Button>
                        <Button variant="outline" className="bg-[#dcdcd5] text-[#1a3d32] border-none hover:bg-[#cfcfc8]">Pay Tuition</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left Column: Classes & Grades */}
                    <div className="md:col-span-8 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Upcoming Classes</CardTitle>
                                <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
                            </CardHeader>
                            <CardContent>
                                <ScheduleList items={scheduleItems} />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Grade Summary</CardTitle>
                                <Button variant="link" className="text-[#3e6253] font-bold">View Details</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {grades.map((grade) => (
                                        <GradeCircle key={grade.subject} {...grade} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Notifications & Library */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Notifications</CardTitle>
                                <Button variant="link" className="text-xs text-muted-foreground">View All</Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="flex gap-3">
                                        <notif.icon className="h-5 w-5 text-[#3e6253] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-[#1a3d32] text-sm">{notif.title}</p>
                                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Library Due Dates</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LibraryList items={libraryItems} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
