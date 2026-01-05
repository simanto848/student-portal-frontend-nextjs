"use client";

import { useMemo } from "react";
import {
    GenericFormModal,
    FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import { Program, Department } from "@/services/academic.service";

interface ProgramFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    selectedProgram: Program | null;
    isSubmitting: boolean;
    departments: Department[];
}

const getDepartmentId = (prog: Program): string => {
    if (typeof prog.departmentId === "string") return prog.departmentId;
    if (typeof prog.departmentId === "object" && prog.departmentId?.id)
        return prog.departmentId.id;
    return "";
};

export function ProgramFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedProgram,
    isSubmitting,
    departments,
}: ProgramFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "name",
                label: "Program Name",
                type: "text",
                required: true,
                placeholder: "e.g. Bachelor of Science in Computer Science",
            },
            {
                name: "shortName",
                label: "Short Name",
                type: "text",
                required: true,
                placeholder: "e.g. BSC-CSE",
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
                name: "duration",
                label: "Duration (Years)",
                type: "number",
                required: true,
                placeholder: "e.g. 4",
            },
            {
                name: "totalCredits",
                label: "Total Credits",
                type: "number",
                required: true,
                placeholder: "e.g. 160",
            },
            {
                name: "description",
                label: "Description",
                type: "textarea",
                placeholder: "Brief description of the program...",
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

    const initialData = selectedProgram
        ? {
            name: selectedProgram.name,
            shortName: selectedProgram.shortName,
            departmentId: getDepartmentId(selectedProgram),
            duration: String(selectedProgram.duration),
            totalCredits: String(selectedProgram.totalCredits),
            description: selectedProgram.description || "",
            status: selectedProgram.status ? "true" : "false",
        }
        : { status: "true", duration: "4", totalCredits: "160" };

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedProgram ? "Edit Program" : "Add New Program"}
            description={
                selectedProgram
                    ? "Update program information"
                    : "Create a new academic program"
            }
            fields={formFields}
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
}
