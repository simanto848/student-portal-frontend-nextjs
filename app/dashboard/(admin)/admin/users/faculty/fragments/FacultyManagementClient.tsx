"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Teacher, TeacherDesignation } from "@/services/user/teacher.service";
import {
    GraduationCap,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Loader2,
    Mail,
    MapPin,
    Network,
    Calendar,
    Clock,
    RotateCcw,
    ChevronRight,
    Sparkles,
    Users,
    Ban,
    Unlock
} from "lucide-react";
import { adminService } from "@/services/user/admin.service";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import {
    deleteTeacherAction,
    restoreTeacherAction,
    permanentDeleteTeacherAction
} from "../actions";

interface FacultyManagementClientProps {
    initialTeachers: Teacher[];
    deletedTeachers: Teacher[];
    pagination?: any;
}

const designationLabel: Record<TeacherDesignation, string> = {
    professor: "Professor",
    associate_professor: "Associate Professor",
    assistant_professor: "Assistant Professor",
    lecturer: "Lecturer",
    senior_lecturer: "Senior Lecturer",
};

const designationColor: Record<TeacherDesignation, string> = {
    professor: "bg-purple-100 text-purple-700 border-purple-200",
    associate_professor: "bg-blue-100 text-blue-700 border-blue-200",
    assistant_professor: "bg-cyan-100 text-cyan-700 border-cyan-200",
    lecturer: "bg-emerald-100 text-emerald-700 border-emerald-200",
    senior_lecturer: "bg-teal-100 text-teal-700 border-teal-200",
};

export function FacultyManagementClient({
    initialTeachers,
    deletedTeachers: initialDeletedTeachers,
    pagination
}: FacultyManagementClientProps) {
    const router = useRouter();
    const [teachers, setTeachers] = useState(initialTeachers);
    const [deletedTeachers, setDeletedTeachers] = useState(initialDeletedTeachers);
    const [activeTab, setActiveTab] = useState("active");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const columns: Column<Teacher>[] = useMemo(() => [
        {
            header: "Name",
            accessorKey: "fullName",
            cell: (teacher) => (
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push(`/dashboard/admin/users/faculty/${teacher.id}`)}>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-md transition-transform group-hover:scale-110 duration-500">
                            {teacher.profile?.profilePicture ? (
                                <img
                                    src={getImageUrl(teacher.profile.profilePicture)}
                                    alt={teacher.fullName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-amber-50 text-amber-600 font-black text-lg">
                                    {teacher.fullName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                    <div>
                        <div className="flex flex-col">
                            <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{teacher.fullName}</p>
                            {teacher.isBlocked && (
                                <Badge variant="destructive" className="w-fit h-4 text-[9px] px-1.5 uppercase font-black animate-pulse bg-red-600 text-white border-none mt-0.5">
                                    Blocked
                                </Badge>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {teacher.registrationNumber}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Contact",
            accessorKey: "email",
            cell: (teacher) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {teacher.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        <Network className="h-3 w-3" />
                        {teacher.department?.name || "N/A"}
                    </div>
                </div>
            ),
        },
        {
            header: "Title",
            accessorKey: "designation",
            cell: (teacher) => (
                teacher.designation ? (
                    <Badge className={`${designationColor[teacher.designation]} border px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm w-fit`}>
                        <GraduationCap className="h-3 w-3" />
                        {designationLabel[teacher.designation]}
                    </Badge>
                ) : (
                    <span className="text-[10px] font-bold text-slate-300 italic">Unassigned</span>
                )
            ),
        },
        {
            header: "Joined",
            accessorKey: "joiningDate",
            cell: (teacher) => (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "N/A"}
                </div>
            ),
        }
    ], [router]);

    const handleRestore = async (id: string) => {
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await restoreTeacherAction(id, null, formData);
            if (result.success) {
                notifySuccess("Faculty access restored");
                router.refresh();
            } else {
                notifyError(result.message || "Failed to restore access");
            }
        } catch (error) {
            notifyError("An error occurred during restoration");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (!confirm("This will permanently delete the faculty member from the system. Proceed?")) return;
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await permanentDeleteTeacherAction(id, null, formData);
            if (result.success) {
                notifySuccess("Faculty deleted permanently");
                router.refresh();
            } else {
                notifyError(result.message || "Failed to delete faculty");
            }
        } catch (error) {
            notifyError("A critical error occurred");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedTeacher) return;
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await deleteTeacherAction(selectedTeacher.id, null, formData);
            if (result.success) {
                notifySuccess("Faculty member deleted");
                setIsDeleteOpen(false);
                router.refresh();
            } else {
                notifyError(result.message || "Deletion failed");
            }
        } catch (error) {
            notifyError("An error occurred");
        } finally {
            setIsActionLoading(false);
            setSelectedTeacher(null);
        }
    };

    const handleBlock = async (teacher: Teacher) => {
        const reason = window.prompt(`Enter block reason for ${teacher.fullName}:`);
        if (reason === null) return;
        if (!reason.trim()) {
            notifyError("Reason is required to block a user");
            return;
        }

        try {
            await adminService.blockUser("teacher", teacher.id, reason);
            notifySuccess(`${teacher.fullName} blocked successfully`);
            setTeachers(teachers.map(t => t.id === teacher.id ? { ...t, isBlocked: true } : t));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to block teacher");
        }
    };

    const handleUnblock = async (teacher: Teacher) => {
        if (!confirm(`Are you sure you want to unblock ${teacher.fullName}?`)) return;
        try {
            await adminService.unblockUser("teacher", teacher.id);
            notifySuccess(`${teacher.fullName} unblocked successfully`);
            setTeachers(teachers.map(t => t.id === teacher.id ? { ...t, isBlocked: false } : t));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to unblock teacher");
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-2 w-fit shadow-sm">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400E]">Overview</span>
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Faculty Management</h1>
                </div>
                <Button
                    onClick={() => router.push("/dashboard/admin/users/faculty/create")}
                    className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-amber-600 text-white shadow-sm font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Faculty</span>
                </Button>
            </div>

            <Tabs defaultValue="active" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" onValueChange={setActiveTab}>
                <div className="bg-slate-50/50 px-4 py-4 md:px-6 md:py-5 border-b border-slate-200 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <TabsList className="bg-slate-100 p-1 rounded-lg h-auto flex w-full sm:w-auto">
                        <TabsTrigger
                            value="active"
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all text-center"
                        >
                            Active Faculty
                        </TabsTrigger>
                        <TabsTrigger
                            value="deleted"
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all text-center"
                        >
                            Deleted Faculty
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="active" className="m-0 p-0">
                    <div className="p-4 sm:p-6">
                        <DataTable
                            data={teachers}
                            columns={columns}
                            searchKey="fullName"
                            searchPlaceholder="Search academic staff..."
                            onView={(item) => router.push(`/dashboard/admin/users/faculty/${item.id}`)}
                            onEdit={(item) => router.push(`/dashboard/admin/users/faculty/${item.id}/edit`)}
                            onDelete={handleDelete}
                            renderExtraActions={(teacher) => (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        teacher.isBlocked ? handleUnblock(teacher) : handleBlock(teacher);
                                    }}
                                    className={`h-8 w-8 rounded-md hover:bg-slate-100 transition-colors ${teacher.isBlocked ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"
                                        }`}
                                    title={teacher.isBlocked ? "Unblock Faculty" : "Block Faculty"}
                                >
                                    {teacher.isBlocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                </Button>
                            )}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="deleted" className="m-0 p-0">
                    <div className="p-4 sm:p-6">
                        {deletedTeachers.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-3">
                                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <Users className="w-8 h-8" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-sm font-medium text-slate-900">No deleted faculty found</p>
                                    <p className="text-sm text-slate-500">There are no deleted faculty records in the system.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-medium text-slate-500">Name</th>
                                            <th className="px-4 py-3 text-xs font-medium text-slate-500">Title</th>
                                            <th className="px-4 py-3 text-xs font-medium text-slate-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {deletedTeachers.map((teacher) => (
                                            <tr
                                                key={teacher.id}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-400 border border-slate-200">
                                                            {teacher.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-900">{teacher.fullName}</p>
                                                            <p className="text-xs text-slate-500">{teacher.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {teacher.designation ? (
                                                        <Badge className={`${designationColor[teacher.designation]} border-none px-2 py-0.5 rounded-md font-medium text-xs`}>
                                                            {designationLabel[teacher.designation]}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRestore(teacher.id)}
                                                            className="h-8 px-3 rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-xs"
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                                            Restore
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePermanentDelete(teacher.id)}
                                                            className="h-8 px-3 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-xs"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                            Purge
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Faculty Account"
                description={`Are you sure you want to delete ${selectedTeacher?.fullName}? their account access will be deactivated.`}
                isDeleting={isActionLoading}
            />
        </div>
    );
}
