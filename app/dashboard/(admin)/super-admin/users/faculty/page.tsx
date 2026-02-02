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
import { teacherService, Teacher, TeacherDesignation } from "@/services/user/teacher.service";
import { Pagination } from "@/types/api";
import { toast } from "sonner";
import {
  GraduationCap,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  RotateCcw,
  AlertTriangle,
  BookOpen,
  Ban,
  Unlock
} from "lucide-react";
import { adminService } from "@/services/user/admin.service";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

const designationLabel: Record<TeacherDesignation, string> = {
  professor: "Professor",
  associate_professor: "Associate Professor",
  assistant_professor: "Assistant Professor",
  lecturer: "Lecturer",
  senior_lecturer: "Senior Lecturer",
};

const designationColor: Record<TeacherDesignation, string> = {
  professor: "bg-purple-600",
  associate_professor: "bg-blue-600",
  assistant_professor: "bg-cyan-600",
  lecturer: "bg-green-600",
  senior_lecturer: "bg-teal-600",
};

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedTeachers, setDeletedTeachers] = useState<Teacher[]>([]);

  const fetchTeachers = useCallback(async (searchTerm = "") => {
    setIsLoading(true);
    try {
      const data = await teacherService.getAll({ search: searchTerm, limit: 50 });
      setTeachers(data.teachers);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDeleted = useCallback(async () => {
    try {
      const list = await teacherService.getDeleted();
      setDeletedTeachers(list);
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to load deleted teachers");
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    if (showDeleted) fetchDeleted();
  }, [fetchTeachers, fetchDeleted, showDeleted]);

  const handleSearch = () => {
    fetchTeachers(search);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await teacherService.delete(id);
      toast.success("Teacher deleted successfully");
      fetchTeachers(search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete teacher");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await teacherService.restore(id);
      toast.success("Teacher restored");
      fetchDeleted();
      fetchTeachers(search);
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Restore failed");
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await teacherService.deletePermanently(id);
      toast.success("Teacher permanently deleted");
      fetchDeleted();
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Permanent delete failed");
    }
  };

  const handleBlock = async (teacher: Teacher) => {
    const reason = window.prompt(`Enter block reason for ${teacher.fullName}:`);
    if (reason === null) return;

    try {
      await adminService.blockUser("teacher", teacher.id, reason);
      toast.success(`${teacher.fullName} blocked successfully`);
      fetchTeachers(search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to block teacher");
    }
  };

  const handleUnblock = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to unblock ${teacher.fullName}?`)) return;

    try {
      await adminService.unblockUser("teacher", teacher.id);
      toast.success(`${teacher.fullName} unblocked successfully`);
      fetchTeachers(search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unblock teacher");
    }
  };

  const getDesignationStats = () => {
    const stats: Record<string, number> = {};
    teachers.forEach(t => {
      if (t.designation) {
        stats[t.designation] = (stats[t.designation] || 0) + 1;
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
        title="Faculty Management"
        subtitle="Manage teachers, professors, and academic staff members"
        icon={GraduationCap}
        actionLabel="Add New Teacher"
        onAction={() => router.push("/dashboard/super-admin/users/faculty/create")}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Faculty"
          value={pagination?.total || teachers.length}
          icon={Users}
          className="border-l-4 border-l-blue-500"
          iconClassName="text-blue-500"
          iconBgClassName="bg-blue-500/10"
          loading={isLoading}
        />
        {getDesignationStats().map(([designation, count], index) => (
          <StatsCard
            key={designation}
            title={designationLabel[designation as TeacherDesignation]}
            value={count}
            icon={BookOpen}
            className={cn(
              "border-l-4",
              index === 0 ? "border-l-purple-500" :
                index === 1 ? "border-l-cyan-500" :
                  "border-l-green-500"
            )}
            iconClassName={cn(
              index === 0 ? "text-purple-500" :
                index === 1 ? "text-cyan-500" :
                  "text-green-500"
            )}
            iconBgClassName={cn(
              index === 0 ? "bg-purple-500/10" :
                index === 1 ? "bg-cyan-500/10" :
                  "bg-green-500/10"
            )}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Filters and Actions */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTeachers(search)}
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
                    placeholder="Search teachers by name or email..."
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
                onClick={() => router.push("/dashboard/super-admin/users/faculty/create")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </div>

            {teachers.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No teachers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Designation</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Department</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Reg. No.</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teachers.map((teacher, index) => (
                      <motion.tr
                        key={teacher.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                              {teacher.profile?.profilePicture ? (
                                <img
                                  src={getImageUrl(teacher.profile.profilePicture)}
                                  alt={teacher.fullName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerText = teacher.fullName.charAt(0);
                                  }}
                                />
                              ) : (
                                <span className="text-slate-600 dark:text-slate-400 font-semibold">{teacher.fullName.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <p className="font-medium text-slate-900 dark:text-slate-100">{teacher.fullName}</p>
                              {teacher.isBlocked && (
                                <Badge variant="destructive" className="w-fit h-4 text-[10px] px-1.5 uppercase font-bold animate-pulse">
                                  Blocked
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{teacher.email}</td>
                        <td className="p-4">
                          {teacher.designation && (
                            <Badge className={`${designationColor[teacher.designation]} text-white`}>
                              {designationLabel[teacher.designation]}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {teacher.department?.name || teacher.departmentId}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {teacher.registrationNumber}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/super-admin/users/faculty/${teacher.id}`)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/super-admin/users/faculty/${teacher.id}/edit`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => teacher.isBlocked ? handleUnblock(teacher) : handleBlock(teacher)}
                              className={cn(
                                teacher.isBlocked
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              )}
                              title={teacher.isBlocked ? "Unblock Teacher" : "Block Teacher"}
                            >
                              {teacher.isBlocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(teacher.id, teacher.fullName)}
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
                <p>Showing {teachers.length} of {pagination.total} teachers</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Deleted Teachers</CardTitle>
            </div>
            <CardDescription>
              Manage deleted teacher accounts. You can restore or permanently delete them.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {deletedTeachers.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No deleted teachers found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Designation</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Department</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deletedTeachers.map((t) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{t.fullName}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{t.email}</td>
                        <td className="p-4">
                          {t.designation && (
                            <Badge className="bg-slate-600 text-white">
                              {designationLabel[t.designation]}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {t.department?.name || t.departmentId}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(t.id)}
                              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePermanentDelete(t.id, t.fullName)}
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
