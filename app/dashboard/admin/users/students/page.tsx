"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { studentService, Student, EnrollmentStatus } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { toast } from "sonner";
import { Users, Search, Plus, Eye, Edit, Trash2, Loader2, Filter } from "lucide-react";

const statusColors: Record<EnrollmentStatus, string> = {
    not_enrolled: "bg-gray-500",
    enrolled: "bg-green-500",
    graduated: "bg-blue-500",
    dropped_out: "bg-red-500",
    suspended: "bg-orange-500",
    on_leave: "bg-yellow-500",
    transferred_out: "bg-purple-500",
    transferred_in: "bg-indigo-500",
};

const statusLabels: Record<EnrollmentStatus, string> = {
    not_enrolled: "Not Enrolled",
    enrolled: "Enrolled",
    graduated: "Graduated",
    dropped_out: "Dropped Out",
    suspended: "Suspended",
    on_leave: "On Leave",
    transferred_out: "Transferred Out",
    transferred_in: "Transferred In",
};

export default function StudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState<{
        page: number;
        limit: number;
        total: number;
    } | null>(null);
    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedStudents, setDeletedStudents] = useState<Student[]>([]);

    // Filters
    const [departmentId, setDepartmentId] = useState<string>("all");
    const [programId, setProgramId] = useState<string>("all");
    const [batchId, setBatchId] = useState<string>("all");
    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!showDeleted) {
            fetchStudents();
        } else {
            fetchDeleted();
        }
    }, [showDeleted, departmentId, programId, batchId]);

    const fetchInitialData = async () => {
        try {
            const [depts, progs, batchesData] = await Promise.all([
                departmentService.getAllDepartments(),
                programService.getAllPrograms(),
                batchService.getAllBatches(),
            ]);
            setDepartments(Array.isArray(depts) ? depts : []);
            setPrograms(Array.isArray(progs) ? progs : []);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
        } catch (error) {
            console.error("Failed to load filter options", error);
        }
    };

    const fetchStudents = async (searchTerm = search) => {
        setIsLoading(true);
        try {
            const params: any = { search: searchTerm, limit: 50 };
            if (departmentId !== "all") params.departmentId = departmentId;
            if (programId !== "all") params.programId = programId;
            if (batchId !== "all") params.batchId = batchId;

            const data = await studentService.getAll(params);
            setStudents(data.students);
            setPagination(data.pagination || null);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to load students"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDeleted = async () => {
        setIsLoading(true);
        try {
            const list = await studentService.getDeleted();
            setDeletedStudents(list);
        } catch (e) {
            const error = e as Error;
            toast.error(error?.message || "Failed to load deleted students");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchStudents(search);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await studentService.delete(id);
            toast.success("Student deleted successfully");
            fetchStudents(search);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete student"
            );
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await studentService.restore(id);
            toast.success("Student restored");
            fetchDeleted();
            fetchStudents(search); // Refresh main list too
        } catch (e) {
            const error = e as Error;
            toast.error(error?.message || "Restore failed");
        }
    };

    const handlePermanentDelete = async (id: string, name: string) => {
        if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
        try {
            await studentService.deletePermanently(id);
            toast.success("Student permanently deleted");
            fetchDeleted();
        } catch (e) {
            const error = e as Error;
            toast.error(error?.message || "Permanent delete failed");
        }
    };

    if (isLoading && students.length === 0 && !showDeleted) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Student Management"
                    subtitle="Manage student enrollments and profiles"
                    icon={Users}
                    actionLabel="Add New Student"
                    onAction={() => router.push("/dashboard/admin/users/students/create")}
                />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button
                            variant={showDeleted ? "default" : "outline"}
                            onClick={() => setShowDeleted((v) => !v)}
                            className={
                                showDeleted
                                    ? "bg-[#588157] text-white"
                                    : "border-[#a3b18a] text-[#344e41]"
                            }
                        >
                            {showDeleted ? "Showing Deleted" : "Show Deleted"}
                        </Button>
                    </div>

                    {!showDeleted && (
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <Select value={departmentId} onValueChange={setDepartmentId}>
                                <SelectTrigger className="w-[180px] bg-white border-[#a3b18a]/60">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id || d._id} value={d.id || d._id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={programId} onValueChange={setProgramId}>
                                <SelectTrigger className="w-[180px] bg-white border-[#a3b18a]/60">
                                    <SelectValue placeholder="Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {programs.map((p) => (
                                        <SelectItem key={p.id || p._id} value={p.id || p._id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={batchId} onValueChange={setBatchId}>
                                <SelectTrigger className="w-[180px] bg-white border-[#a3b18a]/60">
                                    <SelectValue placeholder="Batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Batches</SelectItem>
                                    {batches.map((b) => (
                                        <SelectItem key={b.id || b._id} value={b.id || b._id}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {!showDeleted && (
                    <Card className="border-[#a3b18a]/30">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        placeholder="Search students..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {students.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 mx-auto text-[#a3b18a] mb-4" />
                                    <p className="text-[#344e41]/60">No students found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#dad7cd]/40">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                                                    Name
                                                </th>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                                                    Reg. No
                                                </th>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                                                    Department
                                                </th>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                                                    Batch
                                                </th>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                                                    Status
                                                </th>
                                                <th className="text-right p-4 text-sm font-semibold text-[#344e41]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    className="border-b border-[#a3b18a]/20 hover:bg-[#dad7cd]/20 transition-colors"
                                                >
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-medium text-[#344e41]">
                                                                {student.fullName}
                                                            </p>
                                                            <p className="text-xs text-[#344e41]/60">{student.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-[#344e41]/80 font-mono">
                                                        {student.registrationNumber}
                                                    </td>
                                                    <td className="p-4 text-sm text-[#344e41]/80">
                                                        {departments.find(d => (d.id || d._id) === student.departmentId)?.name || student.department?.name || student.departmentId}
                                                    </td>
                                                    <td className="p-4 text-sm text-[#344e41]/80">
                                                        {batches.find(b => (b.id || b._id) === student.batchId)?.name || student.batch?.name || student.batchId}
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge
                                                            className={`${statusColors[student.enrollmentStatus] || "bg-gray-500"
                                                                } text-white`}
                                                        >
                                                            {statusLabels[student.enrollmentStatus] || student.enrollmentStatus}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/dashboard/admin/users/students/${student.id}`
                                                                    )
                                                                }
                                                                className="text-[#588157] hover:text-[#3a5a40] hover:bg-[#588157]/10"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/dashboard/admin/users/students/${student.id}/edit`
                                                                    )
                                                                }
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(student.id, student.fullName)
                                                                }
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {pagination && pagination.total > 0 && (
                                <div className="mt-6 flex items-center justify-between text-sm text-[#344e41]/60">
                                    <p>
                                        Showing {students.length} of {pagination.total} students
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {showDeleted && (
                    <Card className="border-[#a3b18a]/30">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-[#344e41] mb-4">
                                Deleted Students
                            </h2>
                            {deletedStudents.length === 0 ? (
                                <p className="text-sm text-[#344e41]/60">No deleted students.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#dad7cd]/40">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                                                    Name
                                                </th>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                                                    Reg. No
                                                </th>
                                                <th className="text-right p-4 text-sm font-semibold text-[#344e41]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deletedStudents.map((s) => (
                                                <tr
                                                    key={s.id}
                                                    className="border-b border-[#a3b18a]/20 hover:bg-[#dad7cd]/20 transition-colors"
                                                >
                                                    <td className="p-4">
                                                        <p className="font-medium text-[#344e41]">
                                                            {s.fullName}
                                                        </p>
                                                        <p className="text-xs text-[#344e41]/60">{s.email}</p>
                                                    </td>
                                                    <td className="p-4 text-sm text-[#344e41]/80 font-mono">
                                                        {s.registrationNumber}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRestore(s.id)}
                                                                className="border-[#588157] text-[#588157]"
                                                            >
                                                                Restore
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handlePermanentDelete(s.id, s.fullName)
                                                                }
                                                                className="border-red-500 text-red-600"
                                                            >
                                                                Delete Permanently
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
