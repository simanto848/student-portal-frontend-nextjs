"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    Course,
} from "@/services/academic.service";
import {
    useCourses,
    useDepartments,
} from "@/hooks/queries/useAcademicQueries";
import {
    createCourseAction,
    updateCourseAction,
    deleteCourseAction,
} from "../actions";
import { Badge } from "@/components/ui/badge";
import { notifySuccess, notifyError } from "@/components/toast";
import { BookOpen } from "lucide-react";
import { CourseFormModal } from "./CourseFormModal";
import { CourseDeleteModal } from "./CourseDeleteModal";

export function CourseManagementClient() {
    const router = useRouter();
    const { data: coursesData = [], isLoading, refetch } = useCourses();
    const { data: departmentsData = [] } = useDepartments();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getDepartmentName = (course: Course): string => {
        if (typeof course.departmentId === "object" && course.departmentId?.name)
            return course.departmentId.name;
        return "N/A";
    };

    const columns: Column<Course>[] = useMemo(() => [
        { header: "Course Code", accessorKey: "code" },
        { header: "Course Name", accessorKey: "name" },
        {
            header: "Credits",
            accessorKey: "credit",
            cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                    {item.credit} CR
                </span>
            ),
        },
        {
            header: "Type",
            accessorKey: "courseType",
            cell: (item) => <span className="capitalize font-medium text-slate-600">{item.courseType}</span>,
        },
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (item) => (
                <span className="font-medium text-slate-600">
                    {getDepartmentName(item)}
                </span>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset shadow-none border-none ${item.status
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-slate-50 text-slate-600 ring-slate-200"
                        }`}
                >
                    {item.status ? "Active" : "Inactive"}
                </Badge>
            ),
        },
    ], []);

    const handleCreate = () => {
        setSelectedCourse(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (course: Course) => {
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCourse) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteCourseAction(selectedCourse.id, null, formData);
            if (result.success) {
                notifySuccess("Course deleted successfully");
                setIsDeleteModalOpen(false);
                refetch();
            } else {
                notifyError(result.message || "Failed to delete course");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete classroom");
        } finally {
            setIsDeleting(false);
            setSelectedCourse(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.name || data.name.trim().length < 3) {
                notifyError("Course name must be at least 3 characters");
                return;
            }

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const result = selectedCourse
                ? await updateCourseAction(selectedCourse.id, null, formData)
                : await createCourseAction(null, formData);

            if (result.success) {
                notifySuccess(`Course ${selectedCourse ? "updated" : "created"} successfully`);
                setIsFormModalOpen(false);
                setSelectedCourse(null);
                refetch();
            } else {
                notifyError(result.message || "Failed to save course");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save course");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Course Management"
                subtitle="Manage academic courses and curriculum"
                actionLabel="Add New Course"
                onAction={handleCreate}
                icon={BookOpen}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <DataTable
                    data={coursesData}
                    columns={columns}
                    searchKey="name"
                    searchPlaceholder="Search course by name or code..."
                    onView={(item) =>
                        router.push(`/dashboard/admin/academic/course/${item.id}`)
                    }
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <CourseDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                selectedCourse={selectedCourse}
                isDeleting={isDeleting}
            />

            <CourseFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                selectedCourse={selectedCourse}
                departments={departmentsData}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
