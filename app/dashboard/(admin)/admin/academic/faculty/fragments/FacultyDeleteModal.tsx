"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface FacultyDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    facultyName: string;
}

export function FacultyDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    facultyName,
}: FacultyDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Faculty"
            description={`Are you sure you want to delete "${facultyName}"? This action cannot be undone. Note: Faculties with active departments cannot be deleted.`}
            isDeleting={isDeleting}
        />
    );
}
