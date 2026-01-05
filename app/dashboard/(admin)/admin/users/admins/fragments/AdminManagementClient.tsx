"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Admin,
    AdminRole,
    AdminStatistics
} from "@/services/user/admin.service";
import {
    Shield,
    ShieldCheck,
    Mail,
    Calendar,
    Network,
    Clock,
    Search,
    Trash2,
    RotateCcw,
    ChevronRight,
    Sparkles,
    Users,
    UserPlus,
    UserCog
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    deleteAdminAction,
    restoreAdminAction,
    permanentDeleteAdminAction
} from "../actions";

interface AdminManagementClientProps {
    initialAdmins: Admin[];
    deletedAdmins: Admin[];
    statistics: AdminStatistics;
}

const roleBadge = (role: AdminRole) => {
    const map: Record<string, { label: string; className: string; Icon: typeof Shield }> = {
        super_admin: { label: "Super Admin", className: "bg-purple-100 text-purple-700 border-purple-200", Icon: ShieldCheck },
        admin: { label: "Admin", className: "bg-amber-100 text-amber-700 border-amber-200", Icon: Shield },
        moderator: { label: "Moderator", className: "bg-blue-100 text-blue-700 border-blue-200", Icon: Shield },
    };
    const { label, className, Icon } = map[role] || { label: role || "Unknown", className: "bg-slate-100 text-slate-700 border-slate-200", Icon: Shield };
    return (
        <Badge className={`${className} border px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm`}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
};

export function AdminManagementClient({
    initialAdmins,
    deletedAdmins: initialDeletedAdmins,
    statistics
}: AdminManagementClientProps) {
    const router = useRouter();
    const [admins, setAdmins] = useState(initialAdmins);
    const [deletedAdmins, setDeletedAdmins] = useState(initialDeletedAdmins);
    const [stats, setStats] = useState(statistics);
    const [filterRole, setFilterRole] = useState<AdminRole | "all">("all");
    const [activeTab, setActiveTab] = useState("active");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const filteredAdmins = useMemo(() => {
        if (filterRole === "all") return admins;
        return admins.filter(a => a.role === filterRole);
    }, [admins, filterRole]);

    const columns: Column<Admin>[] = useMemo(() => [
        {
            header: "Name",
            accessorKey: "fullName",
            cell: (admin) => (
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push(`/dashboard/admin/users/admins/${admin.id}`)}>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-md transition-transform group-hover:scale-110 duration-500">
                            {admin.profile?.profilePicture ? (
                                <img
                                    src={getImageUrl(admin.profile.profilePicture)}
                                    alt={admin.fullName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-amber-50 text-amber-600 font-black text-lg">
                                    {admin.fullName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${admin.lastLoginAt ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{admin.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {admin.registrationNumber}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Contact Info",
            accessorKey: "email",
            cell: (admin) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {admin.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        <Clock className="h-3 w-3" />
                        {admin.lastLoginAt ? `LAST LOGIN ${new Date(admin.lastLoginAt).toLocaleDateString()}` : "NEVER LOGGED IN"}
                    </div>
                </div>
            ),
        },
        {
            header: "Role",
            accessorKey: "role",
            cell: (admin) => roleBadge(admin.role),
        },
        {
            header: "Access Rules",
            accessorKey: "registeredIpAddress",
            cell: (admin) => (
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {admin.registeredIpAddress && admin.registeredIpAddress.length > 0 ? (
                        admin.registeredIpAddress.slice(0, 2).map((ip) => (
                            <Badge key={ip} variant="outline" className="border-slate-200 bg-white text-slate-500 font-mono text-[9px] px-1.5 py-0 rounded-md">
                                {ip}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-[10px] font-bold text-slate-300 italic">No IP limits</span>
                    )}
                    {admin.registeredIpAddress && admin.registeredIpAddress.length > 2 && (
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-400 font-black text-[9px] px-1 py-0 rounded-md">
                            +{admin.registeredIpAddress.length - 2}
                        </Badge>
                    )}
                </div>
            ),
        }
    ], [router]);

    const handleRestore = async (id: string) => {
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await restoreAdminAction(id, null, formData);
            if (result.success) {
                notifySuccess("Admin access restored");
                router.refresh();
            } else {
                notifyError(result.message || "Restoration failed");
            }
        } catch (error) {
            notifyError("A restoration breach occurred");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (!confirm("This will permanently delete the admin from the system. This action cannot be undone. Proceed?")) return;
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await permanentDeleteAdminAction(id, null, formData);
            if (result.success) {
                notifySuccess("Admin deleted permanently");
                router.refresh();
            } else {
                notifyError(result.message || "Deletion failed");
            }
        } catch (error) {
            notifyError("A critical error occurred during deletion");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedAdmin) return;
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await deleteAdminAction(selectedAdmin.id, null, formData);
            if (result.success) {
                notifySuccess("Admin suspended successfully");
                setIsDeleteOpen(false);
                router.refresh();
            } else {
                notifyError(result.message || "Suspension failed");
            }
        } catch (error) {
            notifyError("An error occurred during suspension");
        } finally {
            setIsActionLoading(false);
            setSelectedAdmin(null);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-2 sm:mb-4 w-fit shadow-sm">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">Admin Management</h1>
                    <p className="text-slate-500 font-bold mt-2 md:mt-3 text-sm md:text-lg">Manage university administrators and their access permissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => router.push("/dashboard/admin/users/admins/create")}
                        className="h-12 md:h-14 px-6 md:px-8 rounded-[2rem] bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group"
                    >
                        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Add Admin</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-2 border-slate-100 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/40 group hover:border-amber-500/50 transition-all duration-500">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="h-px w-12 bg-slate-100" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Admins</p>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">{stats.total}</h3>
                    </CardContent>
                </Card>
                {Object.entries(stats.byRole).map(([role, value], index) => {
                    const iconMap: any = { super_admin: ShieldCheck, admin: Shield, moderator: UserCog };
                    const Icon = iconMap[role] || Shield;
                    return (
                        <Card key={role} className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 group hover:border-amber-500/50 transition-all duration-500">
                            <CardContent className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Icon className="h-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-400 rounded-lg uppercase">CATEGORY</Badge>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{role.replace("_", " ")}</p>
                                <h3 className="text-4xl font-black text-slate-900 mt-1">{value}</h3>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="bg-white p-1.5 rounded-[2rem] border-2 border-slate-100 shadow-lg shadow-slate-200/30 flex w-fit">
                        <TabsList className="bg-transparent h-12 gap-1 p-0">
                            <TabsTrigger
                                value="active"
                                className="h-10 px-8 rounded-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                Active Admins
                            </TabsTrigger>
                            <TabsTrigger
                                value="deleted"
                                className="h-10 px-8 rounded-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Suspended
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {activeTab === "active" && (
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 overflow-x-auto no-scrollbar max-w-full">
                            {["all", "super_admin", "admin", "moderator"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilterRole(role as AdminRole | "all")}
                                    className={`
                                        h-9 px-5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
                                        ${filterRole === role
                                            ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-100"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                        }
                                    `}
                                >
                                    {role === "all" ? "All Roles" : role.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="active" key="active-tab" className="mt-0 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white border-2 border-slate-100 rounded-3xl md:rounded-[3rem] p-4 sm:p-6 md:p-8 shadow-2xl shadow-slate-200/30 overflow-hidden relative group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <Shield className="w-40 h-40 text-slate-900" />
                            </div>
                            <DataTable
                                data={filteredAdmins}
                                columns={columns}
                                searchKey="fullName"
                                searchPlaceholder="Search admin by name..."
                                onView={(item) => router.push(`/dashboard/admin/users/admins/${item.id}`)}
                                onEdit={(item) => router.push(`/dashboard/admin/users/admins/${item.id}/edit`)}
                                onDelete={handleDelete}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="deleted" key="deleted-tab" className="mt-0 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/30"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Suspended Admins</h2>
                                    <p className="text-slate-500 font-bold text-sm italic">Historical record of admins who have been suspended.</p>
                                </div>
                            </div>

                            {deletedAdmins.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-50 border-4 border-white shadow-2xl shadow-slate-100">
                                        <ShieldCheck className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-black italic text-lg decoration-slate-200 underline underline-offset-8">No suspended admins found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-inner">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Restore Access</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {deletedAdmins.map((admin, index) => (
                                                <motion.tr
                                                    key={admin.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-slate-50/30 transition-colors group"
                                                >
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 grayscale group-hover:grayscale-0 transition-all">
                                                                {admin.fullName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-800">{admin.fullName}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{admin.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">{roleBadge(admin.role)}</td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRestore(admin.id)}
                                                                className="h-10 px-5 rounded-xl border border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-black tracking-tight flex items-center gap-2"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Restore
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handlePermanentDelete(admin.id)}
                                                                className="h-10 px-5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-black tracking-tight flex items-center gap-2"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Permanently Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
                title="Suspend Admin"
                description={`Are you sure you want to deactivate ${selectedAdmin?.fullName}? This will remove their admin access to the portal.`}
                isDeleting={isActionLoading}
            />
        </div>
    );
}

