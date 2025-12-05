"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Users, Calendar, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MyCoursesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<BatchCourseInstructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user?.id) {
            fetchCourses();
        }
    }, [user?.id]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const data = await batchCourseInstructorService.getInstructorCourses(user!.id);
            setCourses(data);
        } catch (error) {
            console.error("Fetch courses error:", error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.batch?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">My Courses</h1>
                        <p className="text-muted-foreground">Manage your assigned courses and batches</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 md:max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-8 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="text-center py-10">Loading courses...</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((assignment) => (
                                <Card key={assignment.id} className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-[#f8f9fa] border-b pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-[#588157]">{assignment.course?.code}</p>
                                                <CardTitle className="text-xl font-bold text-[#1a3d32] mt-1 line-clamp-2" title={assignment.course?.name}>
                                                    {assignment.course?.name}
                                                </CardTitle>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-[#dad7cd] flex items-center justify-center shrink-0">
                                                <BookOpen className="h-5 w-5 text-[#3a5a40]" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-4 w-4" />
                                                <span>{assignment.batch?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>{assignment.semester} Semester</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                                <GraduationCap className="h-4 w-4" />
                                                <span>{assignment.batch?.currentStudents || 0} Students Enrolled</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t bg-gray-50/50 gap-2">
                                        <Button
                                            className="flex-1 bg-[#3a5a40] hover:bg-[#344e41] text-white"
                                            onClick={() => router.push(`/dashboard/teacher/courses/${assignment.id}`)}
                                        >
                                            View Class
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="px-3"
                                            title="Attendance"
                                            onClick={() => router.push(`/dashboard/teacher/attendance?courseId=${assignment.courseId}&batchId=${assignment.batchId}`)}
                                        >
                                            <Users className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="px-3"
                                            title="Grades"
                                            onClick={() => router.push(`/dashboard/teacher/grading?courseId=${assignment.courseId}`)}
                                        >
                                            <GraduationCap className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No courses found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
