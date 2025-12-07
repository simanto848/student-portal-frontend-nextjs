/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    enrollmentService,
    Enrollment,
} from "@/services/enrollment/enrollment.service";
import { batchService } from "@/services/academic/batch.service";
import { courseService } from "@/services/academic/course.service";
import { sessionService } from "@/services/academic/session.service";
import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/teacher.service";
import {
    Loader2,
    Plus,
    Search,
    GraduationCap,
    BookOpen,
    Users,
    ChevronDown,
    ChevronUp,
    University,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface StudentEnrollmentGroup {
    studentId: string;
    student: any;
    batch: any;
    session: any;
    semester: number;
    enrollments: Enrollment[];
    totalCourses: number;
    activeCount: number;
    completedCount: number;
}

export default function EnrollmentsPage() {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        setIsLoading(true);
        try {
            const data = await enrollmentService.listEnrollments({});
            const rawEnrollments = data.enrollments || [];

            // Fetch all unique IDs
            const studentIds = [...new Set(rawEnrollments.map((e) => e.studentId))];
            const batchIds = [...new Set(rawEnrollments.map((e) => e.batchId))];
            const courseIds = [...new Set(rawEnrollments.map((e) => e.courseId))];
            const sessionIds = [...new Set(rawEnrollments.map((e) => e.sessionId))];
            const instructorIds = [
                ...new Set(
                    rawEnrollments
                        .map((e) => e.instructorId)
                        .filter((id): id is string => Boolean(id))
                ),
            ];

            // Fetch all data in parallel
            const [
                studentsData,
                batchesData,
                coursesData,
                sessionsData,
                instructorsData,
            ] = await Promise.all([
                Promise.all(
                    studentIds.map((id) => studentService.getById(id).catch(() => null))
                ),
                Promise.all(
                    batchIds.map((id) => batchService.getBatchById(id).catch(() => null))
                ),
                Promise.all(
                    courseIds.map((id) =>
                        courseService.getCourseById(id).catch(() => null)
                    )
                ),
                Promise.all(
                    sessionIds.map((id) =>
                        sessionService.getSessionById(id).catch(() => null)
                    )
                ),
                Promise.all(
                    instructorIds.map((id) =>
                        teacherService.getTeacherById(id).catch(() => null)
                    )
                ),
            ]);

            // Create lookup maps - filter out nulls with type guard
            const studentsMap = new Map(
                studentsData
                    .filter((s): s is NonNullable<typeof s> => s !== null)
                    .map((s) => [s.id, s])
            );
            const batchesMap = new Map(
                batchesData
                    .filter((b): b is NonNullable<typeof b> => b !== null)
                    .map((b) => [b.id, b])
            );
            const coursesMap = new Map(
                coursesData
                    .filter((c): c is NonNullable<typeof c> => c !== null)
                    .map((c) => [c.id, c])
            );
            const sessionsMap = new Map(
                sessionsData
                    .filter((s): s is NonNullable<typeof s> => s !== null)
                    .map((s) => [s.id, s])
            );
            const instructorsMap = new Map(
                instructorsData
                    .filter((i): i is NonNullable<typeof i> => i !== null)
                    .map((i) => [i.id, i])
            );

            // Enrich enrollments
            const enrichedEnrollments = rawEnrollments.map((enrollment) => ({
                ...enrollment,
                student: studentsMap.get(enrollment.studentId) || null,
                batch: batchesMap.get(enrollment.batchId) || null,
                course: coursesMap.get(enrollment.courseId) || null,
                session: sessionsMap.get(enrollment.sessionId) || null,
                instructor: enrollment.instructorId
                    ? instructorsMap.get(enrollment.instructorId) || null
                    : null,
            }));

            setEnrollments(enrichedEnrollments);
        } catch (error) {
            toast.error("Failed to fetch enrollments");
            console.error("Fetch enrollments error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Group enrollments by student
    const groupedEnrollments: StudentEnrollmentGroup[] = enrollments.reduce(
        (acc, enrollment) => {
            const existing = acc.find((g) => g.studentId === enrollment.studentId);

            if (existing) {
                existing.enrollments.push(enrollment);
                existing.totalCourses++;
                // Only count as active if status is 'active' or 'enrolled' AND semester matches the batch semester
                if (
                    (enrollment.status === "active" ||
                        enrollment.status === "enrolled") &&
                    enrollment.semester === existing.semester
                ) {
                    existing.activeCount++;
                }
                if (enrollment.status === "completed") existing.completedCount++;
            } else {
                acc.push({
                    studentId: enrollment.studentId,
                    student: enrollment.student,
                    batch: enrollment.batch,
                    session: enrollment.session,
                    semester: enrollment.semester,
                    enrollments: [enrollment],
                    totalCourses: 1,
                    activeCount:
                        (enrollment.status === "active" ||
                            enrollment.status === "enrolled") &&
                            enrollment.semester === enrollment.semester
                            ? 1
                            : 0,
                    completedCount: enrollment.status === "completed" ? 1 : 0,
                });
            }

            return acc;
        },
        [] as StudentEnrollmentGroup[]
    );

    // Filter by search
    const filteredGroups = groupedEnrollments.filter((group) => {
        if (!search) return true; // Show all if no search term

        const searchLower = search.toLowerCase();
        return (
            group.student?.fullName?.toLowerCase().includes(searchLower) ||
            group.student?.registrationNumber?.toLowerCase().includes(searchLower) ||
            group.studentId.toLowerCase().includes(searchLower) ||
            group.batch?.name?.toLowerCase().includes(searchLower) ||
            group.enrollments[0]?.batchId?.toLowerCase().includes(searchLower)
        );
    });

    const totalStudents = groupedEnrollments.length;
    const totalEnrollments = enrollments.length;
    const uniqueCourses = new Set(enrollments.map((e) => e.courseId)).size;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
                            Student Enrollments
                        </h1>
                        <p className="text-muted-foreground">
                            Comprehensive view of student course enrollments
                        </p>
                    </div>
                    <Button
                        className="bg-[#3e6253] hover:bg-[#2c463b]"
                        onClick={() =>
                            router.push("/dashboard/admin/enrollment/enrollments/create")
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Enroll Student
                    </Button>
                </div>

                {/* Statistics Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Students Enrolled
                            </CardTitle>
                            <Users className="h-4 w-4 text-[#344e41]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1a3d32]">
                                {totalStudents}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Course Enrollments
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-[#344e41]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1a3d32]">
                                {totalEnrollments}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Unique Courses
                            </CardTitle>
                            <GraduationCap className="h-4 w-4 text-[#344e41]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#1a3d32]">
                                {uniqueCourses}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name, registration number, or batch..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </CardHeader>
                </Card>

                {/* Student Enrollment Groups */}
                {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="space-y-4">
                        {filteredGroups.map((group) => (
                            <Card key={group.studentId} className="overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-[#f1faee]/30 to-white">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-[#344e41] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                                                    {group.student?.fullName?.charAt(0) ||
                                                        group.studentId.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl text-[#1a3d32]">
                                                        {group.student?.fullName ||
                                                            `Student ${group.studentId.substring(0, 8)}`}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {group.student?.registrationNumber ||
                                                            group.studentId}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Student Info Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <University className="h-4 w-4 text-[#588157]" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Department
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {group.batch?.departmentId?.shortName ||
                                                                group.batch?.departmentId?.name ||
                                                                (group.enrollments[0]?.courseId
                                                                    ? "Dept."
                                                                    : "N/A")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-[#588157]" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Batch
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {group.batch?.name ||
                                                                (group.enrollments[0]?.batchId
                                                                    ? `Batch ${group.enrollments[0].batchId.substring(
                                                                        0,
                                                                        8
                                                                    )}`
                                                                    : "N/A")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-[#588157]" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Session
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {typeof group.session === "object"
                                                                ? group.session?.name
                                                                : group.session ||
                                                                (group.enrollments[0]?.sessionId
                                                                    ? `Session ${group.enrollments[0].sessionId.substring(
                                                                        0,
                                                                        8
                                                                    )}`
                                                                    : "N/A")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-[#588157]" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Semester
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            Semester {group.semester}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Course Statistics */}
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-[#1a3d32]">
                                                    {group.totalCourses}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Total Courses
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    {group.activeCount} Active
                                                </Badge>
                                                {group.completedCount > 0 && (
                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                        {group.completedCount} Completed
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setExpandedStudent(
                                                        expandedStudent === group.studentId
                                                            ? null
                                                            : group.studentId
                                                    )
                                                }
                                                className="mt-2 flex items-center gap-1"
                                            >
                                                {expandedStudent === group.studentId ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                                {expandedStudent === group.studentId
                                                    ? "Hide Courses"
                                                    : "View Courses"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Expandable Course List */}
                                {expandedStudent === group.studentId && (
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            {group.enrollments.map((enrollment, idx) => (
                                                <div
                                                    key={
                                                        enrollment.id ||
                                                        `${enrollment.studentId}-${enrollment.courseId}-${idx}`
                                                    }
                                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-[#a3b18a] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">
                                                                {enrollment.course?.name ||
                                                                    `Course ${enrollment.courseId.substring(
                                                                        0,
                                                                        8
                                                                    )}`}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {enrollment.course?.code ||
                                                                    enrollment.courseId.substring(0, 13)}
                                                                {enrollment.instructor ? (
                                                                    <span className="ml-2">
                                                                        • Instructor:{" "}
                                                                        {enrollment.instructor?.fullName}
                                                                    </span>
                                                                ) : enrollment.instructorId ? (
                                                                    <span className="ml-2 text-amber-600">
                                                                        • Instructor:{" "}
                                                                        {enrollment.instructorId.substring(0, 8)}
                                                                    </span>
                                                                ) : null}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            className={`${enrollment.status === "active" ||
                                                                    enrollment.status === "enrolled"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : enrollment.status === "completed"
                                                                        ? "bg-blue-100 text-blue-800"
                                                                        : enrollment.status === "dropped"
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-red-100 text-red-800"
                                                                } hover:opacity-80`}
                                                        >
                                                            {enrollment.status === "active"
                                                                ? "Active"
                                                                : enrollment.status.charAt(0).toUpperCase() +
                                                                enrollment.status.slice(1)}
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground">
                                                            {format(
                                                                new Date(enrollment.enrollmentDate),
                                                                "MMM d, yyyy"
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-700">
                                No enrollments found
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {search
                                    ? "Try adjusting your search"
                                    : "Start by enrolling students"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
