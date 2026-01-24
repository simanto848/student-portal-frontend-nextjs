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
    Download,
    ClipboardCheck,
    UserCheck,
    UserX,
    AlertCircle
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
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<CourseSchedule | null>(null);
    const [attendanceStatus, setAttendanceStatus] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

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
            {/* Header Section - Updated to match teacher dashboard */}
            <div className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-[#2dd4bf] w-5 h-5" />
                        <span className="text-xs font-bold text-[#2dd4bf] uppercase tracking-widest">
                            Academic Calendar
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        My Weekly <span className="text-[#2dd4bf]">Schedule</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Stay organized with your class timings and room assignments.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="px-6 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700 text-center">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Total Classes</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{totalClasses}</p>
                    </div>
                    <div className="px-6 py-3 bg-[#2dd4bf]/10 rounded-xl shadow-sm border border-[#2dd4bf]/20 text-center">
                        <p className="text-[10px] font-black text-[#2dd4bf] uppercase tracking-widest leading-none mb-1">Today</p>
                        <p className="text-xl font-black text-[#2dd4bf] leading-none">{todayClasses}</p>
                    </div>
                </div>
            </div>

            {/* Controls Section - Updated with consistent design */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full md:w-auto">
                    <TabsList className="h-14 p-1.5 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-200/50 dark:border-slate-700 w-full md:w-auto overflow-x-auto">
                        {DAYS.map(day => (
                            <TabsTrigger
                                key={day}
                                value={day}
                                className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-[#2dd4bf]/20 data-[state=inactive]:text-slate-400 dark:data-[state=inactive]:text-slate-500 data-[state=hover]:text-[#2dd4bf]"
                            >
                                {day.substring(0, 3)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="h-12 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 rounded-xl font-bold flex-1 md:flex-none hover:text-[#2dd4bf] hover:border-[#2dd4bf]/20">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button className="h-12 bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl font-bold uppercase text-xs tracking-widest flex-1 md:flex-none">
                        Mark Attendance
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
                                        className="glass-panel group relative overflow-hidden bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-[#2dd4bf]/30 transition-all duration-300 rounded-3xl p-0 hover:-translate-y-1"
                                    >
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2dd4bf] opacity-60 group-hover:opacity-100 transition-opacity" />

                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3 rounded-2xl bg-[#2dd4bf]/10 text-[#2dd4bf] group-hover:scale-110 transition-transform duration-300">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                                    {schedule.classType}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 mb-6">
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight line-clamp-2 leading-tight min-h-[3rem]">
                                                    {course.name}
                                                </h3>
                                                <p className="text-xs font-bold uppercase tracking-widest text-[#2dd4bf]">
                                                    {course.code}
                                                </p>
                                            </div>

                                            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest leading-none">Timing</p>
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{schedule.startTime} - {schedule.endTime}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest leading-none">Location</p>
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{room.number} {room.building && <span className="text-slate-400 dark:text-slate-500 font-medium">({room.building})</span>}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest leading-none">Audience</p>
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch {getBatchName(schedule)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-6">
                                                <Button 
                                                    className="flex-1 bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl font-bold uppercase text-xs tracking-widest h-10 transition-all"
                                                    onClick={() => {
                                                        setSelectedSchedule(schedule);
                                                        setShowAttendanceModal(true);
                                                    }}
                                                >
                                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                                    Mark Attendance
                                                </Button>
                                                <Button variant="outline" className="flex-1 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 font-bold uppercase text-xs tracking-widest h-10 rounded-xl transition-all">
                                                    <BookOpen className="h-4 w-4 mr-2" />
                                                    Materials
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center glass-panel rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6">
                                    <Trophy className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 text-center px-6">
                                    Relax! No Classes Scheduled
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-center px-6 max-w-sm">
                                    You don't have any classes assigned for <span className="text-[#2dd4bf] font-bold">{selectedDay}</span>. Enjoy your break!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Attendance Modal */}
            {showAttendanceModal && selectedSchedule && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <ClipboardCheck className="text-[#2dd4bf] w-5 h-5" />
                                        Mark Attendance
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        {getCourseInfo(selectedSchedule).name} • {getBatchName(selectedSchedule)}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700"
                                    onClick={() => setShowAttendanceModal(false)}
                                >
                                    ×
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Quick Actions */}
                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
                                    onClick={() => {
                                        // Mark all as present logic
                                        setAttendanceStatus(prev => {
                                            const updated = { ...prev };
                                            // This would need student data - for now just UI demonstration
                                            return updated;
                                        });
                                    }}
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Mark All Present
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
                                    onClick={() => {
                                        // Mark all as absent logic
                                        setAttendanceStatus(prev => {
                                            const updated = { ...prev };
                                            // This would need student data - for now just UI demonstration
                                            return updated;
                                        });
                                    }}
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Mark All Absent
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 border-amber-200 text-amber-600 hover:bg-amber-50 font-bold rounded-xl"
                                    onClick={() => {
                                        // Mark all as late logic
                                        setAttendanceStatus(prev => {
                                            const updated = { ...prev };
                                            // This would need student data - for now just UI demonstration
                                            return updated;
                                        });
                                    }}
                                >
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Mark All Late
                                </Button>
                            </div>

                            {/* Attendance List */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-800 dark:text-white">Student List</h3>
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        Student enrollment data will be loaded here
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Connect with attendance service to fetch enrolled students
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 border-slate-200 dark:border-slate-700 font-bold rounded-xl"
                                    onClick={() => setShowAttendanceModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-12 bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 font-bold rounded-xl"
                                    onClick={() => {
                                        // Save attendance logic
                                        setShowAttendanceModal(false);
                                    }}
                                >
                                    Save Attendance
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
