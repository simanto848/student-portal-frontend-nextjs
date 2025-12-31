"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    CoursePrerequisite,
    Course,
} from "@/services/academic.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { GitMerge } from "lucide-react";
import { PrerequisiteFormModal } from "./PrerequisiteFormModal";
import { PrerequisiteDeleteModal } from "./PrerequisiteDeleteModal";
import {
    usePrerequisites,
    useCourses,
} from "@/hooks/queries/useAcademicQueries";
import {
    createPrerequisiteAction,
    updatePrerequisiteAction,
    deletePrerequisiteAction,
} from "../actions";

interface CoursePrerequisiteWithNames extends CoursePrerequisite {
    courseName: string;
    prerequisiteName: string;
}

export function PrerequisiteManagementClient() {
    const router = useRouter();
    const { data: prerequisitesData = [], isLoading, refetch } = usePrerequisites();
    const { data: coursesData = [] } = useCourses();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedPrerequisite, setSelectedPrerequisite] =
        useState<CoursePrerequisite | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<CoursePrerequisiteWithNames>[] = useMemo(() => [
        {
            header: "Course",
            accessorKey: "courseName",
            cell: (item) => (
                <span className="font-bold text-slate-900">{item.courseName}</span>
            )
        },
        {
            header: "Prerequisite Course",
            accessorKey: "prerequisiteName",
            cell: (item) => (
                <span className="font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg ring-1 ring-inset ring-amber-200">
                    {item.prerequisiteName}
                </span>
            )
        },
    ], []);

    const handleCreate = () => {
        setSelectedPrerequisite(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (prereq: CoursePrerequisite) => {
        setSelectedPrerequisite(prereq);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (prereq: CoursePrerequisite) => {
        setSelectedPrerequisite(prereq);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPrerequisite) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deletePrerequisiteAction(selectedPrerequisite.id, null, formData);
            if (result.success) {
                notifySuccess("Prerequisite deleted successfully");
                setIsDeleteModalOpen(false);
                refetch();
            } else {
                notifyError(result.message || "Failed to delete prerequisite");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete prerequisite");
        } finally {
            setIsDeleting(false);
            setSelectedPrerequisite(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.courseId || !data.prerequisiteId) {
                notifyError("Course and Prerequisite Course are required");
                return;
            }

            if (data.courseId === data.prerequisiteId) {
                notifyError("Course cannot be its own prerequisite");
                return;
            }

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const result = selectedPrerequisite
                ? await updatePrerequisiteAction(
                    selectedPrerequisite.id,
                    null,
                    formData,
                )
                : await createPrerequisiteAction(null, formData);

            if (result.success) {
                notifySuccess(`Prerequisite ${selectedPrerequisite ? "updated" : "created"} successfully`);
                setIsFormModalOpen(false);
                setSelectedPrerequisite(null);
                refetch();
            } else {
                notifyError(result.message || "Failed to save prerequisite");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save prerequisite");
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableData: CoursePrerequisiteWithNames[] = useMemo(() =>
        prerequisitesData.map((p) => ({
            ...p,
            courseName:
                typeof p.courseId === "object" && p.courseId
                    ? (p.courseId as { name: string }).name
                    : "N/A",
            prerequisiteName:
                typeof p.prerequisiteId === "object" && p.prerequisiteId
                    ? (p.prerequisiteId as { name: string }).name
                    : "N/A",
        })), [prerequisitesData]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Course Prerequisite Management"
                subtitle="Manage course dependencies"
                actionLabel="Add Prerequisite"
                onAction={handleCreate}
                icon={GitMerge}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <DataTable
                    data={tableData}
                    columns={columns}
                    searchKey="courseName"
                    searchPlaceholder="Search by course name..."
                    onView={(item) =>
                        router.push(`/dashboard/admin/academic/prerequisite/${item.id}`)
                    }
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <PrerequisiteDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                selectedPrerequisite={selectedPrerequisite}
                isDeleting={isDeleting}
            />

            <PrerequisiteFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                selectedPrerequisite={selectedPrerequisite}
                courses={coursesData}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
