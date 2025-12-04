"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { enrollmentService, BatchSemesterCourse } from "@/services/enrollment/enrollment.service";
import { studentService } from "@/services/user/student.service";
import { batchService } from "@/services/academic/batch.service";
import { courseService } from "@/services/academic/course.service";
import { teacherService } from "@/services/user/teacher.service";
import { departmentService } from "@/services/academic/department.service";
import { ArrowLeft, Loader2, BookOpen, User, AlertCircle, CheckCircle2, XCircle, Filter } from "lucide-react";
import { toast } from "sonner";

export default function CreateEnrollmentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isFetchingCourses, setIsFetchingCourses] = useState(false);

    // Form State
    const [studentId, setStudentId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [semester, setSemester] = useState<number | "">("");
    const [sessionId, setSessionId] = useState("");
    const [sessionName, setSessionName] = useState("");

    // Filter State
    const [departmentFilter, setDepartmentFilter] = useState("");

    // Data Lists
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [allBatches, setAllBatches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [courses, setCourses] = useState<BatchSemesterCourse[]>([]);
    const [enrichedCourses, setEnrichedCourses] = useState<any[]>([]);

    // Computed filtered lists
    const filteredStudents = departmentFilter
        ? allStudents.filter(s => s.departmentId === departmentFilter)
        : allStudents;

    const filteredBatches = departmentFilter
        ? allBatches.filter(b => b.departmentId?.id === departmentFilter)
        : allBatches;

    useEffect(() => {
        fetchDropdownData();
    }, []);

    // Auto-fill when student is selected
    useEffect(() => {
        if (studentId && !batchId) {
            const selectedStudent = allStudents.find(s => s.id === studentId);
            if (selectedStudent?.batchId) {
                // Auto-fill batch from student
                setBatchId(selectedStudent.batchId);
                // Also set department filter if not already set
                if (!departmentFilter && selectedStudent.departmentId) {
                    setDepartmentFilter(selectedStudent.departmentId);
                }
            }
        }
    }, [studentId, allStudents]);

    // Auto-fill semester and sessionId when batch is selected
    useEffect(() => {
        if (batchId) {
            const selectedBatch = allBatches.find(b => b.id === batchId);
            if (selectedBatch) {
                setSemester(selectedBatch.currentSemester);

                // Handle sessionId - it might be an object or a string
                if (typeof selectedBatch.sessionId === 'object' && selectedBatch.sessionId !== null) {
                    setSessionId(selectedBatch.sessionId.id);
                    setSessionName(selectedBatch.sessionId.name || `${selectedBatch.sessionId.year}`);
                } else {
                    setSessionId(selectedBatch.sessionId);
                    setSessionName(selectedBatch.sessionId);
                }

                // Fetch courses for this batch and semester
                fetchBatchSemesterCourses(batchId, selectedBatch.currentSemester);

                // Also set department filter if not already set
                if (!departmentFilter && selectedBatch.departmentId?.id) {
                    setDepartmentFilter(selectedBatch.departmentId.id);
                }
            }
        } else {
            setCourses([]);
            setEnrichedCourses([]);
            setSemester("");
            setSessionId("");
            setSessionName("");
        }
    }, [batchId, allBatches]);

    const fetchDropdownData = async () => {
        setIsFetching(true);
        try {
            const [studentsResponse, batchesData, departmentsData] = await Promise.all([
                studentService.getAll(),
                batchService.getAllBatches(),
                departmentService.getAllDepartments()
            ]);
            setAllStudents(studentsResponse.students || []);
            setAllBatches(batchesData || []);
            setDepartments(departmentsData || []);
        } catch (error) {
            toast.error("Failed to load form data");
            console.error("Fetch error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchBatchSemesterCourses = async (batchId: string, semester: number) => {
        setIsFetchingCourses(true);
        try {
            const coursesData = await enrollmentService.getBatchSemesterCourses(batchId, semester);
            setCourses(coursesData);

            // Enrich with course and instructor details
            const enriched = await Promise.all(
                coursesData.map(async (c) => {
                    try {
                        const [courseDetails, instructorDetails] = await Promise.all([
                            courseService.getCourseById(c.courseId),
                            c.instructorId ? teacherService.getById(c.instructorId).catch(() => null) : Promise.resolve(null)
                        ]);
                        return {
                            ...c,
                            course: courseDetails,
                            instructor: instructorDetails
                        };
                    } catch (error) {
                        return { ...c, course: null, instructor: null };
                    }
                })
            );
            setEnrichedCourses(enriched);
        } catch (error: any) {
            console.error("Failed to fetch courses:", error);
            const errorMessage = error?.response?.data?.message || error.message || "Failed to load courses";
            toast.error(errorMessage);
            setCourses([]);
            setEnrichedCourses([]);
        } finally {
            setIsFetchingCourses(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || !batchId || !semester || !sessionId) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (courses.length === 0) {
            toast.error("No courses available for this batch and semester");
            return;
        }

        setIsLoading(true);
        try {
            const result = await enrollmentService.enrollStudent({
                studentId,
                batchId,
                sessionId,
                semester: Number(semester)
            });

            if (result.success) {
                toast.success(result.message || `Student enrolled in ${result.enrolled} courses successfully`);
                if (result.skipped > 0) {
                    toast.info(`${result.skipped} courses were skipped (already enrolled)`);
                }
                if (result.failed > 0) {
                    toast.warning(`${result.failed} courses failed to enroll`);
                }
                router.push("/dashboard/admin/enrollment/enrollments");
            } else {
                toast.error("Enrollment failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to enroll student");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDepartmentFilterChange = (value: string) => {
        setDepartmentFilter(value);
        // Reset selections when department filter changes
        setStudentId("");
        setBatchId("");
        setSemester("");
        setSessionId("");
        setSessionName("");
        setCourses([]);
        setEnrichedCourses([]);
    };

    if (isFetching) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Enroll Student</h1>
                        <p className="text-muted-foreground">Enroll a student in a batch for a semester</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department Filter */}
                    <Card className="border-2 border-dashed border-[#a3b18a]">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-[#344e41]" />
                                <CardTitle>Department Filter</CardTitle>
                            </div>
                            <CardDescription>
                                Filter students and batches by department (optional but recommended)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-md">
                                <Label>Department</Label>
                                <SearchableSelect
                                    options={[
                                        { label: "All Departments", value: "" },
                                        ...departments.map(d => ({
                                            label: `${d.name} (${d.shortName})`,
                                            value: d.id
                                        }))
                                    ]}
                                    value={departmentFilter}
                                    onChange={handleDepartmentFilterChange}
                                    placeholder="Select Department"
                                />
                                {departmentFilter && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Showing {filteredStudents.length} students and {filteredBatches.length} batches
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Student & Batch Selection</CardTitle>
                            <CardDescription>
                                Select a student (batch will auto-fill) OR select a batch (students will be filtered)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Student Selection */}
                                <div className="space-y-2">
                                    <Label>Student <span className="text-red-500">*</span></Label>
                                    <SearchableSelect
                                        options={filteredStudents.map(s => ({
                                            label: `${s.fullName} (${s.registrationNumber})`,
                                            value: s.id
                                        }))}
                                        value={studentId}
                                        onChange={setStudentId}
                                        placeholder={filteredStudents.length > 0 ? "Select Student" : "No students available"}
                                    />
                                    {!departmentFilter && allStudents.length > 20 && (
                                        <p className="text-xs text-yellow-600">
                                            💡 Tip: Use department filter for easier selection
                                        </p>
                                    )}
                                </div>

                                {/* Batch Selection */}
                                <div className="space-y-2">
                                    <Label>Batch <span className="text-red-500">*</span></Label>
                                    <SearchableSelect
                                        options={filteredBatches.map(b => ({
                                            label: `${b.name} - ${b.departmentId?.shortName || 'N/A'}`,
                                            value: b.id
                                        }))}
                                        value={batchId}
                                        onChange={setBatchId}
                                        placeholder={filteredBatches.length > 0 ? "Select Batch" : "No batches available"}
                                    />
                                    {studentId && batchId && (
                                        <p className="text-xs text-green-600">
                                            ✓ Auto-filled from student
                                        </p>
                                    )}
                                </div>

                                {/* Semester (Auto-filled) */}
                                <div className="space-y-2">
                                    <Label>Semester <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        value={semester}
                                        readOnly
                                        className="bg-gray-50"
                                        placeholder="Auto-filled from batch"
                                    />
                                    <p className="text-xs text-muted-foreground">Automatically filled from selected batch</p>
                                </div>

                                {/* Session Name (Display) */}
                                <div className="space-y-2">
                                    <Label>Session</Label>
                                    <Input
                                        value={sessionName}
                                        readOnly
                                        className="bg-gray-50"
                                        placeholder="Auto-filled from batch"
                                    />
                                    <p className="text-xs text-muted-foreground">Automatically filled from selected batch</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Course Preview Section */}
                    {batchId && semester && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Courses to be Enrolled</CardTitle>
                                        <CardDescription>
                                            The student will be enrolled in all the following courses for this semester
                                        </CardDescription>
                                    </div>
                                    {isFetchingCourses && <Loader2 className="h-5 w-5 animate-spin text-[#344e41]" />}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isFetchingCourses ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                                    </div>
                                ) : enrichedCourses.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                                        <p className="text-lg font-semibold text-gray-700">No Courses Found</p>
                                        <p className="text-sm text-muted-foreground max-w-md mt-2">
                                            There are no courses assigned to this batch for semester {semester}.
                                            Please configure session courses and instructor assignments first.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {enrichedCourses.map((course, index) => (
                                            <div
                                                key={course.courseId}
                                                className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-[#f1faee]/30 to-white hover:shadow-sm transition-shadow"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-[#344e41] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 text-[#344e41]" />
                                                            <p className="font-semibold text-gray-800">
                                                                {course.course?.name || 'Course Name Unavailable'}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {course.course?.code || 'N/A'} • {course.course?.credits || 'N/A'} Credits
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <User className="h-3 w-3 text-gray-500" />
                                                            <p className="text-xs text-gray-600">
                                                                {course.instructor
                                                                    ? `Instructor: ${course.instructor.fullName}`
                                                                    : 'No instructor assigned'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {course.instructorAssigned ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <span title="No instructor assigned">
                                                            <XCircle className="h-5 w-5 text-yellow-500" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Total: {enrichedCourses.length} courses</strong> will be enrolled for the student
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#3e6253] hover:bg-[#2c463b]"
                            disabled={isLoading || !studentId || !batchId || courses.length === 0}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enroll in {enrichedCourses.length} Course{enrichedCourses.length !== 1 ? 's' : ''}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
