"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { academicService, CourseSchedule, AcademicApiError } from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/teacher.service";
import { toast } from "sonner";
import {
    ArrowLeft,
    CalendarClock,
    BookOpen,
    Users,
    MapPin,
    Clock,
    GraduationCap,
    Building2,
    Calendar,
    Hash,
    Mail,
    User,
    Award,
    CheckCircle2,
    XCircle,
    RefreshCw,
    FileText,
    Layers
} from "lucide-react";

export default function ScheduleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [schedule, setSchedule] = useState<CourseSchedule | null>(null);
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSchedule();
        }
    }, [id]);

    const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getScheduleById(id);
            setSchedule(data);
            if (data.teacherId && typeof data.teacherId === 'string') {
                try {
                    const teacherData = await teacherService.getTeacherById(data.teacherId);
                    setTeacher(teacherData);
                } catch (err) {
                    console.error("Failed to load teacher details", err);
                }
            } else if (data.teacherId && typeof data.teacherId === 'object') {
                setTeacher(data.teacherId as any);
            }
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load schedule details";
            toast.error(message);
            router.push("/dashboard/admin/academic/schedule");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#588157]"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!schedule) {
        return null;
    }

    const getName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item.name) return item.name;
        return "N/A";
    };

    const getCourseName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'object' && item.courseId) {
            if (typeof item.courseId === 'object' && item.courseId.name) return item.courseId.name;
        }
        return "N/A";
    };

    const getCourseCode = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'object' && item.courseId) {
            if (typeof item.courseId === 'object' && item.courseId.code) return item.courseId.code;
        }
        return "N/A";
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header with Status Badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-[#344e41]">Schedule Details</h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {schedule.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                    {schedule.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-[#344e41]/70 mt-1">{getCourseName(schedule.sessionCourseId)}</p>
                        </div>
                    </div>
                </div>

                {/* Course Information Banner */}
                <div className="bg-gradient-to-r from-[#588157] to-[#344e41] rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">{getCourseName(schedule.sessionCourseId)}</h2>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    <span>Code: {getCourseCode(schedule.sessionCourseId)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    <span>Semester: {typeof schedule.sessionCourseId === 'object' ? schedule.sessionCourseId.semester : "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Type: {schedule.classType}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Time & Schedule Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Clock className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Schedule</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                                <CalendarClock className="h-5 w-5 text-[#588157]" />
                                <div>
                                    <label className="text-xs font-medium text-[#344e41]/70">Days of Week</label>
                                    <p className="text-base font-semibold text-[#344e41]">
                                        {Array.isArray(schedule.daysOfWeek) ? schedule.daysOfWeek.join(", ") : schedule.daysOfWeek}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                    <label className="text-xs font-medium text-[#344e41]/70">Start Time</label>
                                    <p className="text-base font-semibold text-[#344e41]">{schedule.startTime}</p>
                                </div>
                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                    <label className="text-xs font-medium text-[#344e41]/70">End Time</label>
                                    <p className="text-base font-semibold text-[#344e41]">{schedule.endTime}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-[#f8f9fa] rounded-lg">
                                <RefreshCw className="h-5 w-5 text-[#588157]" />
                                <div>
                                    <label className="text-xs font-medium text-[#344e41]/70">Recurring</label>
                                    <p className="text-base font-semibold text-[#344e41]">
                                        {schedule.isRecurring ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <MapPin className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Location</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#588157]/10 to-[#a3b18a]/10 rounded-lg border border-[#588157]/20">
                                <Building2 className="h-6 w-6 text-[#588157] mt-1" />
                                <div>
                                    <label className="text-xs font-medium text-[#344e41]/70">Room Details</label>
                                    <p className="text-base font-semibold text-[#344e41] mt-1">
                                        {typeof schedule.classroomId === 'object' && schedule.classroomId
                                            ? `Room ${schedule.classroomId.roomNumber}`
                                            : "Not Assigned"}
                                    </p>
                                    <p className="text-sm text-[#344e41]/70 mt-1">
                                        {typeof schedule.classroomId === 'object' && schedule.classroomId
                                            ? schedule.classroomId.buildingName
                                            : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                <label className="text-xs font-medium text-[#344e41]/70">Class Type</label>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#a3b18a]/30 text-[#344e41] mt-2">
                                    {schedule.classType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <User className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Teacher</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                                <GraduationCap className="h-5 w-5 text-[#588157]" />
                                <div>
                                    <label className="text-xs font-medium text-[#344e41]/70">Full Name</label>
                                    <p className="text-base font-semibold text-[#344e41]">
                                        {teacher ? teacher.fullName : (schedule.teacher?.fullName || "Not Assigned")}
                                    </p>
                                </div>
                            </div>

                            {teacher && (
                                <>
                                    <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                                        <Mail className="h-5 w-5 text-[#588157]" />
                                        <div>
                                            <label className="text-xs font-medium text-[#344e41]/70">Email</label>
                                            <p className="text-sm font-medium text-[#344e41]">{teacher.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                                        <Award className="h-5 w-5 text-[#588157]" />
                                        <div>
                                            <label className="text-xs font-medium text-[#344e41]/70">Registration Number</label>
                                            <p className="text-sm font-medium text-[#344e41]">{teacher.registrationNumber}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Academic Context & Dates */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Batch Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Users className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Batch Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                                <GraduationCap className="h-5 w-5 text-[#588157]" />
                                <div>
                                    <label className="text-xs font-medium text-[#344e41]/70">Batch Name</label>
                                    <p className="text-base font-semibold text-[#344e41]">{getName(schedule.batchId)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                    <label className="text-xs font-medium text-[#344e41]/70">Year</label>
                                    <p className="text-base font-semibold text-[#344e41]">
                                        {typeof schedule.batchId === 'object' ? schedule.batchId.year : "N/A"}
                                    </p>
                                </div>
                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                    <label className="text-xs font-medium text-[#344e41]/70">Semester</label>
                                    <p className="text-base font-semibold text-[#344e41]">
                                        {typeof schedule.sessionCourseId === 'object' ? schedule.sessionCourseId.semester : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Duration</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                                <Calendar className="h-5 w-5 text-[#588157]" />
                                <div>
                                    <label className="text-xs font-medium text-[#344e41]/70">Start Date</label>
                                    <p className="text-base font-semibold text-[#344e41]">
                                        {new Date(schedule.startDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                                <Calendar className="h-5 w-5 text-[#588157]" />
                                <div>
                                    <label className="text-xs font-medium text-[#344e41]/70">End Date</label>
                                    <p className="text-base font-semibold text-[#344e41]">
                                        {schedule.endDate
                                            ? new Date(schedule.endDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : "Ongoing"}
                                    </p>
                                </div>
                            </div>

                            {schedule.updatedAt && (
                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                    <label className="text-xs font-medium text-[#344e41]/70">Last Updated</label>
                                    <p className="text-sm text-[#344e41]/70 mt-1">
                                        {new Date(schedule.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
