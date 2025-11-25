"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, ExamCommittee, Department, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users2 } from "lucide-react";

// Helper to get name from object or string
const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.name) return item.name;
    return "N/A";
};

// Helper to get ID from object or string
const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.id) return item.id;
    return "";
};

export default function ExamCommitteeManagementPage() {
    const [committees, setCommittees] = useState<ExamCommittee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCommittee, setSelectedCommittee] = useState<ExamCommittee | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<ExamCommittee>[] = [
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (item) => getName(item.departmentId)
        },
        {
            header: "Teacher",
            accessorKey: "teacherId",
            cell: (item) => {
                const teacher = item.teacher as any;
                return teacher?.fullName || "N/A";
            }
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge
                    variant={item.status === "ACTIVE" ? "default" : "destructive"}
                    className={item.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                >
                    {item.status}
                </Badge>
            ),
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "departmentId",
            label: "Department",
            type: "select",
            required: true,
            placeholder: "Select a department",
            options: Array.isArray(departments)
                ? departments
                    .filter(d => d.status)
                    .map(d => ({ label: `${d.name} (${d.shortName})`, value: d.id }))
                : []
        },
        {
            name: "teacherId",
            label: "Teacher ID",
            type: "text",
            required: true,
            placeholder: "Enter teacher ID"
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" }
            ]
        },
    ], [departments]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [committeesData, deptsData] = await Promise.all([
                academicService.getAllExamCommittees(),
                academicService.getAllDepartments()
            ]);
            setCommittees(Array.isArray(committeesData) ? committeesData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load data";
            toast.error(message);
            setCommittees([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedCommittee(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (committee: ExamCommittee) => {
        setSelectedCommittee(committee);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (committee: ExamCommittee) => {
        setSelectedCommittee(committee);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCommittee) return;
        setIsDeleting(true);
        try {
            await academicService.deleteExamCommittee(selectedCommittee.id);
            toast.success("Exam Committee deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to delete exam committee";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedCommittee(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.departmentId || !data.teacherId) {
                toast.error("Department and Teacher ID are required");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                departmentId: data.departmentId,
                teacherId: data.teacherId.trim(),
                status: data.status as any,
            };

            if (selectedCommittee) {
                await academicService.updateExamCommittee(selectedCommittee.id, submitData);
                toast.success("Exam Committee updated successfully");
            } else {
                await academicService.createExamCommittee(submitData);
                toast.success("Exam Committee created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save exam committee";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Exam Committee Management"
                    subtitle="Manage department exam committees"
                    actionLabel="Add New Committee"
                    onAction={handleCreate}
                    icon={Users2}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={committees}
                        columns={columns}
                        searchKey="status"
                        searchPlaceholder="Search by status..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Exam Committee"
                    description="Are you sure you want to delete this exam committee? This action cannot be undone."
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedCommittee ? "Edit Committee" : "Add New Committee"}
                    description={selectedCommittee ? "Update committee information" : "Create a new exam committee"}
                    fields={formFields}
                    initialData={selectedCommittee ? {
                        departmentId: getId(selectedCommittee.departmentId),
                        teacherId: selectedCommittee.teacherId,
                        status: selectedCommittee.status,
                    } : { status: "ACTIVE" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
