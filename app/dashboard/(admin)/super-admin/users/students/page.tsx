"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  studentService,
  Student,
  EnrollmentStatus,
} from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { adminService } from "@/services/user/admin.service";
import { Department, Program, Batch } from "@/services/academic/types";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  UserX,
  Ban,
  Unlock
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/searchable-select";

const statusColors: Record<EnrollmentStatus, string> = {
  not_enrolled: "bg-slate-500",
  enrolled: "bg-green-600",
  graduated: "bg-blue-600",
  dropped_out: "bg-red-600",
  suspended: "bg-orange-600",
  on_leave: "bg-yellow-600",
  transferred_out: "bg-purple-600",
  transferred_in: "bg-indigo-600",
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
  const [shift, setShift] = useState<string>("all");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const getBatchLabel = (b: Batch | null | undefined) => {
    if (!b) return "N/A";
    if (b.code) return String(b.code);
    const name = String(b.name || "");
    const s = String(b.shift || "").toLowerCase();
    const prefix = s === "evening" ? "E" : "D";
    return `${prefix}-${name}`;
  };

  const fetchInitialData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchStudents = useCallback(async (searchTerm = search) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { search: searchTerm, limit: 50 };
      if (departmentId !== "all") params.departmentId = departmentId;
      if (programId !== "all") params.programId = programId;
      if (batchId !== "all") params.batchId = batchId;
      if (shift !== "all") params.shift = shift;

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
  }, [departmentId, programId, batchId, shift, search]);

  const fetchDeleted = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!showDeleted) {
      fetchStudents();
    } else {
      fetchDeleted();
    }
  }, [fetchStudents, fetchDeleted, showDeleted]);

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
      fetchStudents(search);
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

  const handleBlock = async (id: string, name: string) => {
    const reason = window.prompt(`Enter block reason for ${name}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error("Reason is required to block a user");
      return;
    }

    try {
      await adminService.blockUser("student", id, reason);
      toast.success(`${name} blocked successfully`);
      fetchStudents(search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to block student");
    }
  };

  const handleUnblock = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to unblock ${name}?`)) return;
    try {
      await adminService.unblockUser("student", id);
      toast.success(`${name} unblocked successfully`);
      fetchStudents(search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unblock student");
    }
  };

  const getStatusStats = () => {
    const stats: Record<string, number> = {};
    students.forEach(s => {
      if (s.enrollmentStatus) {
        stats[s.enrollmentStatus] = (stats[s.enrollmentStatus] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <PageHeader
        title="Student Management"
        subtitle="Manage student enrollments, profiles, and academic records"
        icon={GraduationCap}
        actionLabel="Add New Student"
        onAction={() => router.push("/dashboard/super-admin/users/students/create")}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={pagination?.total || students.length}
          icon={Users}
          className="border-l-4 border-l-green-500"
          iconClassName="text-green-500"
          iconBgClassName="bg-green-500/10"
          loading={isLoading}
        />
        {getStatusStats().map(([status, count], index) => (
          <StatsCard
            key={status}
            title={statusLabels[status as EnrollmentStatus]}
            value={count}
            icon={status === "enrolled" ? UserCheck : UserX}
            className={cn(
              "border-l-4",
              index === 0 ? "border-l-blue-500" :
                index === 1 ? "border-l-purple-500" :
                  "border-l-orange-500"
            )}
            iconClassName={cn(
              index === 0 ? "text-blue-500" :
                index === 1 ? "text-purple-500" :
                  "text-orange-500"
            )}
            iconBgClassName={cn(
              index === 0 ? "bg-blue-500/10" :
                index === 1 ? "bg-purple-500/10" :
                  "bg-orange-500/10"
            )}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Filters and Actions */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={showDeleted ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDeleted((v) => !v)}
                className={cn(
                  showDeleted
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                )}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {showDeleted ? "Showing Deleted" : "Show Deleted"}
              </Button>
            </div>

            {!showDeleted && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-[160px]">
                  <SearchableSelect
                    options={[
                      { label: "All Departments", value: "all" },

                      ...departments.map((d) => ({
                        label: d.name,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value: (d as any).id || (d as any)._id,
                      })),
                    ]}
                    value={departmentId}
                    onChange={(v) => {
                      setDepartmentId(v);
                      setBatchId("all");
                    }}
                    placeholder="Department"
                  />
                </div>

                <div className="w-[160px]">
                  <SearchableSelect
                    options={[
                      { label: "All Programs", value: "all" },

                      ...programs.map((p) => ({
                        label: p.name,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value: (p as any).id || (p as any)._id,
                      })),
                    ]}
                    value={programId}
                    onChange={(v) => {
                      setProgramId(v);
                      setBatchId("all");
                    }}
                    placeholder="Program"
                  />
                </div>

                <div className="w-[140px]">
                  <SearchableSelect
                    options={[
                      { label: "All Shifts", value: "all" },
                      { label: "Day", value: "day" },
                      { label: "Evening", value: "evening" },
                    ]}
                    value={shift}
                    onChange={(v) => {
                      setShift(v);
                      setBatchId("all");
                    }}
                    placeholder="Shift"
                  />
                </div>

                <div className="w-[140px]">
                  <SearchableSelect
                    options={[
                      { label: "All Batches", value: "all" },
                      ...batches
                        .filter((b) => {
                          if (shift === "all") return true;
                          return String(b.shift || "").toLowerCase() === shift;
                        })

                        .map((b) => ({
                          label: getBatchLabel(b),
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          value: (b as any).id || (b as any)._id,
                        })),
                    ]}
                    value={batchId}
                    onChange={setBatchId}
                    placeholder="Batch"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStudents(search)}
                  disabled={isLoading}
                  className="border-slate-200 dark:border-slate-700"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {!showDeleted ? (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search students by name or registration number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => router.push("/dashboard/super-admin/users/students/create")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Reg. No</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Department</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Batch</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Status</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                              {student.profile?.profilePicture ? (
                                <img
                                  src={getImageUrl(student.profile.profilePicture)}
                                  alt={student.fullName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "";
                                    (e.target as HTMLImageElement).style.display = "none";
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                    {student.fullName.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{student.fullName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {student.registrationNumber}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {departments.find((d) => ((d as any).id || (d as any)._id) === student.departmentId)?.name ||
                            student.department?.name ||
                            student.departmentId}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          { }
                          {(() => {
                            const fromList = batches.find((b) => ((b as any).id || (b as any)._id) === student.batchId);
                            if (fromList) return getBatchLabel(fromList);
                            if (student.batch) return getBatchLabel(student.batch);
                            return student.batchId;
                          })()}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <Badge className={`${statusColors[student.enrollmentStatus]} text-white`}>
                              {statusLabels[student.enrollmentStatus]}
                            </Badge>
                            {student.isBlocked && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Ban className="h-3 w-3" />
                                Blocked
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/super-admin/users/students/${student.id}`)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/super-admin/users/students/${student.id}/edit`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => student.isBlocked
                                ? handleUnblock(student.id, student.fullName)
                                : handleBlock(student.id, student.fullName)
                              }
                              className={cn(
                                student.isBlocked
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              )}
                              title={student.isBlocked ? "Unblock Student" : "Block Student"}
                            >
                              {student.isBlocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(student.id, student.fullName)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.total > 0 && (
              <div className="mt-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <p>Showing {students.length} of {pagination.total} students</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Deleted Students</CardTitle>
            </div>
            <CardDescription>
              Manage deleted student accounts. You can restore or permanently delete them.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {deletedStudents.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No deleted students found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Reg. No</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deletedStudents.map((s) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{s.fullName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{s.email}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {s.registrationNumber}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(s.id)}
                              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePermanentDelete(s.id, s.fullName)}
                              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
