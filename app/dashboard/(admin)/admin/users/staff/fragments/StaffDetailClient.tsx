"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Staff,
    StaffRole
} from "@/services/user/staff.service";
import { StaffProfile } from "@/services/user/staffProfile.service";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    RefreshCcw,
    MapPin,
    Trash2,
    User as UserIcon,
    Clock,
    Globe,
    Lock,
    Edit3,
    Sparkles,
    Briefcase,
    Smartphone,
    Cpu,
    Zap,
    ShieldAlert,
    UserPlus,
    ShieldCheck,
    Plus,
    FileText,
    Hash
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { updateStaffRoleAction, updateStaffIpAction, deleteStaffAction } from "../actions";

interface StaffDetailClientProps {
    staff: Staff;
    profile: StaffProfile | null;
}

const roleLabel: Record<StaffRole, string> = {
    program_controller: "Program Controller",
    admission: "Admission",
    library: "Library",
    it: "IT Specialist",
    exam_controller: "Exam Controller",
};

export function StaffDetailClient({ staff: initialStaff, profile }: StaffDetailClientProps) {
    const router = useRouter();
    const [staff, setStaff] = useState(initialStaff);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [newIp, setNewIp] = useState("");
    const [isIpUpdating, setIsIpUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRoleUpdate = async (role: StaffRole) => {
        if (role === staff.role) return;
        setIsUpdatingRole(true);
        try {
            const formData = new FormData();
            formData.append("role", role);
            const result = await updateStaffRoleAction(staff.id, null, formData);
            if (result.success) {
                setStaff({ ...staff, role });
                notifySuccess("Staff role updated");
            } else {
                notifyError(result.message || "Update failed");
            }
        } catch (error) {
            notifyError("An error occurred during update");
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const handleAddIp = async () => {
        if (!newIp.trim()) return;
        setIsIpUpdating(true);
        try {
            const formData = new FormData();
            formData.append("ip", newIp.trim());
            formData.append("method", "add");
            const result = await updateStaffIpAction(staff.id, null, formData);
            if (result.success) {
                setStaff({
                    ...staff,
                    registeredIpAddress: [...(staff.registeredIpAddress || []), newIp.trim()]
                });
                setNewIp("");
                notifySuccess("IP address added successfully");
            } else {
                notifyError(result.message || "Failed to add IP");
            }
        } catch (error) {
            notifyError("Failed to register IP address");
        } finally {
            setIsIpUpdating(false);
        }
    };

    const handleRemoveIp = async (ip: string) => {
        setIsIpUpdating(true);
        try {
            const formData = new FormData();
            formData.append("ip", ip);
            formData.append("method", "remove");
            const result = await updateStaffIpAction(staff.id, null, formData);
            if (result.success) {
                setStaff({
                    ...staff,
                    registeredIpAddress: staff.registeredIpAddress?.filter(i => i !== ip) || []
                });
                notifySuccess("IP address removed");
            } else {
                notifyError(result.message || "Failed to remove IP");
            }
        } catch (error) {
            notifyError("Failed to remove IP address");
        } finally {
            setIsIpUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to deactivate ${staff.fullName}?`)) return;
        setIsDeleting(true);
        try {
            const result = await deleteStaffAction(staff.id, null, new FormData());
            if (result.success) {
                notifySuccess("Staff member deactivated");
                router.push("/dashboard/admin/users/staff");
            } else {
                notifyError(result.message || "Deactivation failed");
            }
        } catch (error) {
            notifyError("A deactivation failure occurred");
        } finally {
            setIsDeleting(false);
        }
    }

    const roleIconMap: any = {
        program_controller: Cpu,
        admission: UserPlus,
        library: Zap,
        it: ShieldAlert,
        exam_controller: FileText,
    };
    const RoleIcon = roleIconMap[staff.role] || Briefcase;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-500/30 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
                                <RoleIcon className="w-3 h-3" />
                                <span className="text-[10px] font-medium uppercase tracking-wider">{roleLabel[staff.role]}</span>
                            </Badge>
                            <span className="text-slate-500 font-medium text-xs flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {staff.registrationNumber}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{staff.fullName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-10 px-4 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deactivate
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/admin/users/staff/${staff.id}/edit`)}
                        className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-amber-600 text-white shadow-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                        Modify Staff
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-100 to-slate-50" />
                        <CardContent className="p-6 pt-12">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="relative flex-shrink-0">
                                    <div className="h-32 w-32 rounded-xl overflow-hidden border-4 border-white shadow-md relative z-10 bg-slate-100">
                                        {staff.profile?.profilePicture ? (
                                            <img
                                                src={getImageUrl(staff.profile.profilePicture)}
                                                alt={staff.fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium text-3xl">
                                                {staff.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 pt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <InfoBlock icon={Mail} label="Email Address" value={staff.email} />
                                        <InfoBlock icon={Calendar} label="Joining Date" value={staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : "N/A"} />
                                        <InfoBlock icon={MapPin} label="Registration Number" value={staff.registrationNumber} />
                                        <InfoBlock icon={Smartphone} label="Phone Number" value={profile?.phoneNumber || "N/A"} />
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <p className="text-xs font-semibold text-slate-500 mb-3">Role Management</p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Select value={staff.role} onValueChange={(v) => handleRoleUpdate(v as StaffRole)} disabled={isUpdatingRole}>
                                                <SelectTrigger className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-sm w-full sm:w-64 focus:ring-amber-500/20">
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg border border-slate-200 shadow-md">
                                                    {Object.entries(roleLabel).map(([key, label]) => (
                                                        <SelectItem key={key} value={key} className="text-sm">
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
                                                <Clock className="w-3.5 h-3.5" />
                                                Updating roles affects the permissions level of the staff member.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {profile && (
                        <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Personal Details</h2>
                                        <p className="text-slate-500 text-xs">Detailed information and contact metadata.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ProfileItem label="First Name" value={profile.firstName} />
                                    <ProfileItem label="Middle Name" value={profile.middleName || "N/A"} />
                                    <ProfileItem label="Last Name" value={profile.lastName} />
                                    <ProfileItem label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toDateString() : "N/A"} />
                                    <ProfileItem label="Gender" value={profile.gender || "N/A"} />
                                    <ProfileItem label="Status" value="PROVISIONED" highlighted />
                                </div>

                                {profile.addresses && profile.addresses.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <p className="text-xs font-semibold text-slate-500 mb-4">Registered Addresses</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {profile.addresses.map((addr, idx) => (
                                                <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                                                            <Globe className="w-4 h-4" />
                                                        </div>
                                                        {addr.isPrimary && (
                                                            <Badge className="bg-slate-900 text-white font-medium text-[10px] px-2 py-0.5 rounded">Primary</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {[addr.street, addr.city, addr.state].filter(Boolean).join(', ')}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">{addr.country} • {addr.zipCode}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none rounded-xl shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-xs font-medium text-slate-400">System Status</p>
                                <RefreshCcw className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString() : "NEVER LOGGED IN"}
                            </h3>
                            <p className="text-emerald-400 text-xs flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Last Login IP: {staff.lastLoginIp || "UNKNOWN"}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-8 bg-white/5 p-4 rounded-lg">
                                <div>
                                    <p className="text-[10px] font-medium text-slate-400 mb-1">Registration Date</p>
                                    <p className="text-xs font-medium">{new Date(staff.createdAt || "").toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-slate-400 mb-1">Infrastructure</p>
                                    <p className="text-xs font-medium">Portal Core</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">IP Restrictions</h3>
                                    <p className="text-slate-500 text-xs">Allowed Entry Points</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2 relative">
                                    <Input
                                        placeholder="Add IP address..."
                                        value={newIp}
                                        onChange={(e) => setNewIp(e.target.value)}
                                        className="h-10 px-3 rounded-lg bg-white border border-slate-200 text-sm focus:ring-amber-500/20 pr-12"
                                        disabled={isIpUpdating}
                                    />
                                    <button
                                        onClick={handleAddIp}
                                        disabled={isIpUpdating}
                                        className="absolute right-1 top-1 h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                                    >
                                        {isIpUpdating ? (
                                            <RefreshCcw className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {staff.registeredIpAddress && staff.registeredIpAddress.length > 0 ? (
                                        staff.registeredIpAddress.map((ip) => (
                                            <Badge key={ip} className="bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs px-2.5 py-1 rounded-md flex items-center gap-2">
                                                {ip}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIp(ip)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                    disabled={isIpUpdating}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="w-full py-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-slate-300" />
                                            <p className="text-xs font-medium text-slate-400">Global Access Permitted</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
            <p className="text-sm font-medium text-slate-900 truncate pl-6">{value}</p>
        </div>
    );
}

function ProfileItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`text-sm font-medium ${highlighted ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
}
