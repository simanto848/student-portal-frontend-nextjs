"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CalendarDays,
    FileText,
    AlertCircle,
    TrendingUp,
    CheckCircle2,
    Clock,
    BookOpen,
    FilterX
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    useStudentAttendance,
    useEnrollments,
} from "@/hooks/queries/useEnrollmentQueries";
import { Attendance } from "@/services/enrollment/attendance.service";
import { Enrollment } from "@/services/enrollment/enrollment.service";

export default function AttendanceManagementClient() {
    const { user } = useAuth();
    const studentId = user?.id || user?._id || "";

    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const {
        data: attendanceList = [],
        isLoading: attendanceLoading,
        error: attendanceError,
    } = useStudentAttendance(studentId);

    const { data: enrollments = [], isLoading: enrollmentsLoading } =
        useEnrollments({ studentId });

    const isLoading = attendanceLoading || enrollmentsLoading;
    const error = attendanceError ? "Failed to load attendance data." : null;

    const semesters = useMemo(() => {
        const semesterSet = new Set<number>();
        enrollments.forEach((e) => semesterSet.add(e.semester));
        return Array.from(semesterSet).sort((a, b) => b - a);
    }, [enrollments]);

    const effectiveSemester = useMemo(() => {
        if (selectedSemester !== null) return selectedSemester;
        if (semesters.length > 0) return semesters[0].toString();
        return "all";
    }, [selectedSemester, semesters]);

    const filteredEnrollments = useMemo(() => {
        return effectiveSemester === "all"
            ? enrollments
            : enrollments.filter((e) => e.semester.toString() === effectiveSemester);
    }, [enrollments, effectiveSemester]);

    const courseIdsInSemester = useMemo(() => {
        return new Set(filteredEnrollments.map((e) => e.courseId));
    }, [filteredEnrollments]);

    const sortedAttendance = useMemo(() => {
        return [...attendanceList].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    }, [attendanceList]);

    const filteredAttendance = useMemo(() => {
        return sortedAttendance.filter((a) => {
            if (effectiveSemester !== "all" && !courseIdsInSemester.has(a.courseId)) {
                return false;
            }
            if (selectedCourseId && a.courseId !== selectedCourseId) {
                return false;
            }
            return true;
        });
    }, [sortedAttendance, effectiveSemester, courseIdsInSemester, selectedCourseId]);

    const courseStats = useMemo(() => {
        return filteredEnrollments.map((enrol) => {
            const courseAtt = attendanceList.filter((a) => a.courseId === enrol.courseId);
            const total = courseAtt.length;
            const present = courseAtt.filter((a) => a.status === "present").length;
            const late = courseAtt.filter((a) => a.status === "late").length;
            const attended = present + late;
            const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

            return {
                id: enrol.courseId,
                courseId: enrol.courseId,
                courseName: enrol.course?.name || "Unknown Course",
                courseCode: enrol.course?.code || "N/A",
                total,
                present,
                late,
                percent,
                hasClasses: total > 0,
            };
        });
    }, [filteredEnrollments, attendanceList]);

    const stats = useMemo(() => {
        const total = filteredAttendance.length;
        const present = filteredAttendance.filter((a) => a.status === "present").length;
        const late = filteredAttendance.filter((a) => a.status === "late").length;
        const attendedCount = present + late;
        const overall = total > 0 ? Math.round((attendedCount / total) * 100) : 100;

        return { total, present, late, attendedCount, overall };
    }, [filteredAttendance]);

    const attendanceColumns: Column<Attendance>[] = [
        {
            header: "Date",
            accessorKey: "date" as any,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{new Date(item.date).toLocaleDateString()}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                        {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </span>
                </div>
            )
        },
        {
            header: "Course",
            accessorKey: "courseId" as any,
            cell: (item) => {
                const enrol = enrollments.find(e => e.courseId === item.courseId);
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{enrol?.course?.name || "Unknown"}</span>
                        <span className="text-[11px] font-black text-cyan-600">{enrol?.course?.code || "N/A"}</span>
                    </div>
                );
            }
        },
        {
            header: "Status",
            accessorKey: "status" as any,
            cell: (item) => <StatusBadge status={item.status} />
        },
        {
            header: "Remarks",
            accessorKey: "remarks" as any,
            cell: (item) => <span className="text-sm text-slate-500 font-medium italic">{item.remarks || "—"}</span>
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-6 flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                <p className="text-slate-500 font-bold animate-pulse">Scanning biometric records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Attendance Intel"
                subtitle="Analytical overview of your classroom presence."
                icon={CalendarDays}
                extraActions={
                    <div className="flex gap-3">
                        <Select
                            value={effectiveSemester}
                            onValueChange={(val) => {
                                setSelectedSemester(val);
                                setSelectedCourseId(null);
                            }}
                        >
                            <SelectTrigger className="w-[180px] bg-white border-cyan-100 shadow-sm rounded-xl focus:ring-cyan-500">
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-cyan-50">
                                <SelectItem value="all">Global View</SelectItem>
                                {semesters.map((sem) => (
                                    <SelectItem key={sem} value={sem.toString()}>
                                        Semester {sem}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }
            />

            {error && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats Hero */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-6 md:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-2xl bg-cyan-600 shadow-lg shadow-cyan-200">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">Overall</span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.overall}%</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">Consistency Vector</p>
                    <Progress value={stats.overall} className="h-1.5 mt-4 bg-slate-100" />
                </GlassCard>

                <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Present", value: stats.present, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Late", value: stats.late, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Absent", value: stats.total - (stats.present + stats.late), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
                        { label: "Total", value: stats.total, icon: BookOpen, color: "text-cyan-600", bg: "bg-cyan-50" },
                    ].map((s, i) => (
                        <GlassCard key={i} className="p-4" delay={i * 0.05}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>
                                    <s.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                                    <p className="text-xl font-black text-slate-800 leading-none">{s.value}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Course Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {courseStats.map((course, idx) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlassCard
                                className={`p-6 cursor-pointer border-2 transition-all duration-500 ${selectedCourseId === course.courseId ? "border-cyan-500 ring-4 ring-cyan-500/10 shadow-2xl scale-[1.02]" : "border-transparent"}`}
                                onClick={() => setSelectedCourseId(selectedCourseId === course.courseId ? null : course.courseId)}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-800 leading-tight line-clamp-1 group-hover:text-cyan-600 transition-colors">{course.courseName}</h4>
                                        <p className="text-xs font-black text-cyan-600 uppercase tracking-widest">{course.courseCode}</p>
                                    </div>
                                    <div className={`text-xl font-black tracking-tighter ${course.percent >= 75 ? "text-emerald-500" : "text-rose-500"}`}>
                                        {course.percent}%
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Progress value={course.percent} className={`h-2 ${course.percent >= 75 ? "bg-slate-100" : "bg-rose-50"}`} />
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Attended {course.present + course.late}</span>
                                        <span>Total {course.total}</span>
                                    </div>
                                </div>

                                {selectedCourseId === course.courseId && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[10px] font-black text-cyan-500 text-center mt-4 uppercase tracking-[0.2em]"
                                    >
                                        Active Filter Applied
                                    </motion.p>
                                )}
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {courseStats.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                        <FilterX className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest">No course records detected.</p>
                    </div>
                )}
            </div>

            {/* Detailed History Table */}
            <GlassCard className="p-0 border-none shadow-2xl">
                <div className="p-6 border-b border-cyan-50/50 flex items-center justify-between bg-gradient-to-r from-cyan-50/30 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-900 shadow-xl shadow-slate-200">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Presence Ledger</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detailed History Feed</p>
                        </div>
                    </div>
                    {selectedCourseId && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCourseId(null)}
                            className="h-9 px-4 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all uppercase tracking-widest border border-rose-100 bg-white"
                        >
                            Reset Vector
                        </Button>
                    )}
                </div>
                <div className="p-4">
                    <DataTable
                        data={filteredAttendance}
                        columns={attendanceColumns}
                        searchKey="remarks"
                        searchPlaceholder="Search in remarks..."
                    />
                </div>
            </GlassCard>
        </div>
    );
}
