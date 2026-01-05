"use client";

import { useMemo } from "react";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { Course, Department } from "@/services/academic.service";

interface CourseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => Promise<void>;
    selectedCourse: Course | null;
    departments: Department[];
    isSubmitting: boolean;
}

export function CourseFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedCourse,
    departments,
    isSubmitting,
}: CourseFormModalProps) {
    const getDepartmentId = (course: Course): string => {
        if (typeof course.departmentId === "string") return course.departmentId;
        if (typeof course.departmentId === "object" && course.departmentId?.id)
            return course.departmentId.id;
        return "";
    };

    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "name",
                label: "Course Name",
                type: "text",
                required: true,
                placeholder: "e.g. Introduction to Programming",
            },
            {
                name: "code",
                label: "Course Code",
                type: "text",
                required: true,
                placeholder: "e.g. CSE-101",
            },
            {
                name: "credit",
                label: "Credits",
                type: "number",
                required: true,
                placeholder: "e.g. 3.0",
            },
            {
                name: "courseType",
                label: "Course Type",
                type: "select",
                required: true,
                options: [
                    { label: "Theory", value: "theory" },
                    { label: "Lab", value: "lab" },
                    { label: "Project", value: "project" },
                ],
            },
            {
                name: "departmentId",
                label: "Department",
                type: "select",
                required: true,
                placeholder: "Select a department",
                options: Array.isArray(departments)
                    ? departments
                        .filter((d) => d.status)
                        .map((d) => ({
                            label: `${d.name} (${d.shortName})`,
                            value: d.id,
                        }))
                    : [],
            },
            {
                name: "isElective",
                label: "Is Elective?",
                type: "select",
                options: [
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                ],
            },
            {
                name: "description",
                label: "Description",
                type: "textarea",
                placeholder: "Brief description of the course...",
            },
            {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                ],
            },
        ],
        [departments]
    );

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedCourse ? "Edit Course" : "Add New Course"}
            description={
                selectedCourse
                    ? "Update course information"
                    : "Create a new academic course"
            }
            fields={formFields}
            initialData={
                selectedCourse
                    ? {
                        name: selectedCourse.name,
                        code: selectedCourse.code,
                        credit: String(selectedCourse.credit),
                        courseType: selectedCourse.courseType,
                        departmentId: getDepartmentId(selectedCourse),
                        isElective: selectedCourse.isElective ? "true" : "false",
                        description: selectedCourse.description || "",
                        status: selectedCourse.status ? "true" : "false",
                    }
                    : { status: "true", courseType: "theory", isElective: "false" }
            }
            isSubmitting={isSubmitting}
        />
    );
}
