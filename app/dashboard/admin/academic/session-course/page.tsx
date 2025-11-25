"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { GenericFormModal, FormField } from "@/components/dashboard/shared/GenericFormModal";
import { academicService, SessionCourse, Session, Course, Department, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { BookCopy } from "lucide-react";

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

export default function SessionCourseManagementPage() {
    const [sessionCourses, setSessionCourses] = useState<SessionCourse[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSessionCourse, setSelectedSessionCourse] = useState<SessionCourse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<SessionCourse>[] = [
        {
            header: "Session",
            accessorKey: "sessionId",
            cell: (item) => getName(item.sessionId)
        },
        {
            header: "Course",
            accessorKey: "courseId",
            cell: (item) => getName(item.courseId)
        },
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (item) => getName(item.departmentId)
        },
        {
            header: "Semester",
            accessorKey: "semester",
            cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#588157]/20 text-[#344e41]">
                    {item.semester}
                </span>
            )
        },
    ];

    const formFields: FormField[] = useMemo(() => [
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
            name: "courseId",
            label: "Course",
            type: "select",
            required: true,
            placeholder: "Select a course",
            options: Array.isArray(courses)
                ? courses
                    .filter(c => c.status)
                    .map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))
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
            name: "semester",
            label: "Semester",
            type: "number",
            required: true,
            placeholder: "e.g. 1"
        },
    ], [sessions, courses, departments]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [scData, sessionsData, coursesData, deptsData] = await Promise.all([
                academicService.getAllSessionCourses(),
                academicService.getAllSessions(),
                academicService.getAllCourses(),
                academicService.getAllDepartments()
            ]);
            setSessionCourses(Array.isArray(scData) ? scData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load data";
            toast.error(message);
            setSessionCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedSessionCourse(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (sc: SessionCourse) => {
        setSelectedSessionCourse(sc);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (sc: SessionCourse) => {
        setSelectedSessionCourse(sc);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSessionCourse) return;
        setIsDeleting(true);
        try {
            await academicService.deleteSessionCourse(selectedSessionCourse.id);
            toast.success("Session Course deleted successfully");
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to delete session course";
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setSelectedSessionCourse(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (!data.sessionId || !data.courseId || !data.departmentId) {
                toast.error("Session, Course and Department are required");
                setIsSubmitting(false);
                return;
            }

            const semester = Number(data.semester);
            if (!semester || semester < 1) {
                toast.error("Semester must be at least 1");
                setIsSubmitting(false);
                return;
            }

            const submitData = {
                sessionId: data.sessionId,
                courseId: data.courseId,
                departmentId: data.departmentId,
                semester: semester,
            };

            if (selectedSessionCourse) {
                await academicService.updateSessionCourse(selectedSessionCourse.id, submitData);
                toast.success("Session Course updated successfully");
            } else {
                await academicService.createSessionCourse(submitData);
                toast.success("Session Course created successfully");
            }
            fetchData();
            setIsFormModalOpen(false);
        } catch (error) {
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save session course";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Session Course Management"
                    subtitle="Assign courses to sessions"
                    actionLabel="Assign Course"
                    onAction={handleCreate}
                    icon={BookCopy}
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={sessionCourses}
                        columns={columns}
                        searchKey="semester"
                        searchPlaceholder="Search by semester..."
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Session Course"
                    description="Are you sure you want to delete this session course assignment? This action cannot be undone."
                    isDeleting={isDeleting}
                />

                <GenericFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    title={selectedSessionCourse ? "Edit Assignment" : "Assign Course"}
                    description={selectedSessionCourse ? "Update course assignment" : "Assign a course to a session"}
                    fields={formFields}
                    initialData={selectedSessionCourse ? {
                        sessionId: getId(selectedSessionCourse.sessionId),
                        courseId: getId(selectedSessionCourse.courseId),
                        departmentId: getId(selectedSessionCourse.departmentId),
                        semester: String(selectedSessionCourse.semester),
                    } : { semester: "1" }}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
