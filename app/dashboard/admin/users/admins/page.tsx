"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { adminService, Admin, AdminRole, AdminStatistics } from "@/services/user/admin.service";
import { toast } from "sonner";
import { Shield, ShieldCheck, UserPlus, RefreshCcw, UserCog, User as UserIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

const roleBadge = (role: AdminRole) => {
    const map: Record<AdminRole, { label: string; className: string; Icon: typeof Shield }> = {
        super_admin: { label: "Super Admin", className: "bg-purple-600", Icon: ShieldCheck },
        admin: { label: "Admin", className: "bg-emerald-600", Icon: Shield },
        moderator: { label: "Moderator", className: "bg-blue-600", Icon: Shield },
    };
    const { label, className, Icon } = map[role];
    return (
        <Badge className={`${className} hover:opacity-90 text-white flex items-center gap-1`}>
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterRole, setFilterRole] = useState<AdminRole | "all">("all");
    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedAdmins, setDeletedAdmins] = useState<Admin[]>([]);

    const columns: Column<Admin>[] = useMemo(() => [
        {
            header: "Name",
            accessorKey: "fullName",
            cell: (admin) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#dad7cd]/50 overflow-hidden flex-shrink-0 border border-[#a3b18a]/30">
                        {admin.profile?.profilePicture ? (
                            <img
                                src={getImageUrl(admin.profile.profilePicture)}
                                alt={admin.fullName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '';
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <span className="text-[#344e41] font-semibold">{admin.fullName.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-[#344e41]">{admin.fullName}</p>
                        <p className="text-xs text-[#344e41]/60">{admin.registrationNumber}</p>
                    </div>
                </div>
            ),
        },
        {
            header: "Email",
            accessorKey: "email",
            cell: (admin) => (
                <div className="text-sm text-[#344e41]">
                    <p>{admin.email}</p>
                    <p className="text-xs text-[#344e41]/60">{admin.lastLoginAt ? `Last login: ${new Date(admin.lastLoginAt).toLocaleString()}` : "No login data"}</p>
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
                <div className="text-sm text-[#344e41]">
                    {admin.registeredIpAddress && admin.registeredIpAddress.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {admin.registeredIpAddress.slice(0, 2).map((ip) => (
                                <Badge key={ip} variant="outline" className="border-[#a3b18a] text-[#344e41]">
                                    {ip}
                                </Badge>
                            ))}
                            {admin.registeredIpAddress.length > 2 && (
                                <Badge variant="outline" className="border-[#a3b18a] text-[#344e41]">
                                    +{admin.registeredIpAddress.length - 2} more
                                </Badge>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-[#344e41]/60">No IPs</span>
                    )}
                </div>
            ),
        },
        {
            header: "Joined",
            accessorKey: "joiningDate",
            cell: (admin) => (
                <span className="text-sm text-[#344e41]">
                    {admin.joiningDate ? new Date(admin.joiningDate).toLocaleDateString() : "N/A"}
                </span>
            ),
        },
    ], []);

    const filteredAdmins = useMemo(() => {
        if (filterRole === "all") return admins;
        return admins.filter((admin) => admin.role === filterRole);
    }, [admins, filterRole]);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [list, statistics] = await Promise.all([
                adminService.getAll({ role: filterRole === "all" ? undefined : filterRole }),
                adminService.getStatistics(),
            ]);
            setAdmins(list.admins);
            setStats(statistics);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load admins");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (showDeleted) fetchDeleted();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterRole, showDeleted]);

    const fetchDeleted = async () => {
        try {
            const list = await adminService.getDeleted();
            setDeletedAdmins(list);
        } catch (e: any) {
            toast.error(e?.message || "Failed to load deleted admins");
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await adminService.restore(id);
            toast.success("Admin restored");
            fetchDeleted();
            fetchData();
        } catch (e: any) {
            toast.error(e?.message || "Restore failed");
        }
    };

    const handlePermanentDelete = async (id: string, name: string) => {
        if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
        try {
            await adminService.deletePermanently(id);
            toast.success("Admin permanently deleted");
            fetchDeleted();
        } catch (e: any) {
            toast.error(e?.message || "Permanent delete failed");
        }
    };

    const handleCreate = () => {
        router.push("/dashboard/admin/users/admins/create");
    };

    const handleEdit = (admin: Admin) => {
        router.push(`/dashboard/admin/users/admins/${admin.id}/edit`);
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
            toast.error(error instanceof Error ? error.message : "Failed to delete admin");
        } finally {
            setIsDeleting(false);
            setSelectedAdmin(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Admin Management"
                    subtitle="Monitor and control administrator accounts"
                    actionLabel="Add New Admin"
                    onAction={handleCreate}
                    icon={UserPlus}
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white border-none shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-[#344e41]/60">Total Admins</p>
                            <p className="text-3xl font-bold text-[#344e41]">{stats?.total ?? "--"}</p>
                        </CardContent>
                    </Card>
                    {stats && Object.entries(stats.byRole).map(([role, value]) => (
                        <Card key={role} className="bg-white border-none shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-sm text-[#344e41]/60 capitalize">{role.replace("_", " ")}</p>
                                <p className="text-3xl font-bold text-[#344e41]">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {["all", "super_admin", "admin", "moderator"].map((role) => (
                            <Button
                                key={role}
                                variant={filterRole === role ? "default" : "outline"}
                                className={filterRole === role ? "bg-[#588157]" : "border-[#a3b18a] text-[#344e41]"}
                                onClick={() => setFilterRole(role as AdminRole | "all")}
                            >
                                {role === "all" ? "All" : role.replace("_", " ")}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={showDeleted ? "default" : "outline"}
                            onClick={() => setShowDeleted((v) => !v)}
                            className={showDeleted ? "bg-[#588157] text-white" : "border-[#a3b18a] text-[#344e41]"}
                        >
                            <UserCog className="h-4 w-4 mr-2" />
                            {showDeleted ? "Showing Deleted" : "Show Deleted"}
                        </Button>
                        {!showDeleted && (
                            <Button variant="outline" onClick={fetchData} disabled={isRefreshing} className="border-[#a3b18a] text-[#344e41]">
                                <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        )}
                    </div>
                </div>

                {!showDeleted ? (
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-[#a3b18a]/30">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                            </div>
                        ) : (
                            <DataTable
                                data={filteredAdmins}
                                columns={columns}
                                searchKey="fullName"
                                searchPlaceholder="Search admin by name..."
                                onView={(item) => router.push(`/dashboard/admin/users/admins/${item.id}`)}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                ) : (
                    <Card className="border-[#a3b18a]/30">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-[#344e41] mb-4">
                                Deleted Admins
                            </h2>
                            {deletedAdmins.length === 0 ? (
                                <p className="text-sm text-[#344e41]/60">
                                    No deleted admins.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#dad7cd]/40">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">Name</th>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">Email</th>
                                                <th className="text-left p-4 text-sm font-semibold text-[#344e41]">Role</th>
                                                <th className="text-right p-4 text-sm font-semibold text-[#344e41]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deletedAdmins.map((admin) => (
                                                <tr key={admin.id} className="border-b border-[#a3b18a]/20 hover:bg-[#dad7cd]/20 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-medium text-[#344e41]">{admin.fullName}</p>
                                                    </td>
                                                    <td className="p-4 text-sm text-[#344e41]/80">{admin.email}</td>
                                                    <td className="p-4">
                                                        {roleBadge(admin.role)}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRestore(admin.id)}
                                                                className="border-[#588157] text-[#588157]"
                                                            >
                                                                Restore
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePermanentDelete(admin.id, admin.fullName)}
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

                <DeleteModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Admin"
                    description={`Are you sure you want to delete \"${selectedAdmin?.fullName}\"? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />
            </div>
        </DashboardLayout>
    );
}
