"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, CourseSchedule, Batch, SessionCourse, Classroom, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";

// Helper to get name from object or string
const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.name) return item.name;
    if (typeof item === 'object' && item.roomNumber) return item.roomNumber;
    return "N/A";
};

// Helper to get ID from object or string
const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.id) return item.id;
    return "";
};

export default function CourseScheduleManagementPage() {
    const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [sessionCourses, setSessionCourses] = useState<SessionCourse[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<CourseSchedule | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<CourseSchedule>[] = [
        {
            header: "Batch",
            accessorKey: "batchId",
            cell: (item) => getName(item.batchId)
        },
        {
            header: "Course",
            accessorKey: "sessionCourseId",
            cell: (item) => {
                const sc = item.sessionCourseId as any;
                if (sc && sc.courseId) return getName(sc.courseId);
                return "N/A";
            }
        },
        { header: "Day", accessorKey: "dayOfWeek" },
        {
            header: "Time",
            accessorKey: "startTime",
            cell: (item) => `${item.startTime} - ${item.endTime}`
        },
        {
            header: "Room",
            accessorKey: "roomNumber",
            cell: (item) => getName(item.roomNumber)
        },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (item) => (
                <Badge
                    variant={item.isActive ? "default" : "destructive"}
                    className={item.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                >
                    {item.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "batchId",
            label: "Batch",
            type: "select",
            required: true,
            placeholder: "Select a batch",
            options: Array.isArray(batches)
                ? batches
                    .filter(b => b.status)
                    .map(b => ({ label: b.name, value: b.id }))
                : []
        },
        {
            name: "sessionCourseId",
            label: "Course",
            type: "select",
            required: true,
            placeholder: "Select a course",
            options: Array.isArray(sessionCourses)
                ? sessionCourses
                    .map(sc => {
                        const courseName = (sc.courseId as any)?.name || "Unknown Course";
                        const sessionName = (sc.sessionId as any)?.name || "Unknown Session";
                        return { label: `${courseName} (${sessionName})`, value: sc.id };
                    })
                : []
        },
        {
            name: "dayOfWeek",
            label: "Day",
            type: "select",
            required: true,
            options: [
                { label: "Sunday", value: "Sunday" },
                { label: "Monday", value: "Monday" },
                { label: "Tuesday", value: "Tuesday" },
                { label: "Wednesday", value: "Wednesday" },
                { label: "Thursday", value: "Thursday" },
                { label: "Friday", value: "Friday" },
                { label: "Saturday", value: "Saturday" },
            ]
        },
        {
            name: "startTime",
            label: "Start Time",
            type: "time",
            required: true
        },
        {
            name: "endTime",
            label: "End Time",
            type: "time",
            required: true
        },
        {
            name: "roomNumber",
            label: "Classroom",
            type: "select",
            required: true,
            placeholder: "Select a classroom",
            options: Array.isArray(classrooms)
                ? classrooms
                    .filter(c => c.isActive)
                    .map(c => ({ label: `${c.roomNumber} (${c.buildingName})`, value: c.id }))
                : []
        },
        {
            name: "classType",
            label: "Class Type",
            type: "select",
            required: true,
            options: [
                { label: "Lecture", value: "Lecture" },
                { label: "Tutorial", value: "Tutorial" },
                { label: "Lab", value: "Lab" },
                { label: "Seminar", value: "Seminar" },
                { label: "Workshop", value: "Workshop" },
                { label: "Other", value: "Other" },
            ]
        },
        {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true
        },
        {
            name: "endDate",
            label: "End Date",
            type: "date"
        },
        {
            name: "isActive",
            label: "Status",
            type: "select",
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" }
            ]
        },
        {
            name: "isRecurring",
            label: "Recurring",
            type: "select",
            options: [
                { label: "Yes", value: "true" },
                { label: "No", value: "false" }
            ]
        },
    ], [batches, sessionCourses, classrooms]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [schedulesData, batchesData, scData, classroomsData] = await Promise.all([
                academicService.getAllSchedules(),
                academicService.getAllBatches(),
                academicService.getAllSessionCourses(),
                academicService.getAllClassrooms()
            ]);
            setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setSessionCourses(Array.isArray(scData) ? scData : []);
            setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load data";
            toast.error(message);
            setSchedules([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedSchedule(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (schedule: CourseSchedule) => {
        setSelectedSchedule(schedule);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (schedule: CourseSchedule) => {
        setSelectedSchedule(schedule);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSchedule) return;
        setIsDeleting(true);
        try {
            await academicService.deleteSchedule(selectedSchedule.id);
            toast.success("Schedule deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to delete schedule";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedSchedule(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.batchId || !data.sessionCourseId || !data.roomNumber) {
                toast.error("Batch, Course and Classroom are required");
                setIsSubmitting(false);
                return;
            }

            if (!data.startTime || !data.endTime) {
                toast.error("Start and End times are required");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                batchId: data.batchId,
                sessionCourseId: data.sessionCourseId,
                dayOfWeek: data.dayOfWeek as any,
                startTime: data.startTime,
                endTime: data.endTime,
                roomNumber: data.roomNumber,
                classType: data.classType as any,
                startDate: new Date(data.startDate).toISOString(),
                endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
                isActive: data.isActive === "true",
                isRecurring: data.isRecurring === "true",
            };

            if (selectedSchedule) {
                await academicService.updateSchedule(selectedSchedule.id, submitData);
                toast.success("Schedule updated successfully");
            } else {
                await academicService.createSchedule(submitData);
                toast.success("Schedule created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save schedule";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Course Schedule Management"
                    subtitle="Manage class routines and schedules"
                    actionLabel="Add New Schedule"
                    onAction={handleCreate}
                    icon={CalendarClock}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={schedules}
                        columns={columns}
                        searchKey="dayOfWeek"
                        searchPlaceholder="Search by day..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Schedule"
                    description="Are you sure you want to delete this class schedule? This action cannot be undone."
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedSchedule ? "Edit Schedule" : "Add New Schedule"}
                    description={selectedSchedule ? "Update class schedule" : "Create a new class schedule"}
                    fields={formFields}
                    initialData={selectedSchedule ? {
                        batchId: getId(selectedSchedule.batchId),
                        sessionCourseId: getId(selectedSchedule.sessionCourseId),
                        dayOfWeek: selectedSchedule.dayOfWeek,
                        startTime: selectedSchedule.startTime,
                        endTime: selectedSchedule.endTime,
                        roomNumber: getId(selectedSchedule.roomNumber),
                        classType: selectedSchedule.classType,
                        startDate: selectedSchedule.startDate.split('T')[0],
                        endDate: selectedSchedule.endDate ? selectedSchedule.endDate.split('T')[0] : "",
                        isActive: selectedSchedule.isActive ? "true" : "false",
                        isRecurring: selectedSchedule.isRecurring ? "true" : "false",
                    } : { isActive: "true", isRecurring: "true", classType: "Lecture" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
