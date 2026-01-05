"use client";

import { useMemo } from "react";
import {
    GenericFormModal,
    FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import { assessmentService, Assessment, AssessmentType } from "@/services/enrollment/assessment.service";
import { getId, Batch } from "@/services/academic";

interface AssessmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, string>) => void;
    selectedAssessment: Assessment | null;
    isSubmitting: boolean;
    courses: any[];
    batches: Batch[];
    types: AssessmentType[];
}

export function AssessmentFormModal({
    isOpen,
    onClose,
    onSubmit,
    selectedAssessment,
    isSubmitting,
    courses,
    batches,
    types,
}: AssessmentFormModalProps) {
    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "title",
                label: "Title",
                type: "text",
                required: true,
                placeholder: "e.g. Midterm Exam",
            },
            {
                name: "description",
                label: "Description",
                type: "textarea",
                required: false,
                placeholder: "Enter assessment description",
            },
            {
                name: "courseId",
                label: "Course",
                type: "searchable-select",
                required: true,
                placeholder: "Select a course",
                options: courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id })),
            },
            {
                name: "batchId",
                label: "Batch",
                type: "searchable-select",
                required: true,
                placeholder: "Select a batch",
                options: batches.map((b) => ({ label: b.name, value: b.id })),
            },
            {
                name: "typeId",
                label: "Assessment Type",
                type: "searchable-select",
                required: true,
                placeholder: "Select type",
                options: types.filter((t) => t.isActive).map((t) => ({ label: t.name, value: t.id })),
            },
            {
                name: "totalMarks",
                label: "Total Marks",
                type: "number",
                required: true,
                placeholder: "e.g. 100",
            },
            {
                name: "passingMarks",
                label: "Passing Marks",
                type: "number",
                required: true,
                placeholder: "e.g. 40",
            },
            {
                name: "weightPercentage",
                label: "Weight Percentage (%)",
                type: "number",
                required: true,
                placeholder: "e.g. 20",
            },
            {
                name: "dueDate",
                label: "Due Date",
                type: "date",
                required: false,
            },
            {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                    { label: "Draft", value: "draft" },
                    { label: "Published", value: "published" },
                    { label: "Closed", value: "closed" },
                    { label: "Graded", value: "graded" },
                ],
            },
        ],
        [courses, batches, types]
    );

    const initialData = selectedAssessment
        ? {
            title: selectedAssessment.title,
            description: selectedAssessment.description || "",
            courseId: getId((selectedAssessment as any).courseId),
            batchId: getId((selectedAssessment as any).batchId),
            typeId: getId(selectedAssessment.typeId),
            totalMarks: selectedAssessment.totalMarks.toString(),
            passingMarks: selectedAssessment.passingMarks.toString(),
            weightPercentage: selectedAssessment.weightPercentage.toString(),
            dueDate: selectedAssessment.dueDate
                ? new Date(selectedAssessment.dueDate).toISOString().split("T")[0]
                : "",
            status: selectedAssessment.status,
        }
        : {
            status: "draft",
            weightPercentage: "10",
        };

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedAssessment ? "Edit Assessment" : "Add Assessment"}
            description={
                selectedAssessment 
                    ? "Update assessment information" 
                    : "Create a new assessment"
            }
            fields={formFields}
            initialData={initialData}
            isSubmitting={isSubmitting}
        />
    );
}
