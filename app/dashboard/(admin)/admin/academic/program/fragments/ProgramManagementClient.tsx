"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    academicService,
    Department,
    Program,
    AcademicApiError,
} from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { notifySuccess, notifyError } from "@/components/toast";
import { GraduationCap } from "lucide-react";
import { ProgramDeleteModal } from "./ProgramDeleteModal";
import { ProgramFormModal } from "./ProgramFormModal";
import {
    createProgramAction,
    updateProgramAction,
    deleteProgramAction,
} from "../actions";

const getDepartmentName = (prog: Program): string => {
    if (typeof prog.departmentId === "object" && prog.departmentId?.name)
        return prog.departmentId.name;
    return "N/A";
};

export default function ProgramManagementClient() {
    const router = useRouter();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<Program>[] = [
        { header: "Program Name", accessorKey: "name" },
        { header: "Short Name", accessorKey: "shortName" },
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (item) => getDepartmentName(item),
        },
        {
            header: "Duration",
            accessorKey: "duration",
            cell: (item) => `${item.duration} Year${item.duration > 1 ? "s" : ""}`,
        },
        {
            header: "Credits",
            accessorKey: "totalCredits",
            cell: (item) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                    {item.totalCredits}
                </span>
            ),
        },
        {
            header: "Batches",
            accessorKey: "batchesCount",
            cell: (item) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                    {item.batchesCount || 0}
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
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [programsData, deptsData] = await Promise.all([
                academicService.getAllPrograms(),
                academicService.getAllDepartments(),
            ]);
            setPrograms(Array.isArray(programsData) ? programsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
        } catch (error) {
            const message =
                error instanceof AcademicApiError
                    ? error.message
                    : "Failed to load data";
            notifyError(message);
            setPrograms([]);
            setDepartments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProgram(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (prog: Program) => {
        setSelectedProgram(prog);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (prog: Program) => {
        setSelectedProgram(prog);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedProgram) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteProgramAction(selectedProgram.id, null, formData);
            if (result.success) {
                notifySuccess("Program deleted successfully");
                fetchData();
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Failed to delete program");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete program");
        } finally {
            setIsDeleting(false);
            setSelectedProgram(null);
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

            const result = selectedProgram
                ? await updateProgramAction(selectedProgram.id, null, formData)
                : await createProgramAction(null, formData);

            if (result.success) {
                notifySuccess(`Program ${selectedProgram ? "updated" : "created"} successfully`);
                fetchData();
                setIsFormModalOpen(false);
            } else {
                notifyError(result.message || "Failed to save program");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save program");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Program Management"
                    subtitle="Manage academic programs and degrees"
                    actionLabel="Add New Program"
                    onAction={handleCreate}
                    icon={GraduationCap}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <DataTable
                        data={programs}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search program by name..."
                        onView={(item) =>
                            router.push(`/dashboard/admin/academic/program/${item.id}`)
                        }
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <ProgramDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    programName={selectedProgram?.name || ""}
                />

                <ProgramFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    selectedProgram={selectedProgram}
                    isSubmitting={isSubmitting}
                    departments={departments}
                />
            </div>
        </DashboardLayout>
    );
}
