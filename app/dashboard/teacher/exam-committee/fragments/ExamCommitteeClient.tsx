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
    Layers
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { notifySuccess, notifyError, notifyLoading } from "@/components/toast";
import { ExamCommitteeMember, TeacherOption } from "../types";
import { addCommitteeMember, removeCommitteeMember, updateCommitteeMember } from "../actions";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuth } from "@/contexts/AuthContext";

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
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-2xl shadow-indigo-500/5">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl opacity-50" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                                Administrative Control
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Exam<span className="text-indigo-600"> Committee</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg">
                            Manage department exam committee members and permissions.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleCreateClick} className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                    <Plus className="mr-2 h-4 w-4" /> Add Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                                <DialogHeader>
                                    <DialogTitle>{editingMember ? "Edit Details" : "Add Committee Member"}</DialogTitle>
                                    <DialogDescription>
                                        {editingMember ? "Update exam committee member details." : "Assign a teacher to the exam committee."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="teacher">Select Teacher</Label>
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
                                        <Label htmlFor="shift">Shift</Label>
                                        <Select onValueChange={(v: any) => setSelectedShift(v)} value={selectedShift}>
                                            <SelectTrigger id="shift" className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select shift" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="day">Day</SelectItem>
                                                <SelectItem value="evening">Evening</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="batch">Batch (Optional)</Label>
                                        <Select onValueChange={setSelectedBatch} value={selectedBatch}>
                                            <SelectTrigger id="batch" className="h-12 rounded-xl bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="All Batches / General" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">All Batches / General</SelectItem>
                                                {uniqueBatches.map((batch) => (
                                                    <SelectItem key={batch.id} value={batch.id}>
                                                        {batch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Active Status</Label>
                                            <div className="text-xs text-slate-500">
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
                                    <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-12 rounded-xl bg-indigo-600 font-bold">
                                        {isLoading ? (editingMember ? "Updating..." : "Adding...") : (editingMember ? "Update Member" : "Confirm Assignment")}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search members by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 pl-12 border-none bg-transparent focus-visible:ring-0 text-base"
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
                            <Card className={`p-6 rounded-[2rem] border transition-all duration-300 group bg-white ${member.status ? 'border-slate-200/60 hover:shadow-xl hover:border-indigo-100' : 'border-slate-200/60 opacity-70 bg-slate-50'
                                }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg ${member.status ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            {getTeacherName(member).charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight">
                                                {getTeacherName(member)}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]">{getTeacherEmail(member)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem className="font-medium" onClick={() => handleEditClick(member)}>
                                                <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-600 font-medium" onClick={() => handleRemoveMember(member.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50/50">
                                        <span className="text-slate-500 font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4" /> Shift
                                        </span>
                                        <Badge variant="secondary" className="uppercase tracking-wider font-bold text-[10px] bg-white border border-slate-200">
                                            {member.shift}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50/50">
                                        <span className="text-slate-500 font-medium flex items-center gap-2">
                                            <Layers className="h-4 w-4" /> Batch
                                        </span>
                                        <span className="font-bold text-slate-700 text-xs">
                                            {getBatchName(member)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50/50">
                                        <span className="text-slate-500 font-medium flex items-center gap-2">
                                            <Shield className="h-4 w-4" /> Status
                                        </span>
                                        <Badge className={`uppercase tracking-wider font-bold text-[10px] border-none ${member.status ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                                            }`}>
                                            {member.status ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredMembers.length === 0 && (
                <div className="py-24 text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 mb-6">
                        <Users className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No Committee Members</h3>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                        {searchQuery ? "No members match your search." : "Get started by adding teachers to the exam committee."}
                    </p>
                </div>
            )}
        </div>
    );
}
