/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CourseSchedule, SessionCourse, Batch } from "@/services/academic/types";
import {
    CalendarClock,
    BookOpen,
    Users,
    MapPin,
    Clock,
    Building2,
    Calendar,
    Hash,
    Mail,
    User,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Layers,
    ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { to12Hour } from "@/lib/utils/timeFormat";

interface ScheduleDetailClientProps {
    schedule: CourseSchedule;
    teacher?: any | null;
}

export function ScheduleDetailClient({ schedule, teacher: teacherProp }: ScheduleDetailClientProps) {
    const router = useRouter();

    const sessionCourse = typeof schedule.sessionCourseId === 'object' ? (schedule.sessionCourseId as SessionCourse) : null;
    const course = typeof sessionCourse?.courseId === 'object' ? (sessionCourse.courseId as any) : (schedule as any).course;
    const session = typeof sessionCourse?.sessionId === 'object' ? (sessionCourse.sessionId as any) : (schedule as any).session;
    const batch = typeof schedule.batchId === 'object' ? (schedule.batchId as Batch) : (schedule as any).batch;
    const teacher = teacherProp || (typeof schedule.teacherId === 'object' ? (schedule.teacherId as any) : schedule.teacher);
    const classroom = typeof schedule.classroomId === 'object' ? (schedule.classroomId as any) : (schedule as any).classroom;
    const department = batch?.departmentId || sessionCourse?.departmentId || (schedule as any).department;

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            className="space-y-8 pb-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all font-semibold"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Schedule
                </Button>

                <div className={`px-4 py-1.5 rounded-2xl flex items-center gap-2 border shadow-sm ${schedule.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-slate-50 text-slate-500 border-slate-100"
                    }`}>
                    {schedule.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase tracking-wider">{schedule.isActive ? "Active Schedule" : "Inactive"}</span>
                </div>
            </div>

            {/* Course Information Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <CalendarClock className="w-64 h-64" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="p-5 bg-amber-500 rounded-3xl shadow-xl shadow-amber-500/20">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <Badge className="bg-amber-500/20 text-amber-400 border-none font-bold px-3 py-1">
                                {schedule.classType} Class
                            </Badge>
                            <span className="text-slate-500 font-bold">•</span>
                            <span className="text-slate-400 text-sm font-medium">Academic Session: {session?.name || "N/A"}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">{course?.name || "Unknown Course"}</h1>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-white/10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Hash className="w-3 h-3" /> Course Code
                                </p>
                                <p className="text-sm font-bold">{course?.code || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Layers className="w-3 h-3" /> Semester
                                </p>
                                <p className="text-sm font-bold">{sessionCourse?.semester || (schedule as any).semester || "N/A"}th Semester</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Users className="w-3 h-3" /> Assigned Batch
                                </p>
                                <p className="text-sm font-bold">{batch?.name || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Building2 className="w-3 h-3" /> Department
                                </p>
                                <p className="text-sm font-bold truncate">{department?.name || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Timing Card */}
                <motion.div variants={cardVariants} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Timing</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Schedule occurrence and slots</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Weekly Slot</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">
                                    {schedule.daysOfWeek?.join(", ") || "N/A"}
                                </span>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px]">RECURRING</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Start</p>
                                <p className="text-lg font-black text-slate-800">{to12Hour(schedule.startTime)}</p>
                            </div>
                            <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">End</p>
                                <p className="text-lg font-black text-slate-800">{to12Hour(schedule.endTime)}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Location Card */}
                <motion.div variants={cardVariants} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Venue</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Location and facilities</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-5 bg-linear-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Allocated Room</p>
                            <div className="flex items-center gap-3">
                                <Building2 className="w-8 h-8 text-blue-400" />
                                <div>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">Room {classroom?.roomNumber || "N/A"}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{classroom?.buildingName || "Main Campus Building"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                            <span className="text-sm font-bold text-slate-700">Capacity Status</span>
                            <Badge className="bg-emerald-500 text-white border-none font-bold">OPTIMAL</Badge>
                        </div>
                    </div>
                </motion.div>

                {/* Teacher Profile Card */}
                <motion.div variants={cardVariants} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Instructor</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Primary faculty assigned</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl shadow-inner">
                                {teacher?.fullName?.[0] || schedule.teacher?.fullName?.[0] || "T"}
                            </div>
                            <div>
                                <p className="text-base font-bold text-slate-900 tracking-tight">{teacher?.fullName || schedule.teacher?.fullName || "Unassigned"}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher?.registrationNumber || schedule.teacher?.registrationNumber || "ID: TBD"}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Digital Contact</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 truncate">{teacher?.email || schedule.teacher?.email || "N/A"}</p>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Timeline Details */}
            <motion.div variants={cardVariants} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-500 rounded-3xl text-white">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Academic Duration</h3>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Validity periods and update history</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-amber-200 before:rounded-full">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Commencement</p>
                        <p className="text-lg font-black text-slate-800">
                            {new Date(schedule.startDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Official beginning of class sessions for this slot.</p>
                    </div>

                    <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-slate-200 before:rounded-full">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Conclusion</p>
                        <p className="text-lg font-black text-slate-800">
                            {schedule.endDate
                                ? new Date(schedule.endDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                                : "Indefinite / TBD"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium italic">Estimated completion or phase-out date.</p>
                    </div>
                </div>

                {schedule.updatedAt && (
                    <div className="mt-12 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last Configuration Change</span>
                        </div>
                        <span className="text-xs font-black text-slate-700">{new Date(schedule.updatedAt).toLocaleString()}</span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
