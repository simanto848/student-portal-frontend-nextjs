"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Trash2,
    Edit2,
    Shield,
    Calendar,
    User,
    Mail,
    Filter,
    X,
    Check,
    AlertCircle,
    Building2,
    Clock,
    Layers,
    Layout,
    ArrowLeft
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notifySuccess, notifyError, notifyLoading } from "@/components/toast";
import { ExamCommitteeMember, TeacherOption } from "../types";
import { addCommitteeMember, removeCommitteeMember, updateCommitteeMember, getDeletedCommitteeMembers, restoreCommitteeMember } from "../actions";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";

interface BatchOption {
    id: string;
    name: string;
}

interface ExamCommitteeClientProps {
    initialMembers: ExamCommitteeMember[];
    teachers: TeacherOption[];
    batches: BatchOption[];
    departmentId: string;
}

export default function ExamCommitteeClient({ initialMembers, teachers, batches, departmentId }: ExamCommitteeClientProps) {
    const { user } = useAuth();
    const [members, setMembers] = useState<ExamCommitteeMember[]>(initialMembers);
    const [searchQuery, setSearchQuery] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<ExamCommitteeMember | null>(null);

    // Deleted Members State
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    const [deletedMembers, setDeletedMembers] = useState<any[]>([]);
    const [isLoadingTrash, setIsLoadingTrash] = useState(false);

    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedShift, setSelectedShift] = useState<"day" | "evening">("day");
    const [selectedBatch, setSelectedBatch] = useState<string>("null");
    const [isActive, setIsActive] = useState(true);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isFormOpen) {
            if (editingMember) {
                setSelectedTeacher((editingMember.teacherId && typeof editingMember.teacherId === 'object') ? editingMember.teacherId.id : (editingMember.teacherId as string));
                setSelectedShift(editingMember.shift);

                const batchId = (editingMember.batchId && typeof editingMember.batchId === 'object') ? editingMember.batchId.id : (editingMember.batchId as string);
                setSelectedBatch(batchId || "null");

                setIsActive(editingMember.status);
            } else {
                setSelectedTeacher("");
                setSelectedShift("day");
                setSelectedBatch("null");
                setIsActive(true);
            }
        }
    }, [isFormOpen, editingMember]);

    const getTeacherName = (member: ExamCommitteeMember) => {
        if (typeof member.teacherId === 'object') {
            return `${member.teacherId.firstName} ${member.teacherId.lastName}`;
        }

        const teacher = teachers.find(t => t.id === member.teacherId);
        if (teacher) {
            return `${teacher.firstName} ${teacher.lastName}`;
        }

        return "Unknown Teacher";
    };

    const getTeacherEmail = (member: ExamCommitteeMember) => {
        if (typeof member.teacherId === 'object') {
            return member.teacherId.email;
        }
        const teacher = teachers.find(t => t.id === member.teacherId);
        return teacher ? teacher.email : "";
    };

    const getBatchName = (member: ExamCommitteeMember) => {
        if (!member.batchId) return "All Batches";
        if (typeof member.batchId === 'object') {
            return member.batchId.batchName || member.batchId.batchName;
        }
        const batch = batches.find(b => b.id === member.batchId);
        return batch ? batch.name : "Unknown Batch";
    };

    const filteredMembers = members.filter(member => {
        const name = getTeacherName(member).toLowerCase();
        const email = getTeacherEmail(member).toLowerCase();
        const search = searchQuery.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const handleSubmit = async () => {
        if (!selectedTeacher && !editingMember) {
            notifyError("Please select a teacher");
            return;
        }

        const toastId = notifyLoading(editingMember ? "Updating member..." : "Adding member...");
        setIsLoading(true);

        try {
            const payload = {
                teacherId: selectedTeacher,
                departmentId: departmentId,
                shift: selectedShift,
                batchId: selectedBatch === "null" ? null : selectedBatch,
                status: isActive
            };

            let result;
            if (editingMember) {
                result = await updateCommitteeMember(editingMember.id, payload);
            } else {
                result = await addCommitteeMember(payload);
            }

            if (result.success) {
                notifySuccess(editingMember ? "Member updated successfully" : "Member added successfully", { id: toastId });
                setIsFormOpen(false);
                setEditingMember(null);
                window.location.reload();
            } else {
                notifyError(result.error as string, { id: toastId });
            }
        } catch (error) {
            notifyError("An unexpected error occurred", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (member: ExamCommitteeMember) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleCreateClick = () => {
        setEditingMember(null);
        setIsFormOpen(true);
    }

    const handleRemoveMember = async (id: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        const toastId = notifyLoading("Removing member...");
        const result = await removeCommitteeMember(id);

        if (result.success) {
            notifySuccess("Member removed", { id: toastId });
            setMembers(prev => prev.filter(m => m.id !== id));
        } else {
            notifyError(result.error as string, { id: toastId });
        }
    };

    const handleOpenTrash = async () => {
        setIsTrashOpen(true);
        setIsLoadingTrash(true);
        const result = await getDeletedCommitteeMembers(departmentId);
        if (result.success) {
            setDeletedMembers(result.data);
        } else {
            notifyError(result.error as string);
        }
        setIsLoadingTrash(false);
    };

    const handleRestoreMember = async (id: string) => {
        const toastId = notifyLoading("Restoring member...");
        const result = await restoreCommitteeMember(id);
        if (result.success) {
            notifySuccess("Member restored successfully", { id: toastId });
            window.location.reload();
        } else {
            notifyError(result.error as string, { id: toastId });
        }
    };

    const uniqueTeachers = Array.from(new Map(
        teachers.filter(t => t.id).map(t => [t.id, t])
    ).values());

    const teacherOptions = uniqueTeachers.map(t => ({
        label: `${t.firstName} ${t.lastName}`,
        description: t.email,
        value: t.id
    }));

    const uniqueBatches = Array.from(new Map(
        batches.filter(b => b.id).map(b => [b.id, b])
    ).values());

    return (
        <div className="space-y-8 pb-12 w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header / Hero */}
            <GlassCard className="relative overflow-hidden border-slate-200/60 dark:border-slate-700/50 p-8 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/20">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-[#2dd4bf]/10 blur-3xl opacity-50 dark:opacity-20" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-[#2dd4bf]/10 ring-1 ring-[#2dd4bf]/20 text-[#2dd4bf]">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2dd4bf]">
                                Administrative Control
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Exam<span className="text-[#2dd4bf]"> Committee</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-lg">
                            Manage department exam committee members and permissions.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleOpenTrash}
                            className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#2dd4bf] dark:hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 dark:hover:border-[#2dd4bf]/30 hover:bg-[#2dd4bf]/5 dark:hover:bg-[#2dd4bf]/10 transition-all p-0 flex items-center justify-center shadow-sm"
                            title="View Removed Members"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleCreateClick} className="h-12 px-6 bg-[#0d9488] hover:bg-[#0f766e] dark:bg-[#2dd4bf] dark:hover:bg-[#14b8a6] text-white dark:text-slate-900 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-teal-500/20 active:scale-95">
                                    <Plus className="mr-2 h-4 w-4" /> Add Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-[2rem] dark:bg-slate-900 dark:border-slate-800">
                                <DialogHeader>
                                    <DialogTitle className="dark:text-white">{editingMember ? "Edit Details" : "Add Committee Member"}</DialogTitle>
                                    <DialogDescription className="dark:text-slate-400">
                                        {editingMember ? "Update exam committee member details." : "Assign a teacher to the exam committee."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="teacher" className="dark:text-slate-300">Select Teacher</Label>
                                        <div className="relative">
                                            <SearchableSelect
                                                options={teacherOptions}
                                                value={selectedTeacher}
                                                onChange={setSelectedTeacher}
                                                placeholder="Search teacher..."
                                                disabled={!!editingMember}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shift" className="dark:text-slate-300">Shift</Label>
                                        <Select onValueChange={(v: any) => setSelectedShift(v)} value={selectedShift}>
                                            <SelectTrigger id="shift" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white">
                                                <SelectValue placeholder="Select shift" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                <SelectItem value="day" className="dark:text-slate-200 dark:focus:bg-slate-800">Day</SelectItem>
                                                <SelectItem value="evening" className="dark:text-slate-200 dark:focus:bg-slate-800">Evening</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="batch" className="dark:text-slate-300">Batch (Optional)</Label>
                                        <Select onValueChange={setSelectedBatch} value={selectedBatch}>
                                            <SelectTrigger id="batch" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white">
                                                <SelectValue placeholder="All Batches / General" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                <SelectItem value="null" className="dark:text-slate-200 dark:focus:bg-slate-800">All Batches / General</SelectItem>
                                                {uniqueBatches.map((batch) => (
                                                    <SelectItem key={batch.id} value={batch.id} className="dark:text-slate-200 dark:focus:bg-slate-800">
                                                        {batch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/30 dark:bg-slate-800/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-base dark:text-slate-200">Active Status</Label>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {isActive ? "Member is currently active" : "Member is inactive"}
                                            </div>
                                        </div>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={setIsActive}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-12 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] dark:bg-[#2dd4bf] dark:hover:bg-[#14b8a6] text-white dark:text-slate-900 font-bold">
                                        {isLoading ? (editingMember ? "Updating..." : "Adding...") : (editingMember ? "Update Member" : "Confirm Assignment")}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </GlassCard>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800/40 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#2dd4bf] transition-colors" />
                    <Input
                        placeholder="Search members by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 pl-12 border-none bg-transparent focus-visible:ring-0 text-base dark:text-white dark:placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredMembers.map((member, idx) => (
                        <motion.div
                            key={`${member.id}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlassCard className={`p-6 border transition-all duration-300 group ${member.status ? 'border-slate-200/60 dark:border-slate-700/50 hover:shadow-xl hover:border-[#2dd4bf]/30' : 'border-slate-200/60 dark:border-slate-700/30 opacity-70 bg-slate-50/50 dark:bg-slate-800/20'
                                }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${member.status ? 'bg-[#2dd4bf]/10 text-[#2dd4bf] ring-1 ring-[#2dd4bf]/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                            }`}>
                                            {getTeacherName(member).charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                                                {getTeacherName(member)}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{getTeacherEmail(member)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl dark:bg-slate-900 dark:border-slate-800 p-1.5 shadow-xl border-slate-200/60 transition-all">
                                            <DropdownMenuItem className="font-bold text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2.5 focus:bg-[#2dd4bf]/10 focus:text-[#0d9488] dark:focus:bg-[#2dd4bf]/20 dark:focus:text-[#2dd4bf] transition-colors cursor-pointer" onClick={() => handleEditClick(member)}>
                                                <Edit2 className="mr-2 h-4 w-4 text-[#2dd4bf]" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-600 font-bold rounded-lg px-3 py-2.5 focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-900/20 dark:focus:text-rose-400 transition-colors cursor-pointer" onClick={() => handleRemoveMember(member.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-[#2dd4bf]" /> Shift
                                        </span>
                                        <Badge variant="secondary" className="uppercase tracking-wider font-extrabold text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200">
                                            {member.shift}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                            <Layers className="h-4 w-4 text-[#2dd4bf]" /> Batch
                                        </span>
                                        <span className="font-extrabold text-slate-700 dark:text-slate-200 text-[10px] uppercase tracking-wider">
                                            {getBatchName(member)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-[#2dd4bf]" /> Status
                                        </span>
                                        <Badge className={`uppercase tracking-wider font-black text-[10px] border-none ${member.status ? 'bg-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf]' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                                            }`}>
                                            {member.status ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Trash Dialog */}
            <Dialog open={isTrashOpen} onOpenChange={setIsTrashOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] dark:bg-slate-900 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Removed Members</DialogTitle>
                        <DialogDescription className="dark:text-slate-400">
                            Restore previously removed committee members.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoadingTrash ? (
                            <div className="py-8 text-center text-slate-400 dark:text-slate-500">Loading...</div>
                        ) : deletedMembers.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No removed members found.</div>
                        ) : (
                            deletedMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div>
                                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{getTeacherName(member)}</h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{getTeacherEmail(member)}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 px-3 text-[#2dd4bf] border-[#2dd4bf]/30 hover:bg-[#2dd4bf]/10 hover:text-[#2dd4bf] font-black uppercase text-[10px] tracking-widest"
                                        onClick={() => handleRestoreMember(member.id)}
                                    >
                                        Restore
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {
                filteredMembers.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800/40 mb-6 ring-1 ring-slate-100 dark:ring-slate-700/50">
                            <Users className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">No Committee Members</h3>
                        <p className="text-slate-400 dark:text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                            {searchQuery ? "No members match your search parameter." : "Get started by adding teachers to the exam committee."}
                        </p>
                    </div>
                )
            }
        </div >
    );
}
