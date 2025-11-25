"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, CourseSyllabus, SessionCourse, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText } from "lucide-react";

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

export default function CourseSyllabusManagementPage() {
    const [syllabi, setSyllabi] = useState<CourseSyllabus[]>([]);
    const [sessionCourses, setSessionCourses] = useState<SessionCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSyllabus, setSelectedSyllabus] = useState<CourseSyllabus | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<CourseSyllabus>[] = [
        {
            header: "Course",
            accessorKey: "sessionCourseId",
            cell: (item) => {
                const sc = item.sessionCourseId as any;
                if (sc && sc.courseId) return getName(sc.courseId);
                return "N/A";
            }
        },
        { header: "Version", accessorKey: "version" },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge
                    variant={item.status === "Published" ? "default" : "secondary"}
                    className={
                        item.status === "Published" ? "bg-green-100 text-green-800" :
                            item.status === "Approved" ? "bg-blue-100 text-blue-800" :
                                item.status === "Draft" ? "bg-gray-100 text-gray-800" :
                                    "bg-yellow-100 text-yellow-800"
                    }
                >
                    {item.status}
                </Badge>
            )
        },
    ];

    const formFields: FormField[] = useMemo(() => [
        {
            name: "sessionCourseId",
            label: "Course",
            type: "select",
            required: true,
            placeholder: "Select a course",
            options: Array.isArray(sessionCourses)
                ? sessionCourses
                    .map(sc => {
                        const courseName = (sc.courseId as any)?.name || "Unknown Course";
                        const sessionName = (sc.sessionId as any)?.name || "Unknown Session";
                        return { label: `${courseName} (${sessionName})`, value: sc.id };
                    })
                : []
        },
        {
            name: "version",
            label: "Version",
            type: "text",
            required: true,
            placeholder: "e.g. 1.0"
        },
        {
            name: "overview",
            label: "Overview",
            type: "textarea",
            placeholder: "Course overview..."
        },
        {
            name: "objectives",
            label: "Objectives",
            type: "textarea",
            placeholder: "Learning objectives..."
        },
        {
            name: "gradingPolicy",
            label: "Grading Policy",
            type: "textarea",
            placeholder: "Grading breakdown..."
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            options: [
                { label: "Draft", value: "Draft" },
                { label: "Pending Approval", value: "Pending Approval" },
                { label: "Approved", value: "Approved" },
                { label: "Published", value: "Published" },
                { label: "Archived", value: "Archived" },
            ]
        },
    ], [sessionCourses]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [syllabiData, scData] = await Promise.all([
                academicService.getAllSyllabi(),
                academicService.getAllSessionCourses()
            ]);
            setSyllabi(Array.isArray(syllabiData) ? syllabiData : []);
            setSessionCourses(Array.isArray(scData) ? scData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load data";
            toast.error(message);
            setSyllabi([]);
        } finally {
            setIsLoading(false);
        }
    };

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
            await academicService.deleteSyllabus(selectedSyllabus.id);
            toast.success("Syllabus deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to delete syllabus";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedSyllabus(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.sessionCourseId || !data.version) {
                toast.error("Course and Version are required");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                sessionCourseId: data.sessionCourseId,
                version: data.version.trim(),
                overview: data.overview?.trim() || undefined,
                objectives: data.objectives?.trim() || undefined,
                gradingPolicy: data.gradingPolicy?.trim() || undefined,
                status: data.status as any,
            };

            if (selectedSyllabus) {
                await academicService.updateSyllabus(selectedSyllabus.id, submitData);
                toast.success("Syllabus updated successfully");
            } else {
                await academicService.createSyllabus(submitData);
                toast.success("Syllabus created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save syllabus";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Course Syllabus Management"
                    subtitle="Manage course content and policies"
                    actionLabel="Add New Syllabus"
                    onAction={handleCreate}
                    icon={FileText}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={syllabi}
                        columns={columns}
                        searchKey="version"
                        searchPlaceholder="Search by version..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Syllabus"
                    description="Are you sure you want to delete this syllabus? This action cannot be undone."
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedSyllabus ? "Edit Syllabus" : "Add New Syllabus"}
                    description={selectedSyllabus ? "Update syllabus information" : "Create a new course syllabus"}
                    fields={formFields}
                    initialData={selectedSyllabus ? {
                        sessionCourseId: getId(selectedSyllabus.sessionCourseId),
                        version: selectedSyllabus.version,
                        overview: selectedSyllabus.overview || "",
                        objectives: selectedSyllabus.objectives || "",
                        gradingPolicy: selectedSyllabus.gradingPolicy || "",
                        status: selectedSyllabus.status,
                    } : { status: "Draft", version: "1.0" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
