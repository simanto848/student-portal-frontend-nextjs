"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { CourseSyllabus } from "@/services/academic.service";

interface SyllabusDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    selectedSyllabus: CourseSyllabus | null;
    isDeleting: boolean;
}

export function SyllabusDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    selectedSyllabus,
    isDeleting,
}: SyllabusDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Syllabus"
            description={`Are you sure you want to delete the syllabus version "${selectedSyllabus?.version}"? This action cannot be undone.`}
            isDeleting={isDeleting}
        />
    );
}
