"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { notifySuccess, notifyError } from "@/components/toast";
import { Building2 } from "lucide-react";
import {
    useFaculties,
    useCreateFaculty,
    useUpdateFaculty,
    useDeleteFaculty,
    useAssignDean,
} from "@/hooks/queries/useAcademicQueries";
import { Faculty } from "@/services/academic/types";
import { teacherService, Teacher } from "@/services/teacher.service";
import { facultySchema, validateForm } from "@/lib/validations/academic";
import { ApiError } from "@/types/api";
import { FacultyDeleteModal } from "./FacultyDeleteModal";
import { FacultyFormModal } from "./FacultyFormModal";
import { FormField } from "@/components/dashboard/shared/GenericFormModal";
import {
    createFacultyAction,
    updateFacultyAction,
    deleteFacultyAction,
    assignDeanAction,
} from "../actions";

export default function FacultyManagementClient() {
    // React Query hooks
    const { data: faculties = [], isLoading } = useFaculties();
    const createFacultyMutation = useCreateFaculty();
    const updateFacultyMutation = useUpdateFaculty();
    const deleteFacultyMutation = useDeleteFaculty();
    const assignDeanMutation = useAssignDean();

    // Local state for teachers
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // CRUD operations state
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAssignDeanModalOpen, setIsAssignDeanModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const data = await teacherService.getAllTeachers();
                setTeachers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load teachers:", error);
            }
        };
        fetchTeachers();
    }, []);

    const getDeanName = useCallback(
        (deanId?: string) => {
            if (!deanId) return null;
            const teacher = teachers.find((t) => t.id === deanId);
            return teacher ? teacher.fullName : "Unknown Dean";
        },
        [teachers]
    );

    const columns: Column<Faculty>[] = useMemo(
        () => [
            { header: "Faculty Name", accessorKey: "name" },
            { header: "Email", accessorKey: "email" },
            {
                header: "Dean",
                accessorKey: "deanId",
                cell: (item) => {
                    const deanName = getDeanName(item.deanId);
                    return (
                        deanName || (
                            <span className="text-[#344e41]/50 italic">Not Assigned</span>
                        )
                    );
                },
            },
            {
                header: "Departments",
                accessorKey: "departmentsCount",
                cell: (item) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                        {item.departmentsCount || 0}
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
            {
                header: "Actions",
                accessorKey: "id" as any,
                cell: (item) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                (window.location.href = `/dashboard/admin/academic/faculty/${item.id}`)
                            }
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
                        >
                            View
                        </button>
                        <button
                            onClick={() => handleAssignDeanClick(item)}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all active:scale-95 shadow-sm"
                        >
                            Assign Dean
                        </button>
                    </div>
                ),
            },
        ],
        [getDeanName]
    );

    const formFields: FormField[] = useMemo(
        () => [
            {
                name: "name",
                label: "Faculty Name",
                type: "text",
                required: true,
                placeholder: "e.g. School of Engineering",
            },
            {
                name: "email",
                label: "Email",
                type: "email",
                required: true,
                placeholder: "faculty@university.edu",
            },
            {
                name: "phone",
                label: "Phone",
                type: "text",
                placeholder: "+880 1XXX-XXXXXX",
            },
            {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                ],
            },
        ],
        []
    );

    const assignDeanFields: FormField[] = useMemo(
        () => [
            {
                name: "deanId",
                label: "Select Dean",
                type: "searchable-select",
                required: true,
                placeholder: "Search for a teacher...",
                options: teachers.map((t) => ({
                    label: `${t.fullName} (${t.email})`,
                    value: t.id,
                })),
            },
        ],
        [teachers]
    );

    const handleCreate = () => {
        setSelectedFaculty(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        setIsFormModalOpen(true);
    };

    const handleAssignDeanClick = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        setIsAssignDeanModalOpen(true);
    };

    const handleDeleteClick = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedFaculty) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteFacultyAction(selectedFaculty.id, null, formData);
            if (result.success) {
                notifySuccess("Faculty deleted successfully");
                setIsDeleteModalOpen(false);
                setSelectedFaculty(null);
                // Optionally manually trigger re-fetch if not using revalidatePath correctly
                // router.refresh();
            } else {
                notifyError(result.message || "Failed to delete faculty");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete faculty");
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

            const result = selectedFaculty
                ? await updateFacultyAction(selectedFaculty.id, null, formData)
                : await createFacultyAction(null, formData);

            if (result.success) {
                notifySuccess(`Faculty ${selectedFaculty ? "updated" : "created"} successfully`);
                setIsFormModalOpen(false);
                setSelectedFaculty(null);
            } else {
                notifyError(result.message || "Failed to save faculty");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save faculty");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignDeanSubmit = async (data: Record<string, string>) => {
        if (!selectedFaculty) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("deanId", data.deanId);

            const result = await assignDeanAction(selectedFaculty.id, null, formData);
            if (result.success) {
                notifySuccess("Dean assigned successfully");
                setIsAssignDeanModalOpen(false);
                setSelectedFaculty(null);
            } else {
                notifyError(result.message || "Failed to assign dean");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to assign dean");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Faculty Management"
                    subtitle="Manage university faculties and schools"
                    actionLabel="Add New Faculty"
                    onAction={handleCreate}
                    icon={Building2}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <DataTable
                        data={faculties}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search faculty by name..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <FacultyDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    facultyName={selectedFaculty?.name || ""}
                />

                <FacultyFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    selectedFaculty={selectedFaculty}
                    isSubmitting={isSubmitting}
                    title={selectedFaculty ? "Edit Faculty" : "Add New Faculty"}
                    description={selectedFaculty ? "Update faculty information" : "Create a new faculty"}
                    fields={formFields}
                    initialData={
                        selectedFaculty
                            ? {
                                name: selectedFaculty.name,
                                email: selectedFaculty.email,
                                phone: selectedFaculty.phone || "",
                                status: selectedFaculty.status ? "true" : "false",
                            }
                            : { status: "true" }
                    }
                />

                <FacultyFormModal
                    isOpen={isAssignDeanModalOpen}
                    onClose={() => setIsAssignDeanModalOpen(false)}
                    onSubmit={handleAssignDeanSubmit}
                    selectedFaculty={selectedFaculty}
                    isSubmitting={isSubmitting}
                    title="Assign Dean"
                    description={`Assign a dean to ${selectedFaculty?.name}`}
                    fields={assignDeanFields}
                    initialData={{ deanId: selectedFaculty?.deanId || "" }}
                />
            </div>
        </DashboardLayout>
    );
}
