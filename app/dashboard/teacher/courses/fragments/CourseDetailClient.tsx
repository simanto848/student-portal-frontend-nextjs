"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Users,
    Calendar,
    GraduationCap,
    ArrowLeft,
    Clock,
    Info,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
    batchCourseInstructorService,
    BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import {
    enrollmentService,
    Enrollment,
} from "@/services/enrollment/enrollment.service";
import { scheduleService } from "@/services/academic/schedule.service";
import { CourseSchedule } from "@/services/academic/types";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { assessmentService } from "@/services/enrollment/assessment.service";
import { CourseGradeView } from "@/components/classroom/CourseGradeView";
import { DashboardSkeleton } from "@/components/dashboard/shared";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

interface CourseDetailClientProps {
    id: string;
}

type TabType = "overview" | "students" | "attendance" | "grades";

const formatBatchName = (batch: any) => {
    if (!batch) return "N/A";
    const prefix = batch.shift === "day" ? "D-" : batch.shift === "evening" ? "E-" : "";
    return `${prefix}${batch.name}`;
};

export default function CourseDetailClient({ id }: CourseDetailClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = useDashboardTheme();

    // Get initial tab from URL or default to "overview"
    const initialTab = (searchParams.get('tab') as TabType) || "overview";
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    const [assignment, setAssignment] = useState<BatchCourseInstructor | null>(null);
    const [students, setStudents] = useState<Enrollment[]>([]);
    const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
    const [stats, setStats] = useState({
        attendanceCount: 0,
        assessmentsCount: 0,
    });
    const [loading, setLoading] = useState(true);

    // Update URL when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab as TabType);
        const url = new URL(window.location.href);
        if (tab === "overview") {
            url.searchParams.delete('tab');
        } else {
            url.searchParams.set('tab', tab);
        }
        router.replace(url.pathname + url.search, { scroll: false });
    };

    useEffect(() => {
        if (id) {
            fetchCourseDetails();
        }
    }, [id]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const assignmentData = await batchCourseInstructorService.getAssignment(id as string);
            setAssignment(assignmentData);

            const [studentsData, schedulesData, attendanceRes, assessmentsRes] = await Promise.all([
                enrollmentService.listEnrollments({
                    batchId: assignmentData.batchId,
                    courseId: assignmentData.courseId,
                    semester: assignmentData.semester,
                }),
                scheduleService.getScheduleByBatch(assignmentData.batchId),
                attendanceService.listAttendance({
                    courseId: assignmentData.courseId,
                    batchId: assignmentData.batchId,
                    limit: 1,
                }),
                assessmentService.list({
                    courseId: assignmentData.courseId,
                    batchId: assignmentData.batchId,
                    limit: 1,
                }),
            ]);

            setStudents(studentsData.enrollments || []);

            const courseSchedules = schedulesData.filter((s: CourseSchedule) => {
                const sessionCourse = typeof s.sessionCourseId === "object" ? s.sessionCourseId : null;
                const course = sessionCourse && typeof sessionCourse.course === "object" ? sessionCourse.course : null;
                return course && course.id === assignmentData.courseId;
            });
            setSchedules(courseSchedules);

            setStats({
                attendanceCount: attendanceRes.pagination?.total || 0,
                assessmentsCount: assessmentsRes.pagination?.total || 0,
            });
        } catch (error) {
            console.error("Fetch course details error:", error);
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton layout="hero-table" rowCount={10} withLayout={false} />;
    }

    if (!assignment) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Course not found</h3>
                <p className="text-slate-500 mt-1">The course details could not be retrieved.</p>
                <Button variant="link" className={`mt-4 ${theme.colors.accent.primary}`} onClick={() => router.push("/dashboard/teacher/courses")}>
                    Go back to courses
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-start gap-5">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className={`mt-1 h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-sm hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/5 hover:${theme.colors.accent.primary} transition-all`}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </motion.div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className={`${theme.colors.accent.primary.replace('text-', 'bg-')}/5 ${theme.colors.accent.primary} border-indigo-100 font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider`}>
                                {assignment.course?.code}
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider">
                                {formatBatchName(assignment.batch)}
                            </Badge>
                            <Badge variant="secondary" className={`bg-indigo-50/50 text-indigo-600 font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider border border-indigo-100/30`}>
                                Semester {assignment.semester}
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            {assignment.course?.name}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enrolled Students</span>
                        <span className={`text-2xl font-black ${theme.colors.accent.primary}`}>{students.length}</span>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 inline-flex min-w-max">
                        <TabsTrigger value="overview" className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}>
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="students" className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}>
                            Students
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}>
                            Attendance
                        </TabsTrigger>
                        <TabsTrigger value="grades" className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}>
                            Grades
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Quick Stats Grid */}
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                            {[
                                { label: 'Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Attendance Records', value: stats.attendanceCount, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Assessments', value: stats.assessmentsCount, icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { label: 'Upcoming Classes', value: schedules.length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={item}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all"
                                >
                                    <div className={`h-12 w-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Course Information Card */}
                        <Card className="rounded-[2.5rem] border-slate-200/60 shadow-sm overflow-hidden md:col-span-2 p-0">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 ${theme.colors.accent.secondary} rounded-xl flex items-center justify-center`}>
                                        <Info className="h-5 w-5 text-white" />
                                    </div>
                                    <CardTitle className="text-xl font-black text-slate-900">Course Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid gap-8 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Code</label>
                                        <p className="text-lg font-bold text-slate-900">{assignment.course?.code}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credits</label>
                                        <p className="text-lg font-bold text-slate-900">{assignment.course?.credit || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
                                        <div>
                                            <Badge variant="outline" className={`${theme.colors.accent.primary.replace('text-', 'bg-')}/5 ${theme.colors.accent.primary} border-indigo-100/30 font-bold px-3 py-1 rounded-lg text-xs capitalize`}>
                                                {assignment.course?.courseType || "N/A"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {assignment.course?.description || "No description available for this course."}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Class Schedule Card */}
                        <Card className="rounded-[2.5rem] border-slate-200/60 shadow-sm overflow-hidden p-0">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 ${theme.colors.accent.secondary.replace('bg-', 'bg-indigo-')} rounded-xl flex items-center justify-center`}>
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                    <CardTitle className="text-xl font-black text-slate-900">Class Schedule</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {schedules.length > 0 ? (
                                    schedules.map((schedule, index) => {
                                        const roomNumber = typeof schedule.classroom === "object" ? schedule.classroom?.roomNumber : undefined;
                                        return (
                                            <div key={schedule.id || index} className={`p-4 rounded-3xl border border-slate-100 bg-slate-50/30 group hover:${theme.colors.accent.primary.replace('text-', 'border-')}/30 hover:bg-white transition-all`}>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`h-8 w-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center group-hover:${theme.colors.accent.secondary} transition-colors`}>
                                                        <Clock className={`h-4 w-4 ${theme.colors.accent.primary} group-hover:text-white`} />
                                                    </div>
                                                    <span className="font-black text-slate-900">{schedule.startTime} - {schedule.endTime}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {schedule.daysOfWeek?.map((day, idx) => (
                                                        <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                                                            {day}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span>Room: {roomNumber || "TBD"}</span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className={`${theme.colors.accent.primary}`}>{schedule.classType}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Calendar className="h-8 w-8 text-slate-200 mb-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No schedule available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="students" className="mt-6">
                    <Card className="rounded-[2.5rem] border-slate-200/60 shadow-sm overflow-hidden p-0">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <CardTitle className="text-xl font-black text-slate-900">Enrolled Students</CardTitle>
                                </div>
                                <Badge className="bg-blue-50 text-blue-600 border-blue-100 rounded-full px-4 py-1.5 font-black text-xs">
                                    {students.length} Total
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/10">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Registration No</TableHead>
                                            <TableHead className="py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Full Name</TableHead>
                                            <TableHead className="py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Status</TableHead>
                                            <TableHead className="px-8 py-5 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-40 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <Users className="h-8 w-8 mb-2 opacity-20" />
                                                        <p className="text-sm font-bold uppercase tracking-widest">No students enrolled</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            students.map((enrollment, index) => (
                                                <TableRow key={enrollment.id || index} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                                                    <TableCell className="px-8 py-5 font-black text-slate-900">{enrollment.student?.registrationNumber}</TableCell>
                                                    <TableCell className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                                                                {enrollment.student?.fullName?.charAt(0)}
                                                            </div>
                                                            <span className="font-bold text-slate-700">{enrollment.student?.fullName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-5">
                                                        <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-wider rounded-lg px-2 py-0.5 ${enrollment.status === 'active' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                                                            }`}>
                                                            {enrollment.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-5 text-right">
                                                        <Button variant="ghost" size="sm" className={`font-black text-[10px] uppercase tracking-widest rounded-lg text-slate-500 hover:bg-slate-50 hover:text-[#2dd4bf] hover:shadow-sm transition-all`}>View Profile</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden p-4 space-y-3">
                                {students.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                                        <Users className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No students enrolled</p>
                                    </div>
                                ) : (
                                    students.map((enrollment, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={enrollment.id || index}
                                            className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500 border border-slate-200">
                                                        {enrollment.student?.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{enrollment.student?.fullName}</p>
                                                        <p className="text-xs font-semibold text-slate-500">{enrollment.student?.registrationNumber}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-wider rounded-lg px-2 py-0.5 ${enrollment.status === 'active' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                                                    }`}>
                                                    {enrollment.status}
                                                </Badge>
                                            </div>
                                            <Button variant="outline" size="sm" className={`w-full font-black text-[10px] uppercase tracking-widest rounded-xl h-9 text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 transition-all`}>
                                                View Profile
                                            </Button>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="mt-6">
                    <Card className="rounded-[2.5rem] border-slate-200/60 shadow-sm overflow-hidden bg-white p-0">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 ${theme.colors.accent.secondary} rounded-xl flex items-center justify-center`}>
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-xl font-black text-slate-900">Attendance Management</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <div className={`h-24 w-24 ${theme.colors.accent.primary.replace('text-', 'bg-')}/10 rounded-[2.5rem] flex items-center justify-center mb-6`}>
                                <Calendar className={`h-10 w-10 ${theme.colors.accent.primary}`} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to take roll?</h3>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                Manage your daily attendance records for this course and batch. Consistent tracking helps monitor student progress.
                            </p>
                            <Button
                                onClick={() => router.push(`/dashboard/teacher/attendance?courseId=${assignment.courseId}&batchId=${assignment.batchId}`)}
                                className={`w-full shadow-md rounded-xl h-11 font-bold uppercase text-xs tracking-wider transition-all active:scale-95 group-hover:shadow-lg bg-[#2dd4bf] hover:bg-[#25b0a0] text-white border-transparent hover:shadow-teal-500/20 cursor-pointer`}
                            >
                                Mark Today&apos;s Attendance
                            </Button>
                            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <span className="block text-2xl font-black text-slate-900">{stats.attendanceCount}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Records</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <span className="block text-2xl font-black text-slate-900">85%</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Avg. Attendance</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="grades" className="mt-6">
                    <CourseGradeView
                        courseId={assignment.courseId}
                        batchId={assignment.batchId}
                        semester={assignment.semester}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
