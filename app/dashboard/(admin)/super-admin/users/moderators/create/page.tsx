/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService, AdminRole } from "@/services/user/admin.service";
import { adminProfileService } from "@/services/user/adminProfile.service";
import { toast } from "sonner";
import { ShieldCheck, Loader2, CheckCircle2, User, Mail, Home, Globe } from "lucide-react";

interface ModeratorForm {
    fullName: string;
    email: string;
    registrationNumber: string;
    joiningDate: string;
    profile: {
        firstName: string;
        lastName: string;
        middleName: string;
        phoneNumber: string;
        dateOfBirth: string;
        gender: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
}

const initialForm: ModeratorForm = {
    fullName: "",
    email: "",
    registrationNumber: "",
    joiningDate: new Date().toISOString().split("T")[0],
    profile: {
        firstName: "",
        lastName: "",
        middleName: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
    },
    address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Bangladesh",
    },
};

export default function CreateModeratorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<ModeratorForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    const handleChange = (section: string, field: string, value: string) => {
        if (section === "root") {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                [section]: { ...(prev as any)[section], [field]: value }
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.email || !formData.registrationNumber) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                registrationNumber: formData.registrationNumber,
                joiningDate: formData.joiningDate,
                role: "moderator" as AdminRole,
            };

            let dataToSend: any = payload;
            if (profilePicture) {
                const fd = new FormData();
                fd.append("data", JSON.stringify(payload));
                fd.append("profilePicture", profilePicture);
                dataToSend = fd;
            }

            const created = await adminService.create(dataToSend);

            if (formData.profile.firstName && formData.profile.lastName) {
                await adminProfileService.create(created.id, {
                    ...formData.profile,
                    addresses: [{ ...formData.address, isPrimary: true }]
                });
            }

            toast.success("Moderator created successfully");
            router.push(`/dashboard/super-admin/users/moderators`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to create moderator");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <PageHeader
                title="Create Moderator"
                subtitle="Provision a new administrative moderator"
                icon={ShieldCheck}
                onBack={() => router.push("/dashboard/super-admin/users/moderators")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-amber-500" />
                                Account Details
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                                    <Input
                                        value={formData.fullName}
                                        onChange={(e) => handleChange("root", "fullName", e.target.value)}
                                        placeholder="Enter full name"
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("root", "email", e.target.value)}
                                        placeholder="email@example.com"
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registration ID *</label>
                                    <Input
                                        value={formData.registrationNumber}
                                        onChange={(e) => handleChange("root", "registrationNumber", e.target.value)}
                                        placeholder="EMP-001"
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Joining Date</label>
                                    <Input
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={(e) => handleChange("root", "joiningDate", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-500" />
                                Profile Information
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">First Name</label>
                                    <Input
                                        value={formData.profile.firstName}
                                        onChange={(e) => handleChange("profile", "firstName", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Middle Name</label>
                                    <Input
                                        value={formData.profile.middleName}
                                        onChange={(e) => handleChange("profile", "middleName", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
                                    <Input
                                        value={formData.profile.lastName}
                                        onChange={(e) => handleChange("profile", "lastName", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                                    <Input
                                        value={formData.profile.phoneNumber}
                                        onChange={(e) => handleChange("profile", "phoneNumber", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                                    <Select
                                        value={formData.profile.gender}
                                        onValueChange={(v) => handleChange("profile", "gender", v)}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
                                    <Input
                                        type="date"
                                        value={formData.profile.dateOfBirth}
                                        onChange={(e) => handleChange("profile", "dateOfBirth", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Home className="w-4 h-4 text-emerald-500" />
                                Address Details
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Street Address</label>
                                    <Input
                                        value={formData.address.street}
                                        onChange={(e) => handleChange("address", "street", e.target.value)}
                                        placeholder="123 Main St"
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City</label>
                                    <Input
                                        value={formData.address.city}
                                        onChange={(e) => handleChange("address", "city", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">State / Province</label>
                                    <Input
                                        value={formData.address.state}
                                        onChange={(e) => handleChange("address", "state", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Zip / Postal Code</label>
                                    <Input
                                        value={formData.address.zipCode}
                                        onChange={(e) => handleChange("address", "zipCode", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Country</label>
                                    <Input
                                        value={formData.address.country}
                                        onChange={(e) => handleChange("address", "country", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                Action Center
                            </h3>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Picture</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-amber-500/50 transition-colors bg-slate-50/50">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="pfp-upload"
                                    />
                                    <label htmlFor="pfp-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">{profilePicture ? profilePicture.name : "Click to upload image"}</span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm shadow-amber-200 transition-all active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                Create Moderator
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="w-full h-12 rounded-lg border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
