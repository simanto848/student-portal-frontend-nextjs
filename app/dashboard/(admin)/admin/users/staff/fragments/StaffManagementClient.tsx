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
    Cpu,
    Ban,
    Unlock
} from "lucide-react";
import { getImageUrl, cn } from "@/lib/utils";
import { adminService } from "@/services/user/admin.service";
import { notifySuccess, notifyError } from "@/components/toast";
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
        exam_controller: { label: "Exam Controller", className: "bg-violet-100 text-violet-700 border-violet-200", Icon: ShieldAlert },
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
                        <div className="flex flex-col">
                            <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{member.fullName}</p>
                            {member.isBlocked && (
                                <Badge variant="destructive" className="w-fit h-4 text-[9px] px-1.5 uppercase font-black animate-pulse bg-red-600 text-white border-none mt-0.5">
                                    Blocked
                                </Badge>
                            )}
                        </div>
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

    const handleBlock = async (member: Staff) => {
        const reason = window.prompt(`Enter block reason for ${member.fullName}:`);
        if (reason === null) return;
        if (!reason.trim()) {
            notifyError("Reason is required to block a user");
            return;
        }

        try {
            await adminService.blockUser("staff", member.id, reason);
            notifySuccess(`${member.fullName} blocked successfully`);
            setStaff(staff.map(s => s.id === member.id ? { ...s, isBlocked: true } : s));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to block staff member");
        }
    };

    const handleUnblock = async (member: Staff) => {
        if (!confirm(`Are you sure you want to unblock ${member.fullName}?`)) return;
        try {
            await adminService.unblockUser("staff", member.id);
            notifySuccess(`${member.fullName} unblocked successfully`);
            setStaff(staff.map(s => s.id === member.id ? { ...s, isBlocked: false } : s));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to unblock staff member");
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-2 w-fit shadow-sm">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#92400E]">Overview</span>
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Staff Management</h1>
                </div>
                <Button
                    onClick={() => router.push("/dashboard/admin/users/staff/create")}
                    className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-amber-600 text-white shadow-sm font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Staff Member</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-xs font-medium text-slate-500">Total Staff</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{statistics.total}</h3>
                    </CardContent>
                </Card>
                {["program_controller", "admission", "library", "it", "exam_controller"].map((role) => {
                    const map: any = {
                        program_controller: { icon: Cpu, label: "Controllers" },
                        admission: { icon: UserPlus, label: "Admission" },
                        library: { icon: Zap, label: "Library" },
                        it: { icon: ShieldAlert, label: "IT Special" },
                        exam_controller: { icon: ShieldAlert, label: "Exam Control" }
                    };
                    const { icon: Icon, label } = map[role];
                    const count = statistics.byRole[role] || 0;
                    return (
                        <Card key={role} className="bg-white border border-slate-200 rounded-xl shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-slate-500">{label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{count}</h3>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Tabs defaultValue="active" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" onValueChange={setActiveTab}>
                <div className="bg-slate-50/50 px-4 py-4 md:px-6 md:py-5 border-b border-slate-200 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <TabsList className="bg-slate-100 p-1 rounded-lg h-auto flex w-full sm:w-auto">
                        <TabsTrigger
                            value="active"
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all text-center"
                        >
                            Active Staff
                        </TabsTrigger>
                        <TabsTrigger
                            value="deleted"
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all text-center"
                        >
                            Suspended
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === "active" && (
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                            {["all", "program_controller", "admission", "library", "it", "exam_controller"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilterRole(role as StaffRole | "all")}
                                    className={`
                                        h-8 px-4 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                                        ${filterRole === role
                                            ? "bg-slate-900 text-white"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    {role === "all" ? "All Roles" : role.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <TabsContent value="active" className="m-0 p-0">
                    <div className="p-4 sm:p-6">
                        <DataTable
                            data={filteredStaff}
                            columns={columns}
                            searchKey="fullName"
                            searchPlaceholder="Search staff by name..."
                            onView={(item) => router.push(`/dashboard/admin/users/staff/${item.id}`)}
                            onEdit={(item) => router.push(`/dashboard/admin/users/staff/${item.id}/edit`)}
                            onDelete={handleDelete}
                            renderExtraActions={(member) => (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        member.isBlocked ? handleUnblock(member) : handleBlock(member);
                                    }}
                                    className={cn(
                                        "h-8 w-8 rounded-md hover:bg-slate-100 transition-colors",
                                        member.isBlocked ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"
                                    )}
                                    title={member.isBlocked ? "Unblock Staff" : "Block Staff"}
                                >
                                    {member.isBlocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                </Button>
                            )}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="deleted" className="m-0 p-0">
                    <div className="p-4 sm:p-6">
                        {deletedStaff.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center gap-3">
                                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <Briefcase className="w-8 h-8" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-sm font-medium text-slate-900">No suspended staff found</p>
                                    <p className="text-sm text-slate-500">There are no suspended staff records in the system.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-medium text-slate-500">Name</th>
                                            <th className="px-4 py-3 text-xs font-medium text-slate-500">Role</th>
                                            <th className="px-4 py-3 text-xs font-medium text-slate-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {deletedStaff.map((member) => (
                                            <tr
                                                key={member.id}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-400 border border-slate-200">
                                                            {member.fullName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-900">{member.fullName}</p>
                                                            <p className="text-xs text-slate-500">{member.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{roleBadge(member.role)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRestore(member.id)}
                                                            className="h-8 px-3 rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-xs"
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                                            Restore
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePermanentDelete(member.id)}
                                                            className="h-8 px-3 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 font-medium text-xs"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                            Purge
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>
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
