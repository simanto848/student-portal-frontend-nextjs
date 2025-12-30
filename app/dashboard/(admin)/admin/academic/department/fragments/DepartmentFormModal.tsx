"use client";

import { useMemo } from "react";
import {
    GenericFormModal,
    FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import { Department, Faculty } from "@/services/academic/types";
import { Teacher } from "@/services/teacher.service";

interface DepartmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    selectedDepartment: Department | null;
    isSubmitting: boolean;
    faculties: Faculty[];
    teachers: Teacher[];
}

const getFacultyId = (dept: Department): string => {
    if (typeof dept.facultyId === "string") return dept.facultyId;
    if (typeof dept.facultyId === "object" && dept.facultyId?.id) {
        return dept.facultyId.id;
    }
    return "";
};

export function DepartmentFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedDepartment,
    isSubmitting,
    faculties,
    teachers,
}: DepartmentFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "name",
                label: "Department Name",
                type: "text",
                required: true,
                placeholder: "e.g. Computer Science and Engineering",
            },
            {
                name: "shortName",
                label: "Short Name",
                type: "text",
                required: true,
                placeholder: "e.g. CSE",
            },
            {
                name: "email",
                label: "Email",
                type: "email",
                required: true,
                placeholder: "dept@university.edu",
            },
            {
                name: "phone",
                label: "Phone",
                type: "text",
                placeholder: "+880 1XXX-XXXXXX",
            },
            {
                name: "facultyId",
                label: "Faculty",
                type: "searchable-select",
                required: true,
                placeholder: "Select a faculty",
                options: faculties
                    .filter((f) => f.status)
                    .map((f) => ({ label: f.name, value: f.id })),
            },
            {
                name: "departmentHeadId",
                label: "Department Head",
                type: "searchable-select",
                placeholder: "Select a department head",
                options: teachers.map((t) => ({
                    label: `${t.fullName} (${t.designation || "N/A"})`,
                    value: t.id,
                })),
            },
            {
                name: "isActingHead",
                label: "Is Acting Head?",
                type: "select",
                options: [
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                ],
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
        [faculties, teachers]
    );

    const initialData = selectedDepartment
        ? {
            name: selectedDepartment.name,
            shortName: selectedDepartment.shortName,
            email: selectedDepartment.email,
            phone: selectedDepartment.phone || "",
            facultyId: getFacultyId(selectedDepartment),
            departmentHeadId: selectedDepartment.departmentHeadId || "",
            isActingHead: selectedDepartment.isActingHead ? "true" : "false",
            status: selectedDepartment.status ? "true" : "false",
        }
        : { status: "true", isActingHead: "false" };

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedDepartment ? "Edit Department" : "Add New Department"}
            description={
                selectedDepartment
                    ? "Update department information"
                    : "Create a new department"
            }
            fields={formFields}
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
}
