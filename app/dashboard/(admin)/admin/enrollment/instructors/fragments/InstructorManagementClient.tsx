"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import {
    batchCourseInstructorService,
    BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { notifySuccess, notifyError } from "@/components/toast";
import { Users, User, BookOpen, Calendar } from "lucide-react";
import { InstructorDeleteModal } from "./InstructorDeleteModal";
import { deleteInstructorAssignmentAction } from "../actions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.name) return item.name;
    if (typeof item === "object" && item.fullName) return item.fullName;
    return "N/A";
};

interface AssignmentWithDetails extends BatchCourseInstructor {
    instructorName: string;
    instructorEmail: string;
    courseName: string;
    batchName: string;
    displayDate: string;
}

export default function InstructorManagementClient() {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [assignments, setAssignments] = useState<BatchCourseInstructor[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<BatchCourseInstructor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<AssignmentWithDetails>[] = [
        {
            header: "Instructor",
            accessorKey: "instructorName",
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{item.instructorName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.instructorEmail}</span>
                </div>
            )
        },
        {
            header: "Course",
            accessorKey: "courseName",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-600">{item.courseName}</span>
                </div>
            )
        },
        {
            header: "Batch",
            accessorKey: "batchName",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-600">{item.batchName}</span>
                </div>
            )
        },
        {
            header: "Semester",
            accessorKey: "semester",
            cell: (item) => (
                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase">
                    Sem {item.semester}
                </span>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <span
                    className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset capitalize",
                        item.status === "active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : item.status === "completed"
                                ? "bg-blue-50 text-blue-700 ring-blue-200"
                                : "bg-amber-50 text-amber-700 ring-amber-200"
                    )}
                >
                    {item.status}
                </span>
            ),
        },
        {
            header: "Assigned Date",
            accessorKey: "displayDate",
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span className="text-[11px] font-medium">{item.displayDate}</span>
                </div>
            )
        }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [assignmentsRes, teachersRes, coursesRes, batchesRes] = await Promise.all([
                batchCourseInstructorService.listAssignments(),
                teacherService.getAll({ limit: 1000 }),
                courseService.getAllCourses(),
                batchService.getAllBatches()
            ]);

            const assignmentsList = assignmentsRes?.assignments || [];
            const teachersList = teachersRes?.teachers || [];
            const coursesList = Array.isArray(coursesRes) ? coursesRes : [];
            const batchesList = Array.isArray(batchesRes) ? batchesRes : [];

            setAssignments(assignmentsList);
            setTeachers(teachersList);
            setCourses(coursesList);
            setBatches(batchesList);

            if (assignmentsList.length === 0) {
                notifyError("No assignments found");
            }
        } catch (error) {
            notifyError("Failed to load assignments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        router.push("/dashboard/admin/enrollment/instructors/create");
    };

    const handleEdit = (assignment: AssignmentWithDetails) => {
        router.push(`/dashboard/admin/enrollment/instructors/${assignment.id}/edit`);
    };

    const handleDeleteClick = (assignment: AssignmentWithDetails) => {
        setSelectedAssignment(assignment);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAssignment) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteInstructorAssignmentAction(selectedAssignment.id, null, formData);
            if (result.success) {
                notifySuccess("Assignment removed successfully");
                fetchData();
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Failed to remove assignment");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to remove assignment");
        } finally {
            setIsDeleting(false);
            setSelectedAssignment(null);
        }
    };

    const enrichedAssignments = useMemo(() => {
        return assignments.map((a) => {
            const teacher = teachers.find(t => t.id === a.instructorId);
            const course = courses.find(c => (c.id === a.courseId || c._id === a.courseId));
            const batch = batches.find(b => (b.id === a.batchId || b._id === a.batchId));

            const batchObj = a.batch || batch;
            const batchBaseName = getName(batchObj);
            const shiftPrefix = batchObj?.shift === "day" ? "D-" : batchObj?.shift === "evening" ? "E-" : "";

            return {
                ...a,
                instructorName: teacher?.fullName || "Unknown Instructor",
                instructorEmail: teacher?.email || "",
                courseName: getName(a.course) !== "N/A" ? getName(a.course) : getName(course),
                batchName: batchBaseName !== "N/A" ? `${shiftPrefix}${batchBaseName}` : "N/A",
                displayDate: a.assignedDate ? format(new Date(a.assignedDate), "MMM d, yyyy") : "N/A"
            };
        });
    }, [assignments, teachers, courses, batches]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Instructor Management"
                subtitle="Manage faculty assignments for courses and batches"
                actionLabel="Assign Instructor"
                onAction={handleCreate}
                icon={User}
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2", theme.colors.accent.primary)}></div>
                </div>
            ) : (
                <DataTable
                    data={enrichedAssignments}
                    columns={columns}
                    searchKey="instructorName"
                    searchPlaceholder="Search by instructor name..."
                    onView={(item) =>
                        router.push(`/dashboard/admin/enrollment/instructors/${item.id}`)
                    }
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            <InstructorDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
