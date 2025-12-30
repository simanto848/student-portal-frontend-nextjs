"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface BatchDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export function BatchDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: BatchDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Batch"
            description="Are you sure you want to delete this batch? This action cannot be undone."
            isDeleting={isDeleting}
        />
    );
}
