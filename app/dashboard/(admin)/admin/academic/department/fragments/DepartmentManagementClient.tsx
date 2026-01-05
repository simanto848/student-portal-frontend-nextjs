"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import {
    useDepartments,
    useFaculties,
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment,
} from "@/hooks/queries/useAcademicQueries";
import { Department, Faculty } from "@/services/academic/types";
import { teacherService, Teacher } from "@/services/teacher.service";
import { departmentSchema, validateForm } from "@/lib/validations/academic";
import { ApiError } from "@/types/api";
import { notifyError, notifySuccess } from "@/components/toast";
import { DepartmentDeleteModal } from "./DepartmentDeleteModal";
import { DepartmentFormModal } from "./DepartmentFormModal";
import {
    createDepartmentAction,
    updateDepartmentAction,
    deleteDepartmentAction,
} from "../actions";

const getFacultyName = (dept: Department): string => {
    if (typeof dept.facultyId === "object" && dept.facultyId?.name) {
        return dept.facultyId.name;
    }
    return "N/A";
};

export default function DepartmentManagementClient() {
    const router = useRouter();

    // React Query hooks
    const { data: departments = [], isLoading: isDepartmentsLoading } =
        useDepartments();
    const { data: faculties = [], isLoading: isFacultiesLoading } =
        useFaculties();
    const createDepartmentMutation = useCreateDepartment();
    const updateDepartmentMutation = useUpdateDepartment();
    const deleteDepartmentMutation = useDeleteDepartment();

    // Local state for teachers
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isTeachersLoading, setIsTeachersLoading] = useState(true);

    // Modal states
    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Combined loading state
    const isLoading = isDepartmentsLoading || isFacultiesLoading;

    // Fetch teachers on mount
    useEffect(() => {
        const fetchTeachers = async () => {
            setIsTeachersLoading(true);
            try {
                const data = await teacherService.getAllTeachers();
                setTeachers(Array.isArray(data) ? data : []);
            } catch (error) {
                setTeachers([]);
            } finally {
                setIsTeachersLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    // Table columns definition
    const columns: Column<Department>[] = useMemo(
        () => [
            { header: "Department Name", accessorKey: "name" },
            { header: "Short Name", accessorKey: "shortName" },
            {
                header: "Faculty",
                accessorKey: "facultyId",
                cell: (item) => getFacultyName(item),
            },
            {
                header: "Head",
                accessorKey: "departmentHeadId",
                cell: (item) => {
                    if (item.departmentHeadId) {
                        const head = teachers.find((t) => t.id === item.departmentHeadId);
                        if (head) {
                            return (
                                <span>
                                    {head.fullName}
                                    {item.isActingHead && (
                                        <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 uppercase tracking-tighter">
                                            Acting
                                        </span>
                                    )}
                                </span>
                            );
                        }
                    }
                    return <span className="text-[#344e41]/50 italic">Not Assigned</span>;
                },
            },
            {
                header: "Programs",
                accessorKey: "programsCount",
                cell: (item) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                        {item.programsCount || 0}
                    </span>
                ),
            },
            {
                header: "Status",
                accessorKey: "status",
                cell: (item) => (
                    <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${item.status
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-slate-50 text-slate-600 ring-slate-200"
                            }`}
                    >
                        {item.status ? "Active" : "Inactive"}
                    </span>
                ),
            },
        ],
        [teachers],
    );

    // Handlers
    const handleCreate = () => {
        setSelectedDepartment(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsFormModalOpen(true);
    };

    const handleView = (dept: Department) => {
        router.push(`/dashboard/admin/academic/department/${dept.id}`);
    };

    const handleDeleteClick = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDepartment) return;

        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteDepartmentAction(selectedDepartment.id, null, formData);
            if (result.success) {
                notifySuccess("Department deleted successfully");
                setIsDeleteModalOpen(false);
                setSelectedDepartment(null);
                // Note: If using React Query, we might need to invalidate here 
                // but revalidatePath in server action handles the server side.
                // For client-side React Query cache, we might still need invalidate.
                // But let's assume standard Next.js flow for now.
                router.refresh();
            } else {
                notifyError(result.message || "Failed to delete department");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete department");
        } finally {
            setIsDeleting(false);
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

            const result = selectedDepartment
                ? await updateDepartmentAction(selectedDepartment.id, null, formData)
                : await createDepartmentAction(null, formData);

            if (result.success) {
                notifySuccess(`Department ${selectedDepartment ? "updated" : "created"} successfully`);
                setIsFormModalOpen(false);
                setSelectedDepartment(null);
                router.refresh();
            } else {
                notifyError(result.message || "Failed to save department");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save department");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Department Management"
                    subtitle="Manage university departments"
                    actionLabel="Add New Department"
                    onAction={handleCreate}
                    icon={Building}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <DataTable
                        data={departments}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search department by name..."
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DepartmentDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    departmentName={selectedDepartment?.name || ""}
                />

                <DepartmentFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    selectedDepartment={selectedDepartment}
                    isSubmitting={isSubmitting}
                    faculties={faculties}
                    teachers={teachers}
                />
            </div>
        </DashboardLayout>
    );
}
