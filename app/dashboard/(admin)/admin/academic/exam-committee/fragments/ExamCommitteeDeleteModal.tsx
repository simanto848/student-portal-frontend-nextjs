"use client";

import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { ExamCommittee } from "@/services/academic/types";

interface ExamCommitteeDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    selectedMember: ExamCommittee | null;
    isDeleting: boolean;
}

export function ExamCommitteeDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    selectedMember,
    isDeleting,
}: ExamCommitteeDeleteModalProps) {
    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Remove Committee Member"
            description={`Are you sure you want to remove ${selectedMember?.teacher?.fullName || "this teacher"} from the exam committee? This action cannot be undone.`}
            isDeleting={isDeleting}
        />
    );
}
