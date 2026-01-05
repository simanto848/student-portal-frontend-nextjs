"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";

interface DepartmentDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    departmentName: string;
}

export function DepartmentDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    departmentName,
}: DepartmentDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Department"
            description={`Are you sure you want to delete "${departmentName}"? This action cannot be undone. Note: Departments with active programs cannot be deleted.`}
            isDeleting={isDeleting}
        />
    );
}
