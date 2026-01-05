"use client";

import { useMemo } from "react";
import { GenericFormModal } from "@/components/dashboard/shared/GenericFormModal";
import {
    Batch,
    Classroom,
    SessionCourse,
    CourseSchedule
} from "@/services/academic/types";
import { Teacher } from "@/services/teacher.service";

interface ScheduleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: CourseSchedule | null;
    batches: Batch[];
    sessionCourses: SessionCourse[];
    classrooms: Classroom[];
    teachers: Teacher[];
    isSubmitting: boolean;
}

export function ScheduleFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    batches,
    sessionCourses,
    classrooms,
    teachers,
    isSubmitting,
}: ScheduleFormModalProps) {
    const formattedInitialData = useMemo(() => {
        if (!initialData) return undefined;

        return {
            ...initialData,
            batchId: typeof initialData.batchId === 'object' ? (initialData.batchId as any).id || (initialData.batchId as any)._id : initialData.batchId,
            sessionCourseId: typeof initialData.sessionCourseId === 'object' ? (initialData.sessionCourseId as any).id || (initialData.sessionCourseId as any)._id : initialData.sessionCourseId,
            teacherId: typeof initialData.teacherId === 'object' ? (initialData.teacherId as any).id || (initialData.teacherId as any)._id : initialData.teacherId,
            classroomId: typeof initialData.classroomId === 'object' ? (initialData.classroomId as any).id || (initialData.classroomId as any)._id : initialData.classroomId,
            dayOfWeek: initialData.daysOfWeek?.[0] || "",
            semester: String((initialData as any).semester || "")
        };
    }, [initialData]);

    const formFields = useMemo(() => [
        {
            name: "batchId",
            label: "Batch",
            type: "select" as const,
            placeholder: "Select batch",
            options: batches.map((b) => ({ label: b.name, value: b.id })),
            validation: { required: "Batch is required" },
        },
        {
            name: "sessionCourseId",
            label: "Course Assignment",
            type: "select" as const,
            placeholder: "Select course & session",
            options: sessionCourses.map((sc: any) => ({
                label: `${sc.course?.name || "Unknown"} (${sc.session?.name || "N/A"}) - ${sc.semester}th Sem`,
                value: sc.id
            })),
            validation: { required: "Course assignment is required" },
        },
        {
            name: "teacherId",
            label: "Teacher",
            type: "select" as const,
            placeholder: "Select teacher",
            options: teachers.map((t: any) => ({ label: t.fullName || t.name, value: t.id || t._id })),
            validation: { required: "Teacher is required" },
        },
        {
            name: "classroomId",
            label: "Classroom",
            type: "select" as const,
            placeholder: "Select classroom",
            options: classrooms.map((c) => ({ label: c.roomNumber, value: c.id })),
            validation: { required: "Classroom is required" },
        },
        {
            name: "dayOfWeek",
            label: "Day of Week",
            type: "select" as const,
            placeholder: "Select day",
            options: [
                { label: "Saturday", value: "Saturday" },
                { label: "Sunday", value: "Sunday" },
                { label: "Monday", value: "Monday" },
                { label: "Tuesday", value: "Tuesday" },
                { label: "Wednesday", value: "Wednesday" },
                { label: "Thursday", value: "Thursday" },
                { label: "Friday", value: "Friday" },
            ],
            validation: { required: "Day is required" },
        },
        {
            name: "startTime",
            label: "Start Time",
            type: "time" as const,
            placeholder: "HH:mm",
            validation: { required: "Start time is required" },
        },
        {
            name: "endTime",
            label: "End Time",
            type: "time" as const,
            placeholder: "HH:mm",
            validation: { required: "End time is required" },
        },
        {
            name: "semester",
            label: "Semester (Numeric)",
            type: "number" as const,
            placeholder: "e.g. 1",
            validation: { required: "Semester is required" },
        }
    ], [batches, sessionCourses, classrooms, teachers]);

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={initialData ? "Edit Schedule" : "Create Schedule"}
            description={
                initialData
                    ? "Update class timing or classroom assignment."
                    : "Define a new class schedule entry."
            }
            fields={formFields}
            initialData={formattedInitialData}
            isSubmitting={isSubmitting}
        />
    );
}
