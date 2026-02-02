"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Student,
    EnrollmentStatus
} from "@/services/user/student.service";
import {
    Search,
    Mail,
    Plus,
    Hash,
    Eye,
    Edit,
    Trash2,
    RotateCcw,
    XCircle,
    GraduationCap,
    Filter,
    User as UserIcon,
    ChevronDown,
    Building2,
    BookOpen,
    Layers,
    Ban,
    Unlock
} from "lucide-react";
import { adminService } from "@/services/user/admin.service";
import { getImageUrl, cn } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import { deleteStudentAction, restoreStudentAction, permanentDeleteStudentAction } from "../actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface StudentManagementClientProps {
    initialStudents: Student[];
    deletedStudents: Student[];
    departments: any[];
    programs: any[];
    batches: any[];
    sessions: any[];
}

const statusColors: Record<EnrollmentStatus, string> = {
    not_enrolled: "bg-slate-100 text-slate-600",
    enrolled: "bg-emerald-100 text-emerald-700",
    graduated: "bg-blue-100 text-blue-700",
    dropped_out: "bg-red-100 text-red-700",
    suspended: "bg-amber-100 text-amber-700",
    on_leave: "bg-orange-100 text-orange-700",
    transferred_out: "bg-purple-100 text-purple-700",
    transferred_in: "bg-indigo-100 text-indigo-700",
};

export function StudentManagementClient({
    initialStudents,
    deletedStudents: initialDeletedStudents,
    departments,
    programs,
    batches,
    sessions
}: StudentManagementClientProps) {
    const router = useRouter();
    const [students, setStudents] = useState(initialStudents);
    const [deletedStudents, setDeletedStudents] = useState(initialDeletedStudents);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("active");

    // Filters
    const [deptFilter, setDeptFilter] = useState("all");
    const [progFilter, setProgFilter] = useState("all");
    const [batchFilter, setBatchFilter] = useState("all");
    const [shiftFilter, setShiftFilter] = useState("all");

    const handleDelete = async (student: Student) => {
        if (!confirm(`Are you sure you want to suspend ${student.fullName}?`)) return;
        try {
            const result = await deleteStudentAction(student.id, null, new FormData());
            if (result.success) {
                setStudents(students.filter(s => s.id !== student.id));
                setDeletedStudents([...deletedStudents, student]);
                notifySuccess(`${student.fullName} has been suspended`);
            } else {
                notifyError(result.message || "Deactivation failed");
            }
        } catch (error) {
            notifyError("An error occurred during suspension");
        }
    };

    const handleRestore = async (student: Student) => {
        try {
            const result = await restoreStudentAction(student.id, null, new FormData());
            if (result.success) {
                setDeletedStudents(deletedStudents.filter(s => s.id !== student.id));
                setStudents([...students, student]);
                notifySuccess(`Student ${student.fullName} access restored`);
            } else {
                notifyError(result.message || "Restoration failure");
            }
        } catch (error) {
            notifyError("Restoration failed");
        }
    };

    const handlePermanentDelete = async (student: Student) => {
        if (!confirm(`Are you sure you want to permanently delete ${student.fullName}? This cannot be undone.`)) return;
        try {
            const result = await permanentDeleteStudentAction(student.id, null, new FormData());
            if (result.success) {
                setDeletedStudents(deletedStudents.filter(s => s.id !== student.id));
                notifySuccess(`${student.fullName} deleted permanently`);
            } else {
                notifyError(result.message || "Deletion failed");
            }
        } catch (error) {
            notifyError("A critical error occurred");
        }
    };

    const handleBlock = async (student: Student) => {
        const reason = window.prompt(`Enter block reason for ${student.fullName}:`);
        if (reason === null) return;
        if (!reason.trim()) {
            notifyError("Reason is required to block a user");
            return;
        }

        try {
            await adminService.blockUser("student", student.id, reason);
            notifySuccess(`${student.fullName} blocked successfully`);
            setStudents(students.map(s => s.id === student.id ? { ...s, isBlocked: true } : s));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to block student");
        }
    };

    const handleUnblock = async (student: Student) => {
        if (!confirm(`Are you sure you want to unblock ${student.fullName}?`)) return;
        try {
            await adminService.unblockUser("student", student.id);
            notifySuccess(`${student.fullName} unblocked successfully`);
            setStudents(students.map(s => s.id === student.id ? { ...s, isBlocked: false } : s));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to unblock student");
        }
    };

    const filteredStudents = (activeTab === "active" ? students : deletedStudents).filter(s => {
        const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter === "all" || s.departmentId === deptFilter;
        const matchesProg = progFilter === "all" || s.programId === progFilter;
        const matchesBatch = batchFilter === "all" || s.batchId === batchFilter;

        let matchesShift = true;
        if (shiftFilter !== "all") {
            const shift = batches.find(b => (b.id || b._id) === s.batchId)?.shift;
            matchesShift = String(shift || "").toLowerCase() === shiftFilter;
        }

        return matchesSearch && matchesDept && matchesProg && matchesBatch && matchesShift;
    });

    const getBatchLabel = (bId: string) => {
        const b = batches.find(x => (x.id || x._id) === bId);
        if (!b) return "N/A";
        const shift = String(b.shift || "").toLowerCase();
        const prefix = shift === "evening" ? "E" : "D";
        return `${prefix}-${b.name || b.code}`;
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-2 sm:mb-4 w-fit shadow-sm">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#92400E]">Overview</span>
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">Student Management</h1>
                </div>
                <Button
                    onClick={() => router.push("/dashboard/moderator/users/students/create")}
                    className="h-12 md:h-14 px-6 md:px-8 rounded-[2rem] bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Add Student</span>
                </Button>
            </div>

            <Tabs defaultValue="active" onValueChange={setActiveTab} className="bg-white border-2 border-slate-100 rounded-3xl md:rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="bg-slate-50 px-6 py-6 md:px-10 md:py-8 border-b border-slate-100 flex flex-col lg:flex-row gap-6 md:gap-8 lg:items-center justify-between">
                    <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl h-auto self-start">
                        <TabsTrigger value="active" className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg transition-all">Active Students</TabsTrigger>
                        <TabsTrigger value="suspended" className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-lg transition-all">Suspended</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 flex flex-wrap items-center gap-4 max-w-4xl">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search student by name or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-12 pl-14 pr-6 rounded-2xl bg-white border-2 border-slate-100 font-bold text-slate-900 text-sm focus:ring-amber-500/20 transition-all shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                            <FilterWrapper label="Dept">
                                <SearchableSelect
                                    options={[{ label: "All Depts", value: "all" }, ...departments.map(d => ({ label: d.name, value: d.id || d._id }))]}
                                    value={deptFilter}
                                    onChange={setDeptFilter}
                                    placeholder="Dept"
                                />
                            </FilterWrapper>
                            <FilterWrapper label="Prog">
                                <SearchableSelect
                                    options={[{ label: "All Progs", value: "all" }, ...programs.map(p => ({ label: p.name, value: p.id || p._id }))]}
                                    value={progFilter}
                                    onChange={setProgFilter}
                                    placeholder="Prog"
                                />
                            </FilterWrapper>
                            <FilterWrapper label="Shift">
                                <SearchableSelect
                                    options={[{ label: "All Shifts", value: "all" }, { label: "Day", value: "day" }, { label: "Evening", value: "evening" }]}
                                    value={shiftFilter}
                                    onChange={setShiftFilter}
                                    placeholder="Shift"
                                />
                            </FilterWrapper>
                            <FilterWrapper label="Batch">
                                <SearchableSelect
                                    options={[{ label: "All Batches", value: "all" }, ...batches.map(b => ({ label: getBatchLabel(b.id || b._id), value: b.id || b._id }))]}
                                    value={batchFilter}
                                    onChange={setBatchFilter}
                                    placeholder="Batch"
                                />
                            </FilterWrapper>
                        </div>
                    </div>
                </div>

                <div className="p-2 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="px-4 py-4 md:px-8 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Name</TableHead>
                                <TableHead className="px-4 py-4 md:px-8 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registration ID</TableHead>
                                <TableHead className="px-4 py-4 md:px-8 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Academic Info</TableHead>
                                <TableHead className="px-4 py-4 md:px-8 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                                <TableHead className="px-4 py-4 md:px-8 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredStudents.map((s) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={s.id}
                                        className="group border-b border-slate-50 last:border-none hover:bg-amber-50/30 transition-colors"
                                    >
                                        <TableCell className="px-4 py-4 md:px-8 md:py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-100 group-hover:border-amber-200 transition-all shadow-sm">
                                                    {s.profile?.profilePicture ? (
                                                        <img
                                                            src={getImageUrl(s.profile.profilePicture)}
                                                            alt={s.fullName}
                                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center font-black text-slate-400 group-hover:text-amber-600 transition-colors">
                                                            {s.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex flex-col">
                                                        <p className="font-black text-slate-900 tracking-tight leading-none mb-1.5 group-hover:text-amber-700 transition-colors">{s.fullName}</p>
                                                        {s.isBlocked && (
                                                            <Badge variant="destructive" className="w-fit h-4 text-[9px] px-1.5 uppercase font-black animate-pulse bg-red-600 text-white border-none">
                                                                Blocked
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 italic">
                                                        <Mail className="w-3 h-3" />
                                                        {s.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 md:px-8 md:py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-3 h-3 text-amber-500" />
                                                    <span className="font-black text-xs text-slate-900 tracking-wider">ID: {s.registrationNumber}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-3 h-3 text-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getBatchLabel(s.batchId)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 md:px-8 md:py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate max-w-[150px]">
                                                        {departments.find(d => (d.id || d._id) === s.departmentId)?.name || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-3 h-3 text-slate-300" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">
                                                        {programs.find(p => (p.id || p._id) === s.programId)?.name || "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 md:px-8 md:py-6">
                                            <Badge className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.15em] border-none shadow-sm ${statusColors[s.enrollmentStatus]}`}>
                                                {s.enrollmentStatus.replace(/_/g, " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            {activeTab === "active" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/moderator/users/students/${s.id}`)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-amber-600 hover:shadow-md active:scale-95 transition-all">
                                                        <Eye className="w-4.5 h-4.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/moderator/users/students/${s.id}/edit`)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-blue-600 hover:shadow-md active:scale-95 transition-all">
                                                        <Edit className="w-4.5 h-4.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => s.isBlocked ? handleUnblock(s) : handleBlock(s)}
                                                        className={cn(
                                                            "h-10 w-10 rounded-xl hover:bg-white hover:shadow-md active:scale-95 transition-all",
                                                            s.isBlocked ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"
                                                        )}
                                                        title={s.isBlocked ? "Unblock Student" : "Block Student"}
                                                    >
                                                        {s.isBlocked ? <Unlock className="w-4.5 h-4.5" /> : <Ban className="w-4.5 h-4.5" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-md active:scale-95 transition-all">
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleRestore(s)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-emerald-600 hover:shadow-md active:scale-95 transition-all" title="Restore">
                                                        <RotateCcw className="w-4.5 h-4.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handlePermanentDelete(s)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-red-700 hover:shadow-md active:scale-95 transition-all" title="Purge Record">
                                                        <XCircle className="w-4.5 h-4.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                    {filteredStudents.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center gap-4">
                            <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                <GraduationCap className="w-12 h-12" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-900 tracking-tight">No students found</p>
                                <p className="text-xs font-bold text-slate-400 italic">Adjust your filters to see more students.</p>
                            </div>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}

function FilterWrapper({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</p>
            {children}
        </div>
    )
}
