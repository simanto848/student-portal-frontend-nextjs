"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    SessionCourse,
} from "@/services/academic.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { BookCopy, Filter, X } from "lucide-react";
import { SessionCourseFormModal } from "./SessionCourseFormModal";
import { SessionCourseDeleteModal } from "./SessionCourseDeleteModal";
import {
    useSessionCourses,
    useSessions,
    useCourses,
    useDepartments,
} from "@/hooks/queries/useAcademicQueries";
import {
    syncSessionCoursesAction,
    deleteSessionCourseAction,
} from "../actions";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Helper to get name from object or string
const getName = (item: unknown): string => {
    if (!item) return "N/A";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item !== null && "name" in item)
        return (item as Record<string, string>).name;
    return "N/A";
};

export function SessionCourseManagementClient() {
    const { data: sessionCoursesData = [], isLoading, refetch } = useSessionCourses();
    const { data: sessionsData = [] } = useSessions();
    const { data: coursesData = [] } = useCourses();
    const { data: departmentsData = [] } = useDepartments();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedSessionCourse, setSelectedSessionCourse] =
        useState<SessionCourse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filters
    const [selectedSession, setSelectedSession] = useState<string>("all");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedSemester, setSelectedSemester] = useState<string>("all");

    const columns: Column<SessionCourse>[] = useMemo(() => [
        {
            header: "Session",
            accessorKey: "sessionId",
            cell: (item) => (
                <span className="font-medium text-slate-700">{getName(item.sessionId)}</span>
            ),
        },
        {
            header: "Course",
            accessorKey: "courseId",
            cell: (item) => {
                const course = item.courseId as unknown as {
                    name: string;
                    code: string;
                };
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">{course.name || "N/A"}</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">
                            {course.code || "N/A"}
                        </span>
                    </div>
                );
            },
        },
        {
            header: "Department",
            accessorKey: "departmentId",
            cell: (item) => (
                <span className="text-slate-600 font-medium">{getName(item.departmentId)}</span>
            ),
        },
        {
            header: "Semester",
            accessorKey: "semester",
            cell: (item) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 shadow-sm">
                    Semester {item.semester}
                </span>
            ),
        },
    ], []);

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
            const formData = new FormData();
            const result = await deleteSessionCourseAction(selectedSessionCourse.id, null, formData);
            if (result.success) {
                notifySuccess("Session Course deleted successfully");
                setIsDeleteModalOpen(false);
                refetch();
            } else {
                notifyError(result.message || "Failed to delete session course");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to delete session course");
        } finally {
            setIsDeleting(false);
            setSelectedSessionCourse(null);
        }
    };

    const handleFormSubmit = async (data: Record<string, any>) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("sessionId", data.sessionId);
            formData.append("departmentId", data.departmentId);
            formData.append("semester", data.semester.toString());

            const courseIds = Array.isArray(data.courseId) ? data.courseId : [data.courseId];
            courseIds.forEach((id: string) => {
                formData.append("courseIds", id);
            });

            const result = await syncSessionCoursesAction(null, formData);

            if (result.success) {
                notifySuccess("Session courses synchronized successfully");
                setIsFormModalOpen(false);
                refetch();
            } else {
                notifyError(result.message || "Failed to save session courses");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to save session course");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredData = useMemo(() => {
        return sessionCoursesData.filter((item) => {
            const sessionMatch =
                selectedSession === "all" ||
                (item.sessionId && (typeof item.sessionId === "object"
                    ? (item.sessionId as any).id === selectedSession
                    : item.sessionId === selectedSession));
            const deptMatch =
                selectedDepartment === "all" ||
                (item.departmentId && (typeof item.departmentId === "object"
                    ? (item.departmentId as any).id === selectedDepartment
                    : item.departmentId === selectedDepartment));
            const semesterMatch =
                selectedSemester === "all" ||
                String(item.semester) === selectedSemester;
            return sessionMatch && deptMatch && semesterMatch;
        });
    }, [sessionCoursesData, selectedSession, selectedDepartment, selectedSemester]);

    const clearFilters = () => {
        setSelectedSession("all");
        setSelectedDepartment("all");
        setSelectedSemester("all");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Session Course Allocation"
                subtitle="Manage and assign course offerings per session"
                actionLabel="Allocate Courses"
                onAction={handleCreate}
                icon={BookCopy}
            />

            {/* Filters */}
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider ml-2">
                    <Filter className="h-4 w-4" />
                    Quick Filters
                </div>

                <div className="flex flex-wrap gap-3 flex-1">
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                        <SelectTrigger className="w-[200px] rounded-xl border-slate-200 bg-white">
                            <SelectValue placeholder="Filter by Session" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 text-slate-700">
                            <SelectItem value="all">All Sessions</SelectItem>
                            {Array.from(new Map(sessionsData.map(s => [s.id, s])).values()).map((session) => (
                                <SelectItem key={session.id} value={session.id}>
                                    {session.name} ({session.year})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                    >
                        <SelectTrigger className="w-[220px] rounded-xl border-slate-200 bg-white">
                            <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 text-slate-700">
                            <SelectItem value="all">All Departments</SelectItem>
                            {Array.from(new Map(departmentsData.map(d => [d.id, d])).values()).map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-[160px] rounded-xl border-slate-200 bg-white">
                            <SelectValue placeholder="Filter by Semester" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="all">All Semesters</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
                                <SelectItem key={sem} value={String(sem)}>
                                    Semester {sem}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(selectedSession !== "all" ||
                    selectedDepartment !== "all" ||
                    selectedSemester !== "all") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl px-4 transition-all"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : (
                <DataTable
                    data={filteredData}
                    columns={columns}
                    searchKey="semester"
                    searchPlaceholder="Quick search..."
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <SessionCourseDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                selectedSessionCourse={selectedSessionCourse}
                isDeleting={isDeleting}
            />

            <SessionCourseFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedSessionCourse}
                sessions={sessionsData}
                courses={coursesData}
                departments={departmentsData}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
