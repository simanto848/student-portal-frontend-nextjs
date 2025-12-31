"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Classroom } from "@/services/academic.service";

interface ClassroomDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    selectedClassroom: Classroom | null;
    isDeleting: boolean;
}

export function ClassroomDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    selectedClassroom,
    isDeleting,
}: ClassroomDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Classroom"
            description={`Are you sure you want to delete classroom "${selectedClassroom?.roomNumber}" in ${selectedClassroom?.buildingName}? This action cannot be undone.`}
            isDeleting={isDeleting}
        />
    );
}
