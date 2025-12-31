"use client";

import { useMemo } from "react";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { Course, CoursePrerequisite } from "@/services/academic.service";

const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.id) return item.id;
    return "";
};

interface PrerequisiteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => Promise<void>;
    selectedPrerequisite: CoursePrerequisite | null;
    courses: Course[];
    isSubmitting: boolean;
}

export function PrerequisiteFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedPrerequisite,
    courses,
    isSubmitting,
}: PrerequisiteFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "courseId",
                label: "Course",
                type: "searchable-select",
                required: true,
                placeholder: "Select a course",
                options: Array.isArray(courses)
                    ? courses
                        .filter((c) => c.status)
                        .map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))
                    : [],
            },
            {
                name: "prerequisiteId",
                label: "Prerequisite Course",
                type: "searchable-select",
                required: true,
                placeholder: "Select a prerequisite course",
                options: Array.isArray(courses)
                    ? courses
                        .filter((c) => c.status)
                        .map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))
                    : [],
            },
        ],
        [courses]
    );

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedPrerequisite ? "Edit Prerequisite" : "Add Prerequisite"}
            description={
                selectedPrerequisite
                    ? "Update prerequisite information"
                    : "Add a new course prerequisite"
            }
            fields={formFields}
            initialData={
                selectedPrerequisite
                    ? {
                        courseId: getId(selectedPrerequisite.courseId),
                        prerequisiteId: getId(selectedPrerequisite.prerequisiteId),
                    }
                    : {}
            }
            isSubmitting={isSubmitting}
        />
    );
}
