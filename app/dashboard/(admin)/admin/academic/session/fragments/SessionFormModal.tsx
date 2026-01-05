"use client";

import { useMemo } from "react";
import {
    GenericFormModal,
    FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import { Session } from "@/services/academic.service";

interface SessionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    selectedSession: Session | null;
    isSubmitting: boolean;
}

export function SessionFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedSession,
    isSubmitting,
}: SessionFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "name",
                label: "Session Name",
                type: "text",
                required: true,
                placeholder: "e.g. Spring 2024",
            },
            {
                name: "year",
                label: "Year",
                type: "number",
                required: true,
                placeholder: "e.g. 2024",
            },
            {
                name: "startDate",
                label: "Start Date",
                type: "date",
                required: true,
            },
            {
                name: "endDate",
                label: "End Date",
                type: "date",
                required: true,
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
        []
    );

    const initialData = selectedSession
        ? {
            name: selectedSession.name,
            year: String(selectedSession.year),
            startDate: selectedSession.startDate.split("T")[0],
            endDate: selectedSession.endDate.split("T")[0],
            status: selectedSession.status ? "true" : "false",
        }
        : { status: "true", year: String(new Date().getFullYear()) };

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedSession ? "Edit Session" : "Add New Session"}
            description={
                selectedSession
                    ? "Update session information"
                    : "Create a new academic session"
            }
            fields={formFields}
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
}
