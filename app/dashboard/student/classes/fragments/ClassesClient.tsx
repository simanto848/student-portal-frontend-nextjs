"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CalendarDays,
    MapPin,
    Clock,
    BookOpen,
    Download,
    AlertCircle,
    Building2,
    Loader2,
    CalendarCheck2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/academic/schedule.service";
import { CourseSchedule, Classroom } from "@/services/academic/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { studentService } from "@/services/user/student.service";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { notifyError } from "@/components/toast";
import StudentLoading from "@/components/StudentLoading";

interface FormattedSlot {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    course: string;
    title: string;
    room: string;
    building: string;
    type: string;
}

export function ClassesClient() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user) return;

            try {
                setLoading(true);
                let batchId: string | undefined;
                if ('batchId' in user && typeof user.batchId === 'string') {
                    batchId = user.batchId;
                } else if ('batchId' in user && user.batchId && typeof user.batchId === 'object') {
                    batchId = (user.batchId as any).id || (user.batchId as any)._id;
                }

                if (!batchId && user.role === 'student') {
                    try {
                        const studentId = user.id || (user as any)._id;
                        if (!studentId) return;
                        const studentProfile = await studentService.getById(studentId);
                        if (studentProfile) {
                            if (typeof studentProfile.batchId === 'string') {
                                batchId = studentProfile.batchId;
                            } else if (studentProfile.batch && typeof studentProfile.batch === 'object') {
                                batchId = (studentProfile.batch as any).id || (studentProfile.batch as any)._id;
                            }
                        }
                    } catch (profileErr) {
                        notifyError("Failed to fetch student profile to resolve batchId");
                    }
                }

                if (!batchId) {
                    if (user.role === 'student') {
                        setError("You are not assigned to a batch. Please contact administration.");
                    }
                    setLoading(false);
                    return;
                }

                const data = await scheduleService.getScheduleByBatch(batchId);
                setSchedules(data || []);
            } catch (err: any) {
                setError("Failed to load schedule. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [user]);

    const formatSlot = (schedule: CourseSchedule, day: string, index: number): FormattedSlot => {
        let course: any = null;
        if (typeof schedule.sessionCourseId === 'object') {
            const sc = schedule.sessionCourseId as any;
            if (sc.course) course = sc.course;
            else if (sc.courseId && typeof sc.courseId === 'object') course = sc.courseId;
        }

        const classroom = typeof schedule.classroomId === 'object' ? (schedule.classroomId as Classroom) : null;
        const room = classroom ? classroom.roomNumber : 'TBA';
        const building = classroom ? classroom.buildingName : '';

        return {
            id: `${schedule.id}-${day}-${index}`,
            day: day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            course: course?.code || 'N/A',
            title: course?.name || 'Unknown Course',
            room: room,
            building: building,
            type: schedule.classType || 'Lecture'
        };
    };

    const todayFullName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const allFormatted = schedules.flatMap(schedule => {
        return schedule.daysOfWeek.map((day, index) => formatSlot(schedule, day, index));
    });

    const todaySlots = allFormatted.filter(s => s.day === todayFullName).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weeklyGrouped = daysOrder.map(day => {
        return {
            day,
            slots: allFormatted.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
        };
    }).filter(group => group.slots.length > 0);

    const getTypeColor = (type: string = '') => {
        switch (type.toLowerCase()) {
            case 'lecture': return 'bg-[#0088A9]/10 text-[#0088A9] border-[#0088A9]/20';
            case 'lab': return 'bg-blue-400/10 text-blue-500 border-blue-400/20';
            case 'tutorial': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-[#0088A9]/10 text-[#0088A9] border-[#0088A9]/20';
        }
    };

    if (loading) {
        return (
            <StudentLoading />
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[#0088A9]/10 text-[#0088A9] shadow-inner">
                            <CalendarDays className="h-8 w-8" />
                        </div>
                        Class Schedule
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide ml-16">
                        Manage your weekly academic timetable and sessions.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="group relative px-6 py-6 rounded-2xl glass-panel border-[#0088A9]/20 text-[#0088A9] font-black uppercase tracking-widest text-[11px] transition-all hover:bg-[#0088A9]/10 hover:shadow-lg overflow-hidden"
                >
                    <Download className="mr-3 h-4 w-4 relative z-10" />
                    <span className="relative z-10">Export Calendar</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
            </header>

            {error && (
                <Alert variant="destructive" className="rounded-[2rem] border-red-200 bg-red-50/50 backdrop-blur-md p-6">
                    <AlertCircle className="h-5 w-5 mr-3" />
                    <AlertDescription className="font-bold uppercase tracking-tighter">{error}</AlertDescription>
                </Alert>
            )}

            {/* Today's Deep Dive */}
            <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#0088A9] animate-pulse" />
                        Today's Sessions
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0088A9] bg-[#0088A9]/10 px-4 py-1.5 rounded-full border border-[#0088A9]/20">
                        {todaySlots.length} Sessions
                    </span>
                </div>

                {todaySlots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {todaySlots.map((slot, idx) => (
                                <motion.div
                                    key={slot.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="glass-panel group p-8 rounded-[2.5rem] border border-white/60 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
                                >
                                    {/* Shimmer Effect overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <Badge variant="outline" className={cn("font-black text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-xl shadow-sm", getTypeColor(slot.type))}>
                                            {slot.type}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-[#0088A9] font-black text-sm tracking-tighter">
                                            <Clock className="h-4 w-4" />
                                            {slot.startTime}
                                        </div>
                                    </div>

                                    <div className="mb-8 relative z-10">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2 truncate group-hover:text-[#0088A9] transition-colors">
                                            {slot.course}
                                        </h3>
                                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest line-clamp-1">{slot.title}</p>
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-white/10 relative z-10">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                                            <MapPin className="h-4 w-4 text-[#0088A9]" />
                                            Room {slot.room}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest bg-gray-50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10 transition-all group-hover:border-[#0088A9]/20">
                                            <Building2 className="h-4 w-4 text-[#0088A9]" />
                                            {slot.building || "Academic Block"}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel p-16 rounded-[3rem] text-center flex flex-col items-center justify-center border border-dashed border-gray-300"
                    >
                        <div className="h-20 w-20 bg-[#0088A9]/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                            <BookOpen className="h-10 w-10 text-[#0088A9]/40" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Base Clean - No Dispatches</h3>
                        <p className="text-sm text-gray-500 mt-3 max-w-sm font-bold uppercase tracking-tighter leading-relaxed">
                            Terminal clears reveal an empty schedule. Perfect for deep focus or critical review sessions.
                        </p>
                    </motion.div>
                )}
            </section>

            {/* Weekly Trajectory */}
            <section className="space-y-8 pt-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="p-2 rounded-xl bg-sky-100 text-[#0088A9]">
                        <CalendarCheck2 className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Weekly Overview</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {weeklyGrouped.map((group, groupIdx) => {
                            const isToday = group.day === todayFullName;
                            return (
                                <motion.div
                                    key={group.day}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (groupIdx + 1) * 0.1 }}
                                    className={cn(
                                        "glass-panel rounded-[3rem] p-0 overflow-hidden border border-white/60 transition-all",
                                        isToday && "ring-4 ring-[#0088A9]/40 ring-offset-8 ring-offset-transparent shadow-2xl shadow-[#0088A9]/20 scale-[1.03] z-20"
                                    )}
                                >
                                    <div className={cn(
                                        "px-8 py-6 flex items-center justify-between border-b border-white/20",
                                        isToday ? "bg-gradient-to-r from-[#0088A9]/20 to-transparent" : "bg-gray-50/50 dark:bg-slate-800/50"
                                    )}>
                                        <h3 className={cn(
                                            "text-xs font-black uppercase tracking-[0.2em]",
                                            isToday ? "text-[#0088A9]" : "text-gray-400"
                                        )}>
                                            {group.day}
                                        </h3>
                                        {isToday && (
                                            <span className="text-[9px] font-black text-white bg-[#0088A9] px-3 py-1 rounded-full animate-pulse tracking-widest">
                                                ACTIVE NOW
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-2 space-y-4">
                                        {group.slots.map((slot, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="p-6 rounded-[2rem] hover:bg-white/60 dark:hover:bg-white/5 transition-all group flex items-start gap-6"
                                                whileHover={{ x: 5 }}
                                            >
                                                <div className="w-16 shrink-0 flex flex-col items-center justify-center pt-1 border-r border-gray-100 dark:border-slate-700/50 pr-4">
                                                    <span className="text-xs font-black text-gray-900 dark:text-slate-100 tracking-tighter">{slot.startTime}</span>
                                                    <div className="w-px h-3 bg-gray-200 dark:bg-slate-700 my-1.5" />
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{slot.endTime}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1.5 gap-2">
                                                        <span className="font-black text-sm text-gray-900 dark:text-slate-100 truncate leading-none pt-1">{slot.course}</span>
                                                        <Badge variant="outline" className={cn("text-[8px] font-black px-2 py-0.5 rounded-lg border-none shadow-sm capitalize", getTypeColor(slot.type))}>
                                                            {slot.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1 mb-4 font-bold uppercase tracking-tight opacity-70">{slot.title}</p>
                                                    <div className="flex items-center gap-2 mt-auto">
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest bg-gray-50 dark:bg-black/20 w-fit px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10">
                                                            <MapPin className="h-3 w-3 text-[#0088A9]" />
                                                            {slot.room}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest bg-gray-50 dark:bg-black/20 w-fit px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10">
                                                            <Building2 className="h-3 w-3 text-[#0088A9]" />
                                                            {slot.building || "Building N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {weeklyGrouped.length === 0 && (
                    <div className="p-20 text-center glass-panel rounded-[3.5rem] border-dashed bg-white/10 flex flex-col items-center">
                        <div className="p-6 rounded-[2rem] bg-gray-50 mb-6">
                            <Loader2 className="h-10 w-10 text-gray-200 animate-spin" />
                        </div>
                        <p className="text-gray-900 font-black uppercase tracking-widest">Awaiting Registry Sync</p>
                        <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">Please synchronize with your Department or System Administrator.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
