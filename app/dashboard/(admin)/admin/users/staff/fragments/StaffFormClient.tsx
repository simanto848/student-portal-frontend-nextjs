"use client";

import { useState, useEffect } from "react";
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
    StaffRole,
    staffService
} from "@/services/user/staff.service";
import {
    StaffProfile,
    staffProfileService
} from "@/services/user/staffProfile.service";
import {
    ArrowLeft,
    Mail,
    Calendar,
    MapPin,
    User as UserIcon,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Network,
    Sparkles,
    Settings2,
    Lock,
    Globe,
    Trash2,
    Loader2,
    ShieldPlus,
    Building2,
    UploadCloud,
    Phone
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format as formatDate } from "date-fns";

interface StaffFormClientProps {
    staff?: Staff;
    profile?: StaffProfile | null;
    departments: Array<{ id?: string; _id?: string; name: string }>;
}

const roleLabel: Record<StaffRole, string> = {
    program_controller: "Program Controller",
    admission: "Admission",
    library: "Library",
    it: "IT Specialist",
    exam_controller: "Exam Controller",
};

export function StaffFormClient({ staff, profile, departments }: StaffFormClientProps) {
    const router = useRouter();
    const isEdit = !!staff;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 5));
        }
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [basic, setBasic] = useState({
        fullName: staff?.fullName || "",
        email: staff?.email || "",
        departmentId: staff?.departmentId || "",
        role: staff?.role || "admission" as StaffRole,
        registrationNumber: staff?.registrationNumber || "",
    });

    const [advanced, setAdvanced] = useState({
        joiningDate: staff?.joiningDate ? staff.joiningDate.split("T")[0] : "",
        registeredIps: staff?.registeredIpAddress || [],
        ipInput: "",
    });

    const [profileForm, setProfileForm] = useState({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        middleName: profile?.middleName || "",
        phoneNumber: profile?.phoneNumber || "",
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",
        gender: profile?.gender || "",
    });

    const [addresses, setAddresses] = useState(profile?.addresses || []);
    const [addressDraft, setAddressDraft] = useState({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(staff?.profile?.profilePicture ? (getImageUrl(staff.profile.profilePicture) ?? "") : "");

    useEffect(() => {
        if (!profilePicture) {
            if (isEdit && staff?.profile?.profilePicture) {
                setPreviewUrl(getImageUrl(staff.profile.profilePicture) ?? "");
            } else {
                setPreviewUrl("");
            }
            return;
        }

        const objectUrl = URL.createObjectURL(profilePicture);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [profilePicture, isEdit, staff, getImageUrl]);

    const validateStep = (s: number) => {
        const newErrors: Record<string, string> = {};

        if (s === 1) {
            if (!basic.fullName.trim()) newErrors.fullName = "Full name required";
            if (!isEdit && !basic.email.trim()) newErrors.email = "Email address required";
            if (!basic.departmentId) newErrors.departmentId = "Department required";
        } else if (s === 2) {
            if (!advanced.joiningDate) newErrors.joiningDate = "Joining date required";
        } else if (s === 3) {
            if (!profileForm.firstName.trim()) newErrors.firstName = "First name required";
            if (!profileForm.lastName.trim()) newErrors.lastName = "Last name required";
            if (!profileForm.gender) newErrors.gender = "Gender required";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fix errors before proceeding");
            return false;
        }
        return true;
    };


    const handleAddIp = () => {
        const ip = advanced.ipInput.trim();
        if (!ip) return;
        if (advanced.registeredIps.includes(ip)) {
            toast.error("IP address already added");
            return;
        }
        setAdvanced(prev => ({ ...prev, registeredIps: [...prev.registeredIps, ip], ipInput: "" }));
    };

    const handleRemoveIp = (ip: string) => {
        setAdvanced(prev => ({ ...prev, registeredIps: prev.registeredIps.filter(i => i !== ip) }));
    };

    const addAddress = () => {
        if (!addressDraft.street && !addressDraft.city && !addressDraft.country) {
            toast.error("Provide street/city/country");
            return;
        }
        setAddresses(prev => {
            let next = [...prev];
            if (addressDraft.isPrimary) next = next.map(a => ({ ...a, isPrimary: false }));
            next.push({ ...addressDraft });
            return next;
        });
        setAddressDraft({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
    };

    const handleSubmit = async () => {
        for (let i = 1; i <= 3; i++) {
            if (!validateStep(i)) {
                setStep(i);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                fullName: basic.fullName.trim(),
                departmentId: basic.departmentId,
                role: basic.role,
                registrationNumber: basic.registrationNumber.trim() || undefined,
                joiningDate: advanced.joiningDate || undefined,
                registeredIpAddress: advanced.registeredIps,
            };

            if (!isEdit) {
                payload.email = basic.email.trim().toLowerCase();
            }

            // Prepare profile and address data
            const profileData: any = {
                firstName: profileForm.firstName.trim() || basic.fullName.split(" ")[0],
                lastName: profileForm.lastName.trim() || basic.fullName.split(" ").slice(1).join(" ") || "Staff",
                middleName: profileForm.middleName?.trim() || undefined,
                phoneNumber: profileForm.phoneNumber?.trim() || undefined,
                dateOfBirth: profileForm.dateOfBirth || undefined,
                gender: profileForm.gender || undefined,
                addresses: addresses.map(a => ({ ...a })),
            };

            let dataToSend: any = payload;
            const formData = new FormData();
            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }
            formData.append('data', JSON.stringify(payload));
            dataToSend = formData;

            let staffId: string;
            if (isEdit) {
                await staffService.update(staff.id, dataToSend);
                staffId = staff.id;
                toast.success("Staff profile updated");
            } else {
                const created = await staffService.create(dataToSend);
                staffId = created.id;
                toast.success("New staff member added");
            }

            if (profileForm.firstName || addresses.length > 0) {
                try {
                    await staffProfileService.upsert(staffId, profileData);
                } catch (profileError) {
                    console.error("Profile sync error:", profileError);
                    toast.warning("Staff saved but profile synchronization failed.");
                }
            }

            router.push(`/dashboard/admin/users/staff/${staffId}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, label: "Basic Info", icon: UserIcon },
        { id: 2, label: "Security", icon: Lock },
        { id: 3, label: "Personal", icon: Briefcase },
        { id: 4, label: "Address", icon: MapPin },
        { id: 5, label: "Review", icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-2 sm:mb-4 w-fit shadow-sm">
                            <ShieldPlus className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{isEdit ? "Update Staff" : "Add Staff"}</span>
                        </Badge>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            {isEdit ? `Edit: ${staff?.fullName}` : "New Staff Member"}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-3xl md:rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                <div className="bg-slate-900 px-6 py-6 md:px-10 md:py-8 flex items-center justify-between overflow-x-auto gap-8 no-scrollbar">
                    {steps.map((s, idx) => {
                        const active = step === s.id;
                        const completed = step > s.id;
                        return (
                            <div key={s.id} className="flex items-center gap-4 flex-shrink-0 group cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${active ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-110' : completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                    {completed ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                                </div>
                                <div className="hidden sm:block">
                                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${active ? 'text-amber-500' : 'text-slate-500'}`}>Step 0{s.id}</p>
                                    <p className={`text-sm font-black tracking-tight ${active ? 'text-white' : 'text-slate-400'}`}>{s.label}</p>
                                </div>
                                {idx < steps.length - 1 && <div className="hidden lg:block h-0.5 w-8 bg-slate-800" />}
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 sm:p-6 md:px-6 md:py-8 lg:p-10 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                                    <FormGroup label="Full Name" icon={UserIcon} error={errors.fullName}>
                                        <Input
                                            value={basic.fullName}
                                            onChange={e => {
                                                setBasic({ ...basic, fullName: e.target.value });
                                                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                                            }}
                                            placeholder="Enter full name"
                                            className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.fullName ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900 focus:ring-amber-500/20`}
                                        />
                                    </FormGroup>
                                    {!isEdit && (
                                        <FormGroup label="Email Address" icon={Mail} error={errors.email}>
                                            <Input
                                                value={basic.email}
                                                onChange={e => {
                                                    setBasic({ ...basic, email: e.target.value });
                                                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                                }}
                                                placeholder="email@university.edu"
                                                className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.email ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900 focus:ring-amber-500/20`}
                                            />
                                        </FormGroup>
                                    )}
                                    <FormGroup label="Department" icon={Building2} error={errors.departmentId}>
                                        <Select
                                            value={basic.departmentId}
                                            onValueChange={(v) => {
                                                setBasic({ ...basic, departmentId: v });
                                                if (errors.departmentId) setErrors(prev => ({ ...prev, departmentId: "" }));
                                            }}
                                        >
                                            <SelectTrigger className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.departmentId ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900 focus:ring-amber-500/20`}>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl">
                                                {departments.map(d => (
                                                    <SelectItem key={d.id || d._id} value={(d.id || d._id) as string} className="py-3 font-bold text-slate-700 m-1 rounded-xl">
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                    <FormGroup label="Staff Role" icon={Briefcase}>
                                        <Select value={basic.role} onValueChange={(v) => setBasic({ ...basic, role: v as StaffRole })}>
                                            <SelectTrigger className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20">
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl">
                                                {Object.entries(roleLabel).map(([key, label]) => (
                                                    <SelectItem key={key} value={key} className="py-3 font-bold text-slate-700 m-1 rounded-xl">
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                    <FormGroup label="Registration Number" icon={Network}>
                                        <div className="relative">
                                            <Input
                                                value={isEdit ? basic.registrationNumber : "Auto-generated by system"}
                                                readOnly
                                                className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-100 border-2 border-slate-200 font-bold text-slate-500 cursor-not-allowed opacity-70"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </FormGroup>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormGroup label="Joining Date" icon={Calendar} error={errors.joiningDate}>
                                        <DatePicker
                                            date={advanced.joiningDate ? parseISO(advanced.joiningDate) : undefined}
                                            onChange={d => {
                                                setAdvanced({ ...advanced, joiningDate: d ? formatDate(d, "yyyy-MM-dd") : "" });
                                                if (errors.joiningDate) setErrors(prev => ({ ...prev, joiningDate: "" }));
                                            }}
                                        />
                                    </FormGroup>
                                    <FormGroup label="IP address restrictions" icon={Lock}>
                                        <div className="relative">
                                            <Input
                                                value={advanced.ipInput}
                                                onChange={e => setAdvanced({ ...advanced, ipInput: e.target.value })}
                                                placeholder="e.g. 192.168.1.1"
                                                className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddIp}
                                                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-amber-600 transition-all active:scale-95"
                                            >
                                                <ShieldPlus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </FormGroup>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Allowed IP addresses</p>
                                    <div className="flex flex-wrap gap-3 min-h-[60px]">
                                        {advanced.registeredIps.length === 0 ? (
                                            <div className="w-full h-16 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                No restrictions (Open Access)
                                            </div>
                                        ) : (
                                            advanced.registeredIps.map(ip => (
                                                <Badge key={ip} className="h-10 px-4 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-black text-xs flex items-center gap-3 shadow-sm group hover:border-red-200 transition-all">
                                                    {ip}
                                                    <Trash2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-500 cursor-pointer" onClick={() => handleRemoveIp(ip)} />
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <FormGroup label="First Name" icon={UserIcon} error={errors.firstName}>
                                        <Input
                                            value={profileForm.firstName}
                                            onChange={e => {
                                                setProfileForm({ ...profileForm, firstName: e.target.value });
                                                if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
                                            }}
                                            placeholder="First Name"
                                            className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.firstName ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900`}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Middle Name" icon={UserIcon}>
                                        <Input value={profileForm.middleName} onChange={e => setProfileForm({ ...profileForm, middleName: e.target.value })} placeholder="Middle Name" className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Last Name" icon={UserIcon} error={errors.lastName}>
                                        <Input
                                            value={profileForm.lastName}
                                            onChange={e => {
                                                setProfileForm({ ...profileForm, lastName: e.target.value });
                                                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
                                            }}
                                            placeholder="Last Name"
                                            className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.lastName ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900`}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Date of Birth" icon={Calendar}>
                                        <DatePicker
                                            date={profileForm.dateOfBirth ? parseISO(profileForm.dateOfBirth) : undefined}
                                            onChange={d => setProfileForm({ ...profileForm, dateOfBirth: d ? formatDate(d, "yyyy-MM-dd") : "" })}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Phone Number" icon={Phone}>
                                        <Input value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} placeholder="+X XXX XXX XXXX" className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Gender" icon={Sparkles} error={errors.gender}>
                                        <Select
                                            value={profileForm.gender}
                                            onValueChange={(v) => {
                                                setProfileForm({ ...profileForm, gender: v });
                                                if (errors.gender) setErrors(prev => ({ ...prev, gender: "" }));
                                            }}
                                        >
                                            <SelectTrigger className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.gender ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900`}>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl">
                                                <SelectItem value="Male" className="py-3 font-bold text-slate-700 m-1 rounded-xl">Male</SelectItem>
                                                <SelectItem value="Female" className="py-3 font-bold text-slate-700 m-1 rounded-xl">Female</SelectItem>
                                                <SelectItem value="Other" className="py-3 font-bold text-slate-700 m-1 rounded-xl">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 px-1">
                                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profile Picture</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 shadow-inner">
                                        <div className="relative group">
                                            <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center relative z-10 font-black text-slate-200">
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="w-12 h-12" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg z-20">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="relative group/input">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setProfilePicture(e.target.files?.[0] || null)}
                                                    className="hidden"
                                                    id="pfp-upload"
                                                />
                                                <label
                                                    htmlFor="pfp-upload"
                                                    className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50 hover:border-amber-500/30 transition-all cursor-pointer group/label"
                                                >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover/label:text-amber-500 transition-colors" />
                                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center px-4">
                                                            {profilePicture ? profilePicture.name : "Choose profile picture"}
                                                        </p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">PNG, JPG or WEBP (MAX. 2MB)</p>
                                                    </div>
                                                </label>
                                            </div>

                                            {profilePicture && (
                                                <div className="flex items-center justify-between px-2">
                                                    <p className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-2">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Ready for upload
                                                    </p>
                                                    <button
                                                        onClick={() => setProfilePicture(null)}
                                                        className="text-[10px] font-black text-red-500 uppercase hover:text-red-600 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-8">
                                        <FormGroup label="Address" icon={Globe}>
                                            <Input value={addressDraft.street} onChange={e => setAddressDraft({ ...addressDraft, street: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                        </FormGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormGroup label="City" icon={MapPin}>
                                                <Input value={addressDraft.city} onChange={e => setAddressDraft({ ...addressDraft, city: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                            </FormGroup>
                                            <FormGroup label="State" icon={MapPin}>
                                                <Input value={addressDraft.state} onChange={e => setAddressDraft({ ...addressDraft, state: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                            </FormGroup>
                                        </div>
                                        <FormGroup label="Country" icon={Globe}>
                                            <Input value={addressDraft.country} onChange={e => setAddressDraft({ ...addressDraft, country: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                        </FormGroup>
                                        <div className="flex items-center justify-between gap-4">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${addressDraft.isPrimary ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-200 group-hover:border-amber-300'}`}>
                                                    {addressDraft.isPrimary && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={addressDraft.isPrimary} onChange={e => setAddressDraft({ ...addressDraft, isPrimary: e.target.checked })} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-amber-600 transition-colors">Primary Address</span>
                                            </label>
                                            <Button type="button" onClick={addAddress} className="bg-slate-900 text-white rounded-2xl px-8 font-black text-xs uppercase tracking-widest h-12 hover:bg-amber-600 transition-all">Add Address</Button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 p-8">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">Added Addresses</p>
                                        <div className="space-y-4">
                                            {addresses.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No addresses added yet</p>
                                                </div>
                                            ) : (
                                                addresses.map((a, idx) => (
                                                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative group">
                                                        <div className="flex items-center justify-between mb-2">
                                                            {a.isPrimary && <Badge className="bg-emerald-100 text-emerald-700 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">Primary Address</Badge>}
                                                            <Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer transition-colors" onClick={() => setAddresses(addresses.filter((_, i) => i !== idx))} />
                                                        </div>
                                                        <p className="font-black text-slate-800 text-sm leading-tight">{a.street || "Empty Address"}, {a.city}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{a.country} • {a.zipCode}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="bg-amber-50 p-8 rounded-[2.5rem] border-2 border-amber-100 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                                            <Settings2 className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">Review Details</h3>
                                            <p className="text-amber-700 font-bold text-xs italic">Please review the details below before saving the staff member.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 pt-4">
                                        <SummaryItem label="Full Name" value={basic.fullName} />
                                        {!isEdit && <SummaryItem label="Email" value={basic.email} />}
                                        <SummaryItem label="Department" value={departments.find(d => (d.id || d._id) === basic.departmentId)?.name || "UNKNOWN"} highlighted />
                                        <SummaryItem label="Staff Role" value={roleLabel[basic.role]} />
                                        <SummaryItem label="Staff ID" value={basic.registrationNumber} />
                                        <SummaryItem label="Joining Date" value={advanced.joiningDate || "N/A"} />
                                        <SummaryItem label="IP Restrictions" value={`${advanced.registeredIps.length} IPs Registered`} />
                                    </div>

                                    {!isEdit && (
                                        <div className="p-6 rounded-3xl bg-slate-900 text-white flex items-start gap-4">
                                            <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                                            <p className="text-[11px] font-bold leading-relaxed text-slate-300">
                                                A temporary password will be sent to the staff member's email address upon creation.
                                                Please ensure all information is correct before saving.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-slate-50 px-6 py-6 md:px-10 md:py-8 flex items-center justify-between border-t border-slate-100 gap-4">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1 || isSubmitting}
                        className="h-12 md:h-14 px-4 md:px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 group"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1 md:mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                    {step < 5 ? (
                        <Button
                            onClick={nextStep}
                            className="h-12 md:h-14 px-6 md:px-10 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all active:scale-95 group"
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-12 md:h-14 px-8 md:px-12 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all active:scale-95 shadow-2xl shadow-slate-900/30"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Save Staff Member
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function FormGroup({ label, icon: Icon, children, error }: { label: string, icon: any, children: React.ReactNode, error?: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${error ? 'text-red-500' : 'text-slate-400'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${error ? 'text-red-500' : 'text-slate-400'}`}>{label}</p>
                </div>
                {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-tighter">{error}</p>}
            </div>
            {children}
        </div>
    );
}

function SummaryItem({ label, value, highlighted = false }: { label: string, value: string | undefined, highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-700/60 leading-none">{label}</p>
            <p className={`text-base font-black truncate leading-tight ${highlighted ? 'text-amber-600 font-black' : 'text-slate-900 font-bold'}`}>{value || "N/A"}</p>
        </div>
    );
}
