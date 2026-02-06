"use client";

import { useState, useMemo, useEffect } from "react";
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
import { CalendarClock, Sparkles, Filter, Clock, MapPin, User, CheckCircle2, XCircle, Archive } from "lucide-react";
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
    useSessionCourses,
    useDepartments
} from "@/hooks/queries/useAcademicQueries";
import { useTeachers } from "@/hooks/queries/useTeacherQueries";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getScheduleStatusSummary } from "../ai-scheduler/actions";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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

    const [scheduleStatus, setScheduleStatus] = useState<{ active: number; closed: number; archived: number }>({ active: 0, closed: 0, archived: 0 });

    // Filters
    const [selectedDay, setSelectedDay] = useState<string>("all");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedBatch, setSelectedBatch] = useState<string>("all");
    const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

    // Fetch Departments
    const { data: departments = [] } = useDepartments();
    const filteredBatchOptions = useMemo(() => {
        let opts = batches;
        if (selectedDepartment !== "all") {
            opts = opts.filter(b => {
                const deptId = typeof b.departmentId === 'object' ? b.departmentId.id : b.departmentId;
                return deptId === selectedDepartment;
            });
        }
        return opts.map(b => ({
            value: b.id,
            label: b.code || b.name,
            description: `${b.name} • Sem ${b.currentSemester}`
        }));
    }, [batches, selectedDepartment]);

    const filteredTeacherOptions = useMemo(() => {
        let opts = teachers;
        if (selectedDepartment !== "all") {
            opts = opts.filter(t => {
                if (!t.departmentId) return true;
                return t.departmentId === selectedDepartment;
            });
        }
        return opts.map(t => ({
            value: t.id,
            label: t.fullName,
            description: t.email
        }));
    }, [teachers, selectedDepartment]);

    const loadScheduleStatus = async () => {
        try {
            const status = await getScheduleStatusSummary();
            setScheduleStatus(status);
        } catch {
            // Silent fail
        }
    };

    useEffect(() => {
        loadScheduleStatus();
    }, []);

    useEffect(() => {
        if (!isSchedulesLoading) {
            loadScheduleStatus();
        }
    }, [schedules, isSchedulesLoading]);

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
            header: "Status",
            accessorKey: "status",
            cell: (item: any) => {
                const status = item.status || 'active';
                const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
                    active: {
                        label: 'Active',
                        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                        icon: <CheckCircle2 className="w-3 h-3" />
                    },
                    closed: {
                        label: 'Closed',
                        className: 'bg-slate-100 text-slate-600 border-slate-200',
                        icon: <XCircle className="w-3 h-3" />
                    },
                    archived: {
                        label: 'Archived',
                        className: 'bg-amber-100 text-amber-700 border-amber-200',
                        icon: <Archive className="w-3 h-3" />
                    }
                };
                const config = statusConfig[status] || statusConfig.active;

                return (
                    <Badge className={`${config.className} border text-[10px] font-bold px-2 py-0.5 flex items-center gap-1 w-fit`}>
                        {config.icon}
                        {config.label}
                    </Badge>
                );
            }
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

            let departmentMatch = true;
            if (selectedDepartment !== "all") {
                const batch = typeof s.batchId === 'object' ? (s.batchId as any) : batches.find(b => b.id === s.batchId);
                const batchDeptId = typeof batch?.departmentId === 'object' ? batch.departmentId.id : batch?.departmentId;
                if (batch) {
                    departmentMatch = batchDeptId === selectedDepartment;
                } else {
                    const sessionCourse = typeof s.sessionCourseId === 'object' ? (s.sessionCourseId as any) : sessionCourses.find(sc => sc.id === s.sessionCourseId);
                    const courseDeptId = typeof sessionCourse?.departmentId === 'object' ? sessionCourse.departmentId.id : sessionCourse?.departmentId;
                    departmentMatch = courseDeptId === selectedDepartment;
                }
            }

            const teacherId = typeof s.teacherId === 'object' ? (s.teacherId as any)._id || (s.teacherId as any).id : s.teacherId;
            const teacherMatch = selectedTeacher === "all" || teacherId === selectedTeacher;

            return dayMatch && batchMatch && departmentMatch && teacherMatch;
        });
    }, [searchableData, selectedDay, selectedBatch, selectedDepartment, selectedTeacher, batches, sessionCourses]);

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

            if (selectedSchedule && !formData.has('sessionId')) {
                const scheduleSessionId = (selectedSchedule as any).sessionId;
                if (scheduleSessionId) {
                    formData.append('sessionId', String(scheduleSessionId));
                }
            }

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
        setSelectedDepartment("all");
        setSelectedBatch("all");
        setSelectedTeacher("all");
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
                        AUTO Scheduler
                    </Button>
                }
            />

            {/* Schedule Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/70">Active</p>
                                <p className="text-2xl font-black text-emerald-700">{scheduleStatus.active}</p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-500 text-white border-0 font-bold">Running</Badge>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-500/10 rounded-xl">
                                <XCircle className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500/70">Closed</p>
                                <p className="text-2xl font-black text-slate-600">{scheduleStatus.closed}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-slate-500 border-slate-300 font-bold">Inactive</Badge>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4 border border-amber-200/60 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                <Archive className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-600/70">Archived</p>
                                <p className="text-2xl font-black text-amber-700">{scheduleStatus.archived}</p>
                            </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold">Historical</Badge>
                    </div>
                </div>
            </div>

            {/* Premium Filters Bar */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-slate-200/60 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100/50">
                        <Filter className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">Advanced Filters</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Department Filter */}
                    <div className="w-[200px]">
                        <Select value={selectedDepartment} onValueChange={(val) => {
                            setSelectedDepartment(val);
                            setSelectedBatch("all");
                            setSelectedTeacher("all");
                        }}>
                            <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white/50 focus:ring-amber-500 font-medium h-12">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="all">Every Department</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id}>{dept.shortName} - {dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Batch Filter (Searchable) */}
                    <div className="w-[220px]">
                        <SearchableSelect
                            options={[{ value: "all", label: "All Batches" }, ...filteredBatchOptions]}
                            value={selectedBatch}
                            onChange={setSelectedBatch}
                            placeholder="Select Batch..."
                        />
                    </div>

                    {/* Teacher Filter (Searchable) */}
                    <div className="w-[220px]">
                        <SearchableSelect
                            options={[{ value: "all", label: "All Teachers" }, ...filteredTeacherOptions]}
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            placeholder="Select Teacher..."
                        />
                    </div>

                    {/* Day Filter */}
                    <div className="w-[160px]">
                        <Select value={selectedDay} onValueChange={setSelectedDay}>
                            <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white/50 focus:ring-amber-500 font-medium h-12">
                                <SelectValue placeholder="Day of Week" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200">
                                <SelectItem value="all">Every Day</SelectItem>
                                {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(selectedDay !== "all" || selectedBatch !== "all" || selectedDepartment !== "all" || selectedTeacher !== "all") && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all h-12 px-4"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {isSchedulesLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="bg-white/80 p-8 rounded-full shadow-xl shadow-amber-100/50 border border-amber-50 group">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 group-hover:border-amber-600"></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Group by Batch Accordion */}
                    <div className="grid gap-4">
                        {batches.filter(b => selectedBatch === "all" || b.id === selectedBatch).map(batch => {
                            const batchSchedules = filteredData.filter(s => {
                                const sBatchId = typeof s.batchId === 'object' ? (s.batchId as any).id : s.batchId;
                                return sBatchId === batch.id;
                            });

                            if (batchSchedules.length === 0 && selectedBatch !== "all") return null;
                            
                            const classesPerDay = batchSchedules.reduce((acc, curr) => {
                                curr.daysOfWeek?.forEach(day => {
                                    acc[day] = (acc[day] || 0) + 1;
                                });
                                return acc;
                            }, {} as Record<string, number>);

                            return (
                                <Accordion type="single" collapsible key={batch.id} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                                    <AccordionItem value={batch.id} className="border-0">
                                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-4 w-full pr-4">
                                                <Badge className="bg-slate-900 text-white border-none text-sm font-bold px-3 py-1.5 h-auto">
                                                    {batch.code || batch.name}
                                                </Badge>
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        Semester {batch.currentSemester} • {typeof batch.departmentId === 'object' ? (batch.departmentId as any).shortName : (batch as any).departmentName || 'Unknown Dept'}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span className="font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                                                            {batchSchedules.length} Classes
                                                        </span>
                                                        <span className="text-slate-400">•</span>
                                                        <span>{batch.shift === 'day' ? 'Day Shift' : 'Evening Shift'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6 pt-2">
                                            {batchSchedules.length > 0 ? (
                                                <div className="rounded-xl border border-slate-200/60 overflow-hidden">
                                                    <DataTable
                                                        data={batchSchedules}
                                                        columns={columns}
                                                        searchKey="searchCourse"
                                                        searchPlaceholder="Search courses in this batch..."
                                                        onView={handleView}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDeleteClick}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                                                    <p className="text-slate-500 font-medium">No schedule entries found for this batch</p>
                                                    <Button variant="link" onClick={handleCreate} className="text-amber-600 font-bold mt-1">
                                                        Add First Class
                                                    </Button>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            );
                        })}

                        {batches.filter(b => selectedBatch === "all" || b.id === selectedBatch).length === 0 && (
                            <div className="text-center py-12 bg-white/60 rounded-3xl border border-slate-200 border-dashed">
                                <div className="p-4 bg-slate-100/50 rounded-full w-fit mx-auto mb-4">
                                    <Filter className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">No batches match your filter</h3>
                                <p className="text-slate-500 mt-1 mb-4">Try adjusting the batch selector.</p>
                                <Button onClick={clearFilters} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50">
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
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
