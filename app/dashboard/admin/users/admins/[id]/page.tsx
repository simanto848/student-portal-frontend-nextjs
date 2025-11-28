"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService, Admin, AdminRole } from "@/services/user/admin.service";
import { adminProfileService, AdminProfile } from "@/services/user/adminProfile.service";
import { toast } from "sonner";
import { ArrowLeft, Shield, Mail, Phone, Calendar, RefreshCcw, MapPin, Trash2, User as UserIcon } from "lucide-react";

const roleLabel: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderator",
};

export default function AdminDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [admin, setAdmin] = useState<Admin | null>(null);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AdminRole>("moderator");
    const [newIp, setNewIp] = useState("");
    const [isIpUpdating, setIsIpUpdating] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchAdmin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchAdmin = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getById(id);
            setAdmin(data);
            setSelectedRole(data.role);

            try {
                const profileData = await adminProfileService.get(id);
                setProfile(profileData);
            } catch (profileError) {
                setProfile(null);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load admin");
            router.push("/dashboard/admin/users/admins");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleUpdate = async (role: AdminRole) => {
        if (!admin || role === admin.role) return;
        setIsUpdatingRole(true);
        try {
            const updated = await adminService.updateRole(admin.id, role);
            setAdmin(updated);
            setSelectedRole(role);
            toast.success("Role updated successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update role");
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const handleAddIp = async () => {
        if (!admin || !newIp.trim()) {
            toast.error("Enter a valid IP address");
            return;
        }
        setIsIpUpdating(true);
        try {
            const updated = await adminService.addRegisteredIp(admin.id, newIp.trim());
            setAdmin(updated);
            setNewIp("");
            toast.success("IP added successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add IP");
        } finally {
            setIsIpUpdating(false);
        }
    };

    const handleRemoveIp = async (ip: string) => {
        if (!admin) return;
        setIsIpUpdating(true);
        try {
            const updated = await adminService.removeRegisteredIp(admin.id, ip);
            setAdmin(updated);
            toast.success("IP removed");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove IP");
        } finally {
            setIsIpUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!admin) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-[#dad7cd] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#344e41]" />
                    </button>
                    <PageHeader
                        title={admin.fullName}
                        subtitle="Administrator profile overview"
                        icon={Shield}
                        actionLabel="Edit"
                        onAction={() => router.push(`/dashboard/admin/users/admins/${admin.id}/edit`)}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 border-[#a3b18a]/30">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-[#344e41]/50">Role</p>
                                    <p className="text-2xl font-semibold text-[#344e41]">{roleLabel[admin.role]}</p>
                                </div>
                                <Select value={selectedRole} onValueChange={(value) => handleRoleUpdate(value as AdminRole)} disabled={isUpdatingRole}>
                                    <SelectTrigger className="w-full sm:w-60 bg-white border-[#a3b18a]/60 text-[#344e41]">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(roleLabel).map(([key, label]) => (
                                            <SelectItem key={key} value={key} className="text-[#344e41]">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <InfoRow icon={Mail} label="Email" value={admin.email} />
                                <InfoRow icon={Calendar} label="Joining Date" value={admin.joiningDate ? new Date(admin.joiningDate).toLocaleDateString() : "Not set"} />
                                <InfoRow icon={MapPin} label="Registration No." value={admin.registrationNumber} />
                                <InfoRow icon={Phone} label="Phone" value={profile?.phoneNumber || admin.profile?.phoneNumber || "Not provided"} />
                            </div>

                            {profile && (
                                <div className="bg-gradient-to-br from-[#dad7cd]/60 to-[#a3b18a]/20 rounded-lg p-5 space-y-4 border border-[#a3b18a]/20">
                                    <div className="flex items-center justify-between pb-3 border-b border-[#a3b18a]/30">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-[#588157]/20">
                                                <UserIcon className="h-5 w-5 text-[#588157]" />
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-[#344e41]">Profile Information</p>
                                                <p className="text-xs text-[#344e41]/60">Complete personal details</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-[#588157] text-white">Complete</Badge>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Personal Details */}
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">Personal Details</p>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <ProfileField
                                                    label="First Name"
                                                    value={profile.firstName}
                                                />
                                                <ProfileField
                                                    label="Last Name"
                                                    value={profile.lastName}
                                                />
                                                {profile.middleName && (
                                                    <ProfileField
                                                        label="Middle Name"
                                                        value={profile.middleName}
                                                    />
                                                )}
                                                <ProfileField
                                                    label="Full Name"
                                                    value={`${profile.firstName} ${profile.middleName ? profile.middleName + ' ' : ''}${profile.lastName}`}
                                                    highlighted
                                                />
                                            </div>
                                        </div>

                                        {/* Demographics */}
                                        {(profile.dateOfBirth || profile.gender) && (
                                            <div className="space-y-3 pt-3 border-t border-[#a3b18a]/20">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">Demographics</p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {profile.dateOfBirth && (
                                                        <ProfileField
                                                            label="Date of Birth"
                                                            value={new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        />
                                                    )}
                                                    {profile.dateOfBirth && (
                                                        <ProfileField
                                                            label="Age"
                                                            value={`${Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`}
                                                        />
                                                    )}
                                                    {profile.gender && (
                                                        <ProfileField
                                                            label="Gender"
                                                            value={profile.gender}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Information */}
                                        {profile.phoneNumber && (
                                            <div className="space-y-3 pt-3 border-t border-[#a3b18a]/20">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">Contact Information</p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <ProfileField
                                                        label="Phone Number"
                                                        value={profile.phoneNumber}
                                                        icon={Phone}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* System Information */}
                                        <div className="space-y-3 pt-3 border-t border-[#a3b18a]/20">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">System Information</p>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <ProfileField
                                                    label="Profile ID"
                                                    value={profile.id}
                                                    mono
                                                />
                                                {profile.avatar && (
                                                    <ProfileField
                                                        label="Avatar"
                                                        value="Set"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!profile && (
                                <div className="bg-[#dad7cd]/60 rounded-lg p-5 border border-[#a3b18a]/20">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-[#344e41]/10">
                                            <UserIcon className="h-5 w-5 text-[#344e41]/60" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#344e41] mb-1">No Profile Information</p>
                                            <p className="text-xs text-[#344e41]/60 mb-3">
                                                This administrator account doesn't have an extended profile yet.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-[#588157] text-[#588157] hover:bg-[#588157] hover:text-white"
                                                onClick={() => router.push(`/dashboard/admin/users/admins/${admin.id}/edit`)}
                                            >
                                                <UserIcon className="h-3 w-3 mr-1" />
                                                Add Profile Information
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-[#a3b18a]/30">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-[#344e41]/60">Last Login</p>
                                <Button variant="ghost" onClick={fetchAdmin} className="text-[#344e41]" size="icon">
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xl font-semibold text-[#344e41]">
                                {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "No login recorded"}
                            </p>
                            <p className="text-sm text-[#344e41]/60">IP: {admin.lastLoginIp || "N/A"}</p>
                            <div className="pt-4 border-t border-[#a3b18a]/30">
                                <p className="text-xs uppercase text-[#344e41]/60 mb-2">Meta</p>
                                <p className="text-sm text-[#344e41]">Created: {new Date(admin.createdAt || "").toLocaleString()}</p>
                                <p className="text-sm text-[#344e41]">Updated: {new Date(admin.updatedAt || "").toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-[#a3b18a]/30">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-semibold text-[#344e41]">Registered IP Addresses</p>
                                <Badge variant="outline" className="border-[#a3b18a] text-[#344e41]">
                                    {admin.registeredIpAddress?.length || 0}
                                </Badge>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    placeholder="Add new IP"
                                    value={newIp}
                                    onChange={(e) => setNewIp(e.target.value)}
                                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                    disabled={isIpUpdating}
                                />
                                <Button onClick={handleAddIp} disabled={isIpUpdating} className="bg-[#588157] hover:bg-[#3a5a40] text-white">
                                    Add
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {admin.registeredIpAddress && admin.registeredIpAddress.length > 0 ? (
                                    admin.registeredIpAddress.map((ip) => (
                                        <Badge key={ip} variant="outline" className="border-[#a3b18a] text-[#344e41] flex items-center gap-2">
                                            {ip}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveIp(ip)}
                                                className="text-red-600 hover:text-red-700"
                                                disabled={isIpUpdating}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-[#344e41]/60">No registered IP addresses</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#a3b18a]/30">
                        <CardContent className="p-6 space-y-4">
                            <p className="text-lg font-semibold text-[#344e41]">Quick Actions</p>
                            <div className="grid gap-3">
                                <Button
                                    variant="outline"
                                    className="border-[#a3b18a] text-[#344e41]"
                                    onClick={() => router.push(`/dashboard/admin/users/admins/${admin.id}/edit`)}
                                >
                                    Edit Details
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-[#a3b18a] text-[#344e41]"
                                    onClick={() => router.push("/dashboard/admin/users/admins")}
                                >
                                    Back to List
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#dad7cd]/60">
            <div className="p-2 rounded-md bg-white">
                <Icon className="h-4 w-4 text-[#344e41]" />
            </div>
            <div>
                <p className="text-xs uppercase text-[#344e41]/60">{label}</p>
                <p className="text-sm font-medium text-[#344e41]">{value}</p>
            </div>
        </div>
    );
}

function ProfileField({
    label,
    value,
    icon: Icon,
    highlighted = false,
    mono = false
}: {
    label: string;
    value: string;
    icon?: typeof Phone;
    highlighted?: boolean;
    mono?: boolean;
}) {
    return (
        <div className={`p-3 rounded-lg ${highlighted ? 'bg-[#588157]/10 border border-[#588157]/30' : 'bg-white/60'}`}>
            <div className="flex items-start gap-2">
                {Icon && (
                    <div className="p-1 rounded bg-[#588157]/10">
                        <Icon className="h-3 w-3 text-[#588157]" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#344e41]/60 mb-0.5">{label}</p>
                    <p className={`text-sm font-medium text-[#344e41] ${mono ? 'font-mono text-xs' : ''} break-all`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

