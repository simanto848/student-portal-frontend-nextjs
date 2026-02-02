"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    CourseSyllabus,
} from "@/services/academic.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { BookOpenCheck } from "lucide-react";
import { SyllabusFormModal } from "./SyllabusFormModal";
import { SyllabusDeleteModal } from "./SyllabusDeleteModal";
import {
    useSyllabi,
    useSessionCourses,
} from "@/hooks/queries/useAcademicQueries";
import {
    createSyllabusAction,
    updateSyllabusAction,
    deleteSyllabusAction,
} from "../actions";
import { Badge } from "@/components/ui/badge";

interface SyllabusWithDetails extends CourseSyllabus {
    courseName: string;
}

export function SyllabusManagementClient() {
    const router = useRouter();
    const { data: syllabiData = [], isLoading, refetch } = useSyllabi();
    const { data: sessionCoursesData = [] } = useSessionCourses();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSyllabus, setSelectedSyllabus] = useState<CourseSyllabus | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<SyllabusWithDetails>[] = useMemo(() => [
        {
            header: "Course",
            accessorKey: "courseName",
            cell: (item) => (
                <span className="font-bold text-slate-900">{item.courseName}</span>
            ),
        },
        {
            header: "Version",
            accessorKey: "version",
            cell: (item) => (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                    v{item.version}
                </span>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => {
                const variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                let className = "";

                switch (item.status) {
                    case "Approved":
                        className = "bg-blue-50 text-blue-700 ring-blue-200";
                        break;
                    case "Published":
                        className = "bg-amber-50 text-amber-700 ring-amber-200";
                        break;
                    case "Pending Approval":
                        className = "bg-orange-50 text-orange-700 ring-orange-200";
                        break;
                    case "Archived":
                        className = "bg-slate-50 text-slate-600 ring-slate-200";
                        break;
                    default:
                        className = "bg-slate-50 text-slate-500 ring-slate-200";
                }

                return (
                    <Badge className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset shadow-none border-none ${className}`}>
                        {item.status}
                    </Badge>
                );
            },
        },
    ], []);

    const handleCreate = () => {
        setSelectedSyllabus(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (syllabus: CourseSyllabus) => {
        setSelectedSyllabus(syllabus);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (syllabus: CourseSyllabus) => {
        setSelectedSyllabus(syllabus);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSyllabus) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteSyllabusAction(selectedSyllabus.id, null, formData);
            if (result.success) {
                notifySuccess("Syllabus deleted successfully");
                setIsDeleteModalOpen(false);
                refetch();
            } else {
                notifyError(result.message || "Failed to delete syllabus");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete syllabus");
        } finally {
            setIsDeleting(false);
            setSelectedSyllabus(null);
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

            const result = selectedSyllabus
                ? await updateSyllabusAction(selectedSyllabus.id, null, formData)
                : await createSyllabusAction(null, formData);

            if (result.success) {
                notifySuccess(`Syllabus ${selectedSyllabus ? "updated" : "created"} successfully`);
                setIsFormModalOpen(false);
                setSelectedSyllabus(null);
                refetch();
            } else {
                notifyError(result.message || "Failed to save syllabus");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save syllabus");
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableData: SyllabusWithDetails[] = useMemo(() =>
        syllabiData.map((s) => {
            const course =
                typeof s.sessionCourseId === "object" && s.sessionCourseId
                    ? (
                        s.sessionCourseId as unknown as {
                            courseId: { name: string };
                        }
                    ).courseId
                    : null;
            const courseName =
                course && typeof course === "object" ? course.name : "N/A";

            return {
                ...s,
                courseName: courseName,
            };
        }), [syllabiData]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Syllabus Management"
                subtitle="Curate and manage academic course syllabi"
                actionLabel="Create Syllabus"
                onAction={handleCreate}
                icon={BookOpenCheck}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <DataTable
                    data={tableData}
                    columns={columns}
                    searchKey="courseName"
                    searchPlaceholder="Search by course name..."
                    onView={(item) =>
                        router.push(`/dashboard/admin/academic/syllabus/${item.id}`)
                    }
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <SyllabusDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                selectedSyllabus={selectedSyllabus}
                isDeleting={isDeleting}
            />

            <SyllabusFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                selectedSyllabus={selectedSyllabus}
                sessionCourses={sessionCoursesData}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
