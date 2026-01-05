"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { SessionCourse } from "@/services/academic.service";

interface SessionCourseDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    selectedSessionCourse: SessionCourse | null;
    isDeleting: boolean;
}

export function SessionCourseDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    selectedSessionCourse,
    isDeleting,
}: SessionCourseDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Session Course"
            description="Are you sure you want to delete this session course assignment? This action cannot be undone."
            isDeleting={isDeleting}
        />
    );
}
