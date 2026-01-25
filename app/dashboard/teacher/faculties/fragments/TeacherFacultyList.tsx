"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Teacher, TeacherDesignation } from "@/services/user/teacher.service";
import {
    GraduationCap,
    Plus,
    Mail,
    Network,
    Clock,
    RotateCcw,
    Trash2,
    Sparkles,
    Users
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import {
    deleteTeacherAction,
    restoreTeacherAction,
    permanentDeleteTeacherAction
} from "../actions";

interface TeacherFacultyListProps {
    initialTeachers: Teacher[];
    deletedTeachers: Teacher[];
    pagination?: any;
    scope: 'department' | 'faculty';
}

const designationLabel: Record<TeacherDesignation, string> = {
    professor: "Professor",
    associate_professor: "Associate Professor",
    assistant_professor: "Assistant Professor",
    lecturer: "Lecturer",
    senior_lecturer: "Senior Lecturer",
};

const designationColor: Record<TeacherDesignation, string> = {
    professor: "bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] border-[#2dd4bf]/20",
    associate_professor: "bg-blue-100/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    assistant_professor: "bg-cyan-100/50 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50",
    lecturer: "bg-emerald-100/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    senior_lecturer: "bg-teal-100/50 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50",
};

export function TeacherFacultyList({
    initialTeachers,
    deletedTeachers: initialDeletedTeachers,
    pagination,
    scope
}: TeacherFacultyListProps) {
    const router = useRouter();
    const [teachers] = useState(initialTeachers);
    const [deletedTeachers] = useState(initialDeletedTeachers);
    const [activeTab, setActiveTab] = useState("active");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const columns: Column<Teacher>[] = useMemo(() => [
        {
            header: "Name",
            accessorKey: "fullName",
            cell: (teacher) => (
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push(`/dashboard/teacher/faculties/${teacher.id}`)}>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-md transition-transform group-hover:scale-110 duration-500">
                            {teacher.profile?.profilePicture ? (
                                <img
                                    src={getImageUrl(teacher.profile.profilePicture)}
                                    alt={teacher.fullName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20 text-[#2dd4bf] font-black text-lg">
                                    {teacher.fullName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 dark:text-white group-hover:text-[#2dd4bf] transition-colors leading-tight">{teacher.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
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
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-sm">
                        <Mail className="h-3.5 w-3.5 text-[#2dd4bf]" />
                        {teacher.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                        <Network className="h-3 w-3 text-slate-300 dark:text-slate-600" />
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

    return (
        <div className="space-y-10 pb-20">
            <GlassCard className="relative overflow-hidden p-8 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-[#2dd4bf]/10 blur-[100px] opacity-60 dark:opacity-20" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <Badge className="bg-[#2dd4bf]/10 text-[#2dd4bf] ring-1 ring-[#2dd4bf]/20 border-none px-3.5 py-1 rounded-full flex items-center gap-2 w-fit shadow-sm">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">{scope === 'department' ? 'Department' : 'Faculty'} Teachers</span>
                        </Badge>
                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                Faculty<span className="text-[#2dd4bf]"> Management</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg max-w-xl">
                                Efficiently supervise and organize academic staff in your {scope}.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => router.push("/dashboard/teacher/faculties/create")}
                            className="h-14 px-8 rounded-[1.5rem] bg-[#0d9488] hover:bg-[#0f766e] dark:bg-[#2dd4bf] dark:hover:bg-[#14b8a6] text-white dark:text-slate-900 shadow-xl shadow-teal-500/20 font-black uppercase text-xs tracking-widest flex items-center gap-3 active:scale-95 transition-all group"
                        >
                            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Add Faculty</span>
                        </Button>
                    </div>
                </div>
            </GlassCard>

            <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="bg-white/50 dark:bg-slate-800/40 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-200/10 dark:shadow-slate-900/20 flex w-fit">
                        <TabsList className="bg-transparent h-11 gap-1 p-0">
                            <TabsTrigger
                                value="active"
                                className="h-9 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-[#0d9488] dark:data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white dark:data-[state=active]:text-slate-900 text-slate-500 dark:text-slate-400 transition-all shadow-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                Active Staff
                            </TabsTrigger>
                            <TabsTrigger
                                value="deleted"
                                className="h-9 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-500 dark:text-slate-400 transition-all shadow-sm"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Deleted Staff
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="active" key="active-tab" className="mt-0 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                        >
                            <GlassCard className="p-4 sm:p-6 md:p-8 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/30 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                    <GraduationCap className="w-64 h-64 text-slate-900 dark:text-white" />
                                </div>
                                <div className="relative z-10">
                                    <DataTable
                                        data={teachers}
                                        columns={columns}
                                        searchKey="fullName"
                                        searchPlaceholder="Search academic staff..."
                                        onView={(item) => router.push(`/dashboard/teacher/faculties/${item.id}`)}
                                        onEdit={(item) => router.push(`/dashboard/teacher/faculties/${item.id}/edit`)}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            </GlassCard>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="deleted" key="deleted-tab" className="mt-0 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GlassCard className="p-6 md:p-10 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/30">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner ring-1 ring-rose-100 dark:ring-rose-800/50">
                                        <Clock className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deleted Faculty</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Records of faculty members currently removed from the system.</p>
                                    </div>
                                </div>

                                {deletedTeachers.length === 0 ? (
                                    <div className="py-24 text-center space-y-4">
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto ring-1 ring-slate-100 dark:ring-slate-700/50 shadow-xl shadow-slate-200/20">
                                            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="text-slate-400 dark:text-slate-500 font-black text-lg tracking-tight">No deleted faculty found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                                <tr>
                                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Academician</th>
                                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Designation</th>
                                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {deletedTeachers.map((teacher, index) => (
                                                    <motion.tr
                                                        key={teacher.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                                                    >
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 dark:text-slate-600 grayscale group-hover:grayscale-0 transition-all ring-1 ring-slate-200/60 dark:ring-slate-700/50">
                                                                    {teacher.fullName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-800 dark:text-slate-200 group-hover:text-[#2dd4bf] transition-colors">{teacher.fullName}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 font-mono tracking-tighter">{teacher.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            {teacher.designation ? (
                                                                <Badge className={`${designationColor[teacher.designation]} grayscale group-hover:grayscale-0 border px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm w-fit transition-all`}>
                                                                    {designationLabel[teacher.designation]}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 italic">Unassigned</span>
                                                            )}
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRestore(teacher.id)}
                                                                    className="h-10 px-5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                                                                >
                                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                                    Restore
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handlePermanentDelete(teacher.id)}
                                                                    className="h-10 px-5 rounded-xl border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
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
                            </GlassCard>
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
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

