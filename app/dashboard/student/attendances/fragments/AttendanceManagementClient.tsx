"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Search,
    Bell,
    TrendingUp,
    Activity as SsidChart,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    History,
    Code,
    Terminal,
    Headset,
    ChevronDown,
    FilterX,
    CalendarDays,
    FileText,
    ArrowUpRight,
    Zap
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
    useStudentAttendance,
    useEnrollments,
} from "@/hooks/queries/useEnrollmentQueries";
import { Attendance } from "@/services/enrollment/attendance.service";
import { cn } from "@/lib/utils";
import StudentLoading from "@/components/StudentLoading";

export default function AttendanceManagementClient() {
    const { user } = useAuth();
    const studentId = user?.id || user?._id || "";

    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

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
            const enrol = enrollments.find(e => e.courseId === a.courseId);
            const courseName = enrol?.course?.name || "";
            const courseCode = enrol?.course?.code || "";

            const matchesSearch =
                courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                new Date(a.date).toLocaleDateString().includes(searchQuery);

            if (!matchesSearch) return false;

            if (effectiveSemester !== "all" && !courseIdsInSemester.has(a.courseId)) {
                return false;
            }
            if (selectedCourseId && a.courseId !== selectedCourseId) {
                return false;
            }
            return true;
        });
    }, [sortedAttendance, effectiveSemester, courseIdsInSemester, selectedCourseId, searchQuery, enrollments]);

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
        const absent = total - (present + late);
        const overall = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

        return { total, present, late, absent, overall };
    }, [filteredAttendance]);

    if (isLoading) {
        return (
            <StudentLoading />
        );
    }

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Attendance Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Track your academic presence and consistency.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/50 backdrop-blur-xl focus:ring-4 focus:ring-[#0D9488]/10 focus:border-[#0D9488] text-[11px] font-black uppercase tracking-widest transition-all outline-none"
                                placeholder="Search course or date..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select
                            value={effectiveSemester}
                            onValueChange={(val) => {
                                setSelectedSemester(val);
                                setSelectedCourseId(null);
                            }}
                        >
                            <SelectTrigger className="w-[180px] h-[46px] rounded-2xl bg-[#0D9488]/5 border-[#0D9488]/20 text-[#0D9488] font-black uppercase tracking-widest text-[10px] focus:ring-4 focus:ring-[#0D9488]/10">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-[#0D9488]/10">
                                <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">Global View</SelectItem>
                                {semesters.map((sem) => (
                                    <SelectItem key={sem} value={sem.toString()} className="text-[10px] font-black uppercase tracking-widest">
                                        Semester {sem}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </header>

                {error && (
                    <Alert variant="destructive" className="rounded-[2rem] border-rose-100 bg-rose-50 text-rose-700 p-6">
                        <AlertCircle className="h-5 w-5 mr-3" />
                        <AlertDescription className="font-black uppercase tracking-tighter">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Trend Section */}
                <section>
                    <div className="glass-panel group p-8 rounded-[3rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="h-40 w-40 text-[#0D9488]" />
                        </div>
                        <div className="flex justify-between items-end relative z-10 mb-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[#0D9488]/10 rounded-2xl text-[#0D9488]">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">Attendance Trend</h3>
                                </div>
                                <p className="text-[11px] font-bold text-slate-500 max-w-sm leading-relaxed uppercase tracking-wide">
                                    Your consistency over the current semester showing academic persistence vectors.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white flex flex-col items-center min-w-[100px]">
                                    <span className="text-2xl font-black text-[#0D9488]">{stats.overall}%</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Yield</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Mockup matching design */}
                        <div className="flex items-end justify-between h-40 gap-6 px-4">
                            {[0.4, 0.7, 0.5, 0.85, 0.95, 0.75, 1.0, 0.92].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-3 group/bar cursor-pointer">
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-2xl min-h-[10px] h-full relative overflow-hidden transition-all group-hover/bar:bg-[#0D9488]/10">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val * 100}%` }}
                                            transition={{ delay: i * 0.1, duration: 1 }}
                                            className={cn(
                                                "absolute bottom-0 w-full rounded-t-2xl",
                                                val >= 0.9 ? "bg-[#0D9488] shadow-lg shadow-[#0D9488]/30" :
                                                    val < 0.6 ? "bg-rose-500/60" : "bg-[#0D9488]/60"
                                            )}
                                        />
                                    </div>
                                    <span className="text-[9px] text-center font-black text-slate-400 uppercase tracking-widest">W{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stat Cards Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: "Consistency", value: `${stats.overall}%`, icon: SsidChart, color: "text-[#0D9488]", bg: "bg-[#0D9488]/10", trend: "Overall Index", progress: stats.overall },
                        { label: "Present Days", value: stats.present, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "Present" },
                        { label: "Late Days", value: stats.late, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", trend: "Late" },
                        { label: "Absent Days", value: stats.absent, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", trend: "Absent" },
                    ].map((s, i) => (
                        <div key={i} className="glass-panel group p-8 rounded-[2.5rem] hover:bg-white/60 dark:hover:bg-slate-800/80 transition-all border-none relative overflow-hidden cursor-default shadow-sm hover:shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className={cn("p-4 rounded-2xl shadow-inner", s.bg, s.color)}>
                                    <s.icon className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap">{s.trend}</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{s.value}</h3>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{s.label}</p>
                            </div>
                            {s.progress !== undefined && (
                                <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.progress}%` }}
                                        className="h-full bg-[#0D9488] shadow-[0_0_10px_rgba(13,148,136,0.3)]"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </section>

                {/* Subject Wise Tracking */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Subject Analytics</h2>
                        <button className="text-[10px] font-black text-[#0D9488] hover:text-[#0D9488]/80 uppercase tracking-[0.2em] flex items-center gap-2 group transition-all">
                            Export Detailed Report <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {courseStats.map((course, idx) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedCourseId(selectedCourseId === course.courseId ? null : course.courseId)}
                                    className={cn(
                                        "glass-panel group p-8 rounded-[2.5rem] cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden border border-white/40",
                                        selectedCourseId === course.courseId && "ring-4 ring-[#0D9488]/40 border-[#0D9488] scale-[1.03] z-10 shadow-2xl"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1 pr-6 flex-1 min-w-0">
                                            <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight truncate group-hover:text-[#0D9488] transition-colors uppercase tracking-tight">{course.courseName}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.courseCode}</p>
                                        </div>
                                        <div className={cn(
                                            "text-2xl font-black tracking-tighter",
                                            course.percent >= 75 ? "text-emerald-500" :
                                                course.percent < 40 ? "text-rose-500" : "text-amber-500"
                                        )}>
                                            {course.percent}%
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.percent}%` }}
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    course.percent >= 75 ? "bg-emerald-500" :
                                                        course.percent < 40 ? "bg-rose-500" : "bg-amber-500"
                                                )}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors">
                                            <span className="flex items-center gap-2">
                                                <History className="h-3 w-3" />
                                                {course.present + course.late} / {course.total} Units
                                            </span>
                                            <span className="opacity-50 group-hover:opacity-100 italic transition-opacity">Record Trace</span>
                                        </div>
                                    </div>

                                    {selectedCourseId === course.courseId && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-[#0D9488]"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {courseStats.length === 0 && (
                            <div className="col-span-full py-20 text-center glass-panel border-dashed border-slate-300 rounded-[3rem] bg-slate-50/30">
                                <FilterX className="h-14 w-14 text-slate-300 mx-auto mb-6" />
                                <h4 className="text-slate-900 font-extrabold uppercase tracking-widest">No Course Records Detected</h4>
                                <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Your academic enrollment ledger appears synchronized but empty.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Right Sidebar - Recent Feed */}
            <aside className="hidden xl:flex w-[400px] flex-col gap-10 p-8 ml-10 glass-panel-right sticky top-0 h-screen overflow-y-auto no-scrollbar border-l border-white/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-tr from-[#0D9488] to-emerald-400 flex items-center justify-center text-white font-black shadow-xl ring-4 ring-white">
                            S{effectiveSemester === "all" ? semesters[0]?.toString().charAt(0) : effectiveSemester.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Semester {effectiveSemester === "all" ? semesters[0] : effectiveSemester}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0D9488] opacity-70">2026 Academic Cycle</p>
                        </div>
                    </div>
                    <button className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#0D9488] transition-all">
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>

                <div className="glass-panel rounded-[3rem] p-8 flex-1 flex flex-col shadow-inner border border-white bg-white/40">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-900 text-white shadow-lg">
                                <History className="h-4 w-4" />
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm">Recent Presence</h3>
                        </div>
                        {selectedCourseId && (
                            <button
                                onClick={() => setSelectedCourseId(null)}
                                className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 bg-white transition-all shadow-sm"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>

                    <div className="space-y-6 overflow-y-auto pr-1 flex-1 no-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.slice(0, 15).map((item, idx) => {
                                    const enrol = enrollments.find(e => e.courseId === item.courseId);
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="flex gap-5 items-start p-5 hover:bg-white/80 dark:hover:bg-slate-800/60 rounded-[2rem] transition-all cursor-pointer group border border-transparent hover:border-white/60 hover:shadow-xl"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 flex-shrink-0 flex items-center justify-center border border-white/60 dark:border-slate-700/60 shadow-sm group-hover:scale-110 transition-transform">
                                                {item.courseId.includes("Lab") ? <Code className="h-5 w-5 text-[#0D9488]" /> : <Terminal className="h-5 w-5 text-[#0D9488]" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <h4 className="text-sm font-black text-slate-800 dark:text-white truncate leading-tight pt-0.5">{enrol?.course?.name || "Term Course"}</h4>
                                                    <StatusBadge status={item.status} className="shrink-0" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(item.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" })} • {new Date(item.markedAt || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {item.remarks && (
                                                        <p className="text-[10px] text-slate-400 italic font-medium truncate">"{item.remarks}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="py-20 text-center px-4">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No presence records matched the current vector parameters.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Button className="w-full mt-8 py-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#0D9488] hover:text-white dark:hover:bg-[#0D9488] dark:hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                        View full history
                    </Button>
                </div>
            </aside>
        </div>
    );
}
