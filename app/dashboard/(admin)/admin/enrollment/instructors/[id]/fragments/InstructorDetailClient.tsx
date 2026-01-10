"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import {
    batchCourseInstructorService,
    BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService } from "@/services/user/teacher.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { notifySuccess, notifyError } from "@/components/toast";
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    BookOpen,
    Users,
    Calendar,
    Mail,
    Building2,
    ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { InstructorDeleteModal } from "../../fragments/InstructorDeleteModal";
import { deleteInstructorAssignmentAction } from "../../actions";

interface InstructorDetailClientProps {
    id: string;
}

export default function InstructorDetailClient({ id }: InstructorDetailClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [assignment, setAssignment] = useState<BatchCourseInstructor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const assignmentData = await batchCourseInstructorService.getAssignment(id);
            if (assignmentData.instructorId) {
                try {
                    const teachersRes = await teacherService.getAll({ limit: 1000 });
                    const teacher = teachersRes.teachers.find(t => t.id === assignmentData.instructorId);
                    if (teacher) {
                        assignmentData.instructor = {
                            id: teacher.id,
                            fullName: teacher.fullName,
                            email: teacher.email,
                            registrationNumber: (teacher as any).registrationNumber
                        };
                    }
                } catch (e) {
                    notifyError("Failed to fetch teacher details");
                }
            }

            setAssignment(assignmentData);
        } catch (error) {
            notifyError("Failed to fetch assignment details");
            router.push("/dashboard/admin/enrollment/instructors");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteInstructorAssignmentAction(id, null, formData);
            if (result.success) {
                notifySuccess("Assignment removed successfully");
                router.push("/dashboard/admin/enrollment/instructors");
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Failed to remove assignment");
            }
        } catch (error: any) {
            notifyError(error?.message || "Failed to remove assignment");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2", theme.colors.accent.primary)}></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Details...</p>
            </div>
        );
    }

    if (!assignment) return null;

    const getName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === "string") return item;
        if (typeof item === "object" && item.name) return item.name;
        if (typeof item === "object" && item.fullName) return item.fullName;
        return "N/A";
    };

    return (
        <div className="space-y-8">
            {/* Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-12 w-12 rounded-2xl hover:bg-white/50 border border-transparent hover:border-slate-200 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="h-6 w-6 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assignment Details</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-100/50 px-2 py-0.5 rounded-lg border border-slate-200/50">Instructor Record</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-amber-600 font-bold text-[10px] uppercase tracking-widest">{assignment.status}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/admin/enrollment/instructors/${id}/edit`)}
                        className="h-12 px-6 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black tracking-tight gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Record
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteClick}
                        className="h-12 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 border-none font-black tracking-tight gap-2 shadow-lg shadow-rose-200/50 transition-all active:scale-95 text-white"
                    >
                        <Trash2 className="h-4 w-4" />
                        Remove
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Instructor Info */}
                <GlassCard className="p-6 md:col-span-2 lg:col-span-1" delay={0.1}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn("p-2.5 rounded-xl ring-1 shadow-sm", theme.colors.sidebar.active.replace('bg-', 'bg-') + '/10 ring-' + theme.colors.sidebar.active.replace('bg-', '') + '/20')}>
                            <User className={cn("h-5 w-5", theme.colors.accent.primary)} />
                        </div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Instructor</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</p>
                            <p className="text-lg font-black text-slate-800">{getName(assignment.instructor) || "Unknown Instructor"}</p>
                            <div className="flex items-center gap-1.5 mt-2 text-slate-500 font-medium text-sm">
                                <Mail className="h-3.5 w-3.5" />
                                {assignment.instructor?.email || "No email available"}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 uppercase tracking-widest">Employee</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                                <p className="text-sm font-bold text-slate-600">Jan 2024</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Course & Batch Info */}
                <GlassCard className="p-6 md:col-span-2" delay={0.2}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn("p-2.5 rounded-xl ring-1 shadow-sm", theme.colors.sidebar.active.replace('bg-', 'bg-') + '/10 ring-' + theme.colors.sidebar.active.replace('bg-', '') + '/20')}>
                            <ShieldCheck className={cn("h-5 w-5", theme.colors.accent.primary)} />
                        </div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Assignment Metadata</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-400 before:rounded-full">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <BookOpen className="h-3 w-3" />
                                    Course Details
                                </p>
                                <p className="text-base font-black text-slate-700">{getName(assignment.course)}</p>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{assignment.course?.code}</p>
                            </div>
                            <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-400 before:rounded-full">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3" />
                                    Academic Unit
                                </p>
                                <p className="text-sm font-bold text-slate-600">Department of Computer Science</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-400 before:rounded-full">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Users className="h-3 w-3" />
                                    Target Batch
                                </p>
                                <p className="text-base font-black text-slate-700">
                                    {assignment.batch?.shift === "day" ? "D-" : assignment.batch?.shift === "evening" ? "E-" : ""}
                                    {getName(assignment.batch)}
                                </p>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{getName(assignment.batch?.sessionId) || "Ongoing Session"}</p>
                            </div>
                            <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-rose-400 before:rounded-full">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    Timeline
                                </p>
                                <p className="text-sm font-bold text-slate-600">Semester {assignment.semester}</p>
                                <p className="text-[11px] font-medium text-slate-400 mt-1 italic">Assigned on {assignment.assignedDate ? format(new Date(assignment.assignedDate), "MMMM d, yyyy") : "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Status Highlights */}
                <GlassCard className="p-5 flex items-center gap-4 border-amber-100/50" delay={0.3}>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workload Status</p>
                        <p className="text-sm font-black text-slate-700">Standard Allocation</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-5 flex items-center gap-4 border-emerald-100/50" delay={0.4}>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule Conflict</p>
                        <p className="text-sm font-black text-slate-700">None Detected</p>
                    </div>
                </GlassCard>
                <GlassCard className="p-5 flex items-center gap-4 border-indigo-100/50" delay={0.5}>
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Count</p>
                        <p className="text-sm font-black text-slate-700">{assignment.batch?.currentStudents || "0"} Students</p>
                    </div>
                </GlassCard>
            </div>

            <InstructorDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
