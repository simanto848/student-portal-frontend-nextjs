"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { academicService, AcademicApiError } from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/teacher.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  User,
  BookOpen,
  CalendarClock,
  GraduationCap,
  Building2,
  FileText,
  RefreshCw,
  Users,
  Mail,
  Award,
} from "lucide-react";

interface ScheduleWithPopulated {
  id: string;
  batchId?: { id?: string; name?: string; year?: number } | string;
  sessionCourseId?:
  | {
    id?: string;
    name?: string;
    courseId?: { code?: string; name?: string };
    semester?: number;
  }
  | string;
  classroomId?:
  | { id?: string; roomNumber?: string; buildingName?: string }
  | string;
  teacherId?: string;
  teacher?: { fullName?: string };
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  classType: string;
  startDate: string;
  endDate?: string;
  isRecurring?: boolean;
  isActive?: boolean;
  updatedAt?: string;
}

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [schedule, setSchedule] = useState<ScheduleWithPopulated | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getName = (
    obj:
      | { name?: string; title?: string; batchName?: string }
      | string
      | null
      | undefined
  ): string => {
    if (!obj) return "Not Assigned";
    if (typeof obj === "string") return obj;
    return obj.name || obj.title || obj.batchName || "N/A";
  };

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await academicService.getScheduleById(id);
      setSchedule(data as ScheduleWithPopulated);

      if (data.teacherId) {
        try {
          const teacherId =
            typeof data.teacherId === "object" ? (data.teacherId as { _id?: string })._id || "" : data.teacherId;
          if (teacherId) {
            const teacherData = await teacherService.getTeacherById(teacherId);
            setTeacher(teacherData);
          }
        } catch {
          console.log("Could not fetch teacher details");
        }
      }
    } catch (error) {
      const message = error instanceof AcademicApiError ? error.message : "Failed to load schedule details";
      toast.error(message);
      router.push("/dashboard/staff/program-controller/schedules");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchSchedule();
    }
  }, [id, fetchSchedule]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!schedule) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Schedule not found</p>
          <Button
            variant="outline"
            onClick={() =>
              router.push("/dashboard/staff/program-controller/schedules")
            }
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Schedules
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push("/dashboard/staff/program-controller/schedules")
            }
            className="text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#344e41]">
              Schedule Details
            </h1>
            <p className="text-sm text-[#344e41]/60">
              View complete schedule information
            </p>
          </div>
        </div>

        {/* Course/Session Info Banner */}
        <div className="bg-linear-to-r from-[#588157] to-[#3a5a40] rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {getName(schedule.sessionCourseId)}
                </h2>
                <p className="text-white/80 mt-1">
                  {typeof schedule.sessionCourseId === "object" &&
                    schedule.sessionCourseId?.courseId
                    ? `${schedule.sessionCourseId.courseId.code} - ${schedule.sessionCourseId.courseId.name}`
                    : "Course Details"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${schedule.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {schedule.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Type: {schedule.classType}</span>
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
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Days of Week
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {Array.isArray(schedule.daysOfWeek)
                      ? schedule.daysOfWeek.join(", ")
                      : schedule.daysOfWeek}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Start Time
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {schedule.startTime}
                  </p>
                </div>
                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                  <label className="text-xs font-medium text-[#344e41]/70">
                    End Time
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {schedule.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#f8f9fa] rounded-lg">
                <RefreshCw className="h-5 w-5 text-[#588157]" />
                <div>
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Recurring
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {schedule.isRecurring ? "Yes" : "No"}
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
              <div className="flex items-start gap-3 p-4 bg-linear-to-br from-[#588157]/10 to-[#a3b18a]/10 rounded-lg border border-[#588157]/20">
                <Building2 className="h-6 w-6 text-[#588157] mt-1" />
                <div>
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Room Details
                  </label>
                  <p className="text-base font-semibold text-[#344e41] mt-1">
                    {typeof schedule.classroomId === "object" &&
                      schedule.classroomId
                      ? `Room ${schedule.classroomId.roomNumber}`
                      : "Not Assigned"}
                  </p>
                  <p className="text-sm text-[#344e41]/70 mt-1">
                    {typeof schedule.classroomId === "object" &&
                      schedule.classroomId
                      ? schedule.classroomId.buildingName
                      : ""}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#f8f9fa] rounded-lg">
                <label className="text-xs font-medium text-[#344e41]/70">
                  Class Type
                </label>
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
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Full Name
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {teacher
                      ? teacher.fullName
                      : schedule.teacher?.fullName || "Not Assigned"}
                  </p>
                </div>
              </div>

              {teacher && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                    <Mail className="h-5 w-5 text-[#588157]" />
                    <div>
                      <label className="text-xs font-medium text-[#344e41]/70">
                        Email
                      </label>
                      <p className="text-sm font-medium text-[#344e41]">
                        {teacher.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                    <Award className="h-5 w-5 text-[#588157]" />
                    <div>
                      <label className="text-xs font-medium text-[#344e41]/70">
                        Registration Number
                      </label>
                      <p className="text-sm font-medium text-[#344e41]">
                        {teacher.registrationNumber}
                      </p>
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
              <h2 className="text-lg font-semibold text-[#344e41]">
                Batch Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                <GraduationCap className="h-5 w-5 text-[#588157]" />
                <div>
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Batch Name
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {getName(schedule.batchId)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Year
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {typeof schedule.batchId === "object"
                      ? schedule.batchId.year
                      : "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Semester
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {typeof schedule.sessionCourseId === "object"
                      ? schedule.sessionCourseId.semester
                      : "N/A"}
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
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Start Date
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {new Date(schedule.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg">
                <Calendar className="h-5 w-5 text-[#588157]" />
                <div>
                  <label className="text-xs font-medium text-[#344e41]/70">
                    End Date
                  </label>
                  <p className="text-base font-semibold text-[#344e41]">
                    {schedule.endDate
                      ? new Date(schedule.endDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : "Ongoing"}
                  </p>
                </div>
              </div>

              {schedule.updatedAt && (
                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                  <label className="text-xs font-medium text-[#344e41]/70">
                    Last Updated
                  </label>
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
