"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    EnrollmentStatus,
    studentService
} from "@/services/user/student.service";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
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
    User as UserIcon,
    Building2,
    BookOpen,
    Layers,
    Ban,
    Unlock
} from "lucide-react";
import { adminService } from "@/services/user/admin.service";
import { getImageUrl, cn } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { deleteStudentAction, restoreStudentAction, permanentDeleteStudentAction } from "../actions";
import { SearchableSelect } from "@/components/ui/searchable-select";

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

interface StudentManagementClientProps {
    initialStudents: Student[];
    deletedStudents: Student[];
    departments: any[];
    programs: any[];
    batches: any[];
    sessions: any[];
}



export function StudentManagementClient({
    initialStudents,
    deletedStudents: initialDeletedStudents,
    departments,
    programs,
    batches,
    sessions
}: StudentManagementClientProps) {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [deletedStudents, setDeletedStudents] = useState<Student[]>(initialDeletedStudents);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("active");

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    // Filters
    const [deptFilter, setDeptFilter] = useState("all");
    const [progFilter, setProgFilter] = useState("all");
    const [batchFilter, setBatchFilter] = useState("all");
    const [shiftFilter, setShiftFilter] = useState("all");

    const fetchStudents = async (currPage: number, reset: boolean = false) => {
        if (activeTab !== "active") return;

        setLoading(true);
        try {
            const params: any = {
                page: currPage,
                limit: 10,
                search: searchTerm,
            };

            if (deptFilter !== "all") params.departmentId = deptFilter;
            if (progFilter !== "all") params.programId = progFilter;
            if (batchFilter !== "all") params.batchId = batchFilter;
            if (shiftFilter !== "all") params.shift = shiftFilter;

            const res = await studentService.getAll(params);
            if (reset) {
                setStudents(res.students);
            } else {
                setStudents(prev => {
                    const existingIds = new Set(prev.map(s => s.id));
                    const newStudents = res.students.filter(s => !existingIds.has(s.id));
                    return [...prev, ...newStudents];
                });
            }

            setHasMore(res.students.length === 10);
        } catch (error) {
            notifyError("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = useCallback(debounce(() => {
        setPage(1);
        setHasMore(true);
        fetchStudents(1, true);
    }, 500), [searchTerm, deptFilter, progFilter, batchFilter, shiftFilter, activeTab]);

    useEffect(() => {
        if (activeTab === "active") {
            handleFilterChange();
        }
        return () => {
            handleFilterChange.cancel();
        }
    }, [searchTerm, deptFilter, progFilter, batchFilter, shiftFilter, activeTab, handleFilterChange]);

    const lastStudentElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchStudents(nextPage, false);
                    return nextPage;
                });
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

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

    const filteredStudents = activeTab === "active"
        ? students
        : deletedStudents.filter(s => {
            const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

    const getBatchLabel = (bId: string) => {
        const b = batches.find(x => (x.id || x._id) === bId);
        if (!b) return "N/A";
        const shift = String(b.shift || "").toLowerCase();
        const prefix = shift === "evening" ? "E" : "D";
        return `${prefix}-${b.name || b.code}`;
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-2 w-fit shadow-sm">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400E]">Overview</span>
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Student Management</h1>
                </div>
                <Button
                    onClick={() => router.push("/dashboard/admin/users/students/create")}
                    className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-amber-600 text-white shadow-sm font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Student</span>
                </Button>
            </div>

            <Tabs defaultValue="active" onValueChange={setActiveTab} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-4 py-4 md:px-6 md:py-5 border-b border-slate-200 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <TabsList className="bg-slate-100 p-1 rounded-lg h-auto flex w-full sm:w-auto">
                        <TabsTrigger value="active" className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all text-center">Active Students</TabsTrigger>
                        <TabsTrigger value="suspended" className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all text-center">Suspended</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 flex flex-wrap items-center gap-3 max-w-4xl">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search student by name or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-10 pl-9 pr-4 rounded-lg bg-white border border-slate-200 text-sm focus:ring-1 focus:ring-amber-500/20 transition-all shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
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

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-slate-200 bg-slate-50/50">
                                <TableHead className="px-4 py-3 text-xs font-medium text-slate-500">Student Name</TableHead>
                                <TableHead className="px-4 py-3 text-xs font-medium text-slate-500">Registration ID</TableHead>
                                <TableHead className="px-4 py-3 text-xs font-medium text-slate-500">Academic Info</TableHead>
                                <TableHead className="px-4 py-3 text-xs font-medium text-slate-500">Status</TableHead>
                                <TableHead className="px-4 py-3 text-xs font-medium text-slate-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((s, index) => {
                                const isLast = index === filteredStudents.length - 1;
                                return (
                                    <TableRow
                                        key={s.id}
                                        className="group border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors"
                                    >
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    {s.profile?.profilePicture ? (
                                                        <img
                                                            src={getImageUrl(s.profile.profilePicture)}
                                                            alt={s.fullName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center font-medium text-slate-400">
                                                            {s.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="font-medium text-sm text-slate-900">{s.fullName}</p>
                                                        {s.isBlocked && (
                                                            <Badge variant="destructive" className="h-4 text-[10px] px-1.5 bg-red-100 text-red-700 border-none">
                                                                Blocked
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {s.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-medium text-sm text-slate-900">{s.registrationNumber}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs text-slate-500">{getBatchLabel(s.batchId)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs text-slate-700 truncate max-w-[150px]">
                                                        {departments.find(d => (d.id || d._id) === s.departmentId)?.name || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs text-slate-500 truncate max-w-[150px]">
                                                        {programs.find(p => (p.id || p._id) === s.programId)?.name || "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge className={`px-2 py-0.5 rounded-md font-medium text-xs border-none ${statusColors[s.enrollmentStatus]}`}>
                                                {s.enrollmentStatus.replace(/_/g, " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right">
                                            {activeTab === "active" ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/admin/users/students/${s.id}`)} className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/admin/users/students/${s.id}/edit`)} className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => s.isBlocked ? handleUnblock(s) : handleBlock(s)}
                                                        className={cn(
                                                            "h-8 w-8 rounded-md hover:bg-slate-100",
                                                            s.isBlocked ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"
                                                        )}
                                                        title={s.isBlocked ? "Unblock Student" : "Block Student"}
                                                    >
                                                        {s.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleRestore(s)} className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-emerald-600" title="Restore">
                                                        <RotateCcw className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handlePermanentDelete(s)} className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-red-600" title="Purge Record">
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {activeTab === "active" && hasMore && !loading && (
                                <TableRow ref={lastStudentElementRef} className="border-none">
                                    <TableCell colSpan={5} className="h-1 p-0 border-none opacity-0">Loading Marker</TableCell>
                                </TableRow>
                            )}
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                            <span className="text-sm font-medium">Loading more students...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    {filteredStudents.length === 0 && (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <GraduationCap className="w-8 h-8" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-sm font-medium text-slate-900">No students found</p>
                                <p className="text-sm text-slate-500">Adjust your filters to see more students.</p>
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
