"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface ProgramDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    programName: string;
}

export function ProgramDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    programName,
}: ProgramDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Program"
            description={`Are you sure you want to delete "${programName}"? This action cannot be undone. Note: Programs with active batches cannot be deleted.`}
            isDeleting={isDeleting}
        />
    );
}
