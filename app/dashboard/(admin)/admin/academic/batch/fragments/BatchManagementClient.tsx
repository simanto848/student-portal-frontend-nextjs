"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    academicService,
    Batch,
    Program,
    Department,
    Session,
    AcademicApiError,
} from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { Users } from "lucide-react";
import { BatchDeleteModal } from "./BatchDeleteModal";
import { BatchFormModal } from "./BatchFormModal";
import {
    createBatchAction,
    updateBatchAction,
    deleteBatchAction,
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

interface BatchWithDetails extends Batch {
    programName: string;
    departmentName: string;
    sessionName: string;
    counselorName: string;
    displayName: string;
}

const getBatchDisplayName = (b: Batch): string => {
    if (!b) return "N/A";
    if (b.code) return b.code;
    if (b.shift) return `${b.shift === "evening" ? "E" : "D"}-${b.name}`;
    return b.name || "N/A";
};

export default function BatchManagementClient() {
    const router = useRouter();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<BatchWithDetails>[] = [
        {
            header: "Name",
            accessorKey: "displayName",
        },
        {
            header: "Program",
            accessorKey: "programName",
        },
        {
            header: "Department",
            accessorKey: "departmentName",
        },
        {
            header: "Year",
            accessorKey: "year",
        },
        {
            header: "Counselor",
            accessorKey: "counselorName",
        },
        {
            header: "Current Semester",
            accessorKey: "currentSemester",
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
            const [batchesData, programsData, deptsData, sessionsData, teachersData] =
                await Promise.all([
                    academicService.getAllBatches(),
                    academicService.getAllPrograms(),
                    academicService.getAllDepartments(),
                    academicService.getAllSessions(),
                    teacherService.getAll({ limit: 1000 }).then((res) => res.teachers),
                ]);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setPrograms(Array.isArray(programsData) ? programsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
        } catch (error) {
            const message =
                error instanceof AcademicApiError
                    ? error.message
                    : "Failed to load data";
            notifyError(message);
            setBatches([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedBatch(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (batch: BatchWithDetails) => {
        setSelectedBatch(batch);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (batch: BatchWithDetails) => {
        setSelectedBatch(batch);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedBatch) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteBatchAction(selectedBatch.id, null, formData);
            if (result.success) {
                notifySuccess("Batch deleted successfully");
                fetchData();
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Failed to delete batch");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete batch");
        } finally {
            setIsDeleting(false);
            setSelectedBatch(null);
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

            const result = selectedBatch
                ? await updateBatchAction(selectedBatch.id, null, formData)
                : await createBatchAction(null, formData);

            if (result.success) {
                notifySuccess(`Batch ${selectedBatch ? "updated" : "created"} successfully`);
                fetchData();
                setIsFormModalOpen(false);
            } else {
                notifyError(result.message || "Failed to save batch");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save batch");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Batch Management"
                subtitle="Manage student batches"
                actionLabel="Add Batch"
                onAction={handleCreate}
                icon={Users}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <DataTable
                    data={batches.map((b) => ({
                        ...b,
                        displayName: getBatchDisplayName(b),
                        programName: getName(b.programId),
                        departmentName: getName(b.departmentId),
                        sessionName: getName(b.sessionId),
                        counselorName:
                            b.counselor?.fullName ||
                            (typeof b.counselorId === "string"
                                ? teachers.find((t) => t.id === b.counselorId)?.fullName
                                : "Not Assigned") ||
                            "Not Assigned",
                    }))}
                    columns={columns}
                    searchKey="displayName"
                    searchPlaceholder="Search by batch name..."
                    onView={(item) =>
                        router.push(`/dashboard/admin/academic/batch/${item.id}`)
                    }
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <BatchDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />

            <BatchFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                selectedBatch={selectedBatch}
                isSubmitting={isSubmitting}
                programs={programs}
                departments={departments}
                sessions={sessions}
                teachers={teachers}
            />
        </div>
    );
}
