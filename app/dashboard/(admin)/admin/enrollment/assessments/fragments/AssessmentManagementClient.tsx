"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { assessmentService, Assessment, AssessmentType } from "@/services/enrollment/assessment.service";
import { courseService, batchService, Batch } from "@/services/academic";
import { notifySuccess, notifyError } from "@/components/toast";
import { FileText } from "lucide-react";
import { AssessmentDeleteModal } from "./AssessmentDeleteModal";
import { AssessmentFormModal } from "./AssessmentFormModal";
import {
    createAssessmentAction,
    updateAssessmentAction,
    deleteAssessmentAction,
} from "../actions";

const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.name) return item.name;
    if (typeof item === "object" && item.fullName) return item.fullName;
    return "N/A";
};

const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.id) return item.id;
    return "";
};

interface AssessmentWithDetails extends Assessment {
    courseName: string;
    batchName: string;
    typeName: string;
}

export default function AssessmentManagementClient() {
    const router = useRouter();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [types, setTypes] = useState<AssessmentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<AssessmentWithDetails>[] = [
        {
            header: "Title",
            accessorKey: "title",
        },
        {
            header: "Course",
            accessorKey: "courseName",
        },
        {
            header: "Batch",
            accessorKey: "batchName",
        },
        {
            header: "Type",
            accessorKey: "typeName",
        },
        {
            header: "Total Marks",
            accessorKey: "totalMarks",
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${
                        item.status === "published"
                            ? "bg-green-50 text-green-700 ring-green-200"
                            : item.status === "closed"
                            ? "bg-red-50 text-red-700 ring-red-200"
                            : item.status === "graded"
                            ? "bg-blue-50 text-blue-700 ring-blue-200"
                            : "bg-gray-50 text-gray-600 ring-gray-200"
                    }`}
                >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
            ),
        },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [assessmentsData, coursesData, batchesData, typesData] = await Promise.all([
                assessmentService.list({}),
                courseService.getAllCourses(),
                batchService.getAllBatches(),
                assessmentService.listTypes(),
            ]);
            const assessmentsList = Array.isArray(assessmentsData) 
                ? assessmentsData 
                : (assessmentsData as any).assessments || [];
            setAssessments(assessmentsList);
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setTypes(Array.isArray(typesData) ? typesData : []);
        } catch (error) {
            notifyError("Failed to load data");
            setAssessments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedAssessment(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (assessment: AssessmentWithDetails) => {
        setSelectedAssessment(assessment);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (assessment: AssessmentWithDetails) => {
        setSelectedAssessment(assessment);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAssessment) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteAssessmentAction(selectedAssessment.id, null, formData);
            if (result.success) {
                notifySuccess("Assessment deleted successfully");
                fetchData();
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Failed to delete assessment");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete assessment");
        } finally {
            setIsDeleting(false);
            setSelectedAssessment(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const result = selectedAssessment
                ? await updateAssessmentAction(selectedAssessment.id, null, formData)
                : await createAssessmentAction(null, formData);

            if (result.success) {
                notifySuccess(`Assessment ${selectedAssessment ? "updated" : "created"} successfully`);
                fetchData();
                setIsFormModalOpen(false);
            } else {
                notifyError(result.message || "Failed to save assessment");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save assessment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Assessment Management"
                    subtitle="Manage course assessments, quizzes, and exams"
                    actionLabel="Add Assessment"
                    onAction={handleCreate}
                    icon={FileText}
                    extraActions={
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push("/dashboard/admin/enrollment/assessments/submissions")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Submissions
                            </button>
                            <button
                                onClick={() => router.push("/dashboard/admin/enrollment/assessments/types")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Manage Types
                            </button>
                        </div>
                    }
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <DataTable
                        data={assessments.map((a) => ({
                            ...a,
                            courseName: getName((a as any).course),
                            batchName: getName((a as any).batch),
                            typeName: getName(a.type),
                        }))}
                        columns={columns}
                        searchKey="title"
                        searchPlaceholder="Search by title..."
                        onView={(item) =>
                            router.push(`/dashboard/admin/enrollment/assessments/${item.id}`)
                        }
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <AssessmentDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                />

                <AssessmentFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    selectedAssessment={selectedAssessment}
                    isSubmitting={isSubmitting}
                    courses={courses}
                    batches={batches}
                    types={types}
                />
            </div>
        </DashboardLayout>
    );
}
