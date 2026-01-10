"use client";

import { useMemo, useState, useEffect } from "react";
import { GenericFormModal } from "@/components/dashboard/shared/GenericFormModal";
import {
    Batch,
    Classroom,
    SessionCourse,
    CourseSchedule
} from "@/services/academic/types";
import { academicService } from "@/services/academic.service";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
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
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [batchAssignments, setBatchAssignments] = useState<BatchCourseInstructor[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const bId = (initialData.batchId && typeof initialData.batchId === 'object') ? (initialData.batchId as any).id || (initialData.batchId as any)._id : initialData.batchId;
                setSelectedBatchId(bId || null);
            } else {
                setSelectedBatchId(null);
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        const fetchAssignments = async () => {
            if (selectedBatchId) {
                try {
                    const assignments = await batchCourseInstructorService.getCourseInstructors({ batchId: selectedBatchId });
                    setBatchAssignments(assignments);
                } catch (error) {
                    console.error("Failed to fetch batch course instructors:", error);
                }
            } else {
                setBatchAssignments([]);
            }
        };
        fetchAssignments();
    }, [selectedBatchId]);

    const handleFieldChange = (name: string, value: any, setValue: (name: string, value: any) => void) => {
        if (name === "batchId") {
            setSelectedBatchId(value);
        }

        if (name === "sessionCourseId" && value) {
            const sc = sessionCourses.find(item => item.id === value);
            if (sc) {
                const courseId = typeof sc.courseId === 'object' ? (sc.courseId as any).id || (sc.courseId as any)._id : sc.courseId;
                const assignment = batchAssignments.find(a =>
                    a.courseId === courseId &&
                    a.semester === sc.semester &&
                    a.batchId === selectedBatchId
                );

                if (assignment?.instructorId) {
                    setValue("teacherId", assignment.instructorId);
                }
            }
        }
    };

    const formattedInitialData = useMemo(() => {
        if (!initialData) return undefined;

        return {
            ...initialData,
            batchId: (initialData.batchId && typeof initialData.batchId === 'object') ? (initialData.batchId as any).id || (initialData.batchId as any)._id : initialData.batchId,
            sessionCourseId: (initialData.sessionCourseId && typeof initialData.sessionCourseId === 'object') ? (initialData.sessionCourseId as any).id || (initialData.sessionCourseId as any)._id : initialData.sessionCourseId,
            teacherId: (initialData.teacherId && typeof initialData.teacherId === 'object') ? (initialData.teacherId as any).id || (initialData.teacherId as any)._id : initialData.teacherId,
            classroomId: (initialData.classroomId && typeof initialData.classroomId === 'object') ? (initialData.classroomId as any).id || (initialData.classroomId as any)._id : initialData.classroomId,
            daysOfWeek: initialData.daysOfWeek || [],
            semester: String((initialData as any).semester || ""),
            startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
            endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
            classType: initialData.classType || "Lecture",
            isRecurring: String(initialData.isRecurring !== false),
            isActive: String(initialData.isActive !== false)
        };
    }, [initialData]);

    const formFields = useMemo(() => [
        {
            name: "batchId",
            label: "Batch",
            type: "searchable-select" as const,
            placeholder: "Select batch",
            options: batches.map((b) => ({ label: b.name, value: b.id, description: `Sem ${b.currentSemester}` })),
            validation: { required: "Batch is required" },
        },
        {
            name: "sessionCourseId",
            label: "Course Assignment",
            type: "searchable-select" as const,
            placeholder: selectedBatchId ? "Select course" : "Select batch first",
            options: (() => {
                const filtered = sessionCourses.filter(sc => {
                    if (!selectedBatchId) return true;
                    const batch = batches.find(b => b.id === selectedBatchId);
                    if (!batch) return true;

                    const batchDeptId = typeof batch.departmentId === 'object' ? (batch.departmentId as any).id || (batch.departmentId as any)._id : batch.departmentId;
                    const scDeptId = typeof sc.departmentId === 'object' ? (sc.departmentId as any).id || (sc.departmentId as any)._id : sc.departmentId;

                    return sc.semester === batch.currentSemester && scDeptId === batchDeptId;
                });

                const seenCourseIds = new Set();
                return filtered
                    .filter(sc => {
                        const courseId = typeof sc.courseId === 'object' ? (sc.courseId as any).id || (sc.courseId as any)._id : sc.courseId;
                        if (seenCourseIds.has(courseId)) return false;
                        seenCourseIds.add(courseId);
                        return true;
                    })
                    .map((sc: any) => ({
                        label: `${sc.courseId?.name || "Unknown"}`,
                        value: sc.id,
                        description: `${sc.sessionId?.name || "N/A"} - Sem ${sc.semester}`
                    }));
            })(),
            validation: { required: "Course assignment is required" },
        },
        {
            name: "teacherId",
            label: "Teacher",
            type: "searchable-select" as const,
            placeholder: "Select teacher",
            options: teachers.map((t: any) => ({
                label: t.fullName || t.name,
                value: t.id || t._id,
                description: t.email
            })),
            validation: { required: "Teacher is required" },
        },
        {
            name: "classroomId",
            label: "Classroom",
            type: "searchable-select" as const,
            placeholder: "Select classroom",
            options: classrooms.map((c) => ({
                label: c.roomNumber,
                value: c.id,
                description: `${c.buildingName} - Floor ${c.floor || 'N/A'}`
            })),
            validation: { required: "Classroom is required" },
        },
        {
            name: "daysOfWeek",
            label: "Days of Week",
            type: "multi-select" as const,
            placeholder: "Select days",
            options: [
                { label: "Saturday", value: "Saturday" },
                { label: "Sunday", value: "Sunday" },
                { label: "Monday", value: "Monday" },
                { label: "Tuesday", value: "Tuesday" },
                { label: "Wednesday", value: "Wednesday" },
                { label: "Thursday", value: "Thursday" },
                { label: "Friday", value: "Friday" },
            ],
            validation: { required: "At least one day is required" },
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
        },
        {
            name: "startDate",
            label: "Start Date",
            type: "date" as const,
            validation: { required: "Start date is required" },
        },
        {
            name: "endDate",
            label: "End Date (Optional)",
            type: "date" as const,
        },
        {
            name: "classType",
            label: "Class Type",
            type: "select" as const,
            options: [
                { label: "Lecture", value: "Lecture" },
                { label: "Tutorial", value: "Tutorial" },
                { label: "Lab", value: "Lab" },
                { label: "Seminar", value: "Seminar" },
                { label: "Workshop", value: "Workshop" },
                { label: "Other", value: "Other" },
            ],
            validation: { required: "Class type is required" },
        },
        {
            name: "isActive",
            label: "Status",
            type: "select" as const,
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
            ],
            validation: { required: "Status is required" },
        },
        {
            name: "isRecurring",
            label: "Recurring",
            type: "select" as const,
            options: [
                { label: "Yes", value: "true" },
                { label: "No", value: "false" },
            ],
            validation: { required: "Recurring status is required" },
        }
    ], [batches, sessionCourses, classrooms, teachers, selectedBatchId]);

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
            onFieldChange={handleFieldChange}
        />
    );
}
