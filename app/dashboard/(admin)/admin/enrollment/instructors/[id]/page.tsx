"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService } from "@/services/teacher.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { ArrowLeft, Edit, Trash2, Loader2, User, BookOpen, Users, Calendar, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InstructorAssignmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [assignment, setAssignment] = useState<BatchCourseInstructor | null>(null);
    const [instructor, setInstructor] = useState<any>(null);
    const [course, setCourse] = useState<any>(null);
    const [batch, setBatch] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Assignment
            const assignmentData = await batchCourseInstructorService.getAssignment(id);
            setAssignment(assignmentData);

            // 2. Fetch Related Data in Parallel
            if (assignmentData) {
                const [instructorData, courseData, batchData] = await Promise.all([
                    teacherService.getTeacherById(assignmentData.instructorId).catch(() => null),
                    courseService.getCourseById(assignmentData.courseId).catch(() => null),
                    batchService.getBatchById(assignmentData.batchId).catch(() => null)
                ]);

                setInstructor(instructorData);
                setCourse(courseData);
                setBatch(batchData);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            toast.error("Failed to fetch assignment details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to remove this instructor assignment?")) return;
        try {
            await batchCourseInstructorService.deleteAssignment(id);
            toast.success("Instructor removed");
            router.push("/dashboard/admin/enrollment/instructors");
        } catch (error) {
            toast.error("Failed to remove instructor");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
            case 'reassigned':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Reassigned</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!assignment) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                    <h2 className="text-2xl font-bold text-gray-700">Assignment Not Found</h2>
                    <Button onClick={() => router.push("/dashboard/admin/enrollment/instructors")}>
                        Back to List
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Assignment Details</h1>
                            <p className="text-muted-foreground">View detailed information about this instructor assignment</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/dashboard/admin/enrollment/instructors/${id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Instructor Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[#3e6253]" />
                                <CardTitle>Instructor Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {instructor ? (
                                <>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                        <span className="text-sm font-medium">{instructor.fullName}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email:</span>
                                        <span className="text-sm">{instructor.email}</span>
                                    </div>
                                    {instructor.phone && (
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone:</span>
                                            <span className="text-sm">{instructor.phone}</span>
                                        </div>
                                    )}
                                    {instructor.designation && (
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">Designation:</span>
                                            <span className="text-sm">{instructor.designation}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Instructor details not available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Course Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-[#3e6253]" />
                                <CardTitle>Course Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {course ? (
                                <>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Course Name:</span>
                                        <span className="text-sm font-medium">{course.name}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Code:</span>
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{course.code}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Credits:</span>
                                        <span className="text-sm">{course.credit}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Type:</span>
                                        <span className="text-sm capitalize">{course.courseType}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Course details not available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Batch Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-[#3e6253]" />
                                <CardTitle>Batch Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {batch ? (
                                <>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Batch Name:</span>
                                        <span className="text-sm font-medium">{batch.name}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Current Sem:</span>
                                        <span className="text-sm">Semester {batch.currentSemester}</span>
                                    </div>
                                    {batch.department && (
                                        <div className="grid grid-cols-[100px_1fr] gap-2">
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Dept:</span>
                                            <span className="text-sm">{typeof batch.department === 'object' ? batch.department.name : 'Unknown'}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Batch details not available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assignment Status Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-[#3e6253]" />
                                <CardTitle>Assignment Status</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <div>{getStatusBadge(assignment.status)}</div>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Assigned Date:</span>
                                <span className="text-sm">{assignment.assignedDate ? format(new Date(assignment.assignedDate), "MMMM d, yyyy") : "-"}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Semester:</span>
                                <span className="text-sm">Semester {assignment.semester}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Assignment ID:</span>
                                <span className="text-xs font-mono text-muted-foreground">{assignment.id}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
