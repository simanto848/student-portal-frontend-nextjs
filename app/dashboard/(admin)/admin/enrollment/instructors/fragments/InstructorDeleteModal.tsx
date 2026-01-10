"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface InstructorDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export function InstructorDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: InstructorDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Remove Assignment"
            description="Are you sure you want to remove this instructor assignment? This will unassign the teacher from the selected course batch."
            isDeleting={isDeleting}
        />
    );
}
