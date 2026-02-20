"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService, Admin, AdminRole } from "@/services/user/admin.service";
import { adminProfileService, AdminProfile, AdminAddress } from "@/services/user/adminProfile.service";
import { toast } from "sonner";
import { Shield, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditAdminPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [admin, setAdmin] = useState<Admin | null>(null);
    const [form, setForm] = useState({
        fullName: "",
        role: "moderator" as AdminRole,
        joiningDate: "",
        registrationNumber: "",
    });
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [showProfileSection, setShowProfileSection] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
    });
    const [addresses, setAddresses] = useState<AdminAddress[]>([]);
    const [addressDraft, setAddressDraft] = useState({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
    const [showAddressSection, setShowAddressSection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

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
            setForm({
                fullName: data.fullName,
                role: data.role,
                joiningDate: data.joiningDate ? data.joiningDate.split("T")[0] : "",
                registrationNumber: data.registrationNumber,
            });

            try {
                const p = await adminProfileService.get(id);
                if (p) {
                    setProfile(p);
                    setProfileForm({
                        firstName: p.firstName || "",
                        lastName: p.lastName || "",
                        middleName: p.middleName || "",
                        phoneNumber: p.phoneNumber || "",
                        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
                        gender: p.gender || "",
                    });
                    setAddresses(Array.isArray(p.addresses) ? p.addresses : []);
                    if ((p.addresses || []).length) setShowAddressSection(true);
                    setShowProfileSection(true);
                }
            } catch {
                setProfile(null);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load admin");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleProfileChange = (key: keyof typeof profileForm, value: string) => {
        setProfileForm(prev => ({ ...prev, [key]: value }));
    };

    const togglePrimary = (idx: number) => {
        setAddresses(prev => prev.map((a, i) => ({ ...a, isPrimary: i === idx })));
    };
    const addAddress = () => {
        if (!addressDraft.street && !addressDraft.city && !addressDraft.country) {
            toast.error("Provide at least street/city/country");
            return;
        }
        setAddresses(prev => {
            const sanitized = prev.map(a => ({ ...a }));
            let next = [...sanitized];
            if (addressDraft.isPrimary) next = next.map(a => ({ ...a, isPrimary: false }));
            next.push({ ...addressDraft });
            return next;
        });
        setAddressDraft({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
    };
    const removeAddress = (idx: number) => setAddresses(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!admin) return;
        setIsSaving(true);
        try {
            const updatePayload: any = {
                fullName: form.fullName.trim(),
                role: form.role,
                joiningDate: form.joiningDate || undefined,
                registrationNumber: form.registrationNumber.trim(),
            };

            if (showProfileSection && profileForm.firstName && profileForm.lastName) {
                updatePayload.profile = {
                    firstName: profileForm.firstName.trim(),
                    lastName: profileForm.lastName.trim(),
                };
                if (profileForm.middleName) updatePayload.profile.middleName = profileForm.middleName.trim();
                if (profileForm.phoneNumber) updatePayload.profile.phoneNumber = profileForm.phoneNumber.trim();
                if (profileForm.dateOfBirth) updatePayload.profile.dateOfBirth = profileForm.dateOfBirth;
                if (profileForm.gender) updatePayload.profile.gender = profileForm.gender;
                if (showAddressSection && addresses.length > 0) updatePayload.profile.addresses = addresses.map(a => ({ ...a }));
            }

            let dataToSend: any = updatePayload;

            if (profilePicture) {
                const formData = new FormData();
                formData.append('data', JSON.stringify(updatePayload));
                formData.append('profilePicture', profilePicture);
                dataToSend = formData;
            }

            await adminService.update(admin.id, dataToSend);
            toast.success("Admin updated successfully");
            router.push(`/dashboard/super-admin/users/admins/${admin.id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save changes");
        } finally {
            setIsSaving(false);
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
                title={`Edit ${admin.fullName}`}
                subtitle="Update administrator information"
                icon={Shield}
                onBack={() => router.push(`/dashboard/super-admin/users/admins/${admin.id}`)}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                    <Input
                                        value={form.fullName}
                                        onChange={(e) => handleChange("fullName", e.target.value)}
                                        className="border-slate-200 dark:border-slate-700"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                                    <Select value={form.role} onValueChange={(value) => handleChange("role", value)}>
                                        <SelectTrigger className="border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="moderator">Moderator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Joining Date</label>
                                    <Input
                                        type="date"
                                        value={form.joiningDate}
                                        onChange={(e) => handleChange("joiningDate", e.target.value)}
                                        className="border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Registration Number</label>
                                    <Input
                                        value={form.registrationNumber}
                                        onChange={(e) => handleChange("registrationNumber", e.target.value)}
                                        className="border-slate-200 dark:border-slate-700"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-slate-600" />
                                    <CardTitle className="text-lg">Profile Information</CardTitle>
                                    {profile && (
                                        <Badge variant="secondary" className="ml-2">Existing: {profile.firstName} {profile.lastName}</Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={showProfileSection ? "default" : "outline"}
                                        onClick={() => setShowProfileSection(v => !v)}
                                        className={cn(showProfileSection && "bg-indigo-600 hover:bg-indigo-700")}
                                        size="sm"
                                    >
                                        {showProfileSection ? "Hide Profile" : "Add/Edit Profile"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={showAddressSection ? "default" : "outline"}
                                        onClick={() => setShowAddressSection(v => !v)}
                                        className={cn(showAddressSection && "bg-indigo-600 hover:bg-indigo-700")}
                                        size="sm"
                                    >
                                        {showAddressSection ? "Hide Addresses" : "Addresses"}
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {showProfileSection && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid gap-4 md:grid-cols-2 pt-4 border-t border-slate-200 dark:border-slate-700"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
                                        <Input
                                            value={profileForm.firstName}
                                            onChange={(e) => handleProfileChange("firstName", e.target.value)}
                                            className="border-slate-200 dark:border-slate-700"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
                                        <Input
                                            value={profileForm.lastName}
                                            onChange={(e) => handleProfileChange("lastName", e.target.value)}
                                            className="border-slate-200 dark:border-slate-700"
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Middle Name</label>
                                        <Input
                                            value={profileForm.middleName}
                                            onChange={(e) => handleProfileChange("middleName", e.target.value)}
                                            className="border-slate-200 dark:border-slate-700"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <Input
                                            value={profileForm.phoneNumber}
                                            onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                                            className="border-slate-200 dark:border-slate-700"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                                        <Input
                                            type="date"
                                            value={profileForm.dateOfBirth}
                                            onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                                            className="border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                                        <Select value={profileForm.gender} onValueChange={(value) => handleProfileChange("gender", value)}>
                                            <SelectTrigger className="border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">Profile Picture <User className="h-4 w-4" /></label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                setProfilePicture(file || null);
                                            }}
                                            className="border-slate-200 dark:border-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                        {profilePicture && <p className="text-sm text-indigo-600 dark:text-indigo-400">Selected: {profilePicture.name}</p>}
                                    </div>
                                </motion.div>
                            )}

                            {showAddressSection && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Street</label>
                                            <Input value={addressDraft.street} onChange={e => setAddressDraft(d => ({ ...d, street: e.target.value }))} className="border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                                            <Input value={addressDraft.city} onChange={e => setAddressDraft(d => ({ ...d, city: e.target.value }))} className="border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">State</label>
                                            <Input value={addressDraft.state} onChange={e => setAddressDraft(d => ({ ...d, state: e.target.value }))} className="border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Zip Code</label>
                                            <Input value={addressDraft.zipCode} onChange={e => setAddressDraft(d => ({ ...d, zipCode: e.target.value }))} className="border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                                            <Input value={addressDraft.country} onChange={e => setAddressDraft(d => ({ ...d, country: e.target.value }))} className="border-slate-200 dark:border-slate-700" />
                                        </div>
                                        <div className="space-y-2 flex items-end">
                                            <Button 
                                                type="button" 
                                                variant={addressDraft.isPrimary ? "default" : "outline"} 
                                                onClick={() => setAddressDraft(d => ({ ...d, isPrimary: !d.isPrimary }))}
                                                className={cn(addressDraft.isPrimary && "bg-indigo-600 hover:bg-indigo-700")}
                                            >
                                                {addressDraft.isPrimary ? 'Primary' : 'Set Primary'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" onClick={addAddress} className="bg-indigo-600 hover:bg-indigo-700" disabled={!addressDraft.street && !addressDraft.city && !addressDraft.country}>
                                            Add Address
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setAddressDraft({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false })}>
                                            Clear
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Addresses</p>
                                        {addresses.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No addresses yet.</p>}
                                        <div className="space-y-2">
                                            {addresses.map((a, i) => (
                                                <motion.div 
                                                    key={i} 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
                                                >
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                        <p className="font-medium">{a.street || '(No street)'}{a.city ? ', ' + a.city : ''}{a.state ? ', ' + a.state : ''}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.country || 'No country'}{a.zipCode ? ' - ' + a.zipCode : ''}</p>
                                                        {a.isPrimary && <Badge className="mt-1 bg-indigo-600">Primary</Badge>}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!a.isPrimary && <Button size="sm" variant="outline" onClick={() => togglePrimary(i)}>Make Primary</Button>}
                                                        <Button size="sm" variant="outline" onClick={() => removeAddress(i)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Remove</Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center justify-end gap-3"
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </motion.div>
            </form>
        </div>
    );
}
