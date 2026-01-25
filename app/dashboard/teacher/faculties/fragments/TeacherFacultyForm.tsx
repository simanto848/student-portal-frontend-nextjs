"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    ShieldPlus,
    UploadCloud,
    Phone
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format as formatDate } from "date-fns";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";

interface TeacherFacultyFormProps {
    teacher?: Teacher;
    profile?: TeacherProfile | null;
    fixedDepartmentId?: string; // If set, user can only create/edit for this department
    scope: 'department' | 'faculty';
}

export function TeacherFacultyForm({ teacher, profile, fixedDepartmentId, scope }: TeacherFacultyFormProps) {
    const router = useRouter();
    const isEdit = !!teacher;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 5));
        }
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [basic, setBasic] = useState({
        fullName: teacher?.fullName || "",
        email: teacher?.email || "",
        departmentId: teacher?.departmentId || fixedDepartmentId || "",
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
    const [previewUrl, setPreviewUrl] = useState<string>(teacher?.profile?.profilePicture ? (getImageUrl(teacher.profile.profilePicture) ?? "") : "");

    useEffect(() => {
        if (!profilePicture) {
            if (isEdit && teacher?.profile?.profilePicture) {
                setPreviewUrl(getImageUrl(teacher.profile.profilePicture) ?? "");
            } else {
                setPreviewUrl("");
            }
            return;
        }

        const objectUrl = URL.createObjectURL(profilePicture);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [profilePicture, isEdit, teacher]);

    const validateStep = (s: number) => {
        const newErrors: Record<string, string> = {};

        if (s === 1) {
            if (!basic.fullName.trim()) newErrors.fullName = "Full name required";
            if (!isEdit && !basic.email.trim()) newErrors.email = "Email address required";
            if (!basic.departmentId) newErrors.departmentId = "Department selection required";
            if (!basic.designation) newErrors.designation = "Designation required";
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

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const d = await departmentService.getAllDepartments();
                const allDepts = Array.isArray(d) ? d : [];
                if (fixedDepartmentId) {
                    // Filter to show only the fixed one or just validation
                    setDepartments(allDepts.filter(dept => (dept.id || (dept as any)._id) === fixedDepartmentId));
                } else {
                    setDepartments(allDepts);
                }
            } catch (e: any) {
                toast.error("Failed to load departments");
            } finally {
                setLoadingDepartments(false);
            }
        };
        loadDepartments();
    }, [fixedDepartmentId]);


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
                router.push(`/dashboard/teacher/faculties/${teacher!.id}`);
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
                router.push(`/dashboard/teacher/faculties/${created.id}`);
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
            <GlassCard className="relative overflow-hidden p-8 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-[#2dd4bf]/10 blur-[100px] opacity-60 dark:opacity-20" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <button
                            onClick={() => router.back()}
                            className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[#2dd4bf] dark:hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 dark:hover:border-[#2dd4bf]/30 transition-all shadow-lg shadow-slate-200/40 dark:shadow-slate-900/20 active:scale-95 group"
                        >
                            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <Badge className="bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] ring-1 ring-[#2dd4bf]/20 border-none px-3.5 py-1 rounded-full flex items-center gap-2 mb-2 sm:mb-4 w-fit shadow-sm">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{isEdit ? "Update Faculty" : "Add Faculty"}</span>
                            </Badge>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                {isEdit ? `Edit: ${teacher?.fullName}` : "New Faculty Member"}
                            </h1>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/40 overflow-hidden relative">
                <div className="bg-slate-950/50 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-6 md:px-10 md:py-8 flex items-center justify-between overflow-x-auto gap-8 no-scrollbar border-b border-slate-800/50">
                    {steps.map((s, idx) => {
                        const active = step === s.id;
                        const completed = step > s.id;
                        return (
                            <div key={s.id} className="flex items-center gap-4 flex-shrink-0 group cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-500 ring-1 ${active ? 'bg-[#0d9488] dark:bg-[#2dd4bf] text-white dark:text-slate-900 ring-[#2dd4bf] shadow-[0_0_20px_rgba(45,212,191,0.3)] scale-110' : completed ? 'bg-emerald-500 text-white ring-emerald-400' : 'bg-white/5 dark:bg-slate-800 text-slate-500 ring-slate-800'}`}>
                                    {completed ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                <div className="hidden sm:block">
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${active ? 'text-[#2dd4bf]' : 'text-slate-500'}`}>Step 0{s.id}</p>
                                    <p className={`text-sm font-black tracking-tight ${active ? 'text-white' : 'text-slate-400'}`}>{s.label}</p>
                                </div>
                                {idx < steps.length - 1 && <div className="hidden lg:block h-px w-8 bg-slate-800/50" />}
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
                                            className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.fullName ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all`}
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
                                                className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.email ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all`}
                                            />
                                        </FormGroup>
                                    )}
                                    <FormGroup label="Department" icon={BookOpen} error={errors.departmentId}>
                                        <Select
                                            value={basic.departmentId}
                                            onValueChange={(v) => {
                                                setBasic({ ...basic, departmentId: v });
                                                if (errors.departmentId) setErrors(prev => ({ ...prev, departmentId: "" }));
                                            }}
                                            disabled={loadingDepartments || !!fixedDepartmentId}
                                        >
                                            <SelectTrigger className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.departmentId ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900 focus:ring-amber-500/20`}>
                                                <SelectValue placeholder={loadingDepartments ? "Loading..." : "Select Department"} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl max-h-[300px] dark:bg-slate-900">
                                                {departments.map(d => (
                                                    <SelectItem key={d.id || (d as any)._id} value={d.id || (d as any)._id} className="py-3 font-bold text-slate-700 dark:text-slate-200 m-1 rounded-xl dark:focus:bg-slate-800">
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                    <FormGroup label="Designation" icon={GraduationCap} error={errors.designation}>
                                        <Select
                                            value={basic.designation}
                                            onValueChange={(v) => {
                                                setBasic({ ...basic, designation: v as TeacherDesignation });
                                                if (errors.designation) setErrors(prev => ({ ...prev, designation: "" }));
                                            }}
                                        >
                                            <SelectTrigger className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.designation ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all`}>
                                                <SelectValue placeholder="Select Designation" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl dark:bg-slate-900">
                                                {Object.entries(designationLabels).map(([key, label]) => (
                                                    <SelectItem key={key} value={key} className="py-3 font-bold text-slate-700 dark:text-slate-200 m-1 rounded-xl dark:focus:bg-slate-800">
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
                                                className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="Phone Number" icon={Network}>
                                        <Input
                                            value={basic.phone}
                                            onChange={e => setBasic({ ...basic, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all"
                                        />
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
                                    <FormGroup label="Allowed IPs" icon={Lock}>
                                        <div className="relative">
                                            <Input
                                                value={advanced.ipInput}
                                                onChange={e => setAdvanced({ ...advanced, ipInput: e.target.value })}
                                                placeholder="e.g. 192.168.1.1"
                                                className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddIp}
                                                className="absolute right-2 top-2 h-10 w-10 md:h-11 md:w-11 rounded-xl bg-slate-950 dark:bg-[#2dd4bf] text-white dark:text-slate-900 flex items-center justify-center hover:bg-[#0d9488] dark:hover:bg-[#14b8a6] transition-all active:scale-95 shadow-lg shadow-teal-500/20"
                                            >
                                                <ShieldPlus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </FormGroup>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Allowed IP Addresses</p>
                                    <div className="flex flex-wrap gap-3 min-h-[60px]">
                                        {advanced.registeredIps.length === 0 ? (
                                            <div className="w-full h-16 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] text-center">
                                                No IP restrictions (Open Access)
                                            </div>
                                        ) : (
                                            advanced.registeredIps.map(ip => (
                                                <Badge key={ip} className="h-11 px-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center gap-4 shadow-sm group hover:border-[#2dd4bf]/40 transition-all">
                                                    {ip}
                                                    <Trash2 className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-red-500 cursor-pointer transition-colors" onClick={() => handleRemoveIp(ip)} />
                                                </Badge>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {/* Remaining steps (3, 4, 5) are personal/profile, kept same */}
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
                                            className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.firstName ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all`}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Middle Name" icon={UserIcon}>
                                        <Input value={profileForm.middleName} onChange={e => setProfileForm({ ...profileForm, middleName: e.target.value })} placeholder="Middle Name" className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all" />
                                    </FormGroup>
                                    <FormGroup label="Last Name" icon={UserIcon} error={errors.lastName}>
                                        <Input
                                            value={profileForm.lastName}
                                            onChange={e => {
                                                setProfileForm({ ...profileForm, lastName: e.target.value });
                                                if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
                                            }}
                                            placeholder="Last Name"
                                            className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.lastName ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all`}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Date of Birth" icon={Calendar}>
                                        <DatePicker
                                            date={profileForm.dateOfBirth ? parseISO(profileForm.dateOfBirth) : undefined}
                                            onChange={d => setProfileForm({ ...profileForm, dateOfBirth: d ? formatDate(d, "yyyy-MM-dd") : "" })}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Phone Number" icon={Phone}>
                                        <Input value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} placeholder="+X XXX XXX XXXX" className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all" />
                                    </FormGroup>
                                    <FormGroup label="Gender" icon={Sparkles} error={errors.gender}>
                                        <Select
                                            value={profileForm.gender}
                                            onValueChange={(v) => {
                                                setProfileForm({ ...profileForm, gender: v });
                                                if (errors.gender) setErrors(prev => ({ ...prev, gender: "" }));
                                            }}
                                        >
                                            <SelectTrigger className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 ${errors.gender ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all`}>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl dark:bg-slate-900">
                                                <SelectItem value="Male" className="py-3 font-bold text-slate-700 dark:text-slate-200 m-1 rounded-xl dark:focus:bg-slate-800">Male</SelectItem>
                                                <SelectItem value="Female" className="py-3 font-bold text-slate-700 dark:text-slate-200 m-1 rounded-xl dark:focus:bg-slate-800">Female</SelectItem>
                                                <SelectItem value="Other" className="py-3 font-bold text-slate-700 dark:text-slate-200 m-1 rounded-xl dark:focus:bg-slate-800">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 px-1">
                                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profile Picture</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-700/50 shadow-inner">
                                        <div className="relative group">
                                            <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 flex items-center justify-center relative z-10 font-black text-slate-200 dark:text-slate-700">
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
                                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-[#2dd4bf] text-white flex items-center justify-center shadow-lg z-20">
                                                <Sparkles className="w-5 h-5 dark:text-slate-900" />
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
                                                    className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#2dd4bf]/30 transition-all cursor-pointer group/label"
                                                >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2 group-hover/label:text-[#2dd4bf] transition-colors" />
                                                        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center px-4">
                                                            {profilePicture ? profilePicture.name : "Choose profile picture"}
                                                        </p>
                                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tighter">PNG, JPG or WEBP (MAX. 2MB)</p>
                                                    </div>
                                                </label>
                                            </div>

                                            {profilePicture && (
                                                <div className="flex items-center justify-between px-2">
                                                    <p className="text-[10px] font-black text-[#2dd4bf] uppercase flex items-center gap-2">
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
                                        <FormGroup label="Street Address" icon={Globe}>
                                            <Input value={addressDraft.street} onChange={e => setAddressDraft({ ...addressDraft, street: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all" />
                                        </FormGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormGroup label="City" icon={MapPin}>
                                                <Input value={addressDraft.city} onChange={e => setAddressDraft({ ...addressDraft, city: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all" />
                                            </FormGroup>
                                            <FormGroup label="State" icon={MapPin}>
                                                <Input value={addressDraft.state} onChange={e => setAddressDraft({ ...addressDraft, state: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all" />
                                            </FormGroup>
                                        </div>
                                        <FormGroup label="Country" icon={Globe}>
                                            <Input value={addressDraft.country} onChange={e => setAddressDraft({ ...addressDraft, country: e.target.value })} className="h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all" />
                                        </FormGroup>
                                        <div className="flex items-center justify-between gap-4">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${addressDraft.isPrimary ? 'bg-[#2dd4bf] border-[#2dd4bf]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-[#2dd4bf]/50'}`}>
                                                    {addressDraft.isPrimary && <CheckCircle2 className="w-4 h-4 text-white dark:text-slate-900" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={addressDraft.isPrimary} onChange={e => setAddressDraft({ ...addressDraft, isPrimary: e.target.checked })} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#2dd4bf] transition-colors">Primary Address</span>
                                            </label>
                                            <Button type="button" onClick={addAddress} className="bg-slate-950 dark:bg-[#2dd4bf] text-white dark:text-slate-900 rounded-2xl px-8 font-black text-xs uppercase tracking-widest h-12 hover:bg-[#0d9488] dark:hover:bg-[#14b8a6] transition-all shadow-lg shadow-teal-500/10">Add Address</Button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-inner">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">Added Addresses</p>
                                        <div className="space-y-4">
                                            {addresses.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <MapPin className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                                                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">No addresses added yet</p>
                                                </div>
                                            ) : (
                                                addresses.map((a, idx) => (
                                                    <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                                                        <div className="flex items-center justify-between mb-2">
                                                            {a.isPrimary && <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md border-none">Primary Address</Badge>}
                                                            <Trash2 className="w-4 h-4 text-slate-300 dark:text-slate-700 hover:text-red-500 cursor-pointer transition-colors" onClick={() => setAddresses(addresses.filter((_, i) => i !== idx))} />
                                                        </div>
                                                        <p className="font-black text-slate-800 dark:text-slate-200 text-sm leading-tight">{a.street}, {a.city}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">{a.country} • {a.zipCode}</p>
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
                                <div className="bg-[#2dd4bf]/5 dark:bg-[#2dd4bf]/5 p-8 rounded-[2.5rem] border-2 border-[#2dd4bf]/20 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-[#0d9488] dark:bg-[#2dd4bf] text-white dark:text-slate-900 flex items-center justify-center shadow-lg">
                                            <Settings2 className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">Review Faculty Details</h3>
                                            <p className="text-[#0d9488] dark:text-[#2dd4bf] font-bold text-xs">Verify all fields before processing the official registration.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 pt-4">
                                        <SummaryItem label="Full Name" value={basic.fullName} />
                                        {!isEdit && <SummaryItem label="Email" value={basic.email} />}
                                        <SummaryItem label="Department" value={departments.find(d => (d.id || d._id) === basic.departmentId)?.name || "Unknown"} highlighted />
                                        <SummaryItem label="Designation" value={designationLabels[basic.designation] || "None"} />
                                        <SummaryItem label="Joined" value={advanced.joiningDate || "N/A"} />
                                        <SummaryItem label="ID" value={basic.registrationNumber} />
                                    </div>

                                    {!isEdit && (
                                        <div className="p-6 rounded-3xl bg-slate-950/80 dark:bg-slate-900/50 backdrop-blur-md text-white border border-slate-800 flex items-start gap-4">
                                            <Sparkles className="w-5 h-5 text-[#2dd4bf] flex-shrink-0 mt-0.5" />
                                            <p className="text-[11px] font-bold leading-relaxed text-slate-300">
                                                System credential invitation will be dispatched to the academic email provided.
                                                Ensure accuracy of the designation and department to avoid role conflicts.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-slate-950/50 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-6 md:px-10 md:py-8 flex items-center justify-between border-t border-slate-800/50 gap-4">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1 || isSubmitting}
                        className="h-12 md:h-14 px-4 md:px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/5 group transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1 md:mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Prev Step</span>
                    </Button>
                    {step < 5 ? (
                        <Button
                            onClick={nextStep}
                            className="h-12 md:h-14 px-6 md:px-10 rounded-2xl bg-[#0d9488] dark:bg-[#2dd4bf] hover:bg-[#0f766e] dark:hover:bg-[#14b8a6] text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3 transition-all active:scale-95 group shadow-xl shadow-teal-500/20"
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-12 md:h-14 px-8 md:px-12 rounded-2xl bg-[#0d9488] dark:bg-[#2dd4bf] hover:bg-[#0f766e] dark:hover:bg-[#14b8a6] text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3 transition-all active:scale-95 shadow-2xl shadow-teal-500/30"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Complete Registration
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
                    <Icon className={`w-3.5 h-3.5 ${error ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${error ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>{label}</p>
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
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0d9488]/60 dark:text-[#2dd4bf]/40 leading-none">{label}</p>
            <p className={`text-base font-black truncate leading-tight ${highlighted ? 'text-[#0d9488] dark:text-[#2dd4bf]' : 'text-slate-900 dark:text-white'}`}>{value || "N/A"}</p>
        </div>
    );
}
