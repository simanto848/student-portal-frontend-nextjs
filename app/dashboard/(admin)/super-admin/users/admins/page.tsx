"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import {
  adminService,
  Admin,
  AdminRole,
  AdminStatistics,
} from "@/services/user/admin.service";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  RefreshCw,
  Users,
  Trash2,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

const roleBadge = (role: AdminRole) => {
  const map: Record<
    string,
    { label: string; className: string; Icon: typeof Shield }
  > = {
    super_admin: {
      label: "Super Admin",
      className: "bg-purple-600 hover:bg-purple-700",
      Icon: ShieldCheck,
    },
    admin: { 
      label: "Admin", 
      className: "bg-emerald-600 hover:bg-emerald-700", 
      Icon: Shield 
    },
    moderator: { 
      label: "Moderator", 
      className: "bg-blue-600 hover:bg-blue-700", 
      Icon: Shield 
    },
  };
  const { label, className, Icon } = map[role] || {
    label: role || "Unknown",
    className: "bg-slate-500 hover:bg-slate-600",
    Icon: Shield,
  };
  return (
    <Badge
      className={`${className} text-white flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function AdminManagementPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterRole, setFilterRole] = useState<AdminRole | "all">("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedAdmins, setDeletedAdmins] = useState<Admin[]>([]);

  const columns: Column<Admin>[] = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "fullName",
        cell: (admin) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
              {admin.profile?.profilePicture ? (
                <img
                  src={getImageUrl(admin.profile.profilePicture)}
                  alt={admin.fullName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">
                    {admin.fullName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{admin.fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {admin.registrationNumber}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: (admin) => (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p>{admin.email}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {admin.lastLoginAt
                ? `Last login: ${new Date(admin.lastLoginAt).toLocaleString()}`
                : "No login data"}
            </p>
          </div>
        ),
      },
      {
        header: "Role",
        accessorKey: "role",
        cell: (admin) => roleBadge(admin.role),
      },
      {
        header: "IPs",
        accessorKey: "registeredIpAddress",
        cell: (admin) => (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {admin.registeredIpAddress &&
            admin.registeredIpAddress.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {admin.registeredIpAddress.slice(0, 2).map((ip) => (
                  <Badge
                    key={ip}
                    variant="outline"
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    {ip}
                  </Badge>
                ))}
                {admin.registeredIpAddress.length > 2 && (
                  <Badge
                    variant="outline"
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    +{admin.registeredIpAddress.length - 2} more
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">No IPs</span>
            )}
          </div>
        ),
      },
      {
        header: "Joined",
        accessorKey: "joiningDate",
        cell: (admin) => (
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {admin.joiningDate
              ? new Date(admin.joiningDate).toLocaleDateString()
              : "N/A"}
          </span>
        ),
      },
    ],
    [],
  );

  const filteredAdmins = useMemo(() => {
    if (filterRole === "all") return admins;
    return admins.filter((admin) => admin.role === filterRole);
  }, [admins, filterRole]);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [list, statistics] = await Promise.all([
        adminService.getAll({
          role: filterRole === "all" ? undefined : filterRole,
        }),
        adminService.getStatistics(),
      ]);
      setAdmins(list.admins);
      setStats(statistics);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load admins",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filterRole]);

  useEffect(() => {
    fetchData();
    if (showDeleted) fetchDeleted();
  }, [fetchData, showDeleted]);

  const fetchDeleted = async () => {
    try {
      const list = await adminService.getDeleted();
      setDeletedAdmins(list);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load deleted admins",
      );
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await adminService.restore(id);
      toast.success("Admin restored");
      fetchDeleted();
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed");
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await adminService.deletePermanently(id);
      toast.success("Admin permanently deleted");
      fetchDeleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Permanent delete failed",
      );
    }
  };

  const handleCreate = () => {
    router.push("/dashboard/super-admin/users/admins/create");
  };

  const handleEdit = (admin: Admin) => {
    router.push(`/dashboard/super-admin/users/admins/${admin.id}/edit`);
  };

  const handleDelete = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;
    setIsDeleting(true);
    try {
      await adminService.delete(selectedAdmin.id);
      toast.success("Admin deleted successfully");
      fetchData();
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete admin",
      );
    } finally {
      setIsDeleting(false);
      setSelectedAdmin(null);
    }
  };

  const getRoleStats = () => {
    if (!stats) return [];
    return Object.entries(stats.byRole).map(([role, value]) => ({
      role,
      value,
      label: role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <PageHeader
        title="Admin Management"
        subtitle="Monitor and control administrator accounts with role-based access"
        icon={Shield}
        actionLabel="Add New Admin"
        onAction={handleCreate}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Admins"
          value={stats?.total ?? 0}
          icon={Users}
          className="border-l-4 border-l-indigo-500"
          iconClassName="text-indigo-500"
          iconBgClassName="bg-indigo-500/10"
          loading={isLoading}
        />
        {getRoleStats().map((roleStat, index) => (
          <StatsCard
            key={roleStat.role}
            title={roleStat.label}
            value={roleStat.value}
            icon={Shield}
            className={cn(
              "border-l-4",
              index === 0 ? "border-l-purple-500" :
              index === 1 ? "border-l-emerald-500" :
              "border-l-blue-500"
            )}
            iconClassName={cn(
              index === 0 ? "text-purple-500" :
              index === 1 ? "text-emerald-500" :
              "text-blue-500"
            )}
            iconBgClassName={cn(
              index === 0 ? "bg-purple-500/10" :
              index === 1 ? "bg-emerald-500/10" :
              "bg-blue-500/10"
            )}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Filters and Actions */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {["all", "super_admin", "admin", "moderator"].map((role) => (
                <Button
                  key={role}
                  variant={filterRole === role ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    filterRole === role
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setFilterRole(role as AdminRole | "all")}
                >
                  {role === "all" ? "All Roles" : role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>
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
              {!showDeleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={isRefreshing}
                  className="border-slate-200 dark:border-slate-700"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {!showDeleted ? (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-8 w-8 border-b-2 border-indigo-600"
                />
              </div>
            ) : (
              <DataTable
                data={filteredAdmins}
                columns={columns}
                searchKey="fullName"
                searchPlaceholder="Search admin by name..."
                onView={(item) =>
                  router.push(`/dashboard/super-admin/users/admins/${item.id}`)
                }
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Deleted Admins</CardTitle>
            </div>
            <CardDescription>
              Manage deleted admin accounts. You can restore or permanently delete them.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {deletedAdmins.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No deleted admins found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Name
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Email
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Role
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deletedAdmins.map((admin) => (
                      <motion.tr
                        key={admin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {admin.fullName}
                          </p>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {admin.email}
                        </td>
                        <td className="p-4">{roleBadge(admin.role)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(admin.id)}
                              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePermanentDelete(
                                  admin.id,
                                  admin.fullName,
                                )
                              }
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

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Admin"
        description={`Are you sure you want to delete "${selectedAdmin?.fullName}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
