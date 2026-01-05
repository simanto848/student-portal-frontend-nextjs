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
    Users
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
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
                        <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{teacher.fullName}</p>
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
                notifySuccess("Faculty member suspended");
                setIsDeleteOpen(false);
                router.refresh();
            } else {
                notifyError(result.message || "Suspension failed");
            }
        } catch (error) {
            notifyError("An error occurred");
        } finally {
            setIsActionLoading(false);
            setSelectedTeacher(null);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-4 w-fit shadow-sm">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Faculty List</span>
                    </Badge>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Faculty</h1>
                    <p className="text-slate-500 font-bold mt-3 text-lg">Manage teachers and faculty members in the system.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => router.push("/dashboard/admin/users/faculty/create")}
                        className="h-14 px-8 rounded-[2rem] bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Add Faculty
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="bg-white p-1.5 rounded-[2rem] border-2 border-slate-100 shadow-lg shadow-slate-200/30 flex w-fit">
                        <TabsList className="bg-transparent h-12 gap-1 p-0">
                            <TabsTrigger
                                value="active"
                                className="h-10 px-8 rounded-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                Active
                            </TabsTrigger>
                            <TabsTrigger
                                value="deleted"
                                className="h-10 px-8 rounded-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Suspended
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="active" key="active-tab" className="mt-0 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 shadow-2xl shadow-slate-200/30 overflow-hidden relative group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <GraduationCap className="w-48 h-48 text-slate-900" />
                            </div>
                            <DataTable
                                data={teachers}
                                columns={columns}
                                searchKey="fullName"
                                searchPlaceholder="Search academic staff..."
                                onView={(item) => router.push(`/dashboard/admin/users/faculty/${item.id}`)}
                                onEdit={(item) => router.push(`/dashboard/admin/users/faculty/${item.id}/edit`)}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="deleted" key="deleted-tab" className="mt-0 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/30"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Suspended Faculty</h2>
                                    <p className="text-slate-500 font-bold text-sm italic">Records of faculty members removed from the active system.</p>
                                </div>
                            </div>

                            {deletedTeachers.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-50 border-4 border-white shadow-2xl shadow-slate-100">
                                        <Users className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-black italic text-lg decoration-slate-200 underline underline-offset-8">No faculty in suspension</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-inner">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Restore Access</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {deletedTeachers.map((teacher, index) => (
                                                <motion.tr
                                                    key={teacher.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-slate-50/30 transition-colors group"
                                                >
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 grayscale group-hover:grayscale-0 transition-all">
                                                                {teacher.fullName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-800">{teacher.fullName}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{teacher.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        {teacher.designation ? (
                                                            <Badge className={`${designationColor[teacher.designation]} grayscale border px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm w-fit`}>
                                                                {designationLabel[teacher.designation]}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-300 italic">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRestore(teacher.id)}
                                                                className="h-10 px-5 rounded-xl border border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-black tracking-tight flex items-center gap-2"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Restore
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handlePermanentDelete(teacher.id)}
                                                                className="h-10 px-5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-black tracking-tight flex items-center gap-2"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Purge
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
                title="Suspend Faculty"
                description={`Are you sure you want to suspend ${selectedTeacher?.fullName}? their account access will be deactivated.`}
                isDeleting={isActionLoading}
            />
        </div>
    );
}
