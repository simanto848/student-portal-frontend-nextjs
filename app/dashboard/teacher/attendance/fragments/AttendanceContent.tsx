"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Cinematic Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-10 md:p-14 text-white shadow-2xl"
            >
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] opacity-50" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] opacity-30" />

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                <span>Attendance Control</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-white">
                                Attendance Control
                            </h1>
                            <p className="text-indigo-100/70 max-w-md text-lg font-medium leading-relaxed">
                                Record attendance for students in a cinematic and efficient manner.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Session Active</span>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/10 shadow-xl">
                                    <CalendarIcon className="h-4 w-4 text-white" />
                                    {format(date, "MMMM d, yyyy")}
                                </div>
                            </div>
                            {selectedCourse && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Current Sector</span>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-indigo-400/30 shadow-xl">
                                        <Building2 className="h-4 w-4 text-indigo-200" />
                                        {selectedCourse.batch?.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-10"
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
                    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] bg-white overflow-hidden rounded-[3rem]">
                        <CardHeader className="border-b border-slate-100 p-10 space-y-8">
                            <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-end">
                                <div className="flex-1 w-full space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Course</label>
                                            <Select
                                                value={selectedAssignmentId}
                                                onValueChange={setSelectedAssignmentId}
                                            >
                                                <SelectTrigger className="h-14 bg-slate-50 border-2 border-slate-100/50 hover:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl font-bold transition-all p-5 shadow-none outline-none">
                                                    <SelectValue placeholder="Choose Course..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-3xl border-slate-100 shadow-2xl p-2">
                                                    {courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id} className="cursor-pointer font-bold py-4 rounded-xl focus:bg-indigo-50 focus:text-indigo-700 transition-colors">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm">{course.course?.code} - {course.course?.name}</span>
                                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{course.batch?.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">Date</label>
                                            <DatePicker
                                                date={date}
                                                onChange={(d) => d && setDate(d)}
                                                className="h-14 bg-slate-50 border-2 border-slate-100/50 font-bold rounded-2xl p-5"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedAssignmentId && (
                                    <div className="flex items-center gap-4 w-full lg:w-auto">
                                        <div className="relative flex-1 lg:w-96 group">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <Input
                                                placeholder="Search student registry..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-14 h-14 bg-slate-50 border-2 border-slate-100/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 rounded-2xl font-bold transition-all"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="h-14 w-14 rounded-2xl border-2 border-slate-100/50 hover:bg-white hover:text-indigo-600 hover:border-indigo-100 transition-all p-0 shadow-sm"
                                            onClick={() => fetchClassData()}
                                            title="Sync Data"
                                        >
                                            <RefreshCw className={cn("h-6 w-6", loadingStudents && "animate-spin")} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {!selectedAssignmentId ? (
                                <div className="flex flex-col items-center justify-center py-40 bg-gradient-to-b from-white to-slate-50/50 px-10 text-center">
                                    <div className="h-28 w-28 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-8 shadow-inner border border-slate-200/50">
                                        <SearchCheck className="h-12 w-12 text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">Stream Selection Required</h3>
                                    <p className="text-slate-500 font-medium max-w-sm">Please identify an academic stream from the hub above to begin presence synchronization.</p>
                                </div>
                            ) : loadingStudents ? (
                                <div className="flex flex-col items-center justify-center py-40">
                                    <div className="relative mb-8">
                                        <div className="h-20 w-20 rounded-full border-t-4 border-indigo-600 animate-spin" />
                                        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-indigo-200 animate-pulse" />
                                    </div>
                                    <p className="text-slate-900 font-black text-lg tracking-tight uppercase">Syncing Registry...</p>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Connecting to Academic Databases</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-40 text-slate-400 bg-gradient-to-b from-white to-slate-50/50 px-10 text-center">
                                    <div className="h-28 w-28 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-8 shadow-inner border border-slate-200/50">
                                        <GraduationCap className="h-12 w-12 text-slate-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">Empty Manifest</h3>
                                    <p className="text-slate-500 font-medium max-w-sm">No student units detected within this specific academic stream. Please verify batch assignments.</p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="max-h-[700px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                        <Table>
                                            <TableHeader className="bg-white/80 sticky top-0 z-10 backdrop-blur-xl">
                                                <TableRow className="hover:bg-transparent border-b border-slate-100">
                                                    <TableHead className="px-10 py-6 h-auto text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-56">Registry ID</TableHead>
                                                    <TableHead className="py-6 h-auto text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Identifier</TableHead>
                                                    <TableHead className="py-6 h-auto text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Engagement Status</TableHead>
                                                    <TableHead className="px-10 py-6 h-auto text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operational Notes</TableHead>
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
                                    <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Analytics</span>
                                                <div className="flex gap-6 mt-3">
                                                    <div className="flex items-center gap-2 font-black text-[10px] text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm uppercase tracking-widest">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        {attendanceSummary.present} PRESENT
                                                    </div>
                                                    <div className="flex items-center gap-2 font-black text-[10px] text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 shadow-sm uppercase tracking-widest">
                                                        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                        {attendanceSummary.absent} MISSING
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-12 w-px bg-slate-200" />
                                            <div className="flex flex-col">
                                                <p className="text-xs text-slate-600 font-bold italic flex items-center gap-2">
                                                    <ClipboardCheck className="h-4 w-4 text-indigo-500" />
                                                    Authenticated timestamp verified for all entries.
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 ml-6 text-indigo-500/50">Academic Integrity Validated</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="h-16 px-12 bg-slate-900 hover:bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.05] active:scale-95 disabled:hover:scale-100 group overflow-hidden relative"
                                            onClick={handleSubmit}
                                            disabled={saving}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                    Synchronizing...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-3 h-5 w-5" />
                                                    Finalize Session
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}