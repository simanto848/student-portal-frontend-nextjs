"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    DashboardSkeleton,
} from "@/components/dashboard/shared";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendanceManagement } from "@/hooks/queries/useTeacherQueries";
import {
    enrollmentService,
    Enrollment,
} from "@/services/enrollment/enrollment.service";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { studentService } from "@/services/user/student.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Loader2, ClipboardCheck, Search, Calendar as CalendarIcon, Users, Save, RefreshCw, SearchCheck, Building2, Sparkles, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceRow } from "./AttendanceRow";


interface AttendanceState {
    [studentId: string]: {
        status: "present" | "absent" | "late" | "excused";
        remarks: string;
    };
}

export function AttendanceContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const instructorId = user?.id || user?._id || "";

    // Use React Query hook for courses
    const { courses, isLoading: coursesLoading } =
        useAttendanceManagement(instructorId);

    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
    const [date, setDate] = useState<Date>(new Date());
    const [students, setStudents] = useState<Enrollment[]>([]);
    const [attendanceState, setAttendanceState] = useState<AttendanceState>({});
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Handle URL params for course/batch selection
    useEffect(() => {
        const paramCourseId = searchParams.get("courseId");
        const paramBatchId = searchParams.get("batchId");

        if (courses.length > 0 && paramCourseId && paramBatchId) {
            const match = courses.find(
                (c) => c.courseId === paramCourseId && c.batchId === paramBatchId,
            );
            if (match) {
                setSelectedAssignmentId(match.id);
            }
        }
    }, [courses, searchParams]);

    // Fetch class data function wrapped in useCallback
    const fetchClassData = useCallback(async () => {
        setLoadingStudents(true);
        try {
            const assignment = courses.find((c) => c.id === selectedAssignmentId);
            if (!assignment) return;

            // Fetch enrolled students
            const enrollmentsResponse = await enrollmentService.listEnrollments({
                batchId: assignment.batchId,
                courseId: assignment.courseId,
                limit: 100,
            });
            let enrolledStudents = enrollmentsResponse.enrollments || [];

            // Enrich students with details
            const studentsWithDetails = await Promise.all(
                enrolledStudents.map(async (enrollment) => {
                    if (!enrollment.student) {
                        try {
                            const studentDetails = await studentService.getById(
                                enrollment.studentId,
                            );
                            return {
                                ...enrollment,
                                student: studentDetails,
                            };
                        } catch (error) {
                            return enrollment;
                        }
                    }
                    return enrollment;
                }),
            );
            enrolledStudents = studentsWithDetails;
            setStudents(enrolledStudents);

            // Fetch existing attendance for the date
            const startDateTime = new Date(date);
            startDateTime.setHours(0, 0, 0, 0);

            const endDateTime = new Date(date);
            endDateTime.setHours(23, 59, 59, 999);

            const attendanceResponse = await attendanceService.listAttendance({
                batchId: assignment.batchId,
                courseId: assignment.courseId,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
            });
            const existingAttendance = Array.isArray(attendanceResponse)
                ? attendanceResponse
                : (
                    attendanceResponse as {
                        attendance?: {
                            studentId: string;
                            status: "present" | "absent" | "late" | "excused";
                            remarks?: string;
                        }[];
                    }
                ).attendance || [];

            // Initialize attendance state
            const initialState: AttendanceState = {};
            enrolledStudents.forEach((student) => {
                const record = existingAttendance.find(
                    (a: { studentId: string }) => a.studentId === student.studentId,
                );
                initialState[student.studentId] = {
                    status: record ? record.status : "present",
                    remarks: record ? record.remarks || "" : "",
                };
            });
            setAttendanceState(initialState);
        } catch (error) {
            console.error("Fetch class data error:", error);
            notifyError(getErrorMessage(error, "Failed to load student list"));
        } finally {
            setLoadingStudents(false);
        }
    }, [courses, selectedAssignmentId, date]);

    // Fetch students and attendance when course/date changes
    useEffect(() => {
        if (selectedAssignmentId && date) {
            fetchClassData();
        } else {
            setStudents([]);
            setAttendanceState({});
        }
    }, [selectedAssignmentId, date, fetchClassData]);

    const handleStatusChange = (
        studentId: string,
        status: "present" | "absent" | "late" | "excused",
    ) => {
        setAttendanceState((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], status },
        }));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setAttendanceState((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks },
        }));
    };

    const handleSubmit = async () => {
        const assignment = courses.find((c) => c.id === selectedAssignmentId);
        if (!assignment) return;

        // Validation: Check for missing remarks on 'excused' status
        const invalidAttendance = students.filter(student => {
            const state = attendanceState[student.studentId];
            return state.status === 'excused' && !state.remarks?.trim();
        });

        if (invalidAttendance.length > 0) {
            notifyError(`Please provide remarks for ${invalidAttendance.length} student(s) marked as Excused.`);
            return;
        }

        setSaving(true);
        try {
            const isoDate = format(date, "yyyy-MM-dd") + "T00:00:00Z";

            const payload = {
                courseId: assignment.courseId,
                batchId: assignment.batchId,
                date: isoDate,
                attendances: students.map((student) => ({
                    studentId: student.studentId,
                    status: attendanceState[student.studentId].status,
                    remarks: attendanceState[student.studentId].remarks,
                })),
            };

            const res = await attendanceService.bulkMarkAttendance(payload);
            notifySuccess(getSuccessMessage(res, "Attendance saved successfully"));
        } catch (error) {
            notifyError(getErrorMessage(error, "Failed to save attendance"));
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(
            (s) =>
                s.student?.fullName?.toLowerCase().includes(query) ||
                s.student?.registrationNumber?.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    // Calculate attendance summary
    const attendanceSummary = useMemo(() => {
        const total = students.length;
        const present = Object.values(attendanceState).filter(
            (s) => s.status === "present",
        ).length;
        const absent = Object.values(attendanceState).filter(
            (s) => s.status === "absent",
        ).length;
        const late = Object.values(attendanceState).filter(
            (s) => s.status === "late",
        ).length;
        const excused = Object.values(attendanceState).filter(
            (s) => s.status === "excused",
        ).length;

        return { total, present, absent, late, excused };
    }, [students, attendanceState]);

    // Get selected course name for display
    const selectedCourse = useMemo(
        () => courses.find((c) => c.id === selectedAssignmentId),
        [courses, selectedAssignmentId],
    );

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    if (coursesLoading) {
        return <DashboardSkeleton layout="hero-table" rowCount={8} withLayout={false} />;
    }

    return (
        <div className="space-y-8 font-display animate-in fade-in duration-500">
            {/* Standard Dashboard Header */}
            <GlassCard className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="text-[#2dd4bf] w-6 h-6" />
                        Attendance Control
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Manage student attendance for <span className="text-[#2dd4bf] font-semibold">{format(date, "MMMM d, yyyy")}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedCourse && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] text-xs font-bold shadow-sm backdrop-blur-sm hover:bg-[#2dd4bf]/20 transition-all cursor-default hover:scale-105">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>{selectedCourse.batch?.name}</span>
                            <span className="w-1 h-1 rounded-full bg-[#2dd4bf]/50 mx-0.5"></span>
                            <span>{selectedCourse.course?.code}</span>
                        </div>
                    )}
                    <DatePicker
                        date={date}
                        onChange={(d) => d && setDate(d)}
                        className="w-40 md:w-48 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10"
                        disabled={(date) => date > new Date()}
                    />
                </div>
            </GlassCard>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <AnimatePresence mode="wait">
                    {selectedAssignmentId && students.length > 0 && (
                        <motion.div
                            key="stats"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <AttendanceStats summary={attendanceSummary} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div variants={itemVariants}>
                    <GlassCard className="overflow-hidden p-0">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 space-y-6">
                            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-end">
                                <div className="flex-1 w-full space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Select Course</label>
                                            <Select
                                                value={selectedAssignmentId}
                                                onValueChange={setSelectedAssignmentId}
                                            >
                                                <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-[#2dd4bf]">
                                                    <SelectValue placeholder="Choose Course..." />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                    {courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id} className="cursor-pointer">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="font-medium text-slate-700 dark:text-slate-200">{course.course?.code} - {course.course?.name}</span>
                                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{course.batch?.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedAssignmentId && (
                                            <div className="space-y-2 relative">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Search Students</label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Search by name or reg. no..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="pl-10 h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-[#2dd4bf]"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedAssignmentId && (
                                    <Button
                                        variant="outline"
                                        className="h-11 w-11 shrink-0 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:text-[#2dd4bf] p-0"
                                        onClick={() => fetchClassData()}
                                        title="Sync Data"
                                    >
                                        <RefreshCw className={cn("h-5 w-5", loadingStudents && "animate-spin")} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="p-0">
                            {!selectedAssignmentId ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                                        <SearchCheck className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Select a Course</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">Choose a course from the dropdown above to start marking attendance.</p>
                                </div>
                            ) : loadingStudents ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <Loader2 className="h-10 w-10 text-[#2dd4bf] animate-spin mb-4" />
                                    <p className="text-slate-600 dark:text-slate-300 font-medium">Loading Class Register...</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                                        <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Students Found</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">There are no students enrolled in this batch yet.</p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-700">
                                                    <TableHead className="pl-6 w-48 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reg. ID</TableHead>
                                                    <TableHead className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</TableHead>
                                                    <TableHead className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</TableHead>
                                                    <TableHead className="pr-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remarks</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence mode="popLayout">
                                                    {filteredStudents.map((student, idx) => (
                                                        <AttendanceRow
                                                            key={student.studentId}
                                                            student={student}
                                                            index={idx}
                                                            disabled={saving}
                                                            state={
                                                                attendanceState[student.studentId] || {
                                                                    status: "present",
                                                                    remarks: "",
                                                                }
                                                            }
                                                            onStatusChange={(status) =>
                                                                handleStatusChange(student.studentId, status)
                                                            }
                                                            onRemarksChange={(remarks) =>
                                                                handleRemarksChange(student.studentId, remarks)
                                                            }
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30 dark:bg-slate-800/20">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                {attendanceSummary.present} Present
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                {attendanceSummary.absent} Absent
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                {attendanceSummary.late} Late
                                            </div>
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full md:w-auto bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl font-bold"
                                            onClick={handleSubmit}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Finalize Attendance
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    );
}