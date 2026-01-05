"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    academicService,
    Session,
    AcademicApiError,
} from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { notifySuccess, notifyError } from "@/components/toast";
import { CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { SessionDeleteModal } from "./SessionDeleteModal";
import { SessionFormModal } from "./SessionFormModal";
import {
    createSessionAction,
    updateSessionAction,
    deleteSessionAction,
} from "../actions";

export default function SessionManagementClient() {
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
            cell: (item) => format(new Date(item.startDate), "MMM dd, yyyy"),
        },
        {
            header: "End Date",
            accessorKey: "endDate",
            cell: (item) => format(new Date(item.endDate), "MMM dd, yyyy"),
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
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getAllSessions();
            setSessions(Array.isArray(data) ? data : []);
        } catch (error) {
            const message =
                error instanceof AcademicApiError
                    ? error.message
                    : "Failed to load sessions";
            notifyError(message);
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
            const formData = new FormData();
            const result = await deleteSessionAction(selectedSession.id, null, formData);
            if (result.success) {
                notifySuccess("Session deleted successfully");
                fetchSessions();
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Failed to delete session");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete session");
        } finally {
            setIsDeleting(false);
            setSelectedSession(null);
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

            const result = selectedSession
                ? await updateSessionAction(selectedSession.id, null, formData)
                : await createSessionAction(null, formData);

            if (result.success) {
                notifySuccess(`Session ${selectedSession ? "updated" : "created"} successfully`);
                fetchSessions();
                setIsFormModalOpen(false);
            } else {
                notifyError(result.message || "Failed to save session");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save session");
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <DataTable
                        data={sessions}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search session by name..."
                        onView={(item) =>
                            router.push(`/dashboard/admin/academic/session/${item.id}`)
                        }
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <SessionDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    sessionName={selectedSession?.name || ""}
                />

                <SessionFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    selectedSession={selectedSession}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
