"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, Batch, Program, Department, Session, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users } from "lucide-react";

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

export default function BatchManagementPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<Batch>[] = [
        { header: "Batch Name", accessorKey: "name" },
        {
            header: "Program",
            accessorKey: "programId",
            cell: (item) => getName(item.programId)
        },
        {
            header: "Session",
            accessorKey: "sessionId",
            cell: (item) => getName(item.sessionId)
        },
        {
            header: "Students",
            accessorKey: "currentStudents",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.currentStudents}</span>
                    <span className="text-xs text-muted-foreground">/ {item.maxStudents}</span>
                </div>
            )
        },
        {
            header: "Semester",
            accessorKey: "currentSemester",
            cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#588157]/20 text-[#344e41]">
                    {item.currentSemester}
                </span>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge
                    variant={item.status ? "default" : "destructive"}
                    className={item.status
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                >
                    {item.status ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "name",
            label: "Batch Name",
            type: "text",
            required: true,
            placeholder: "e.g. CSE-24"
        },
        {
            name: "year",
            label: "Year",
            type: "number",
            required: true,
            placeholder: "e.g. 2024"
        },
        {
            name: "programId",
            label: "Program",
            type: "select",
            required: true,
            placeholder: "Select a program",
            options: Array.isArray(programs)
                ? programs
                    .filter(p => p.status)
                    .map(p => ({ label: `${p.name} (${p.shortName})`, value: p.id }))
                : []
        },
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
            name: "sessionId",
            label: "Session",
            type: "select",
            required: true,
            placeholder: "Select a session",
            options: Array.isArray(sessions)
                ? sessions
                    .filter(s => s.status)
                    .map(s => ({ label: s.name, value: s.id }))
                : []
        },
        {
            name: "maxStudents",
            label: "Max Students",
            type: "number",
            required: true,
            placeholder: "e.g. 50"
        },
        {
            name: "currentSemester",
            label: "Current Semester",
            type: "number",
            required: true,
            placeholder: "e.g. 1"
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" }
            ]
        },
    ], [programs, departments, sessions]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [batchesData, programsData, deptsData, sessionsData] = await Promise.all([
                academicService.getAllBatches(),
                academicService.getAllPrograms(),
                academicService.getAllDepartments(),
                academicService.getAllSessions()
            ]);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setPrograms(Array.isArray(programsData) ? programsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load data";
            toast.error(message);
            setBatches([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedBatch(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (batch: Batch) => {
        setSelectedBatch(batch);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (batch: Batch) => {
        setSelectedBatch(batch);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedBatch) return;
        setIsDeleting(true);
        try {
            await academicService.deleteBatch(selectedBatch.id);
            toast.success("Batch deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to delete batch";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedBatch(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.name || data.name.trim().length < 3) {
                toast.error("Batch name must be at least 3 characters");
                setIsSubmitting(false);
                return;
            }

            const year = Number(data.year);
            if (!year || year < 2000 || year > 2100) {
                toast.error("Year must be between 2000 and 2100");
                setIsSubmitting(false);
                return;
            }

            if (!data.programId || !data.departmentId || !data.sessionId) {
                toast.error("Program, Department and Session are required");
                setIsSubmitting(false);
                return;
            }

            const maxStudents = Number(data.maxStudents);
            if (!maxStudents || maxStudents < 1 || maxStudents > 500) {
                toast.error("Max students must be between 1 and 500");
                setIsSubmitting(false);
                return;
            }

            const currentSemester = Number(data.currentSemester);
            if (!currentSemester || currentSemester < 1) {
                toast.error("Current semester must be at least 1");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                name: data.name.trim(),
                year: year,
                programId: data.programId,
                departmentId: data.departmentId,
                sessionId: data.sessionId,
                maxStudents: maxStudents,
                currentSemester: currentSemester,
                status: data.status === "true"
            };

            if (selectedBatch) {
                await academicService.updateBatch(selectedBatch.id, submitData);
                toast.success("Batch updated successfully");
            } else {
                await academicService.createBatch(submitData);
                toast.success("Batch created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save batch";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Batch Management"
                    subtitle="Manage student batches"
                    actionLabel="Add New Batch"
                    onAction={handleCreate}
                    icon={Users}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={batches}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search batch by name..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Batch"
                    description={`Are you sure you want to delete "${selectedBatch?.name}"? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedBatch ? "Edit Batch" : "Add New Batch"}
                    description={selectedBatch ? "Update batch information" : "Create a new student batch"}
                    fields={formFields}
                    initialData={selectedBatch ? {
                        name: selectedBatch.name,
                        year: String(selectedBatch.year),
                        programId: getId(selectedBatch.programId),
                        departmentId: getId(selectedBatch.departmentId),
                        sessionId: getId(selectedBatch.sessionId),
                        maxStudents: String(selectedBatch.maxStudents),
                        currentSemester: String(selectedBatch.currentSemester),
                        status: selectedBatch.status ? "true" : "false"
                    } : { status: "true", maxStudents: "50", currentSemester: "1" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
