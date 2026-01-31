"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    DashboardSkeleton,
} from "@/components/dashboard/shared";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
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
    Enrollment,
} from "@/services/enrollment/enrollment.service";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { studentService } from "@/services/user/student.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Loader2, ClipboardCheck, Search, Users, Save, RefreshCw, SearchCheck, GraduationCap, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceRow } from "./AttendanceRow";
import { AttendanceSummarySheet } from "./AttendanceSummarySheet";
import { SmartAttendanceModal } from "./SmartAttendanceModal";


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
    const [searchQuery, setSearchQuery] = useState("");

    const [showSummary, setShowSummary] = useState(false);
    const [showSmartAttendance, setShowSmartAttendance] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);

    // Hydration fix
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

            // Fetch ALL students in the batch (not just enrolled ones)
            const studentsResponse = await studentService.getAll({
                batchId: assignment.batchId,
                limit: 100,
            });

            // Convert students to enrollment-like format for compatibility
            const batchStudents = (studentsResponse.students || []).map((student) => ({
                id: student.id,
                studentId: student.id,
                batchId: assignment.batchId,
                courseId: assignment.courseId,
                student: student,
            })) as Enrollment[];

            setStudents(batchStudents);

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
            batchStudents.forEach((student) => {
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

    const handleSubmit = async (overrideData?: AttendanceState) => {
        const assignment = courses.find((c) => c.id === selectedAssignmentId);
        if (!assignment) return;

        // Use override data if provided, otherwise use current state
        const dataToSubmit = overrideData || attendanceState;

        // Validation: Check for missing remarks on 'excused' status
        const invalidAttendance = students.filter(student => {
            const state = dataToSubmit[student.studentId];
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
                    status: dataToSubmit[student.studentId].status,
                    remarks: dataToSubmit[student.studentId].remarks,
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

    const handleSmartAttendanceMark = (recognizedIds: Map<string, number>) => {
        const newAttendanceState = { ...attendanceState };

        // Loop through all currently viewed students
        students.forEach(student => {
            const regNum = student.student?.registrationNumber;
            const studentId = student.studentId;

            if (regNum && recognizedIds.has(regNum)) {
                // Present
                const confidence = recognizedIds.get(regNum) || 100;
                newAttendanceState[studentId] = {
                    status: "present",
                    remarks: `Verified Face ID (Conf: ${confidence.toFixed(0)}%)`
                };
            } else {
                // Absent
                newAttendanceState[studentId] = {
                    status: "absent",
                    remarks: "Auto-marked: Not detected in scan"
                };
            }
        });

        setAttendanceState(newAttendanceState);
        setShowSmartAttendance(false);
        notifySuccess(`Auto-marked attendance for ${students.length} students`);

        // Auto-submit
        handleSubmit(newAttendanceState);
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

    if (coursesLoading || !mounted) {
        return <DashboardSkeleton layout="hero-table" rowCount={8} withLayout={false} />;
    }

    return (
        <div className="space-y-8 font-display animate-in fade-in duration-500">
            {/* Standard Dashboard Header */}
            <GlassCard className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="text-[#2dd4bf] w-8 h-8" />
                        Attendance Control
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base mt-1">
                        Manage student attendance for <span className="text-[#2dd4bf] font-semibold">{format(date, "MMMM d, yyyy")}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {selectedCourse && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] text-sm font-bold shadow-sm backdrop-blur-sm hover:bg-[#2dd4bf]/20 transition-all cursor-default hover:scale-105">
                            <GraduationCap className="w-4 h-4" />
                            <span>{selectedCourse.batch?.name}</span>
                            <span className="w-1 h-1 rounded-full bg-[#2dd4bf]/50 mx-0.5"></span>
                            <span>{selectedCourse.course?.code}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {selectedCourse && (
                            <Button
                                variant="outline"
                                onClick={() => setShowSummary(true)}
                                className="hidden md:flex bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-[#2dd4bf] hover:text-white hover:border-[#2dd4bf] transition-all h-10 px-4 rounded-xl font-bold text-sm uppercase tracking-wider"
                            >
                                <ClipboardCheck className="w-4 h-4 mr-2" />
                                Summary
                            </Button>
                        )}
                        <DatePicker
                            date={date}
                            onChange={(d) => d && setDate(d)}
                            className="w-40 md:w-48 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 text-sm"
                            disabled={(date) => date > new Date()}
                        />
                    </div>
                </div>
            </GlassCard>

            {/* Smart Actions Bar */}
            {selectedCourse && (
                <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Button
                        onClick={() => setShowSmartAttendance(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl h-12 px-6 font-bold"
                    >
                        <ScanFace className="w-5 h-5 mr-2" />
                        Start Smart Attendance
                    </Button>
                </div>
            )}

            {selectedCourse && (
                <AttendanceSummarySheet
                    isOpen={showSummary}
                    onClose={() => setShowSummary(false)}
                    courseId={selectedCourse.courseId}
                    batchId={selectedCourse.batchId}
                    courseCode={selectedCourse.course?.code}
                    batchName={selectedCourse.batch?.name}
                />
            )}

            {selectedCourse && (
                <SmartAttendanceModal
                    isOpen={showSmartAttendance}
                    onClose={() => setShowSmartAttendance(false)}
                    students={students}
                    onMarkAttendance={handleSmartAttendanceMark}
                />
            )}

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
                                            <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Select Course</label>
                                            <Select
                                                value={selectedAssignmentId}
                                                onValueChange={setSelectedAssignmentId}
                                            >
                                                <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-[#2dd4bf] text-base font-medium">
                                                    <SelectValue placeholder="Choose Course..." />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                    {courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id} className="cursor-pointer py-3">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-bold text-base text-slate-700 dark:text-slate-200">{course.course?.code} - {course.course?.name}</span>
                                                                <span className="text-xs text-slate-400 uppercase tracking-widest">{course.batch?.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedAssignmentId && (
                                            <div className="space-y-2 relative">
                                                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">Search Students</label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        placeholder="Search by name or reg. no..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="pl-10 h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-[#2dd4bf] text-base"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedAssignmentId && (
                                    <Button
                                        variant="outline"
                                        className="h-12 w-12 shrink-0 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:text-[#2dd4bf] p-0"
                                        onClick={() => fetchClassData()}
                                        title="Sync Data"
                                    >
                                        <RefreshCw className={cn("h-6 w-6", loadingStudents && "animate-spin")} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="p-0">
                            {!selectedAssignmentId ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                                        <SearchCheck className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Select a Course</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm">Choose a course from the dropdown above to start marking attendance.</p>
                                </div>
                            ) : loadingStudents ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <Loader2 className="h-12 w-12 text-[#2dd4bf] animate-spin mb-4" />
                                    <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">Loading Class Register...</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                                        <GraduationCap className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Students Found</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm">There are no students enrolled in this batch yet.</p>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                                                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-700">
                                                    <TableHead className="pl-6 w-48 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reg. ID</TableHead>
                                                    <TableHead className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</TableHead>
                                                    <TableHead className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</TableHead>
                                                    <TableHead className="pr-6 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remarks</TableHead>
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
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold border border-emerald-500/20">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                {attendanceSummary.present} Present
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-500/20">
                                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                                                {attendanceSummary.absent} Absent
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold border border-amber-500/20">
                                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                {attendanceSummary.late} Late
                                            </div>
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full md:w-auto bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl font-bold text-base"
                                            onClick={() => handleSubmit()}
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