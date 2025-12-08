"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, Batch, Program, Department, Session, AcademicApiError } from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { toast } from "sonner";
import { Users, GraduationCap, Building2, Calendar } from "lucide-react";

const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.name) return item.name;
    if (typeof item === 'object' && item.fullName) return item.fullName;
    return "N/A";
};

const getId = (item: any): string => {
    if (!item) return "";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.id) return item.id;
    return "";
};

interface BatchWithDetails extends Batch {
    programName: string;
    departmentName: string;
    sessionName: string;
    counselorName: string;
}

export default function BatchManagementPage() {
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
            accessorKey: "name",
        },
        {
            header: "Program",
            accessorKey: "programName",
        },
        {
            header: "Department",
            accessorKey: "departmentName",
        },
        // {
        //     header: "Session",
        //     accessorKey: "sessionName",
        // },
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
                <span className={`px-2 py-1 rounded-full text-xs ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.status ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "name",
            label: "Batch Name",
            type: "text",
            required: true,
            placeholder: "e.g. CSE-2024",
        },
        {
            name: "year",
            label: "Year",
            type: "number",
            required: true,
            placeholder: "e.g. 2024",
        },
        {
            name: "programId",
            label: "Program",
            type: "searchable-select",
            required: true,
            placeholder: "Select a program",
            options: programs.filter(p => p.status).map(p => ({ label: p.name, value: p.id })),
        },
        {
            name: "departmentId",
            label: "Department",
            type: "searchable-select",
            required: true,
            placeholder: "Select a department",
            options: departments.filter(d => d.status).map(d => ({ label: d.name, value: d.id })),
        },
        {
            name: "sessionId",
            label: "Session",
            type: "searchable-select",
            required: true,
            placeholder: "Select a session",
            options: sessions.filter(s => s.status).map(s => ({ label: s.name, value: s.id })),
        },
        {
            name: "counselorId",
            label: "Counselor",
            type: "searchable-select",
            required: false,
            placeholder: "Select a counselor",
            options: teachers.map(t => ({ label: t.fullName, value: t.id })),
        },
        {
            name: "currentSemester",
            label: "Current Semester",
            type: "number",
            required: true,
            placeholder: "e.g. 1",
        },
        {
            name: "maxStudents",
            label: "Max Students",
            type: "number",
            required: true,
            placeholder: "e.g. 60",
        },
        {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: false,
        },
        {
            name: "endDate",
            label: "End Date",
            type: "date",
            required: false,
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
            ],
        },
    ], [programs, departments, sessions, teachers]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [batchesData, programsData, deptsData, sessionsData, teachersData] = await Promise.all([
                academicService.getAllBatches(),
                academicService.getAllPrograms(),
                academicService.getAllDepartments(),
                academicService.getAllSessions(),
                teacherService.getAll({ limit: 1000 }).then(res => res.teachers),
            ]);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setPrograms(Array.isArray(programsData) ? programsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load data";
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
            await academicService.deleteBatch(selectedBatch.id);
            toast.success("Batch deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to delete batch";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedBatch(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            const submitData = {
                name: data.name,
                year: parseInt(data.year),
                programId: data.programId,
                departmentId: data.departmentId,
                sessionId: data.sessionId,
                counselorId: data.counselorId || undefined,
                currentSemester: parseInt(data.currentSemester),
                maxStudents: parseInt(data.maxStudents),
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
                status: data.status === "true",
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
            const message = error instanceof AcademicApiError ? error.message : "Failed to save batch";
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
                    actionLabel="Add Batch"
                    onAction={handleCreate}
                    icon={Users}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={batches.map(b => ({
                            ...b,
                            programName: getName(b.programId),
                            departmentName: getName(b.departmentId),
                            sessionName: getName(b.sessionId),
                            counselorName: b.counselor?.fullName || (typeof b.counselorId === 'string' ? teachers.find(t => t.id === b.counselorId)?.fullName : "Not Assigned") || "Not Assigned",
                        }))}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search by batch name..."
                        onView={(item) => router.push(`/dashboard/admin/academic/batch/${item.id}`)}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Batch"
                    description="Are you sure you want to delete this batch? This action cannot be undone."
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedBatch ? "Edit Batch" : "Add Batch"}
                    description={selectedBatch ? "Update batch information" : "Create a new batch"}
                    fields={formFields}
                    initialData={selectedBatch ? {
                        name: selectedBatch.name,
                        year: selectedBatch.year.toString(),
                        programId: getId(selectedBatch.programId),
                        departmentId: getId(selectedBatch.departmentId),
                        sessionId: getId(selectedBatch.sessionId),
                        counselorId: getId(selectedBatch.counselor),
                        currentSemester: selectedBatch.currentSemester.toString(),
                        maxStudents: selectedBatch.maxStudents.toString(),
                        startDate: selectedBatch.startDate ? new Date(selectedBatch.startDate).toISOString().split('T')[0] : "",
                        endDate: selectedBatch.endDate ? new Date(selectedBatch.endDate).toISOString().split('T')[0] : "",
                        status: selectedBatch.status.toString(),
                    } : {
                        status: "true",
                        currentSemester: "1",
                    }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
