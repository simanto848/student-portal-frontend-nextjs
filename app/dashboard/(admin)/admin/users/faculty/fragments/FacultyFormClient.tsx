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
import { Teacher, TeacherDesignation, teacherService } from "@/services/user/teacher.service";
import { TeacherProfile, teacherProfileService } from "@/services/user/teacherProfile.service";
import { departmentService } from "@/services/academic/department.service";
import {
    ArrowLeft,
    GraduationCap,
    Mail,
    Calendar,
    MapPin,
    User as UserIcon,
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
    BookOpen,
    ShieldPlus
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FacultyFormClientProps {
    teacher?: Teacher;
    profile?: TeacherProfile | null;
}

export function FacultyFormClient({ teacher, profile }: FacultyFormClientProps) {
    const router = useRouter();
    const isEdit = !!teacher;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // Form State
    const [basic, setBasic] = useState({
        fullName: teacher?.fullName || "",
        email: teacher?.email || "",
        departmentId: teacher?.departmentId || "",
        designation: teacher?.designation || "" as TeacherDesignation,
        registrationNumber: teacher?.registrationNumber || "",
        phone: teacher?.phone || "",
    });

    const [advanced, setAdvanced] = useState({
        joiningDate: teacher?.joiningDate ? teacher.joiningDate.split("T")[0] : "",
        registeredIps: teacher?.registeredIpAddress || [],
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

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const d = await departmentService.getAllDepartments();
                setDepartments(Array.isArray(d) ? d : []);
            } catch (e: any) {
                toast.error("Failed to load departments");
            } finally {
                setLoadingDepartments(false);
            }
        };
        loadDepartments();
    }, []);

    const generateRegistrationNumber = () => {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const value = `TCHR-${new Date().getFullYear()}-${rand}`;
        setBasic(prev => ({ ...prev, registrationNumber: value }));
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
        setIsSubmitting(true);
        try {
            const payload: any = {
                fullName: basic.fullName.trim(),
                departmentId: basic.departmentId,
                designation: basic.designation || undefined,
                registrationNumber: basic.registrationNumber.trim(),
                phone: basic.phone?.trim() || undefined,
                joiningDate: advanced.joiningDate || undefined,
                registeredIpAddress: advanced.registeredIps,
            };

            if (!isEdit) {
                payload.email = basic.email.trim().toLowerCase();
            }

            let dataToSend: any = payload;
            if (profilePicture) {
                const formData = new FormData();
                formData.append('data', JSON.stringify(payload));
                formData.append('profilePicture', profilePicture);
                dataToSend = formData;
            }

            if (isEdit) {
                await teacherService.update(teacher!.id, dataToSend);

                // Update profile if needed
                if (profileForm.firstName && profileForm.lastName) {
                    const profilePayload = {
                        firstName: profileForm.firstName.trim(),
                        lastName: profileForm.lastName.trim(),
                        middleName: profileForm.middleName?.trim() || undefined,
                        phoneNumber: profileForm.phoneNumber?.trim() || undefined,
                        dateOfBirth: profileForm.dateOfBirth || undefined,
                        gender: profileForm.gender || undefined,
                        addresses: addresses.map(a => ({ ...a })),
                    };
                    await teacherProfileService.upsert(teacher!.id, profilePayload);
                }

                toast.success("Faculty details updated");
                router.push(`/dashboard/admin/users/faculty/${teacher!.id}`);
            } else {
                const created = await teacherService.create(dataToSend);

                if (profileForm.firstName && profileForm.lastName) {
                    try {
                        const profilePayload = {
                            firstName: profileForm.firstName.trim(),
                            lastName: profileForm.lastName.trim(),
                            middleName: profileForm.middleName?.trim() || undefined,
                            phoneNumber: profileForm.phoneNumber?.trim() || undefined,
                            dateOfBirth: profileForm.dateOfBirth || undefined,
                            gender: profileForm.gender || undefined,
                            addresses: addresses.map(a => ({ ...a })),
                        };
                        await teacherProfileService.create(created.id, profilePayload);
                    } catch (pe) {
                        toast.warning("Faculty created, but profile update failed");
                    }
                }

                toast.success("New faculty member added");
                router.push(`/dashboard/admin/users/faculty/${created.id}`);
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error?.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, label: "Basic Info", icon: GraduationCap },
        { id: 2, label: "Security", icon: Lock },
        { id: 3, label: "Personal", icon: UserIcon },
        { id: 4, label: "Address", icon: MapPin },
        { id: 5, label: "Review", icon: CheckCircle2 },
    ];

    const designationLabels: Record<string, string> = {
        professor: "Professor",
        associate_professor: "Associate Professor",
        assistant_professor: "Assistant Professor",
        lecturer: "Lecturer",
        senior_lecturer: "Senior Lecturer",
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 mb-4 w-fit shadow-sm">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{isEdit ? "Update Faculty" : "Add Faculty"}</span>
                        </Badge>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            {isEdit ? `Edit: ${teacher?.fullName}` : "New Faculty Member"}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                <div className="bg-slate-900 px-10 py-8 flex items-center justify-between overflow-x-auto gap-8">
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

                <div className="p-10 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormGroup label="Full Name" icon={UserIcon}>
                                        <Input
                                            value={basic.fullName}
                                            onChange={e => setBasic({ ...basic, fullName: e.target.value })}
                                            placeholder="Enter full name"
                                            className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20"
                                        />
                                    </FormGroup>
                                    {!isEdit && (
                                        <FormGroup label="Email Address" icon={Mail}>
                                            <Input
                                                value={basic.email}
                                                onChange={e => setBasic({ ...basic, email: e.target.value })}
                                                placeholder="email@university.edu"
                                                className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20"
                                            />
                                        </FormGroup>
                                    )}
                                    <FormGroup label="Department" icon={BookOpen}>
                                        <Select
                                            value={basic.departmentId}
                                            onValueChange={(v) => setBasic({ ...basic, departmentId: v })}
                                            disabled={loadingDepartments}
                                        >
                                            <SelectTrigger className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20">
                                                <SelectValue placeholder={loadingDepartments ? "Loading..." : "Select Department"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl max-h-[300px]">
                                                {departments.map(d => (
                                                    <SelectItem key={d.id || d._id} value={d.id || d._id} className="py-3 font-bold text-slate-700 m-1 rounded-xl">
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                    <FormGroup label="Designation" icon={GraduationCap}>
                                        <Select value={basic.designation} onValueChange={(v) => setBasic({ ...basic, designation: v as TeacherDesignation })}>
                                            <SelectTrigger className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20">
                                                <SelectValue placeholder="Select Designation" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl">
                                                {Object.entries(designationLabels).map(([key, label]) => (
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
                                                value={basic.registrationNumber}
                                                onChange={e => setBasic({ ...basic, registrationNumber: e.target.value })}
                                                placeholder="ID Number"
                                                className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={generateRegistrationNumber}
                                                className="absolute right-2 top-2 h-10 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all active:scale-95"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="Phone Number" icon={Network}>
                                        <Input
                                            value={basic.phone}
                                            onChange={e => setBasic({ ...basic, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20"
                                        />
                                    </FormGroup>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormGroup label="Joining Date" icon={Calendar}>
                                        <Input
                                            type="date"
                                            value={advanced.joiningDate}
                                            onChange={e => setAdvanced({ ...advanced, joiningDate: e.target.value })}
                                            className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20"
                                        />
                                    </FormGroup>
                                    <FormGroup label="Allowed IPs" icon={Lock}>
                                        <div className="relative">
                                            <Input
                                                value={advanced.ipInput}
                                                onChange={e => setAdvanced({ ...advanced, ipInput: e.target.value })}
                                                placeholder="e.g. 192.168.1.1"
                                                className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20"
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
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Allowed IP Addresses</p>
                                    <div className="flex flex-wrap gap-3 min-h-[60px]">
                                        {advanced.registeredIps.length === 0 ? (
                                            <div className="w-full h-16 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">
                                                No IP restrictions (Open Access)
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
                                    <FormGroup label="First Name" icon={UserIcon}>
                                        <Input value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Middle Name" icon={UserIcon}>
                                        <Input value={profileForm.middleName} onChange={e => setProfileForm({ ...profileForm, middleName: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Last Name" icon={UserIcon}>
                                        <Input value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Date of Birth" icon={Calendar}>
                                        <Input type="date" value={profileForm.dateOfBirth} onChange={e => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Phone Number" icon={Network}>
                                        <Input value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Gender" icon={Sparkles}>
                                        <Select value={profileForm.gender} onValueChange={(v) => setProfileForm({ ...profileForm, gender: v })}>
                                            <SelectTrigger className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900">
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
                                <FormGroup label="Profile Picture" icon={Sparkles}>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setProfilePicture(e.target.files?.[0] || null)}
                                        className="h-14 px-6 py-3 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 file:bg-slate-900 file:text-white file:rounded-xl file:border-none file:px-4 file:mr-4 file:text-[10px] file:font-black file:uppercase file:tracking-widest cursor-pointer"
                                    />
                                    {profilePicture && <p className="mt-2 text-[10px] font-black text-amber-600 uppercase">Uploading profile picture: {profilePicture.name}</p>}
                                </FormGroup>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-8">
                                        <FormGroup label="Street Address" icon={Globe}>
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
                                                        <p className="font-black text-slate-800 text-sm leading-tight">{a.street}, {a.city}</p>
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
                                            <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">Review Faculty Details</h3>
                                            <p className="text-amber-700 font-bold text-xs italic">Please review the information below before saving the faculty member.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                                        <SummaryItem label="Full Name" value={basic.fullName} />
                                        {!isEdit && <SummaryItem label="Email" value={basic.email} />}
                                        <SummaryItem label="Department" value={departments.find(d => (d.id || d._id) === basic.departmentId)?.name || "Unknown"} highlighted />
                                        <SummaryItem label="Designation" value={designationLabels[basic.designation] || "None"} />
                                        <SummaryItem label="Joined" value={advanced.joiningDate || "N/A"} />
                                        <SummaryItem label="ID" value={basic.registrationNumber} />
                                    </div>

                                    {!isEdit && (
                                        <div className="p-6 rounded-3xl bg-slate-900 text-white flex items-start gap-4">
                                            <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                                            <p className="text-[11px] font-bold leading-relaxed text-slate-300">
                                                A password will be sent to the faculty member's email address upon creation.
                                                Please ensure all details are correct before proceeding.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-slate-50 px-10 py-8 flex items-center justify-between border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1 || isSubmitting}
                        className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 group"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </Button>
                    {step < 5 ? (
                        <Button
                            onClick={nextStep}
                            className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 group"
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-slate-900/30"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Save Faculty Member
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function FormGroup({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            </div>
            {children}
        </div>
    );
}

function SummaryItem({ label, value, highlighted = false }: { label: string, value: string, highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-700/60 leading-none">{label}</p>
            <p className={`text-base font-black truncate leading-tight ${highlighted ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
}
