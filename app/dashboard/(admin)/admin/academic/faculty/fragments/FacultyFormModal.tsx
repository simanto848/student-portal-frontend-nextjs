"use client";

import { useMemo } from "react";
import {
    GenericFormModal,
    FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import { Faculty } from "@/services/academic/types";
import { Teacher } from "@/services/teacher.service";

interface FacultyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    selectedFaculty: Faculty | null;
    isSubmitting: boolean;
    title: string;
    description: string;
    fields: FormField[];
    initialData: Record<string, any>;
}

export function FacultyFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedFaculty,
    isSubmitting,
    title,
    description,
    fields,
    initialData,
}: FacultyFormModalProps) {
    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={title}
            description={description}
            fields={fields}
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
}
