"use client";

import { useMemo } from "react";
import {
    GenericFormModal,
    FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import {
    CourseSyllabus,
    SessionCourse,
} from "@/services/academic.service";

const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.id) return item.id;
    return "";
};

interface SyllabusFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    selectedSyllabus: CourseSyllabus | null;
    isSubmitting: boolean;
    sessionCourses: SessionCourse[];
}

export function SyllabusFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedSyllabus,
    isSubmitting,
    sessionCourses,
}: SyllabusFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "sessionCourseId",
                label: "Course Allocation (Session)",
                type: "searchable-select",
                required: true,
                placeholder: "Select a course allocation",
                options: sessionCourses.map((sc) => {
                    const courseName =
                        typeof sc.courseId === "object"
                            ? sc.courseId.name
                            : "Unknown Course";
                    const courseCode =
                        typeof sc.courseId === "object" ? sc.courseId.code : "";
                    const sessionName =
                        typeof sc.sessionId === "object" ? sc.sessionId.name : "N/A";
                    return {
                        label: `${courseName} (${courseCode}) - ${sessionName}`,
                        value: sc.id
                    };
                }),
            },
            {
                name: "version",
                label: "Version",
                type: "text",
                required: true,
                placeholder: "e.g. 1.0",
            },
            {
                name: "overview",
                label: "Overview",
                type: "textarea",
                required: false,
                placeholder: "Course overview...",
            },
            {
                name: "objectives",
                label: "Objectives",
                type: "textarea",
                required: false,
                placeholder: "Learning objectives...",
            },
            {
                name: "prerequisites",
                label: "Prerequisites Description",
                type: "textarea",
                required: false,
                placeholder: "Describe prerequisites...",
            },
            {
                name: "gradingPolicy",
                label: "Grading Policy",
                type: "textarea",
                required: false,
                placeholder: "Grading breakdown...",
            },
            {
                name: "policies",
                label: "Policies",
                type: "textarea",
                required: false,
                placeholder: "Course policies...",
            },
            {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                    { label: "Draft", value: "Draft" },
                    { label: "Pending Approval", value: "Pending Approval" },
                    { label: "Approved", value: "Approved" },
                    { label: "Published", value: "Published" },
                    { label: "Archived", value: "Archived" },
                ],
            },
        ],
        [sessionCourses]
    );

    const initialData = selectedSyllabus
        ? {
            sessionCourseId: getId(selectedSyllabus.sessionCourseId),
            version: selectedSyllabus.version,
            overview: selectedSyllabus.overview || "",
            objectives: selectedSyllabus.objectives || "",
            prerequisites: selectedSyllabus.prerequisites || "",
            gradingPolicy: selectedSyllabus.gradingPolicy || "",
            policies: selectedSyllabus.policies || "",
            status: selectedSyllabus.status,
        }
        : {
            status: "Draft",
            version: "1.0",
        };

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedSyllabus ? "Edit Syllabus" : "Add Syllabus"}
            description={
                selectedSyllabus
                    ? "Update syllabus information and versioning"
                    : "Create a new course syllabus"
            }
            fields={formFields}
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
}
