"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    CourseSchedule,
    Batch,
    Classroom,
    SessionCourse
} from "@/services/academic/types";
import { Teacher } from "@/services/teacher.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { CalendarClock, Sparkles, Filter, Clock, MapPin, User, BookOpen } from "lucide-react";
import { ScheduleFormModal } from "./ScheduleFormModal";
import { ScheduleDeleteModal } from "./ScheduleDeleteModal";
import {
    createScheduleAction,
    updateScheduleAction,
    deleteScheduleAction
} from "../actions";
import {
    useSchedules,
    useBatches,
    useClassrooms,
    useSessionCourses
} from "@/hooks/queries/useAcademicQueries";
import { useTeachers } from "@/hooks/queries/useTeacherQueries";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SearchableSchedule extends CourseSchedule {
    searchCourse: string;
    searchTeacher: string;
    searchBatch: string;
    searchRoom: string;
    searchDepartment: string;
    displayDay: string;
    semester?: number;
    session?: any;
    course?: any;
}

export function ScheduleManagementClient() {
    const router = useRouter();
    const { data: schedules = [], isLoading: isSchedulesLoading, refetch } = useSchedules();
    const { data: batches = [] } = useBatches();
    const { data: classrooms = [] } = useClassrooms();
    const { data: sessionCourses = [] } = useSessionCourses();
    const { data: teachers = [] } = useTeachers();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<CourseSchedule | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filters
    const [selectedDay, setSelectedDay] = useState<string>("all");
    const [selectedBatch, setSelectedBatch] = useState<string>("all");

    const columns: Column<SearchableSchedule>[] = useMemo(() => [
        {
            header: "Course & Semester",
            accessorKey: "sessionCourseId" as any,
            cell: (item: any) => {
                const sessionCourse = typeof item.sessionCourseId === 'object' ? item.sessionCourseId : null;
                const courseName = (typeof sessionCourse?.courseId === 'object' ? sessionCourse.courseId?.name : null) || item.course?.name || "Unknown Course";
                const sessionName = (typeof sessionCourse?.sessionId === 'object' ? sessionCourse.sessionId?.name : null) || (typeof item.session === 'object' ? item.session?.name : null) || "N/A";

                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{courseName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-600 border-amber-200">
                                Sem {item.semester}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-medium">| {sessionName}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Classroom",
            accessorKey: "classroomId",
            cell: (item: any) => {
                const classroom = typeof item.classroomId === 'object' ? item.classroomId : item.classroom;
                return (
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                            <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-700">{classroom?.roomNumber || "N/A"}</span>
                    </div>
                );
            },
        },
        {
            header: "Teacher",
            accessorKey: "teacherId",
            cell: (item: any) => {
                const teacherObj = typeof item.teacherId === 'object' ? item.teacherId :
                    (teachers as Teacher[]).find(t => t.id === item.teacherId || (t as any)._id === item.teacherId) || item.teacher;
                const fullName = (teacherObj as any)?.fullName || (typeof item.searchTeacher === 'string' && item.searchTeacher !== "Unassigned" ? item.searchTeacher : null);

                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">{fullName || "Unassigned"}</span>
                        </div>
                        {teacherObj?.email && (
                            <span className="text-[10px] text-slate-400 font-medium ml-6">{teacherObj.email}</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: "Department",
            accessorKey: "departmentId" as any,
            cell: (item: any) => {
                const batch = typeof item.batchId === 'object' ? item.batchId : null;
                const sessionCourse = typeof item.sessionCourseId === 'object' ? item.sessionCourseId : null;
                const department = batch?.departmentId || sessionCourse?.departmentId || (item as any).department;

                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-600">{department?.name || "N/A"}</span>
                        {department?.shortName && (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{department.shortName}</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: "Time Slot",
            accessorKey: "startTime",
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wide">
                        {item.daysOfWeek?.join(", ") || "N/A"}
                    </span>
                    <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-[11px] font-medium">{item.startTime} - {item.endTime}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Batch",
            accessorKey: "batchId",
            cell: (item: any) => {
                const batch = typeof item.batchId === 'object' ? item.batchId : item.batch;
                return (
                    <Badge className="bg-slate-900 text-white border-none text-[10px] font-bold px-2.5 py-1">
                        {batch?.code || batch?.name || "N/A"}
                    </Badge>
                );
            },
        },
    ], [batches, sessionCourses, classrooms, teachers]);

    const searchableData: SearchableSchedule[] = useMemo(() => {
        return schedules.map(s => {
            const sessionCourse = typeof s.sessionCourseId === 'object' ? (s.sessionCourseId as SessionCourse) : null;
            const courseName = (typeof sessionCourse?.courseId === 'object' ? (sessionCourse.courseId as any).name : null) || (s as any).course?.name || "Unknown Course";
            const batch = typeof s.batchId === 'object' ? (s.batchId as Batch) : null;
            const batchName = batch?.code || batch?.name || (s as any).batch?.name || "N/A";
            const teacher = typeof s.teacherId === 'object' ? (s.teacherId as any) :
                (teachers as Teacher[]).find(t => t.id === s.teacherId || (t as any)._id === s.teacherId) || (s as any).teacher;
            const teacherName = (teacher as any)?.fullName || "Unassigned";
            const roomNumber = s.classroom?.roomNumber || (s.classroomId as any)?.roomNumber || "N/A";
            const department = batch?.departmentId || sessionCourse?.departmentId || (s as any).department;
            const departmentName = department?.name || "N/A";

            return {
                ...s,
                searchCourse: courseName,
                searchTeacher: teacherName,
                searchBatch: batchName,
                searchRoom: roomNumber,
                searchDepartment: departmentName,
                displayDay: s.daysOfWeek?.[0] || "N/A",
                semester: sessionCourse?.semester || (s as any).semester,
                course: sessionCourse?.courseId || (s as any).course,
                session: sessionCourse?.sessionId || (s as any).session
            };
        });
    }, [schedules, teachers]);

    const filteredData = useMemo(() => {
        return searchableData.filter((s) => {
            const dayMatch = selectedDay === "all" || s.daysOfWeek?.includes(selectedDay as any);
            const batchId = typeof s.batchId === 'object' ? (s.batchId as any).id : s.batchId;
            const batchMatch = selectedBatch === "all" || batchId === selectedBatch;
            return dayMatch && batchMatch;
        });
    }, [searchableData, selectedDay, selectedBatch]);

    const handleCreate = () => {
        setSelectedSchedule(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (schedule: CourseSchedule) => {
        setSelectedSchedule(schedule);
        setIsFormModalOpen(true);
    };

    const handleView = (schedule: CourseSchedule) => {
        router.push(`/dashboard/admin/academic/schedule/${schedule.id}`);
    };

    const handleDeleteClick = (schedule: CourseSchedule) => {
        setSelectedSchedule(schedule);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSchedule) return;
        setIsDeleting(true);
        try {
            const result = await deleteScheduleAction(selectedSchedule.id, null, new FormData());
            if (result.success) {
                notifySuccess("Schedule deleted successfully");
                setIsDeleteModalOpen(false);
                refetch();
            } else {
                notifyError(result.message || "Failed to delete schedule");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete schedule");
        } finally {
            setIsDeleting(false);
            setSelectedSchedule(null);
        }
    };

    const handleFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => formData.append(key, String(v)));
                    return;
                }
                if (value !== undefined && value !== null && value !== "") {
                    formData.append(key, String(value));
                }
            });

            const result = selectedSchedule
                ? await updateScheduleAction(selectedSchedule.id, null, formData)
                : await createScheduleAction(null, formData);

            if (result.success) {
                notifySuccess(`Schedule ${selectedSchedule ? "updated" : "created"} successfully`);
                setIsFormModalOpen(false);
                setSelectedSchedule(null);
                refetch();
            } else {
                notifyError(result.message || "Failed to save schedule");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearFilters = () => {
        setSelectedDay("all");
        setSelectedBatch("all");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Class Schedule"
                subtitle="Manage and optimize academic timetables"
                actionLabel="Add Schedule"
                onAction={handleCreate}
                icon={CalendarClock}
                extraActions={
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/admin/academic/schedule/ai-scheduler")}
                        className="rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-all font-bold gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Scheduler
                    </Button>
                }
            />

            {/* Premium Filters Bar */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100/50">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Refine View</span>
                </div>

                <div className="flex flex-wrap gap-3 flex-1">
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white/50 focus:ring-amber-500 font-medium">
                            <SelectValue placeholder="Day of Week" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="all">Every Day</SelectItem>
                            {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                        <SelectTrigger className="w-[200px] rounded-xl border-slate-200 bg-white/50 focus:ring-amber-500 font-medium">
                            <SelectValue placeholder="Batch" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 max-h-[300px]">
                            <SelectItem value="all">All Batches</SelectItem>
                            {batches.map((batch) => (
                                <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(selectedDay !== "all" || selectedBatch !== "all") && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    >
                        Reset
                    </Button>
                )}
            </div>

            {isSchedulesLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="bg-white/80 p-8 rounded-full shadow-xl shadow-amber-100/50 border border-amber-50 group">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 group-hover:border-amber-600"></div>
                    </div>
                </div>
            ) : (
                <DataTable
                    data={filteredData}
                    columns={columns}
                    searchKey="searchCourse"
                    searchPlaceholder="Search by course name..."
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <ScheduleFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedSchedule}
                batches={batches}
                sessionCourses={sessionCourses}
                classrooms={classrooms}
                teachers={teachers}
                isSubmitting={isSubmitting}
            />

            <ScheduleDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                scheduleTitle={selectedSchedule ? (
                    (typeof selectedSchedule.sessionCourseId === 'object' ? (typeof (selectedSchedule.sessionCourseId as any).courseId === 'object' ? (selectedSchedule.sessionCourseId as any).courseId?.name : null) : null) ||
                    (selectedSchedule as any).course?.name ||
                    "this class"
                ) + ` (${selectedSchedule.startTime})` : undefined}
                isDeleting={isDeleting}
            />
        </div>
    );
}
