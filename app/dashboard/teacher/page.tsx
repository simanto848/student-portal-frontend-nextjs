"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScheduleList } from "@/components/dashboard/widgets/ScheduleList";
import { CourseCard } from "@/components/dashboard/widgets/CourseCard";
import { ActionList } from "@/components/dashboard/widgets/ActionList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Search, Bell, User } from "lucide-react"; 
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/academic/schedule.service";
import { batchCourseInstructorService } from "@/services/enrollment/batchCourseInstructor.service";
import { CourseSchedule } from "@/services/academic/types";
import { BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
    const [courses, setCourses] = useState<BatchCourseInstructor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [scheduleData, coursesData] = await Promise.all([
                scheduleService.getScheduleByTeacher(user!.id),
                batchCourseInstructorService.getInstructorCourses(user!.id)
            ]);
            setSchedules(scheduleData);
            setCourses(coursesData);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    // Filter schedule for today
    const today = format(new Date(), 'EEEE'); // e.g., "Monday"
    const todaySchedules = schedules
        .filter(s => s.daysOfWeek.includes(today as any))
        .map(s => ({
            id: s.id,
            title: (s.sessionCourse as any)?.course?.name || "Untitled Course",
            time: `${s.startTime} - ${s.endTime}`,
            location: (s.classroom as any)?.roomNumber ? `Room ${(s.classroom as any).roomNumber}` : "TBD",
            type: (s.classType.toLowerCase()) as "lecture" | "lab" | "meeting" // map type
        }));

    // Map courses to widgets
    const courseWidgets = courses.map(c => ({
        title: c.course?.name || "Unknown Course",
        code: c.course?.code,
        studentCount: c.batch?.currentStudents || 0,
        // Mock progress for now as per plan
        progress: { current: 0, total: c.batch?.currentStudents || 0, label: "Grading Progress" }
    }));

    const actionItems = [
        { id: "1", type: "form" as const, title: "Mark Attendance", subtitle: "For today's classes", actionLabel: "Go to Attendance", onClick: () => router.push('/dashboard/teacher/attendance') },
        // Add more dynamic actions later
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Teacher Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.fullName}! Here&apos;s a look at your day.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="bg-white text-[#1a3d32] border-gray-200"
                            onClick={() => router.push('/dashboard/teacher/attendance')}
                        >
                            Take Attendance
                        </Button>
                        <Button
                            className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]"
                            onClick={() => router.push('/dashboard/teacher/communication')}
                        >
                            Communication
                        </Button>
                        <Button
                            className="bg-[#1a3d32] text-white hover:bg-[#142e26]"
                            onClick={() => router.push('/dashboard/teacher/classroom')}
                        >
                            Go to Classroom
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left Column: Schedule & Actions */}
                    <div className="md:col-span-4 space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Today&apos;s Schedule ({today})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {todaySchedules.length > 0 ? (
                                    <ScheduleList items={todaySchedules} />
                                ) : (
                                    <p className="text-muted-foreground text-sm">No classes scheduled for today.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Quick Actions</CardTitle>
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
                                {loading ? (
                                    <p>Loading courses...</p>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {courseWidgets.length > 0 ? (
                                            courseWidgets.map((course, idx) => (
                                                <CourseCard key={idx} {...course} />
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground">No courses assigned yet.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
