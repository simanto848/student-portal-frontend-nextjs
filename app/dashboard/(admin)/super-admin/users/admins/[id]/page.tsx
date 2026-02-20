"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService, Admin, AdminRole } from "@/services/user/admin.service";
import { adminProfileService, AdminProfile } from "@/services/user/adminProfile.service";
import { toast } from "sonner";
import { Shield, Mail, Phone, Calendar, RefreshCcw, MapPin, User as UserIcon, X, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
            } catch {
                setProfile(null);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load admin");
            router.push("/dashboard/super-admin/users/admins");
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
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!admin) {
        return null;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={admin.fullName}
                subtitle="Administrator profile overview"
                icon={Shield}
                onBack={() => router.push("/dashboard/super-admin/users/admins")}
                actionLabel="Edit"
                onAction={() => router.push(`/dashboard/super-admin/users/admins/${admin.id}/edit`)}
            />

            <div className="grid gap-6 md:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:col-span-2"
                >
                    <Card className="border-slate-200 dark:border-slate-700 h-full">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                    {admin?.profile?.profilePicture ? (
                                        <img
                                            src={getImageUrl(admin.profile.profilePicture)}
                                            alt={admin.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <Shield className="h-8 w-8 text-indigo-600" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{admin.fullName}</CardTitle>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{admin.email}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Role</p>
                                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{roleLabel[admin.role]}</p>
                                </div>
                                <Select value={selectedRole} onValueChange={(value) => handleRoleUpdate(value as AdminRole)} disabled={isUpdatingRole}>
                                    <SelectTrigger className="w-full sm:w-60 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(roleLabel).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
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
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 space-y-4 border border-slate-200 dark:border-slate-700"
                                >
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                                <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Profile Information</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Complete personal details</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-indigo-600">Complete</Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Personal Details</p>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <ProfileField label="First Name" value={profile.firstName} />
                                                <ProfileField label="Last Name" value={profile.lastName} />
                                                {profile.middleName && <ProfileField label="Middle Name" value={profile.middleName} />}
                                                <ProfileField
                                                    label="Full Name"
                                                    value={`${profile.firstName} ${profile.middleName ? profile.middleName + ' ' : ''}${profile.lastName}`}
                                                    highlighted
                                                />
                                            </div>
                                        </div>

                                        {(profile.dateOfBirth || profile.gender) && (
                                            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Demographics</p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {profile.dateOfBirth && <ProfileField label="Date of Birth" value={new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />}
                                                    {profile.dateOfBirth && <ProfileField label="Age" value={`${Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`} />}
                                                    {profile.gender && <ProfileField label="Gender" value={profile.gender} />}
                                                </div>
                                            </div>
                                        )}

                                        {profile.phoneNumber && (
                                            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contact Information</p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <ProfileField label="Phone Number" value={profile.phoneNumber} icon={Phone} />
                                                </div>
                                            </div>
                                        )}

                                        {profile.addresses && profile.addresses.length > 0 && (
                                            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Addresses</p>
                                                <div className="space-y-2">
                                                    {profile.addresses.map((addr, idx) => (
                                                        <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                {[addr.street, addr.city, addr.state].filter(Boolean).join(', ') || '(No street)'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {[addr.country, addr.zipCode].filter(Boolean).join(' - ') || '(No country)'}
                                                                {addr.isPrimary && <Badge className="ml-2 bg-indigo-600">PRIMARY</Badge>}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">System Information</p>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <ProfileField label="Profile ID" value={profile.id} mono />
                                                {profile.avatar && <ProfileField label="Avatar" value="Set" />}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {!profile && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                            <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">No Profile Information</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                This administrator account doesn&apos;t have an extended profile yet.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/dashboard/super-admin/users/admins/${admin.id}/edit`)}
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
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-6"
                >
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Last Login</p>
                                <Button variant="ghost" onClick={fetchAdmin} size="icon" className="h-8 w-8">
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "No login recorded"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">IP: {admin.lastLoginIp || "N/A"}</p>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-2">Meta</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">Created: {new Date(admin.createdAt || "").toLocaleString()}</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">Updated: {new Date(admin.updatedAt || "").toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Registered IPs
                                </span>
                                <Badge variant="secondary">{admin.registeredIpAddress?.length || 0}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    placeholder="Add new IP"
                                    value={newIp}
                                    onChange={(e) => setNewIp(e.target.value)}
                                    className="border-slate-200 dark:border-slate-700"
                                    disabled={isIpUpdating}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddIp()}
                                />
                                <Button onClick={handleAddIp} disabled={isIpUpdating} className="bg-indigo-600 hover:bg-indigo-700">
                                    {isIpUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {admin.registeredIpAddress && admin.registeredIpAddress.length > 0 ? (
                                    admin.registeredIpAddress.map((ip) => (
                                        <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                                            {ip}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveIp(ip)}
                                                className="ml-1 hover:text-red-500 transition-colors"
                                                disabled={isIpUpdating}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No registered IP addresses</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
                <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{value}</p>
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
        <div className={cn(
            "p-3 rounded-lg",
            highlighted ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-slate-900"
        )}>
            <div className="flex items-start gap-2">
                {Icon && (
                    <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/30">
                        <Icon className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
                    <p className={cn(
                        "text-sm font-medium text-slate-900 dark:text-slate-100",
                        mono && "font-mono text-xs"
                    )}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}
