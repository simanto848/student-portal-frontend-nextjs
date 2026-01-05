"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface SessionDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    sessionName: string;
}

export function SessionDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    sessionName,
}: SessionDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Session"
            description={`Are you sure you want to delete "${sessionName}"? This action cannot be undone.`}
            isDeleting={isDeleting}
        />
    );
}
