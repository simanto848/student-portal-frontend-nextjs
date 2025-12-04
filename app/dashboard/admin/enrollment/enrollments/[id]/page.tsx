"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";
import { studentService } from "@/services/user/student.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { ArrowLeft, Edit, Trash2, Loader2, User, BookOpen, Users, Calendar, Mail, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EnrollmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [student, setStudent] = useState<any>(null);
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
            const enrollmentData = await enrollmentService.getEnrollment(id);
            setEnrollment(enrollmentData);

            if (enrollmentData) {
                const [studentData, courseData, batchData] = await Promise.all([
                    studentService.getById(enrollmentData.studentId).catch(() => null),
                    courseService.getCourseById(enrollmentData.courseId).catch(() => null),
                    batchService.getBatchById(enrollmentData.batchId).catch(() => null)
                ]);

                setStudent(studentData);
                setCourse(courseData);
                setBatch(batchData);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            toast.error("Failed to fetch enrollment details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this enrollment?")) return;
        try {
            await enrollmentService.deleteEnrollment(id);
            toast.success("Enrollment deleted");
            router.push("/dashboard/admin/enrollment/enrollments");
        } catch (error) {
            toast.error("Failed to delete enrollment");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'enrolled':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Enrolled</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
            case 'dropped':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Dropped</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
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

    if (!enrollment) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                    <h2 className="text-2xl font-bold text-gray-700">Enrollment Not Found</h2>
                    <Button onClick={() => router.push("/dashboard/admin/enrollment/enrollments")}>
                        Back to List
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Enrollment Details</h1>
                            <p className="text-muted-foreground">View detailed information about this enrollment</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/dashboard/admin/enrollment/enrollments/${id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Student Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[#3e6253]" />
                                <CardTitle>Student Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {student ? (
                                <>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                        <span className="text-sm font-medium">{student.fullName}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Reg No:</span>
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{student.registrationNumber}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email:</span>
                                        <span className="text-sm">{student.email}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Student details not available</p>
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
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Course Name:</span>
                                        <span className="text-sm font-medium">{course.name}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Code:</span>
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{course.code}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Credits:</span>
                                        <span className="text-sm">{course.credit}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
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
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Batch Name:</span>
                                        <span className="text-sm font-medium">{batch.name}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">Current Sem:</span>
                                        <span className="text-sm">Semester {batch.currentSemester}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Batch details not available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enrollment Details Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-[#3e6253]" />
                                <CardTitle>Enrollment Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <div>{getStatusBadge(enrollment.status)}</div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Semester:</span>
                                <span className="text-sm">Semester {enrollment.semester}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Academic Year:</span>
                                <span className="text-sm">{enrollment.academicYear}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Enrolled Date:</span>
                                <span className="text-sm">{enrollment.enrollmentDate ? format(new Date(enrollment.enrollmentDate), "MMMM d, yyyy") : "-"}</span>
                            </div>
                            {enrollment.completionDate && (
                                <div className="grid grid-cols-[120px_1fr] gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Completion Date:</span>
                                    <span className="text-sm">{format(new Date(enrollment.completionDate), "MMMM d, yyyy")}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Enrollment ID:</span>
                                <span className="text-xs font-mono text-muted-foreground">{enrollment.id}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
