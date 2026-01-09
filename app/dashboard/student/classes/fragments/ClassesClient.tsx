"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, BookOpen, Download, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/academic/schedule.service";
import { CourseSchedule, Classroom } from "@/services/academic/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { studentService } from "@/services/user/student.service";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { notifyError } from "@/components/toast";

interface FormattedSlot {
    id: string;
    day: string;
    time: string;
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
            time: `${schedule.startTime} - ${schedule.endTime}`,
            course: course?.code || 'N/A',
            title: course?.name || 'Unknown Course',
            room: room,
            building: building,
            type: schedule.classType
        };
    };

    const todayFullName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const allFormatted = schedules.flatMap(schedule => {
        return schedule.daysOfWeek.map((day, index) => formatSlot(schedule, day, index));
    });

    const todaySlots = allFormatted.filter(s => s.day === todayFullName).sort((a, b) => a.time.localeCompare(b.time));

    const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weeklyGrouped = daysOrder.map(day => {
        return {
            day,
            slots: allFormatted.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time))
        };
    }).filter(group => group.slots.length > 0);

    const getTypeColor = (type: string = '') => {
        switch (type.toLowerCase()) {
            case 'lecture': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            case 'lab': return 'bg-sky-100 text-sky-700 border-sky-200';
            case 'tutorial': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'seminar': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-12 w-1/3 rounded-xl" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-[400px] w-full bg-white/40 rounded-[2rem]" />
                    <Skeleton className="h-[400px] w-full bg-white/40 rounded-[2rem]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Class Schedule"
                subtitle="Manage your weekly academic timetable and sessions."
                icon={CalendarDays}
                extraActions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-white/20 bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-700"
                        >
                            <Download className="mr-2 h-4 w-4" /> Download ICS
                        </Button>
                    </div>
                }
            />

            {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50/50 backdrop-blur-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Today's Overview */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cyan-600" />
                        Today's Sessions
                    </h2>
                    <Badge className="bg-cyan-500/10 text-cyan-700 border-cyan-200/50 hover:bg-cyan-500/20 px-3 py-1 rounded-full">
                        {todaySlots.length} Classes
                    </Badge>
                </div>

                {todaySlots.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {todaySlots.map((slot, idx) => (
                                <GlassCard key={slot.id} delay={idx * 0.1} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className={cn("font-semibold rounded-lg px-2 text-[10px] uppercase tracking-wider", getTypeColor(slot.type))}>
                                            {slot.type}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full">
                                            <Clock className="h-3.5 w-3.5" />
                                            {slot.time.split(' - ')[0]}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors mb-1">
                                        {slot.course}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-1 font-medium mb-4">{slot.title}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl">
                                            <MapPin className="h-4 w-4 text-cyan-500" />
                                            {slot.room}
                                        </div>
                                        {slot.building && (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-md">
                                                {slot.building}
                                            </span>
                                        )}
                                    </div>
                                </GlassCard>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <GlassCard className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="h-16 w-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">No classes scheduled for today</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-xs font-medium">
                            You're all clear! Use this time to catch up on self-study or preparations.
                        </p>
                    </GlassCard>
                )}
            </section>

            {/* Weekly View */}
            <section className="space-y-6 pt-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-sky-600" />
                    Weekly Overview
                </h2>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {weeklyGrouped.map((group, groupIdx) => {
                            const isToday = group.day === todayFullName;
                            return (
                                <GlassCard
                                    key={group.day}
                                    delay={(groupIdx + 1) * 0.1}
                                    className={cn(
                                        "p-0 overflow-hidden",
                                        isToday && "ring-2 ring-cyan-500 ring-offset-2 ring-offset-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "px-6 py-4 flex items-center justify-between border-b border-slate-100/50",
                                        isToday ? "bg-cyan-500/10" : "bg-slate-50/50"
                                    )}>
                                        <h3 className="font-bold text-slate-800">{group.day}</h3>
                                        {isToday && (
                                            <Badge className="bg-cyan-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border-none">
                                                Active Now
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="divide-y divide-slate-100/50">
                                        {group.slots.map((slot, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="p-5 hover:bg-white/40 transition-all group"
                                                whileHover={{ x: 5 }}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-20 shrink-0 flex flex-col items-center justify-center border-r border-slate-100/50 pr-4 mt-1">
                                                        <span className="text-xs font-bold text-slate-900">{slot.time.split(' - ')[0]}</span>
                                                        <div className="w-px h-3 bg-slate-100 my-1" />
                                                        <span className="text-[10px] text-slate-400 font-medium">{slot.time.split(' - ')[1]}</span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-1 gap-2">
                                                            <span className="font-bold text-sm text-slate-800 truncate">{slot.course}</span>
                                                            <Badge variant="outline" className={cn("text-[9px] h-5 border-none font-bold px-2 rounded-md", getTypeColor(slot.type))}>
                                                                {slot.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mb-2.5 font-medium">{slot.title}</p>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50/50 w-fit px-2 py-1 rounded-lg border border-slate-100/50">
                                                            <MapPin className="h-3 w-3 text-cyan-500" />
                                                            <span className="font-bold">{slot.room}</span>
                                                            {slot.building && (
                                                                <>
                                                                    <span className="text-slate-200">|</span>
                                                                    <span className="font-medium">{slot.building}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {weeklyGrouped.length === 0 && (
                    <GlassCard className="p-16 text-center border-dashed bg-white/20">
                        <p className="text-slate-500 font-bold">Comprehensive schedule data currently unavailable</p>
                        <p className="text-xs text-slate-400 mt-2">Please sync with your department or administrator.</p>
                    </GlassCard>
                )}
            </section>
        </div>
    );
}
