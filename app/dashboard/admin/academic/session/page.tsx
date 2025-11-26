"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, Session, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarRange } from "lucide-react";
import { format } from "date-fns";

export default function SessionManagementPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<Session>[] = [
        { header: "Session Name", accessorKey: "name" },
        { header: "Year", accessorKey: "year" },
        {
            header: "Start Date",
            accessorKey: "startDate",
            cell: (item) => format(new Date(item.startDate), "MMM dd, yyyy")
        },
        {
            header: "End Date",
            accessorKey: "endDate",
            cell: (item) => format(new Date(item.endDate), "MMM dd, yyyy")
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

    const formFields: FormField[] = [
        {
            name: "name",
            label: "Session Name",
            type: "text",
            required: true,
            placeholder: "e.g. Spring 2024"
        },
        {
            name: "year",
            label: "Year",
            type: "number",
            required: true,
            placeholder: "e.g. 2024"
        },
        {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true
        },
        {
            name: "endDate",
            label: "End Date",
            type: "date",
            required: true
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
    ];

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getAllSessions();
            setSessions(Array.isArray(data) ? data : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load sessions";
            toast.error(message);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedSession(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (session: Session) => {
        setSelectedSession(session);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (session: Session) => {
        setSelectedSession(session);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSession) return;
        setIsDeleting(true);
        try {
            await academicService.deleteSession(selectedSession.id);
            toast.success("Session deleted successfully");
            fetchSessions();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to delete session";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedSession(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.name || data.name.trim().length < 3) {
                toast.error("Session name must be at least 3 characters");
                setIsSubmitting(false);
                return;
            }

            const year = Number(data.year);
            if (!year || year < 2000 || year > 2100) {
                toast.error("Year must be between 2000 and 2100");
                setIsSubmitting(false);
                return;
            }

            if (!data.startDate || !data.endDate) {
                toast.error("Start and End dates are required");
                setIsSubmitting(false);
                return;
            }

            if (new Date(data.startDate) >= new Date(data.endDate)) {
                toast.error("End date must be after start date");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                name: data.name.trim(),
                year: year,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
                status: data.status === "true"
            };

            if (selectedSession) {
                await academicService.updateSession(selectedSession.id, submitData);
                toast.success("Session updated successfully");
            } else {
                await academicService.createSession(submitData);
                toast.success("Session created successfully");
            }
            fetchSessions();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to save session";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Session Management"
                    subtitle="Manage academic sessions and terms"
                    actionLabel="Add New Session"
                    onAction={handleCreate}
                    icon={CalendarRange}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={sessions}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search session by name..."
                        onView={(item) => router.push(`/dashboard/admin/academic/session/${item.id}`)}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Session"
                    description={`Are you sure you want to delete "${selectedSession?.name}"? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedSession ? "Edit Session" : "Add New Session"}
                    description={selectedSession ? "Update session information" : "Create a new academic session"}
                    fields={formFields}
                    initialData={selectedSession ? {
                        name: selectedSession.name,
                        year: String(selectedSession.year),
                        startDate: selectedSession.startDate.split('T')[0],
                        endDate: selectedSession.endDate.split('T')[0],
                        status: selectedSession.status ? "true" : "false"
                    } : { status: "true", year: String(new Date().getFullYear()) }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
