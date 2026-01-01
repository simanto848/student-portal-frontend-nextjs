"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Staff,
    StaffRole
} from "@/services/user/staff.service";
import {
    Mail,
    Clock,
    Trash2,
    RotateCcw,
    Sparkles,
    Users,
    UserPlus,
    Briefcase,
    Zap,
    ShieldAlert,
    Cpu
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    deleteStaffAction,
    restoreStaffAction,
    permanentDeleteStaffAction
} from "../actions";

interface StaffManagementClientProps {
    initialStaff: Staff[];
    deletedStaff: Staff[];
    pagination?: any;
}

const roleBadge = (role: StaffRole) => {
    const map: Record<StaffRole, { label: string; className: string; Icon: any }> = {
        program_controller: { label: "Program Controller", className: "bg-purple-100 text-purple-700 border-purple-200", Icon: Cpu },
        admission: { label: "Admission", className: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: UserPlus },
        library: { label: "Library", className: "bg-blue-100 text-blue-700 border-blue-200", Icon: Zap },
        it: { label: "IT Specialist", className: "bg-cyan-100 text-cyan-700 border-cyan-200", Icon: ShieldAlert },
    };
    const { label, className, Icon } = map[role] || { label: role || "Unknown", className: "bg-slate-100 text-slate-700 border-slate-200", Icon: Briefcase };
    return (
        <Badge className={`${className} border px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm`}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
};

export function StaffManagementClient({
    initialStaff,
    deletedStaff: initialDeletedStaff,
    pagination
}: StaffManagementClientProps) {
    const router = useRouter();
    const [staff, setStaff] = useState(initialStaff);
    const [deletedStaff, setDeletedStaff] = useState(initialDeletedStaff);
    const [filterRole, setFilterRole] = useState<StaffRole | "all">("all");
    const [activeTab, setActiveTab] = useState("active");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Staff | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const statistics = useMemo(() => ({
        total: staff.length,
        byRole: staff.reduce((acc, curr) => {
            acc[curr.role] = (acc[curr.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    }), [staff]);

    const filteredStaff = useMemo(() => {
        if (filterRole === "all") return staff;
        return staff.filter(s => s.role === filterRole);
    }, [staff, filterRole]);

    const columns: Column<Staff>[] = useMemo(() => [
        {
            header: "Name",
            accessorKey: "fullName",
            cell: (member) => (
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push(`/dashboard/admin/users/staff/${member.id}`)}>
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-md transition-transform group-hover:scale-110 duration-500">
                            {member.profile?.profilePicture ? (
                                <img
                                    src={getImageUrl(member.profile.profilePicture)}
                                    alt={member.fullName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-amber-50 text-amber-600 font-black text-lg">
                                    {member.fullName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${member.lastLoginAt ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{member.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {member.registrationNumber}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Contact Info",
            accessorKey: "email",
            cell: (member) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {member.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                        <Clock className="h-3 w-3" />
                        {member.lastLoginAt ? `LAST LOGIN ${new Date(member.lastLoginAt).toLocaleDateString()}` : "NEVER LOGGED IN"}
                    </div>
                </div>
            ),
        },
        {
            header: "Role",
            accessorKey: "role",
            cell: (member) => roleBadge(member.role),
        },
        {
            header: "Access Rules",
            accessorKey: "registeredIpAddress",
            cell: (member) => (
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {member.registeredIpAddress && member.registeredIpAddress.length > 0 ? (
                        member.registeredIpAddress.slice(0, 2).map((ip) => (
                            <Badge key={ip} variant="outline" className="border-slate-200 bg-white text-slate-500 font-mono text-[9px] px-1.5 py-0 rounded-md">
                                {ip}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-[10px] font-bold text-slate-300 italic">No IP limits</span>
                    )}
                    {member.registeredIpAddress && member.registeredIpAddress.length > 2 && (
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-400 font-black text-[9px] px-1 py-0 rounded-md">
                            +{member.registeredIpAddress.length - 2}
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
            const result = await restoreStaffAction(id, null, formData);
            if (result.success) {
                notifySuccess("Staff member access restored");
                router.refresh();
            } else {
                notifyError(result.message || "Failed to restore");
            }
        } catch (error) {
            notifyError("An error occurred during restoration");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (!confirm("This will permanently delete the staff member from the system. This action cannot be undone. Proceed?")) return;
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await permanentDeleteStaffAction(id, null, formData);
            if (result.success) {
                notifySuccess("Staff member deleted permanently");
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

    const handleDelete = (member: Staff) => {
        setSelectedMember(member);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedMember) return;
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            const result = await deleteStaffAction(selectedMember.id, null, formData);
            if (result.success) {
                notifySuccess("Staff member deactivated");
                setIsDeleteOpen(false);
                router.refresh();
            } else {
                notifyError(result.message || "Deactivation failed");
            }
        } catch (error) {
            notifyError("Failed to deactivate staff member");
        } finally {
            setIsActionLoading(false);
            setSelectedMember(null);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-4 w-fit shadow-sm">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
                    </Badge>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Staff Management</h1>
                    <p className="text-slate-500 font-bold mt-3 text-lg">Manage and configure the staff members of the university.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => router.push("/dashboard/admin/users/staff/create")}
                        className="h-14 px-8 rounded-[2rem] bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group"
                    >
                        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Add Staff Member
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 group hover:border-amber-500/50 transition-all duration-500">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="h-px w-12 bg-slate-100" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Staff</p>
                        <h3 className="text-4xl font-black text-slate-900 mt-1">{statistics.total}</h3>
                    </CardContent>
                </Card>
                {["program_controller", "admission", "library", "it"].map((role, index) => {
                    const map: any = {
                        program_controller: { icon: Cpu, label: "Controllers" },
                        admission: { icon: UserPlus, label: "Admission" },
                        library: { icon: Zap, label: "Library" },
                        it: { icon: ShieldAlert, label: "IT Special" }
                    };
                    const { icon: Icon, label } = map[role];
                    const count = statistics.byRole[role] || 0;
                    return (
                        <Card key={role} className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 group hover:border-amber-500/50 transition-all duration-500">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Icon className="h-6 h-6" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-400 rounded-lg uppercase">CATEGORY</Badge>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                <h3 className="text-4xl font-black text-slate-900 mt-1">{count}</h3>
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
                                Active Staff
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
                            {["all", "program_controller", "admission", "library", "it"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilterRole(role as StaffRole | "all")}
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
                            className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 shadow-2xl shadow-slate-200/30 overflow-hidden relative group"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <Briefcase className="w-40 h-40 text-slate-900" />
                            </div>
                            <DataTable
                                data={filteredStaff}
                                columns={columns}
                                searchKey="fullName"
                                searchPlaceholder="Search staff by name..."
                                onView={(item) => router.push(`/dashboard/admin/users/staff/${item.id}`)}
                                onEdit={(item) => router.push(`/dashboard/admin/users/staff/${item.id}/edit`)}
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
                                <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Suspended Staff</h2>
                                    <p className="text-slate-500 font-bold text-sm italic">Historical record of staff members who have been suspended.</p>
                                </div>
                            </div>

                            {deletedStaff.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-50 border-4 border-white shadow-2xl shadow-slate-100">
                                        <Briefcase className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-black italic text-lg decoration-slate-200 underline underline-offset-8">No staff in suspension</p>
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
                                            {deletedStaff.map((member, index) => (
                                                <motion.tr
                                                    key={member.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-slate-50/30 transition-colors group"
                                                >
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 grayscale group-hover:grayscale-0 transition-all">
                                                                {member.fullName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-800">{member.fullName}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{member.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">{roleBadge(member.role)}</td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRestore(member.id)}
                                                                className="h-10 px-5 rounded-xl border border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-black tracking-tight flex items-center gap-2"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Restore
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handlePermanentDelete(member.id)}
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
                title="Suspend Staff Member"
                description={`Are you sure you want to deactivate ${selectedMember?.fullName}? This will remove their access to the portal.`}
                isDeleting={isActionLoading}
            />
        </div>
    );
}
