"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Course } from "@/services/academic.service";

interface CourseDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    selectedCourse: Course | null;
    isDeleting: boolean;
}

export function CourseDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    selectedCourse,
    isDeleting,
}: CourseDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Course"
            description={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone.`}
            isDeleting={isDeleting}
        />
    );
}
