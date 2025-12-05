"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Users, Calendar, GraduationCap, ArrowLeft } from "lucide-react";

export default function CourseDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [assignment, setAssignment] = useState<BatchCourseInstructor | null>(null);
    const [students, setStudents] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchCourseDetails();
        }
    }, [id]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const assignmentData = await batchCourseInstructorService.getAssignment(id as string);
            setAssignment(assignmentData);

            // Fetch students enrolled in this batch & course
            const studentsData = await enrollmentService.listEnrollments({
                batchId: assignmentData.batchId,
                courseId: assignmentData.courseId,
                semester: assignmentData.semester // Filter by this semester potentially?
            });
            setStudents(studentsData.enrollments || []);
        } catch (error) {
            console.error("Fetch course details error:", error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    if (!assignment) return <DashboardLayout><div>Course not found</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">{assignment.course?.name}</h1>
                        <p className="text-muted-foreground">{assignment.course?.code} • {assignment.batch?.name} • Semester {assignment.semester}</p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="grades">Grades</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">Instructor</h3>
                                        <p className="text-sm text-gray-600">{assignment.instructor?.fullName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">Schedule</h3>
                                        <p className="text-sm text-gray-600">TBD</p>
                                        {/* TODO: Fetch schedule for this course */}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">Description</h3>
                                        <p className="text-sm text-gray-600">{assignment.course?.description || "No description available."}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="students" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Enrolled Students ({students.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Registration No</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((enrollment) => (
                                            <TableRow key={enrollment.id}>
                                                <TableCell className="font-medium">{enrollment.student?.registrationNumber}</TableCell>
                                                <TableCell>{enrollment.student?.fullName}</TableCell>
                                                <TableCell className="capitalize">{enrollment.status}</TableCell>
                                            </TableRow>
                                        ))}
                                        {students.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground">No students enrolled.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Management</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                                <Calendar className="h-12 w-12 text-muted-foreground" />
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">Mark Attendance</h3>
                                    <p className="text-muted-foreground text-sm">Record attendance for today's class.</p>
                                </div>
                                <Button onClick={() => router.push(`/dashboard/teacher/attendance?courseId=${assignment.courseId}&batchId=${assignment.batchId}`)}>
                                    Go to Attendance
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="grades" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade Management</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                                <GraduationCap className="h-12 w-12 text-muted-foreground" />
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">Input Grades</h3>
                                    <p className="text-muted-foreground text-sm">Manage student grades and assessments.</p>
                                </div>
                                <Button onClick={() => router.push(`/dashboard/teacher/grading?courseId=${assignment.courseId}&batchId=${assignment.batchId}`)}>
                                    Go to Gradebook
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
