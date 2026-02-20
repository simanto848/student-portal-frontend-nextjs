"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teacherService, TeacherDesignation, TeacherCreatePayload } from "@/services/user/teacher.service";
import { teacherProfileService, TeacherProfilePayload } from "@/services/user/teacherProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { toast } from "sonner";
import { GraduationCap, Loader2, CheckCircle2, User, Home, Zap, MapPin, Globe, Mail, Phone, Calendar } from "lucide-react";

interface TeacherForm {
    fullName: string;
    email: string;
    departmentId: string;
    designation: TeacherDesignation;
    registrationNumber: string;
    joiningDate: string;
    phone: string;
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

const initialForm: TeacherForm = {
    fullName: "",
    email: "",
    departmentId: "",
    designation: "lecturer",
    registrationNumber: "",
    joiningDate: new Date().toISOString().split("T")[0],
    phone: "",
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

export default function CreateFacultyPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<TeacherForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    useEffect(() => {
        const loadDepartments = async () => {
            setLoadingDepartments(true);
            try {
                const d = await departmentService.getAllDepartments();
                setDepartments(Array.isArray(d) ? d : []);
            } catch (e: any) {
                toast.error(e?.message || "Failed to load departments");
            } finally {
                setLoadingDepartments(false);
            }
        };
        loadDepartments();
    }, []);

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
        if (!formData.fullName || !formData.email || !formData.departmentId || !formData.registrationNumber) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: TeacherCreatePayload = {
                fullName: formData.fullName,
                email: formData.email,
                departmentId: formData.departmentId,
                designation: formData.designation,
                registrationNumber: formData.registrationNumber,
                joiningDate: formData.joiningDate,
                phone: formData.phone || undefined,
            };

            let dataToSend: TeacherCreatePayload | FormData = payload;

            if (profilePicture) {
                const fd = new FormData();
                fd.append('data', JSON.stringify(payload));
                fd.append('profilePicture', profilePicture);
                dataToSend = fd;
            }

            const created = await teacherService.create(dataToSend);

            if (formData.profile.firstName && formData.profile.lastName) {
                const profilePayload: TeacherProfilePayload = {
                    ...formData.profile,
                    addresses: [{ ...formData.address, isPrimary: true }],
                };
                await teacherProfileService.create(created.id, profilePayload);
            }

            toast.success("Faculty member created successfully");
            router.push(`/dashboard/super-admin/users/faculty`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to create teacher");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <PageHeader
                title="Create Faculty"
                subtitle="Provision a new teaching member"
                icon={GraduationCap}
                onBack={() => router.push("/dashboard/super-admin/users/faculty")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Academic Section */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Academic Identifiers
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                                    <Input 
                                        value={formData.fullName} 
                                        onChange={(e) => handleChange("root", "fullName", e.target.value)}
                                        placeholder="Full legal name"
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department *</label>
                                    <Select 
                                        value={formData.departmentId} 
                                        onValueChange={(v) => handleChange("root", "departmentId", v)}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 shadow-none">
                                            {loadingDepartments ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <SelectValue placeholder="Select Department" />}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id || dept._id} value={dept.id || dept._id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Designation *</label>
                                    <Select 
                                        value={formData.designation} 
                                        onValueChange={(v) => handleChange("root", "designation", v)}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 shadow-none">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lecturer">Lecturer</SelectItem>
                                            <SelectItem value="assistant_professor">Assistant Professor</SelectItem>
                                            <SelectItem value="associate_professor">Associate Professor</SelectItem>
                                            <SelectItem value="professor">Professor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registration Code *</label>
                                    <Input 
                                        value={formData.registrationNumber} 
                                        onChange={(e) => handleChange("root", "registrationNumber", e.target.value)}
                                        placeholder="FAC-XXX-YYY"
                                        className="h-10 rounded-lg border-slate-200 shadow-none font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Joining Date</label>
                                    <Input 
                                        type="date"
                                        value={formData.joiningDate} 
                                        onChange={(e) => handleChange("root", "joiningDate", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Email *</label>
                                    <Input 
                                        type="email"
                                        value={formData.email} 
                                        onChange={(e) => handleChange("root", "email", e.target.value)}
                                        placeholder="faculty@institution.edu"
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Section */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-500" />
                                Personal Profile Information
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">First Name</label>
                                    <Input 
                                        value={formData.profile.firstName} 
                                        onChange={(e) => handleChange("profile", "firstName", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Middle Name</label>
                                    <Input 
                                        value={formData.profile.middleName} 
                                        onChange={(e) => handleChange("profile", "middleName", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
                                    <Input 
                                        value={formData.profile.lastName} 
                                        onChange={(e) => handleChange("profile", "lastName", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                                    <Input 
                                        value={formData.profile.phoneNumber} 
                                        onChange={(e) => handleChange("profile", "phoneNumber", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
                                    <Input 
                                        type="date"
                                        value={formData.profile.dateOfBirth} 
                                        onChange={(e) => handleChange("profile", "dateOfBirth", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                                    <Select 
                                        value={formData.profile.gender} 
                                        onValueChange={(v) => handleChange("profile", "gender", v)}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 shadow-none">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Section */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Home className="w-4 h-4 text-emerald-500" />
                                Residential Data
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Street</label>
                                    <Input 
                                        value={formData.address.street} 
                                        onChange={(e) => handleChange("address", "street", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City</label>
                                    <Input 
                                        value={formData.address.city} 
                                        onChange={(e) => handleChange("address", "city", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">State / Province</label>
                                    <Input 
                                        value={formData.address.state} 
                                        onChange={(e) => handleChange("address", "state", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Zip Code</label>
                                    <Input 
                                        value={formData.address.zipCode} 
                                        onChange={(e) => handleChange("address", "zipCode", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Country</label>
                                    <Input 
                                        value={formData.address.country} 
                                        onChange={(e) => handleChange("address", "country", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
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
                                Execution Control
                            </h3>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Picture</label>
                                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50 hover:bg-white transition-colors cursor-pointer group">
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                                        className="hidden" 
                                        id="avatar-upload"
                                    />
                                    <label htmlFor="avatar-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs text-slate-500">{profilePicture ? profilePicture.name : "Select Image"}</span>
                                    </label>
                                </div>
                            </div>

                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm shadow-amber-200 transition-transform active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                Provision Faculty
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => router.back()}
                                className="w-full h-11 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
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
