"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    BookOpen,
    Trophy,
    ChevronRight,
    Search,
    LayoutGrid,
    LayoutList,
    Download
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { CourseSchedule, Batch, Classroom, Course } from "@/services/academic/types";

interface ScheduleClientProps {
    initialSchedules: CourseSchedule[];
}

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export default function ScheduleClient({ initialSchedules }: ScheduleClientProps) {
    const theme = useDashboardTheme();
    const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
    const [selectedDay, setSelectedDay] = useState(
        new Date().toLocaleDateString('en-US', { weekday: 'long' })
    );

    const accentPrimary = theme.colors.accent.primary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/10';
    const accentBorder = accentPrimary.replace('text-', 'border-') + '/20';

    const getCourseInfo = (schedule: CourseSchedule) => {
        if (typeof schedule.sessionCourseId === 'object' && 'courseId' in schedule.sessionCourseId) {
            const sc = schedule.sessionCourseId as unknown as { courseId: Course };
            if (sc.courseId && typeof sc.courseId === 'object') {
                return { name: sc.courseId.name, code: sc.courseId.code };
            }
        }
        return { name: "Unknown Course", code: "N/A" };
    };

    const getBatchName = (schedule: CourseSchedule) => {
        if (typeof schedule.batchId === 'object') {
            return (schedule.batchId as Batch).name;
        }
        return "N/A";
    };

    const getRoomInfo = (schedule: CourseSchedule) => {
        if (typeof schedule.classroomId === 'object') {
            const room = schedule.classroomId as Classroom;
            return {
                number: room.roomNumber,
                building: room.buildingName
            };
        }
        return { number: "TBD", building: "" };
    };

    const sortedSchedules = useMemo(() => {
        const grouped: Record<string, CourseSchedule[]> = {};
        DAYS.forEach(day => {
            grouped[day] = initialSchedules
                .filter(s => s.daysOfWeek.includes(day as any))
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return grouped;
    }, [initialSchedules]);

    const activeSchedules = sortedSchedules[selectedDay] || [];

    // Stats
    const totalClasses = initialSchedules.length;
    const todayClasses = sortedSchedules[selectedDay]?.length || 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-2xl shadow-indigo-500/5">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <div className={`p-2 rounded-xl ${accentBgSubtle} ${accentPrimary}`}>
                                <Calendar className="h-5 w-5" />
                            </div>
                            <span className={`text-xs font-black uppercase tracking-[0.2em] ${accentPrimary}`}>
                                Academic Calendar
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                            My Weekly <span className={accentPrimary}>Schedule</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base">
                            Stay organized with your class timings and room assignments.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <div className="px-6 py-2 bg-white rounded-xl shadow-sm border border-slate-200/50 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Classes</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{totalClasses}</p>
                        </div>
                        <div className="px-6 py-2 bg-white rounded-xl shadow-sm border border-slate-200/50 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Today</p>
                            <p className={`text-xl font-black ${accentPrimary} leading-none`}>{todayClasses}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full md:w-auto">
                    <TabsList className="h-14 p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/50 w-full md:w-auto overflow-x-auto">
                        {DAYS.map(day => (
                            <TabsTrigger
                                key={day}
                                value={day}
                                className={`h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg data-[state=active]:${accentBorder} data-[state=inactive]:text-slate-400`}
                            >
                                {day.substring(0, 3)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="h-12 border-slate-200 rounded-2xl font-bold flex-1 md:flex-none">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button className={`h-12 ${accentPrimary.replace('text-', 'bg-')} hover:opacity-90 text-white shadow-lg shadow-indigo-600/10 rounded-2xl font-black uppercase text-xs tracking-widest flex-1 md:flex-none`}>
                        Notify Class
                    </Button>
                </div>
            </div>

            {/* Schedule Body */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDay}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {activeSchedules.length > 0 ? (
                            activeSchedules.map((schedule, idx) => {
                                const course = getCourseInfo(schedule);
                                const room = getRoomInfo(schedule);

                                return (
                                    <Card
                                        key={schedule.id || idx}
                                        className="group relative overflow-hidden bg-white border-slate-200/60 shadow-sm hover:shadow-2xl hover:border-indigo-100/50 transition-all duration-500 rounded-[2rem] p-0"
                                    >
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${accentPrimary.replace('text-', 'bg-')} opacity-60 group-hover:opacity-100 transition-opacity`} />

                                        <CardContent className="p-7">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3 rounded-2xl ${accentBgSubtle} ${accentPrimary} group-hover:scale-110 transition-transform duration-500`}>
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-slate-500">
                                                    {schedule.classType}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1 mb-6">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-2 leading-tight min-h-[3rem]">
                                                    {course.name}
                                                </h3>
                                                <p className={`text-xs font-black uppercase tracking-widest ${accentPrimary}`}>
                                                    {course.code}
                                                </p>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Timing</p>
                                                        <p className="text-sm font-bold text-slate-700">{schedule.startTime} - {schedule.endTime}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Location</p>
                                                        <p className="text-sm font-bold text-slate-700">{room.number} {room.building && <span className="text-slate-400 font-medium">({room.building})</span>}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Audience</p>
                                                        <p className="text-sm font-bold text-slate-700">Batch {getBatchName(schedule)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button className="w-full mt-7 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl group/btn transition-all">
                                                View Course Materials
                                                <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6">
                                    <Trophy className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 text-center px-6">
                                    Relax! No Classes Scheduled
                                </h3>
                                <p className="text-slate-400 font-medium text-center px-6 max-w-sm">
                                    You don't have any classes assigned for <span className="text-slate-900 font-bold">{selectedDay}</span>. Enjoy your break!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
