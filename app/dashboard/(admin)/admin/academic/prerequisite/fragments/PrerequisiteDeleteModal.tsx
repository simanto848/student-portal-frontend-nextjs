"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { CoursePrerequisite } from "@/services/academic.service";

interface PrerequisiteDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    selectedPrerequisite: CoursePrerequisite | null;
    isDeleting: boolean;
}

export function PrerequisiteDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    selectedPrerequisite,
    isDeleting,
}: PrerequisiteDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Prerequisite"
            description="Are you sure you want to delete this prerequisite? This action cannot be undone."
            isDeleting={isDeleting}
        />
    );
}
