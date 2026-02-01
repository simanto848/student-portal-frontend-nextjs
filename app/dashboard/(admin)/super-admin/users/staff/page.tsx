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
import { staffService, Staff, StaffRole } from "@/services/user/staff.service";
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
  Building2
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

const roleLabel: Record<StaffRole, string> = {
  program_controller: "Program Controller",
  admission: "Admission",
  library: "Library",
  it: "IT",
  exam_controller: "Exam Controller",
};

const roleColor: Record<StaffRole, string> = {
  program_controller: "bg-purple-600",
  admission: "bg-blue-600",
  library: "bg-green-600",
  it: "bg-cyan-600",
  exam_controller: "bg-violet-600",
};



export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedStaff, setDeletedStaff] = useState<Staff[]>([]);

  const fetchStaff = useCallback(async (searchTerm = "") => {
    setIsLoading(true);
    try {
      const data = await staffService.getAll({ search: searchTerm, limit: 50 });
      setStaff(data.staff);
      setPagination(data.pagination || null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load staff"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDeleted = useCallback(async () => {
    try {
      const list = await staffService.getDeleted();
      setDeletedStaff(list);
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to load deleted staff");
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    if (showDeleted) fetchDeleted();
  }, [fetchStaff, fetchDeleted, showDeleted]);

  const handleSearch = () => {
    fetchStaff(search);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await staffService.delete(id);
      toast.success("Staff deleted successfully");
      fetchStaff(search);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete staff"
      );
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await staffService.restore(id);
      toast.success("Staff restored");
      fetchDeleted();
      fetchStaff(search);
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Restore failed");
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await staffService.deletePermanently(id);
      toast.success("Staff permanently deleted");
      fetchDeleted();
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Permanent delete failed");
    }
  };

  const getRoleStats = () => {
    const stats: Record<string, number> = {};
    staff.forEach(s => {
      if (s.role) {
        stats[s.role] = (stats[s.role] || 0) + 1;
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
        title="Staff Management"
        subtitle="Manage administrative and support staff members"
        icon={Building2}
        actionLabel="Add New Staff"
        onAction={() => router.push("/dashboard/super-admin/users/staff/create")}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Staff"
          value={pagination?.total || staff.length}
          icon={Users}
          className="border-l-4 border-l-orange-500"
          iconClassName="text-orange-500"
          iconBgClassName="bg-orange-500/10"
          loading={isLoading}
        />
        {getRoleStats().map(([role, count], index) => (
          <StatsCard
            key={role}
            title={roleLabel[role as StaffRole]}
            value={count}
            icon={Building2}
            className={cn(
              "border-l-4",
              index === 0 ? "border-l-purple-500" :
              index === 1 ? "border-l-blue-500" :
              "border-l-green-500"
            )}
            iconClassName={cn(
              index === 0 ? "text-purple-500" :
              index === 1 ? "text-blue-500" :
              "text-green-500"
            )}
            iconBgClassName={cn(
              index === 0 ? "bg-purple-500/10" :
              index === 1 ? "bg-blue-500/10" :
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
                  onClick={() => fetchStaff(search)}
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
                    placeholder="Search staff by name or email..."
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
                onClick={() => router.push("/dashboard/super-admin/users/staff/create")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>

            {staff.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No staff found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Role</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Department</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Reg. No.</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {staff.map((member, index) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                              {member.profile?.profilePicture ? (
                                <img
                                  src={getImageUrl(member.profile.profilePicture)}
                                  alt={member.fullName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerText = member.fullName.charAt(0);
                                  }}
                                />
                              ) : (
                                <span className="text-slate-600 dark:text-slate-400 font-semibold">{member.fullName.charAt(0)}</span>
                              )}
                            </div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{member.fullName}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{member.email}</td>
                        <td className="p-4">
                          {member.role && (
                            <Badge className={`${roleColor[member.role]} text-white`}>
                              {roleLabel[member.role]}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {member.department?.name || member.departmentId}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {member.registrationNumber}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/super-admin/users/staff/${member.id}`)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/super-admin/users/staff/${member.id}/edit`)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(member.id, member.fullName)}
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
                <p>Showing {staff.length} of {pagination.total} staff members</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Deleted Staff</CardTitle>
            </div>
            <CardDescription>
              Manage deleted staff accounts. You can restore or permanently delete them.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {deletedStaff.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No deleted staff found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Name</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Email</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Role</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Department</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deletedStaff.map((s) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{s.fullName}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{s.email}</td>
                        <td className="p-4">
                          {s.role && (
                            <Badge className="bg-slate-600 text-white">
                              {roleLabel[s.role]}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {s.department?.name || s.departmentId}
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
