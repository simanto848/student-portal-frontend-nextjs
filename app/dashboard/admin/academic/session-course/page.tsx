"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { academicService, SessionCourse, Session, Course, Department, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { BookCopy, Filter, X } from "lucide-react";
import { SessionCourseForm } from "./SessionCourseForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Helper to get name from object or string
const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.name) return item.name;
    return "N/A";
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

    // Filters
    const [selectedSession, setSelectedSession] = useState<string>("all");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
    const [selectedSemester, setSelectedSemester] = useState<string>("all");

    const columns: Column<SessionCourse>[] = [
        {
            header: "Session",
            accessorKey: "sessionId",
            cell: (item) => getName(item.sessionId)
        },
        {
            header: "Course",
            accessorKey: "courseId",
            cell: (item) => {
                const course = item.courseId as any;
                return (
                    <div>
                        <div className="font-medium">{course.name || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">{course.code || "N/A"}</div>
                    </div>
                );
            }
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
                    Semester {item.semester}
                </span>
            )
        },
    ];

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

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);

            // Use the sync endpoint for both create and update (manage)
            // Ensure courseId is an array
            const courseIds = Array.isArray(data.courseId) ? data.courseId : [data.courseId];

            await academicService.syncSessionCourses({
                sessionId: data.sessionId,
                departmentId: data.departmentId,
                semester: Number(data.semester),
                courseIds: courseIds
            });

            toast.success("Session courses saved successfully");

            setIsFormModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error("Error submitting form:", error);
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to save session course";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredData = useMemo(() => {
        return sessionCourses.filter(item => {
            const sessionMatch = selectedSession === "all" || (typeof item.sessionId === 'object' ? item.sessionId.id === selectedSession : item.sessionId === selectedSession);
            const deptMatch = selectedDepartment === "all" || (typeof item.departmentId === 'object' ? item.departmentId.id === selectedDepartment : item.departmentId === selectedDepartment);
            const semesterMatch = selectedSemester === "all" || String(item.semester) === selectedSemester;
            return sessionMatch && deptMatch && semesterMatch;
        });
    }, [sessionCourses, selectedSession, selectedDepartment, selectedSemester]);

    const clearFilters = () => {
        setSelectedSession("all");
        setSelectedDepartment("all");
        setSelectedSemester("all");
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

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg border border-border flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        Filters:
                    </div>

                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Session" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sessions</SelectItem>
                            {sessions.map(session => (
                                <SelectItem key={session.id} value={session.id}>{session.name} ({session.year})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(sem => (
                                <SelectItem key={sem} value={String(sem)}>Semester {sem}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(selectedSession !== "all" || selectedDepartment !== "all" || selectedSemester !== "all") && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <DataTable
                        data={filteredData}
                        columns={columns}
                        searchKey="semester"
                        searchPlaceholder="Search..."
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

                <SessionCourseForm
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    initialData={selectedSessionCourse}
                    sessions={sessions}
                    courses={courses}
                    departments={departments}
                    isSubmitting={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}
