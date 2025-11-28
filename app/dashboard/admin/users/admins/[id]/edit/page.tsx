"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { adminService, Admin, AdminRole } from "@/services/user/admin.service";
import { adminProfileService, AdminProfile } from "@/services/user/adminProfile.service";
import { toast } from "sonner";
import { Shield, User } from "lucide-react";

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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
                    setShowProfileSection(true);
                }
            } catch (_) {
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!admin) return;
        setIsSaving(true);
        try {
            await adminService.update(admin.id, {
                fullName: form.fullName.trim(),
                role: form.role,
                joiningDate: form.joiningDate || undefined,
                registrationNumber: form.registrationNumber.trim(),
            });

            if (showProfileSection && profileForm.firstName && profileForm.lastName) {
                const payload: any = {
                    firstName: profileForm.firstName.trim(),
                    lastName: profileForm.lastName.trim(),
                };
                if (profileForm.middleName) payload.middleName = profileForm.middleName.trim();
                if (profileForm.phoneNumber) payload.phoneNumber = profileForm.phoneNumber.trim();
                if (profileForm.dateOfBirth) payload.dateOfBirth = profileForm.dateOfBirth;
                if (profileForm.gender) payload.gender = profileForm.gender;
                try {
                    await adminProfileService.upsert(admin.id, payload);
                } catch (err: any) {
                    toast.warning(`Profile save failed: ${err?.message || 'Unknown error'}`);
                }
            }

            toast.success("Admin updated successfully");
            router.push(`/dashboard/admin/users/admins/${admin.id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save changes");
        } finally {
            setIsSaving(false);
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <PageHeader
                    title={`Edit ${admin.fullName}`}
                    subtitle="Update administrator information"
                    icon={Shield}
                />

                <Card className="border-[#a3b18a]/30">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344e41]">Full Name</label>
                                <Input
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344e41]">Role</label>
                                <Select value={form.role} onValueChange={(value) => handleChange("role", value)}>
                                    <SelectTrigger className="bg-white border-[#a3b18a]/60 text-[#344e41]">
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
                                <label className="text-sm font-medium text-[#344e41]">Joining Date</label>
                                <Input
                                    type="date"
                                    value={form.joiningDate}
                                    onChange={(e) => handleChange("joiningDate", e.target.value)}
                                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#344e41]">Registration Number</label>
                                <Input
                                    value={form.registrationNumber}
                                    onChange={(e) => handleChange("registrationNumber", e.target.value)}
                                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Section */}
                <Card className="border-[#a3b18a]/30">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[#344e41]" />
                                <h3 className="text-lg font-semibold text-[#344e41]">Profile Information</h3>
                            </div>
                            <Button
                                type="button"
                                variant={showProfileSection ? "default" : "outline"}
                                onClick={() => setShowProfileSection(v => !v)}
                                className={showProfileSection ? "bg-[#588157] text-white" : "border-[#a3b18a] text-[#344e41]"}
                            >
                                {showProfileSection ? "Hide Profile" : "Add/Edit Profile"}
                            </Button>
                        </div>

                        {showProfileSection && (
                            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-[#a3b18a]/30">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#344e41]">First Name <span className="text-red-500">*</span></label>
                                    <Input
                                        value={profileForm.firstName}
                                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                                        className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#344e41]">Last Name <span className="text-red-500">*</span></label>
                                    <Input
                                        value={profileForm.lastName}
                                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                                        className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                        placeholder="Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#344e41]">Middle Name</label>
                                    <Input
                                        value={profileForm.middleName}
                                        onChange={(e) => handleProfileChange("middleName", e.target.value)}
                                        className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#344e41]">Phone Number</label>
                                    <Input
                                        value={profileForm.phoneNumber}
                                        onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                                        className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#344e41]">Date of Birth</label>
                                    <Input
                                        type="date"
                                        value={profileForm.dateOfBirth}
                                        onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                                        className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#344e41]">Gender</label>
                                    <Select value={profileForm.gender} onValueChange={(value) => handleProfileChange("gender", value)}>
                                        <SelectTrigger className="bg-white border-[#a3b18a]/60 text-[#344e41]">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#a3b18a] text-[#344e41]"
                        onClick={() => router.back()}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-[#588157] hover:bg-[#3a5a40] text-white">
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
