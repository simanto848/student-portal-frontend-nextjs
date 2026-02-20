/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    batchCourseInstructorService,
    BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService } from "@/services/user/teacher.service";
import { notifySuccess, notifyError } from "@/components/toast";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Loader2,
    User,
    BookOpen,
    Users,
    Calendar,
    Mail,
    ShieldCheck,
    Fingerprint,
    Zap,
    LucideIcon
} from "lucide-react";
import { InstructorDeleteModal } from "../../fragments/InstructorDeleteModal";
import { deleteInstructorAssignmentAction } from "../../actions";

interface InstructorDetailClientProps {
    id: string;
}

export default function InstructorDetailClient({ id }: InstructorDetailClientProps) {
    const router = useRouter();
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
                notifySuccess("Assignment purged successfully");
                router.push("/dashboard/admin/enrollment/instructors");
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Operation failed");
            }
        } catch (error: any) {
            notifyError(error?.message || "System error during deletion");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Loading assignment details...</p>
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

    const DetailItem = ({ label, value, icon: Icon, mono = false }: { label: string, value: string | number, icon: LucideIcon, mono?: boolean }) => (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                {label}
            </label>
            <div className={`text-sm font-medium text-slate-900 ${mono ? 'font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 w-fit' : ''}`}>
                {value || "---"}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-500/30 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Assignment Details</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Instructor Assignment</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => router.push(`/dashboard/admin/enrollment/instructors/${id}/edit`)}
                        variant="outline"
                        className="h-10 px-4 rounded-lg border-slate-200 text-slate-600 hover:border-amber-500/30 hover:text-amber-600 shadow-sm font-medium transition-colors"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Update Assignment
                    </Button>
                    <Button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        variant="destructive"
                        className="h-10 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-sm transition-colors"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Terminate
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-900">Instructor Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <DetailItem label="Full Name" value={getName(assignment.instructor)} icon={User} />
                                <DetailItem label="Email" value={assignment.instructor?.email || "No email available"} icon={Mail} />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Registration Number" value={assignment.instructor?.registrationNumber || "N/A"} icon={Fingerprint} mono />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-900">Course Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <DetailItem label="Course Name" value={getName(assignment.course)} icon={BookOpen} />
                                <DetailItem label="Course Code" value={assignment.course?.code || "UNKN"} icon={Zap} mono />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Level" value={`Semester ${assignment.semester}`} icon={Calendar} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg font-bold text-slate-900">Batch Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DetailItem label="Batch Name" value={`${assignment.batch?.shift === "day" ? "D-" : assignment.batch?.shift === "evening" ? "E-" : ""}${getName(assignment.batch)}`} icon={Users} />
                                <DetailItem label="Session" value={getName(assignment.batch?.sessionId) || "Ongoing"} icon={Calendar} />
                                <DetailItem label="Total Student" value={`${assignment.batch?.currentStudents || 0} Enrolled`} icon={ShieldCheck} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
