"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScheduleList } from "@/components/dashboard/widgets/ScheduleList";
import { CourseCard } from "@/components/dashboard/widgets/CourseCard";
import { ActionList } from "@/components/dashboard/widgets/ActionList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Bell, User } from "lucide-react"; // Header icons if needed, but we use shared Header

export default function TeacherDashboard() {
    const scheduleItems = [
        { id: "1", title: "Intro to Physics", time: "10:00 AM - 11:30 AM", location: "Room 301", type: "lecture" as const },
        { id: "2", title: "Advanced Chemistry", time: "1:00 PM - 2:30 PM", location: "Lab 4B", type: "lab" as const },
        { id: "3", title: "Faculty Meeting", time: "3:00 PM - 3:45 PM", location: "Conference Hall", type: "meeting" as const },
    ];

    const courses = [
        { title: "Chemistry 204", studentCount: 32, progress: { current: 15, total: 25, label: "Grading Progress" } },
        { title: "Biology 101", studentCount: 28, progress: { current: 20, total: 20, label: "Grading Progress" } },
        { title: "Intro to Physics", studentCount: 45, progress: { current: 12, total: 30, label: "Grading Progress" } },
        { title: "Literature Seminar", studentCount: 18, progress: { current: 5, total: 15, label: "Grading Progress" } },
    ];

    const actionItems = [
        { id: "1", type: "grade" as const, title: "Grade 3 new assignments in 'Biology 101'", subtitle: "Biology 101", actionLabel: "View Submissions" },
        { id: "2", type: "message" as const, title: "New message from John Doe", subtitle: "Reply Now", actionLabel: "Reply Now" },
        { id: "3", type: "form" as const, title: "Field trip form due Friday", subtitle: "Complete Form", actionLabel: "Complete Form" },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Teacher Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, Professor Smith! Here&apos;s a look at your day.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="bg-white text-[#1a3d32] border-gray-200">Take Attendance</Button>
                        <Button className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">Create Announcement</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left Column: Schedule & Actions */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Today&apos;s Schedule</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScheduleList items={scheduleItems} />
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Action Required</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ActionList items={actionItems} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Courses */}
                    <div className="md:col-span-8">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">My Courses</CardTitle>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {courses.map((course) => (
                                        <CourseCard key={course.title} {...course} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
