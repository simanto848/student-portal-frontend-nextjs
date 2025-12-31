"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    Classroom,
} from "@/services/academic.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { Building2 } from "lucide-react";
import { ClassroomFormModal } from "./ClassroomFormModal";
import { ClassroomDeleteModal } from "./ClassroomDeleteModal";
import {
    useClassrooms,
    useDepartments,
} from "@/hooks/queries/useAcademicQueries";
import {
    createClassroomAction,
    updateClassroomAction,
    deleteClassroomAction,
} from "../actions";

interface ClassroomWithDetails extends Classroom {
    departmentName: string;
}

export function ClassroomManagementClient() {
    const router = useRouter();
    const { data: classroomsData = [], isLoading, refetch } = useClassrooms();
    const { data: departmentsData = [] } = useDepartments();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
        null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<ClassroomWithDetails>[] = useMemo(() => [
        {
            header: "Room Number",
            accessorKey: "roomNumber",
        },
        {
            header: "Building",
            accessorKey: "buildingName",
        },
        {
            header: "Type",
            accessorKey: "roomType",
        },
        {
            header: "Capacity",
            accessorKey: "capacity",
        },
        {
            header: "Floor",
            accessorKey: "floor",
            cell: (item) => item.floor?.toString() || "N/A",
        },
        {
            header: "Department",
            accessorKey: "departmentName",
        },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (item) => (
                <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${item.isActive
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-slate-50 text-slate-600 ring-slate-200"
                        }`}
                >
                    {item.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
    ], []);

    const handleCreate = () => {
        setSelectedClassroom(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedClassroom) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteClassroomAction(selectedClassroom.id, null, formData);
            if (result.success) {
                notifySuccess("Classroom deleted successfully");
                setIsDeleteModalOpen(false);
                refetch();
            } else {
                notifyError(result.message || "Failed to delete classroom");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete classroom");
        } finally {
            setIsDeleting(false);
            setSelectedClassroom(null);
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

            const result = selectedClassroom
                ? await updateClassroomAction(selectedClassroom.id, null, formData)
                : await createClassroomAction(null, formData);

            if (result.success) {
                notifySuccess(`Classroom ${selectedClassroom ? "updated" : "created"} successfully`);
                setIsFormModalOpen(false);
                setSelectedClassroom(null);
                refetch();
            } else {
                notifyError(result.message || "Failed to save classroom");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save classroom");
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableData: ClassroomWithDetails[] = useMemo(() =>
        classroomsData.map((c) => ({
            ...c,
            departmentName:
                typeof c.departmentId === "object" && c.departmentId
                    ? (c.departmentId as { name: string }).name
                    : "N/A",
        })), [classroomsData]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Classroom Management"
                subtitle="Manage classrooms and facilities"
                actionLabel="Add Classroom"
                onAction={handleCreate}
                icon={Building2}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <DataTable
                    data={tableData}
                    columns={columns}
                    searchKey="roomNumber"
                    searchPlaceholder="Search by room number..."
                    onView={(item) =>
                        router.push(`/dashboard/admin/academic/classroom/${item.id}`)
                    }
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <ClassroomDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                selectedClassroom={selectedClassroom}
                isDeleting={isDeleting}
            />

            <ClassroomFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                selectedClassroom={selectedClassroom}
                departments={departmentsData}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
