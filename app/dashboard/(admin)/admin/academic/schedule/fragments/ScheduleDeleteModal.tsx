"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface ScheduleDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    scheduleTitle?: string;
    isDeleting: boolean;
}

export function ScheduleDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    scheduleTitle,
    isDeleting,
}: ScheduleDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Schedule Entry"
            description={`Are you sure you want to delete the schedule for ${scheduleTitle || "this class"}? This action cannot be undone.`}
            isDeleting={isDeleting}
        />
    );
}
