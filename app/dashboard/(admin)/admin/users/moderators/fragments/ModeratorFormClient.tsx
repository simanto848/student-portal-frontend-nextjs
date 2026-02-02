"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService, Admin, AdminRole } from "@/services/user/admin.service";
import { toast } from "sonner";
import { ShieldPlus, ChevronRight, ChevronLeft, Loader2, Settings2, CheckCircle2, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ModeratorFormClientProps {
    mode: "create" | "edit";
    initialData?: Admin;
}

interface BasicForm {
    fullName: string;
    email: string;
    role: AdminRole;
    registrationNumber: string;
}

interface AdvancedForm {
    joiningDate: string;
    registeredIps: string[];
    ipInput: string;
}

interface ProfileForm {
    firstName: string;
    lastName: string;
    middleName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
}

export function ModeratorFormClient({ mode, initialData }: ModeratorFormClientProps) {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [useAdvanced, setUseAdvanced] = useState(false);
    const [useProfile, setUseProfile] = useState(false);

    const [basic, setBasic] = useState<BasicForm>({
        fullName: initialData?.fullName || "",
        email: initialData?.email || "",
        role: initialData?.role || "moderator",
        registrationNumber: initialData?.registrationNumber || "",
    });

    const [advanced, setAdvanced] = useState<AdvancedForm>({
        joiningDate: initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : "",
        registeredIps: initialData?.registeredIpAddress || [],
        ipInput: "",
    });

    const [profile, setProfile] = useState<ProfileForm>({
        firstName: initialData?.profile?.firstName || "",
        lastName: initialData?.profile?.lastName || "",
        middleName: initialData?.profile?.middleName || "",
        phoneNumber: initialData?.profile?.phoneNumber || "",
        dateOfBirth: initialData?.profile?.dateOfBirth ? new Date(initialData.profile.dateOfBirth).toISOString().split('T')[0] : "",
        gender: initialData?.profile?.gender || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validation functions
    const validateEmail = (email: string): string | null => {
        if (!email.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Invalid email address";
        return null;
    };

    const validateFullName = (name: string): string | null => {
        if (!name.trim()) return "Full name is required";
        if (name.trim().length < 2) return "Full name must be at least 2 characters";
        return null;
    };

    const validatePhoneNumber = (phone: string): string | null => {
        if (!phone) return null; // Optional field
        const phoneRegex = /^[+]?[\d\s-()]+$/;
        if (!phoneRegex.test(phone)) return "Invalid phone number format";
        return null;
    };

    const validateStep = (stepNum: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (stepNum === 1) {
            const fullNameError = validateFullName(basic.fullName);
            const emailError = validateEmail(basic.email);

            if (fullNameError) newErrors.fullName = fullNameError;
            if (emailError) newErrors.email = emailError;
        }

        if (stepNum === 2) {
            if (useProfile) {
                if (!profile.firstName.trim()) newErrors.firstName = "First name is required";
                if (!profile.lastName.trim()) newErrors.lastName = "Last name is required";

                const phoneError = validatePhoneNumber(profile.phoneNumber);
                if (phoneError) newErrors.phoneNumber = phoneError;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (field: string, value: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        if (field === 'fullName' || field === 'email') {
            setBasic(prev => ({ ...prev, [field]: value }));
        } else if (field === 'firstName' || field === 'lastName' || field === 'phoneNumber' || field === 'middleName' || field === 'dateOfBirth' || field === 'gender') {
            setProfile(prev => ({ ...prev, [field]: value }));
        }
    };


    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload: any = {
                fullName: basic.fullName.trim(),
                email: basic.email.trim().toLowerCase(),
                role: basic.role,
                registrationNumber: basic.registrationNumber.trim() || undefined,
            };

            if (useAdvanced || mode === "edit") {
                if (advanced.joiningDate) payload.joiningDate = advanced.joiningDate;
                if (advanced.registeredIps.length) payload.registeredIpAddress = advanced.registeredIps;
            }

            if (useProfile || mode === "edit") {
                payload.profile = {
                    firstName: profile.firstName.trim() || basic.fullName.split(' ')[0],
                    lastName: profile.lastName.trim() || basic.fullName.split(' ').slice(1).join(' ') || "User",
                };
                if (profile.middleName) payload.profile.middleName = profile.middleName.trim();
                if (profile.phoneNumber) payload.profile.phoneNumber = profile.phoneNumber.trim();
                if (profile.dateOfBirth) payload.profile.dateOfBirth = profile.dateOfBirth;
                if (profile.gender) payload.profile.gender = profile.gender;
            }

            let dataToSend: any = payload;
            if (profilePicture) {
                const formData = new FormData();
                formData.append('data', JSON.stringify(payload));
                formData.append('profilePicture', profilePicture);
                dataToSend = formData;
            }

            if (mode === "create") {
                const created = await adminService.create(dataToSend);
                toast.success("Moderator created successfully");
                router.push(`/dashboard/admin/users/moderators/${created.id}`);
            } else {
                await adminService.update(initialData!.id, dataToSend);
                toast.success("Moderator updated successfully");
                router.push(`/dashboard/admin/users/moderators/${initialData!.id}`);
            }
        } catch (error: any) {
            // Handle backend validation errors
            if (error?.response?.data?.errors) {
                const backendErrors: Record<string, string> = {};
                error.response.data.errors.forEach((err: any) => {
                    if (err.path) {
                        backendErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(backendErrors);
                toast.error("Please fix the validation errors");
            } else {
                toast.error(error?.message || `Failed to ${mode} moderator`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            if (step === 1) {
                if (useProfile) setStep(2);
                else if (useAdvanced) setStep(3);
                else setStep(4);
            } else if (step === 2) {
                if (useAdvanced) setStep(3);
                else setStep(4);
            } else {
                setStep(prev => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4);
            }
        }
    };

    const prevStep = () => {
        if (step === 4) {
            if (useAdvanced) setStep(3);
            else if (useProfile) setStep(2);
            else setStep(1);
        } else if (step === 3) {
            if (useProfile) setStep(2);
            else setStep(1);
        } else {
            setStep(prev => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={mode === "create" ? "Add Moderator" : "Edit Moderator"}
                subtitle={mode === "create" ? "Provision a new moderator account" : `Updating ${basic.fullName}`}
                icon={mode === "create" ? ShieldPlus : Settings2}
                onBack={() => router.push("/dashboard/admin/users/moderators")}
            />

            <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                    step === s ? "bg-blue-600 text-white shadow-md shadow-blue-100" :
                                        step > s ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                                )}>
                                    {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                                </div>
                                {s < 4 && <div className="w-8 h-px bg-slate-200" />}
                            </div>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={basic.fullName}
                                            onChange={e => handleFieldChange('fullName', e.target.value)}
                                            placeholder="John Doe"
                                            className={cn("rounded-xl", errors.fullName && "border-red-500")}
                                        />
                                        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="email"
                                            value={basic.email}
                                            onChange={e => handleFieldChange('email', e.target.value)}
                                            placeholder="john@example.com"
                                            className={cn("rounded-xl", errors.email && "border-red-500")}
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Registration Number</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value="AUTO GENERATED BY SYSTEM"
                                                disabled
                                                className="rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Role</label>
                                        <Input
                                            value="Moderator"
                                            disabled
                                            className="rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed capitalize"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold text-slate-800">Profile Information</Label>
                                            <p className="text-xs text-slate-500">Collect personal details and profile picture</p>
                                        </div>
                                        <Switch
                                            checked={useProfile}
                                            onCheckedChange={setUseProfile}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold text-slate-800">Advanced Settings</Label>
                                            <p className="text-xs text-slate-500">Configure joining date and IP restrictions</p>
                                        </div>
                                        <Switch
                                            checked={useAdvanced}
                                            onCheckedChange={setUseAdvanced}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">First Name <span className="text-red-500">*</span></label>
                                        <Input
                                            value={profile.firstName}
                                            onChange={e => handleFieldChange('firstName', e.target.value)}
                                            placeholder="John"
                                            className={cn("rounded-xl", errors.firstName && "border-red-500")}
                                        />
                                        {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Middle Name</label>
                                        <Input
                                            value={profile.middleName}
                                            onChange={e => handleFieldChange('middleName', e.target.value)}
                                            placeholder="Quincy"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Last Name <span className="text-red-500">*</span></label>
                                        <Input
                                            value={profile.lastName}
                                            onChange={e => handleFieldChange('lastName', e.target.value)}
                                            placeholder="Doe"
                                            className={cn("rounded-xl", errors.lastName && "border-red-500")}
                                        />
                                        {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                        <Input
                                            value={profile.phoneNumber}
                                            onChange={e => handleFieldChange('phoneNumber', e.target.value)}
                                            placeholder="+1 234 567 890"
                                            className={cn("rounded-xl", errors.phoneNumber && "border-red-500")}
                                        />
                                        {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                                        <Input
                                            type="date"
                                            value={profile.dateOfBirth}
                                            onChange={e => handleFieldChange('dateOfBirth', e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Gender</label>
                                        <Select
                                            value={profile.gender}
                                            onValueChange={(value) => handleFieldChange('gender', value)}
                                        >
                                            <SelectTrigger className="rounded-xl h-10">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Profile Picture</label>
                                        <Input type="file" accept="image/*" onChange={e => setProfilePicture(e.target.files?.[0] || null)} className="rounded-xl cursor-pointer" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Joining Date</label>
                                        <Input type="date" value={advanced.joiningDate} onChange={e => setAdvanced({ ...advanced, joiningDate: e.target.value })} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Registered IPs (Optional)</label>
                                        <div className="flex gap-2 text-xs mb-2">
                                            {advanced.registeredIps.map(ip => (
                                                <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                                                    {ip}
                                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setAdvanced({ ...advanced, registeredIps: advanced.registeredIps.filter(i => i !== ip) })} />
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input value={advanced.ipInput} onChange={e => setAdvanced({ ...advanced, ipInput: e.target.value })} placeholder="127.0.0.1" className="rounded-xl" />
                                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => {
                                                if (advanced.ipInput) {
                                                    setAdvanced({ ...advanced, registeredIps: [...advanced.registeredIps, advanced.ipInput], ipInput: "" });
                                                }
                                            }}>Add</Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Review Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Full Name</p>
                                            <p className="font-medium">{basic.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email</p>
                                            <p className="font-medium">{basic.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Registration</p>
                                            <p className="font-medium font-mono">{basic.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Role</p>
                                            <Badge className="bg-blue-600 text-white capitalize">{basic.role}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                    <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-700">
                                        {mode === "create"
                                            ? "Upon creation, the moderator will receive a welcome email with their account credentials."
                                            : "Updating these settings will take effect immediately. Please ensure the information is accurate."}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                        <Button variant="ghost" onClick={prevStep} disabled={step === 1} className="rounded-xl flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <div className="flex gap-3">
                            {step < 4 ? (
                                <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 px-8">
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 px-8">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "create" ? "Finish & Create" : "Save Changes"}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
