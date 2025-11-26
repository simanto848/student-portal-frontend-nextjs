"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { academicService, CourseSchedule, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, BookOpen, Users, MapPin, Clock } from "lucide-react";

export default function ScheduleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [schedule, setSchedule] = useState<CourseSchedule | null>(null);
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
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
                        <h1 className="text-2xl font-bold text-[#344e41]">Schedule Details</h1>
                        <p className="text-[#344e41]/70">{getCourseName(schedule.sessionCourseId)}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Time & Location Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Clock className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Time & Location</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Day</label>
                                    <p className="text-base font-medium text-[#344e41]">{schedule.dayOfWeek}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Time</label>
                                    <p className="text-base font-medium text-[#344e41]">{schedule.startTime} - {schedule.endTime}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Location</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4 text-[#344e41]/50" />
                                    <p className="text-base font-medium text-[#344e41]">
                                        {typeof schedule.roomNumber === 'object' && schedule.roomNumber
                                            ? `${schedule.roomNumber.roomNumber} - ${schedule.roomNumber.buildingName}`
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Class Type</label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#a3b18a]/20 text-[#344e41] mt-1">
                                    {schedule.classType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Academic Context Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <BookOpen className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Academic Context</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Batch</label>
                                <p className="text-base font-medium text-[#344e41]">{getName(schedule.batchId)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Teacher</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Users className="h-4 w-4 text-[#344e41]/50" />
                                    <p className="text-base font-medium text-[#344e41]">
                                        {schedule.teacher?.fullName || "Not Assigned"}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Start Date</label>
                                    <p className="text-base font-medium text-[#344e41]">
                                        {new Date(schedule.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">End Date</label>
                                    <p className="text-base font-medium text-[#344e41]">
                                        {schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : "Ongoing"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Status</label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {schedule.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
