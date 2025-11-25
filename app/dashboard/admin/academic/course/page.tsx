"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, Course, Department, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

// Helper to get department name
const getDepartmentName = (course: Course): string => {
    if (typeof course.departmentId === 'object' && course.departmentId?.name) return course.departmentId.name;
    return "N/A";
};

// Helper to get department ID
const getDepartmentId = (course: Course): string => {
    if (typeof course.departmentId === 'string') return course.departmentId;
    if (typeof course.departmentId === 'object' && course.departmentId?.id) return course.departmentId.id;
    return '';
};

export default function CourseManagementPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<Course>[] = [
        { header: "Course Code", accessorKey: "code" },
        { header: "Course Name", accessorKey: "name" },
        {
            header: "Credits",
            accessorKey: "credit",
            cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#a3b18a]/30 text-[#344e41]">
                    {item.credit}
                </span>
            )
        },
        {
            header: "Type",
            accessorKey: "courseType",
            cell: (item) => (
                <span className="capitalize">{item.courseType}</span>
            )
        },
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (item) => getDepartmentName(item)
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
            label: "Course Name",
            type: "text",
            required: true,
            placeholder: "e.g. Introduction to Programming"
        },
        {
            name: "code",
            label: "Course Code",
            type: "text",
            required: true,
            placeholder: "e.g. CSE-101"
        },
        {
            name: "credit",
            label: "Credits",
            type: "number",
            required: true,
            placeholder: "e.g. 3.0"
        },
        {
            name: "courseType",
            label: "Course Type",
            type: "select",
            required: true,
            options: [
                { label: "Theory", value: "theory" },
                { label: "Lab", value: "lab" },
                { label: "Project", value: "project" }
            ]
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
            name: "isElective",
            label: "Is Elective?",
            type: "select",
            options: [
                { label: "Yes", value: "true" },
                { label: "No", value: "false" }
            ]
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Brief description of the course..."
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
    ], [departments]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [coursesData, deptsData] = await Promise.all([
                academicService.getAllCourses(),
                academicService.getAllDepartments()
            ]);
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load data";
            toast.error(message);
            setCourses([]);
            setDepartments([]);
        } finally {
            setIsLoading(false);
        }
    };

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
            await academicService.deleteCourse(selectedCourse.id);
            toast.success("Course deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to delete course";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedCourse(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.name || data.name.trim().length < 3) {
                toast.error("Course name must be at least 3 characters");
                setIsSubmitting(false);
                return;
            }

            if (!data.code || data.code.trim().length < 3) {
                toast.error("Course code must be at least 3 characters");
                setIsSubmitting(false);
                return;
            }

            const credit = Number(data.credit);
            if (!credit || credit < 0.5 || credit > 20) {
                toast.error("Credit must be between 0.5 and 20");
                setIsSubmitting(false);
                return;
            }

            if (!data.departmentId) {
                toast.error("Please select a department");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                name: data.name.trim(),
                code: data.code.trim().toUpperCase(),
                credit: credit,
                courseType: data.courseType as 'theory' | 'lab' | 'project',
                departmentId: data.departmentId,
                isElective: data.isElective === "true",
                description: data.description?.trim() || undefined,
                status: data.status === "true"
            };

            if (selectedCourse) {
                await academicService.updateCourse(selectedCourse.id, submitData);
                toast.success("Course updated successfully");
            } else {
                await academicService.createCourse(submitData);
                toast.success("Course created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save course";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={courses}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search course by name or code..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Course"
                    description={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedCourse ? "Edit Course" : "Add New Course"}
                    description={selectedCourse ? "Update course information" : "Create a new academic course"}
                    fields={formFields}
                    initialData={selectedCourse ? {
                        name: selectedCourse.name,
                        code: selectedCourse.code,
                        credit: String(selectedCourse.credit),
                        courseType: selectedCourse.courseType,
                        departmentId: getDepartmentId(selectedCourse),
                        isElective: selectedCourse.isElective ? "true" : "false",
                        description: selectedCourse.description || "",
                        status: selectedCourse.status ? "true" : "false"
                    } : { status: "true", courseType: "theory", isElective: "false" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
