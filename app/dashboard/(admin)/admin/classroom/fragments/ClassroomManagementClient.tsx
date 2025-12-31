"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { BookOpen, Building2, Users, GraduationCap, Calendar } from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { ClassroomDeleteModal } from "./ClassroomDeleteModal";
import { deleteWorkspaceAction } from "../actions";
import { Badge } from "@/components/ui/badge";

interface EnrichedWorkspace {
    id: string;
    courseId: string;
    batchId: string;
    departmentId: string;
    courseName: string;
    courseCode: string;
    batchName: string;
    departmentName: string;
    studentIds?: string[];
    teacherIds?: string[];
}

interface ClassroomManagementClientProps {
    initialWorkspaces: EnrichedWorkspace[];
}

export function ClassroomManagementClient({ initialWorkspaces }: ClassroomManagementClientProps) {
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState<EnrichedWorkspace[]>(initialWorkspaces);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState<EnrichedWorkspace | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<EnrichedWorkspace>[] = useMemo(() => [
        {
            header: "Course",
            accessorKey: "courseName",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{item.courseName}</span>
                    <span className="text-xs text-slate-500">{item.courseCode}</span>
                </div>
            )
        },
        {
            header: "Department",
            accessorKey: "departmentName",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-sm font-medium">{item.departmentName}</span>
                </div>
            )
        },
        {
            header: "Batch",
            accessorKey: "batchName",
            cell: (item) => (
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-slate-700">{item.batchName}</span>
                </div>
            )
        },
        {
            header: "Roster",
            accessorKey: "courseId", // Changed from id to courseId to avoid key collision
            cell: (item) => (
                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{item.studentIds?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-100">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-600">{item.teacherIds?.length || 0}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "batchId", // Changed from id to batchId to avoid key collision
            cell: () => (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 transition-colors uppercase text-[10px] font-bold tracking-wider">
                    Active
                </Badge>
            )
        }
    ], []);

    const handleDeleteClick = (workspace: EnrichedWorkspace) => {
        setSelectedWorkspace(workspace);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedWorkspace) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteWorkspaceAction(selectedWorkspace.id, null, formData);
            if (result.success) {
                notifySuccess("Workspace dissolved successfully");
                setWorkspaces(workspaces.filter(ws => ws.id !== selectedWorkspace.id));
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Failed to dissolve workspace");
            }
        } catch (error) {
            notifyError("An unexpected error occurred");
        } finally {
            setIsDeleting(false);
            setSelectedWorkspace(null);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Classroom Workspaces"
                subtitle="High-level orchestration of course delivery and student engagement"
                actionLabel="Forge Workspace"
                onAction={() => router.push("/dashboard/admin/classroom/create")}
                icon={BookOpen}
            />

            <DataTable
                data={workspaces}
                columns={columns}
                searchKey="courseName"
                searchPlaceholder="Search by course..."
                onView={(item) => router.push(`/dashboard/admin/classroom/${item.id}`)}
                onEdit={(item) => router.push(`/dashboard/admin/classroom/${item.id}/edit`)}
                onDelete={handleDeleteClick}
            />

            <ClassroomDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                workspaceName={selectedWorkspace?.courseName || ""}
                isDeleting={isDeleting}
            />
        </div>
    );
}
