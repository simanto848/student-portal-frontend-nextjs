"use client";

import { useMemo } from "react";
import {
    GenericFormModal,
    FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import {
    Batch,
    Program,
    Department,
    Session,
} from "@/services/academic.service";
import { Teacher } from "@/services/user/teacher.service";

interface BatchFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    selectedBatch: Batch | null;
    isSubmitting: boolean;
    programs: Program[];
    departments: Department[];
    sessions: Session[];
    teachers: Teacher[];
}

const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.id) return item.id;
    return "";
};

export function BatchFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedBatch,
    isSubmitting,
    programs,
    departments,
    sessions,
    teachers,
}: BatchFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "shift",
                label: "Shift",
                type: "select",
                required: true,
                options: [
                    { label: "Day", value: "day" },
                    { label: "Evening", value: "evening" },
                ],
            },
            {
                name: "name",
                label: "Batch (numbers only)",
                type: "text",
                required: true,
                placeholder: "e.g. 2024",
            },
            {
                name: "year",
                label: "Year",
                type: "number",
                required: true,
                placeholder: "e.g. 2024",
            },
            {
                name: "programId",
                label: "Program",
                type: "searchable-select",
                required: true,
                placeholder: "Select a program",
                options: programs
                    .filter((p) => p.status)
                    .map((p) => ({ label: p.name, value: p.id })),
            },
            {
                name: "departmentId",
                label: "Department",
                type: "searchable-select",
                required: true,
                placeholder: "Select a department",
                options: departments
                    .filter((d) => d.status)
                    .map((d) => ({ label: d.name, value: d.id })),
            },
            {
                name: "sessionId",
                label: "Session",
                type: "searchable-select",
                required: true,
                placeholder: "Select a session",
                options: sessions
                    .filter((s) => s.status)
                    .map((s) => ({ label: s.name, value: s.id })),
            },
            {
                name: "counselorId",
                label: "Counselor",
                type: "searchable-select",
                required: false,
                placeholder: "Select a counselor",
                options: teachers.map((t) => ({ label: t.fullName, value: t.id })),
            },
            {
                name: "currentSemester",
                label: "Current Semester",
                type: "number",
                required: true,
                placeholder: "e.g. 1",
            },
            {
                name: "maxStudents",
                label: "Max Students",
                type: "number",
                required: true,
                placeholder: "e.g. 60",
            },
            {
                name: "startDate",
                label: "Start Date",
                type: "date",
                required: false,
            },
            {
                name: "endDate",
                label: "End Date",
                type: "date",
                required: false,
            },
            {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                ],
            },
        ],
        [programs, departments, sessions, teachers]
    );

    const initialData = selectedBatch
        ? {
            name: selectedBatch.name,
            shift: selectedBatch.shift || "day",
            year: selectedBatch.year.toString(),
            programId: getId(selectedBatch.programId),
            departmentId: getId(selectedBatch.departmentId),
            sessionId: getId(selectedBatch.sessionId),
            counselorId: getId(selectedBatch.counselor),
            currentSemester: selectedBatch.currentSemester.toString(),
            maxStudents: selectedBatch.maxStudents.toString(),
            startDate: selectedBatch.startDate
                ? new Date(selectedBatch.startDate).toISOString().split("T")[0]
                : "",
            endDate: selectedBatch.endDate
                ? new Date(selectedBatch.endDate).toISOString().split("T")[0]
                : "",
            status: selectedBatch.status.toString(),
        }
        : {
            status: "true",
            currentSemester: "1",
            shift: "day",
        };

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedBatch ? "Edit Batch" : "Add Batch"}
            description={
                selectedBatch ? "Update batch information" : "Create a new batch"
            }
            fields={formFields}
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
}
