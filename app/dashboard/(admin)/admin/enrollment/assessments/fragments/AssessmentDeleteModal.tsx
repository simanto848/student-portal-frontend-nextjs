"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface AssessmentDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export function AssessmentDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: AssessmentDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Assessment"
            description="Are you sure you want to delete this assessment? This action cannot be undone."
            isDeleting={isDeleting}
        />
    );
}
