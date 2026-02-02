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
    Student,
    studentService,
    EnrollmentStatus
} from "@/services/user/student.service";
import {
    StudentProfile,
    studentProfileService
} from "@/services/user/studentProfile.service";
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
    Sparkles,
    Settings2,
    Globe,
    Loader2,
    ShieldPlus,
    Building2,
    GraduationCap,
    BookOpen,
    Layers,
    Clock,
    Phone,
    Heart,
    Flag,
    CreditCard,
    Home,
    Contact,
    Users,
    UploadCloud,
    RotateCcw,
    Hash,
    ShieldAlert,
    Lock
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format as formatDate } from "date-fns";
import { FaceEnrollmentStep } from "./FaceEnrollmentStep";

interface StudentFormClientProps {
    student?: Student;
    profile?: StudentProfile | null;
    departments: any[];
    programs: any[];
    batches: any[];
    sessions: any[];
}

export function StudentFormClient({
    student,
    profile,
    departments,
    programs,
    batches,
    sessions
}: StudentFormClientProps) {
    const router = useRouter();
    const isEdit = !!student;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [basic, setBasic] = useState({
        fullName: student?.fullName || "",
        email: student?.email || "",
        registrationNumber: student?.registrationNumber || "",
        departmentId: student?.departmentId || "",
        programId: student?.programId || "",
        batchId: student?.batchId || "",
        sessionId: student?.sessionId || "",
        admissionDate: student?.admissionDate ? student.admissionDate.split("T")[0] : new Date().toISOString().split("T")[0],
        enrollmentStatus: student?.enrollmentStatus || "enrolled" as EnrollmentStatus,
        currentSemester: student?.currentSemester || 1,
    });

    const validateStep = (s: number) => {
        const newErrors: Record<string, string> = {};

        if (s === 1) {
            if (!basic.fullName.trim()) newErrors.fullName = "Full name required";
            if (!isEdit && !basic.email.trim()) newErrors.email = "Email address required";
            if (!basic.admissionDate) newErrors.admissionDate = "Admission date required";
        } else if (s === 2) {
            if (!basic.batchId) newErrors.batchId = "Batch selection required";
            if (!basic.programId) newErrors.programId = "Program selection required";
            if (!basic.departmentId) newErrors.departmentId = "Department selection required";
        } else if (s === 3) {
            if (!profileForm.studentMobile.trim()) newErrors.studentMobile = "Phone number required";
            if (!profileForm.gender) newErrors.gender = "Gender selection required";
            if (!profileForm.dateOfBirth) newErrors.dateOfBirth = "Date of birth required";
        } else if (s === 4) {
            if (!(addresses.permanent?.street ?? "").trim() || !(addresses.permanent?.city ?? "").trim()) newErrors.permanent = "Permanent address required";
            if (!(addresses.mailing?.street ?? "").trim() || !(addresses.mailing?.city ?? "").trim()) newErrors.mailing = "Mailing address required";
        } else if (s === 5) {
            if (!kinForm.emergencyContact.name.trim() || !kinForm.emergencyContact.cell.trim()) newErrors.emergencyContact = "Emergency contact required";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fill all required fields");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 6));
        }
    };

    const [profileForm, setProfileForm] = useState({
        studentMobile: profile?.studentMobile || "",
        gender: profile?.gender || "",
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",
        bloodGroup: profile?.bloodGroup || "",
        nationality: profile?.nationality || "Bangladeshi",
        religion: profile?.religion || "",
        maritalStatus: profile?.maritalStatus || "",
        nidOrPassportNo: profile?.nidOrPassportNo || "",
    });

    const [kinForm, setKinForm] = useState({
        father: { name: profile?.father?.name || "", cell: profile?.father?.cell || "" },
        mother: { name: profile?.mother?.name || "", cell: profile?.mother?.cell || "" },
        guardian: { name: profile?.guardian?.name || "", cell: profile?.guardian?.cell || "", occupation: profile?.guardian?.occupation || "" },
        emergencyContact: { name: profile?.emergencyContact?.name || "", cell: profile?.emergencyContact?.cell || "", relation: profile?.emergencyContact?.relation || "" },
    });

    const [addresses, setAddresses] = useState({
        permanent: profile?.permanentAddress || { street: "", city: "", country: "Bangladesh" },
        mailing: profile?.mailingAddress || { street: "", city: "", country: "Bangladesh" },
    });

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(student?.profile?.profilePicture ? (getImageUrl(student.profile.profilePicture) ?? "") : "");

    useEffect(() => {
        if (!profilePicture) {
            if (isEdit && student?.profile?.profilePicture) {
                setPreviewUrl(getImageUrl(student.profile.profilePicture) ?? "");
            } else {
                setPreviewUrl("");
            }
            return;
        }

        const objectUrl = URL.createObjectURL(profilePicture);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [profilePicture, isEdit, student, getImageUrl]);

    const handleBatchChange = (v: string) => {
        setBasic(prev => {
            const selectedBatch = batches.find((b) => (b.id || b._id) === v);
            const sessionIdFromBatch = (selectedBatch?.sessionId && (selectedBatch.sessionId.id || selectedBatch.sessionId._id)) || selectedBatch?.sessionId || "";
            const programIdFromBatch = (selectedBatch?.programId && (selectedBatch.programId.id || selectedBatch.programId._id)) || selectedBatch?.programId || "";
            const departmentIdFromBatch = (selectedBatch?.departmentId && (selectedBatch.departmentId.id || selectedBatch.departmentId._id)) || selectedBatch?.departmentId || "";

            return {
                ...prev,
                batchId: v,
                sessionId: sessionIdFromBatch || prev.sessionId,
                programId: programIdFromBatch || prev.programId,
                departmentId: departmentIdFromBatch || prev.departmentId,
            };
        });
    };

    const [enrollmentData, setEnrollmentData] = useState<{ open: boolean; studentId: string; studentName: string } | null>(null);

    const handleSubmit = async () => {
        for (let i = 1; i <= 5; i++) {
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
                programId: basic.programId,
                batchId: basic.batchId,
                sessionId: basic.sessionId,
                admissionDate: basic.admissionDate,
                enrollmentStatus: basic.enrollmentStatus,
                currentSemester: basic.currentSemester,
                registrationNumber: basic.registrationNumber || undefined,
            };

            if (!isEdit) payload.email = basic.email.trim().toLowerCase();

            const profileData: any = {
                ...profileForm,
                ...kinForm,
                permanentAddress: addresses.permanent,
                mailingAddress: addresses.mailing,
            };

            let dataToSend: any = payload;
            if (profilePicture) {
                const formData = new FormData();
                formData.append('profilePicture', profilePicture);
                formData.append('data', JSON.stringify(payload));
                dataToSend = formData;
            }

            let studentId: string;
            let regNum: string = "";
            let fullName: string = basic.fullName;

            if (isEdit) {
                const updated = await studentService.update(student.id, dataToSend);
                studentId = student.id;
                regNum = updated.registrationNumber || student.registrationNumber;
                toast.success("Student profile updated");
            } else {
                const created = await studentService.create(dataToSend);
                studentId = created.id;
                regNum = created.registrationNumber;
                fullName = created.fullName;
                toast.success("New student added successfully");
            }

            // Sync Profile
            try {
                await studentProfileService.upsert(studentId, profileData);
            } catch (err) {
                toast.warning("Student saved but biometric synchronization failed.");
            }

            // If new student, open enrollment modal instead of redirecting immediately
            if (!isEdit && regNum) {
                setIsSubmitting(false);
                setEnrollmentData({
                    open: true,
                    studentId: regNum,
                    studentName: fullName
                });
                return;
            }

            router.push(`/dashboard/moderator/users/students/${studentId}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.message || "Protocol synchronization failed");
            setIsSubmitting(false);
        }
    };

    const handleEnrollmentComplete = () => {
        setEnrollmentData(null);
        router.push("/dashboard/moderator/users/students");
        router.refresh();
    };

    const steps = [
        { id: 1, label: "Basic Info", icon: UserIcon },
        { id: 2, label: "Academic Info", icon: GraduationCap },
        { id: 3, label: "Contact Info", icon: Sparkles },
        { id: 4, label: "Addresses", icon: MapPin },
        { id: 5, label: "Guardian Info", icon: Users },
        { id: 6, label: "Review", icon: CheckCircle2 },
    ];

    const getBatchLabel = (bId: string) => {
        const b = batches.find(x => (x.id || x._id) === bId);
        if (!b) return "N/A";
        const shift = String(b.shift || "").toLowerCase();
        const prefix = shift === "evening" ? "E" : "D";
        return `${prefix}-${b.name || b.code}`;
    };

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
                            <span className="text-[10px] font-black uppercase tracking-widest">{isEdit ? "Update Student" : "Add Student"}</span>
                        </Badge>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            {isEdit ? `Editing: ${student?.fullName}` : "New Student Registration"}
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

                <div className="p-4 sm:p-6 md:px-6 md:py-8 lg:p-10 min-h-[450px]">
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
                                    <FormGroup label="Registration Number" icon={Hash}>
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
                                    <FormGroup label="Admission Date" icon={Calendar} error={errors.admissionDate}>
                                        <DatePicker
                                            date={basic.admissionDate ? parseISO(basic.admissionDate) : undefined}
                                            onChange={d => {
                                                setBasic({ ...basic, admissionDate: d ? formatDate(d, "yyyy-MM-dd") : "" });
                                                if (errors.admissionDate) setErrors(prev => ({ ...prev, admissionDate: "" }));
                                            }}
                                        />
                                    </FormGroup>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 text-[11px] font-bold text-amber-700 italic flex items-center gap-3">
                                    <Sparkles className="w-4 h-4" /> Select batch first — it will automatically update session, program, and department fields.
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                                    <FormGroup label="Batch" icon={Layers} error={errors.batchId}>
                                        <SearchableSelect
                                            options={batches.map(b => ({ label: getBatchLabel(b.id || b._id), value: b.id || b._id }))}
                                            value={basic.batchId}
                                            onChange={v => {
                                                handleBatchChange(v);
                                                if (errors.batchId) setErrors(prev => ({ ...prev, batchId: "" }));
                                            }}
                                            placeholder="Select Batch"
                                        />
                                    </FormGroup>
                                    <FormGroup label="Session" icon={Clock} error={errors.sessionId}>
                                        <SearchableSelect
                                            options={sessions.map(s => ({ label: s.name, value: s.id || s._id }))}
                                            value={basic.sessionId}
                                            onChange={v => {
                                                setBasic({ ...basic, sessionId: v });
                                                if (errors.sessionId) setErrors(prev => ({ ...prev, sessionId: "" }));
                                            }}
                                            placeholder="Select Session"
                                        />
                                    </FormGroup>
                                    <FormGroup label="Program" icon={BookOpen} error={errors.programId}>
                                        <SearchableSelect
                                            options={programs.map(p => ({ label: p.name, value: p.id || p._id }))}
                                            value={basic.programId}
                                            onChange={v => {
                                                setBasic({ ...basic, programId: v });
                                                if (errors.programId) setErrors(prev => ({ ...prev, programId: "" }));
                                            }}
                                            placeholder="Select Program"
                                        />
                                    </FormGroup>
                                    <FormGroup label="Department" icon={Building2} error={errors.departmentId}>
                                        <SearchableSelect
                                            options={departments.map(d => ({ label: d.name, value: d.id || d._id }))}
                                            value={basic.departmentId}
                                            onChange={v => {
                                                setBasic({ ...basic, departmentId: v });
                                                if (errors.departmentId) setErrors(prev => ({ ...prev, departmentId: "" }));
                                            }}
                                            placeholder="Select Department"
                                        />
                                    </FormGroup>
                                    <FormGroup label="Current Semester" icon={RotateCcw}>
                                        <Input type="number" min={1} max={12} value={basic.currentSemester} onChange={e => setBasic({ ...basic, currentSemester: parseInt(e.target.value) })} className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Enrollment Status" icon={ShieldAlert}>
                                        <Select value={basic.enrollmentStatus} onValueChange={v => setBasic({ ...basic, enrollmentStatus: v as EnrollmentStatus })}>
                                            <SelectTrigger className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl">
                                                {["enrolled", "not_enrolled", "graduated", "suspended", "on_leave"].map(s => (
                                                    <SelectItem key={s} value={s} className="py-3 font-bold text-slate-700 m-1 rounded-xl capitalize">{s.replace(/_/g, " ")}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                                    <FormGroup label="Phone Number" icon={Phone} error={errors.studentMobile}>
                                        <Input
                                            value={profileForm.studentMobile}
                                            onChange={e => {
                                                setProfileForm({ ...profileForm, studentMobile: e.target.value });
                                                if (errors.studentMobile) setErrors(prev => ({ ...prev, studentMobile: "" }));
                                            }}
                                            placeholder="+X XXX XXX XXXX"
                                            className={`h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 ${errors.studentMobile ? 'border-red-500' : 'border-slate-100'} font-bold text-slate-900`}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Date of Birth" icon={Calendar} error={errors.dateOfBirth}>
                                        <DatePicker
                                            date={profileForm.dateOfBirth ? parseISO(profileForm.dateOfBirth) : undefined}
                                            onChange={d => {
                                                setProfileForm({ ...profileForm, dateOfBirth: d ? formatDate(d, "yyyy-MM-dd") : "" });
                                                if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: "" }));
                                            }}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Gender" icon={UserIcon} error={errors.gender}>
                                        <Select
                                            value={profileForm.gender}
                                            onValueChange={v => {
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
                                    <FormGroup label="Blood Group" icon={Heart}>
                                        <Select value={profileForm.bloodGroup} onValueChange={v => setProfileForm({ ...profileForm, bloodGroup: v })}>
                                            <SelectTrigger className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl grid grid-cols-2">
                                                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                                    <SelectItem key={bg} value={bg} className="py-3 font-bold text-slate-700 m-1 rounded-xl">{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormGroup>
                                    <FormGroup label="NID/Passport Number" icon={CreditCard}>
                                        <Input value={profileForm.nidOrPassportNo} onChange={e => setProfileForm({ ...profileForm, nidOrPassportNo: e.target.value })} className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                    <FormGroup label="Nationality" icon={Flag}>
                                        <Input value={profileForm.nationality} onChange={e => setProfileForm({ ...profileForm, nationality: e.target.value })} className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900" />
                                    </FormGroup>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 px-1">
                                        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profile Picture</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 shadow-inner">
                                        <div className="relative group">
                                            <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center relative z-10">
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="w-12 h-12 text-slate-200" />
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
                                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                            {profilePicture ? profilePicture.name : "Choose profile picture"}
                                                        </p>
                                                        <p className="text-[9px] text-slate-400 font-bold mt-1">PNG, JPG or WEBP (MAX. 2MB)</p>
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
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 px-1">
                                            <Home className={`w-4 h-4 ${errors.permanent ? 'text-red-500' : 'text-slate-900'}`} />
                                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${errors.permanent ? 'text-red-500' : 'text-slate-900'}`}>Permanent Address</p>
                                        </div>
                                        <div className={`space-y-4 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-slate-50 border-2 ${errors.permanent ? 'border-red-500' : 'border-slate-100'} shadow-inner`}>
                                            <FormGroup label="Street" icon={MapPin}>
                                                <Input
                                                    value={addresses.permanent.street}
                                                    onChange={e => {
                                                        setAddresses({ ...addresses, permanent: { ...addresses.permanent, street: e.target.value } });
                                                        if (errors.permanent) setErrors(prev => ({ ...prev, permanent: "" }));
                                                    }}
                                                    className="bg-white"
                                                />
                                            </FormGroup>
                                            <FormGroup label="City" icon={Globe}>
                                                <Input
                                                    value={addresses.permanent.city}
                                                    onChange={e => {
                                                        setAddresses({ ...addresses, permanent: { ...addresses.permanent, city: e.target.value } });
                                                        if (errors.permanent) setErrors(prev => ({ ...prev, permanent: "" }));
                                                    }}
                                                    className="bg-white"
                                                />
                                            </FormGroup>
                                            <FormGroup label="Country" icon={Flag}>
                                                <Input
                                                    value={addresses.permanent.country}
                                                    onChange={e => {
                                                        setAddresses({ ...addresses, permanent: { ...addresses.permanent, country: e.target.value } });
                                                        if (errors.permanent) setErrors(prev => ({ ...prev, permanent: "" }));
                                                    }}
                                                    className="bg-white"
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 px-1">
                                            <MapPin className={`w-4 h-4 ${errors.mailing ? 'text-red-500' : 'text-amber-600'}`} />
                                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${errors.mailing ? 'text-red-500' : 'text-amber-600'}`}>Mailing Address</p>
                                        </div>
                                        <div className={`space-y-4 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-amber-50/30 border-2 ${errors.mailing ? 'border-red-500' : 'border-amber-100/50'} shadow-inner`}>
                                            <FormGroup label="Street" icon={MapPin}>
                                                <Input
                                                    value={addresses.mailing.street}
                                                    onChange={e => {
                                                        setAddresses({ ...addresses, mailing: { ...addresses.mailing, street: e.target.value } });
                                                        if (errors.mailing) setErrors(prev => ({ ...prev, mailing: "" }));
                                                    }}
                                                    className="bg-white border-amber-100 focus:ring-amber-500/10"
                                                />
                                            </FormGroup>
                                            <FormGroup label="City" icon={Globe}>
                                                <Input
                                                    value={addresses.mailing.city}
                                                    onChange={e => {
                                                        setAddresses({ ...addresses, mailing: { ...addresses.mailing, city: e.target.value } });
                                                        if (errors.mailing) setErrors(prev => ({ ...prev, mailing: "" }));
                                                    }}
                                                    className="bg-white border-amber-100 focus:ring-amber-500/10"
                                                />
                                            </FormGroup>
                                            <FormGroup label="Country" icon={Flag}>
                                                <Input
                                                    value={addresses.mailing.country}
                                                    onChange={e => {
                                                        setAddresses({ ...addresses, mailing: { ...addresses.mailing, country: e.target.value } });
                                                        if (errors.mailing) setErrors(prev => ({ ...prev, mailing: "" }));
                                                    }}
                                                    className="bg-white border-amber-100 focus:ring-amber-500/10"
                                                />
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 lg:gap-10">
                                    <KinInputSection label="Father's Info" icon={UserIcon} data={kinForm.father} onChange={v => setKinForm({ ...kinForm, father: v })} errors={errors.father} setErrors={setErrors} />
                                    <KinInputSection label="Mother's Info" icon={UserIcon} data={kinForm.mother} onChange={v => setKinForm({ ...kinForm, mother: v })} errors={errors.mother} setErrors={setErrors} />
                                    <KinInputSection label="Guardian Info" icon={ShieldAlert} data={kinForm.guardian} onChange={v => setKinForm({ ...kinForm, guardian: v })} hasOccupation errors={errors.guardian} setErrors={setErrors} />
                                    <KinInputSection label="Emergency Contact" icon={Contact} data={kinForm.emergencyContact} onChange={v => setKinForm({ ...kinForm, emergencyContact: v })} hasRelation errors={errors.emergencyContact} setErrors={setErrors} />
                                </div>
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="bg-amber-50 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-amber-100 space-y-6 md:space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                                            <Settings2 className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-none mb-1">Review Details</h3>
                                            <p className="text-amber-700 font-bold text-xs italic">Please review the details below before saving the student.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 pt-4">
                                        <SummaryItem label="Full Name" value={basic.fullName} />
                                        {!isEdit && <SummaryItem label="Email Address" value={basic.email} />}
                                        <SummaryItem label="Registration ID" value={basic.registrationNumber || "AUTO-GEN"} highlighted />
                                        <SummaryItem label="Batch" value={getBatchLabel(basic.batchId)} />
                                        <SummaryItem label="Department" value={departments.find(d => (d.id || d._id) === basic.departmentId)?.name || "UNKNOWN"} />
                                        <SummaryItem label="Semester" value={`Semester ${basic.currentSemester}`} />
                                        <SummaryItem label="Phone Status" value={profileForm.studentMobile ? "PROVIDED" : "PENDING"} highlighted={!!profileForm.studentMobile} />
                                        <SummaryItem label="Status" value={basic.enrollmentStatus} />
                                    </div>

                                    {!isEdit && (
                                        <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-900 text-white flex items-start gap-3 md:gap-4 shadow-xl">
                                            <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                                            <p className="text-[11px] font-bold leading-relaxed text-slate-300">
                                                A temporary password will be sent to the student's email address upon creation.
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
                        className="h-12 md:h-14 px-4 md:px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 group transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1 md:mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                    {step < 6 ? (
                        <Button
                            onClick={nextStep}
                            className="h-12 md:h-14 px-6 md:px-10 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all active:scale-95 group shadow-lg"
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
                            Save Student
                        </Button>
                    )}
                </div>

                {enrollmentData && (
                    <FaceEnrollmentStep
                        isOpen={enrollmentData.open}
                        onClose={() => setEnrollmentData(null)}
                        studentName={enrollmentData.studentName}
                        studentId={enrollmentData.studentId}
                        onComplete={handleEnrollmentComplete}
                    />
                )}
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

function KinInputSection({ label, icon: Icon, data, onChange, hasOccupation = false, hasRelation = false, errors, setErrors }: { label: string, icon: any, data: any, onChange: (v: any) => void, hasOccupation?: boolean, hasRelation?: boolean, errors?: string, setErrors?: any }) {
    return (
        <div className={`p-8 rounded-[2.5rem] bg-white border-2 ${errors ? 'border-red-500 bg-red-50/10' : 'border-slate-50'} shadow-sm space-y-6 hover:border-amber-500/20 transition-all duration-500`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl ${errors ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${errors ? 'text-red-500' : 'text-slate-900'}`}>{label}</p>
                </div>
                {errors && <p className="text-[9px] font-black text-red-500 uppercase tracking-tighter">{errors}</p>}
            </div>
            <div className="space-y-4">
                <FormGroup label="Full Name" icon={UserIcon} error={errors && !data.name ? "Required" : ""}>
                    <Input
                        value={data.name}
                        onChange={e => {
                            onChange({ ...data, name: e.target.value });
                            if (errors && setErrors) {
                                // Clear error if both fields are now filled
                                if (e.target.value && data.cell) {
                                    const key = label.toLowerCase().replace("'s info", "").replace(" info", "").replace(" contact", "Contact");
                                    setErrors((prev: any) => ({ ...prev, [key]: "" }));
                                }
                            }
                        }}
                        className={`h-12 px-4 rounded-xl bg-slate-50 border-2 ${errors && !data.name ? 'border-red-500' : 'border-slate-100'}`}
                    />
                </FormGroup>
                <FormGroup label="Phone Number" icon={Phone} error={errors && !data.cell ? "Required" : ""}>
                    <Input
                        value={data.cell}
                        onChange={e => {
                            onChange({ ...data, cell: e.target.value });
                            if (errors && setErrors) {
                                if (data.name && e.target.value) {
                                    const key = label.toLowerCase().replace("'s info", "").replace(" info", "").replace(" contact", "Contact");
                                    setErrors((prev: any) => ({ ...prev, [key]: "" }));
                                }
                            }
                        }}
                        className={`h-12 px-4 rounded-xl bg-slate-50 border-2 ${errors && !data.cell ? 'border-red-500' : 'border-slate-100'}`}
                    />
                </FormGroup>
                {hasOccupation && (
                    <FormGroup label="Occupation" icon={Briefcase}>
                        <Input value={data.occupation} onChange={e => onChange({ ...data, occupation: e.target.value })} className="h-12 px-4 rounded-xl bg-slate-50 border-2 border-slate-100" />
                    </FormGroup>
                )}
                {hasRelation && (
                    <FormGroup label="Relation" icon={ShieldAlert}>
                        <Input value={data.relation} onChange={e => onChange({ ...data, relation: e.target.value })} className="h-12 px-4 rounded-xl bg-slate-50 border-2 border-slate-100" />
                    </FormGroup>
                )}
            </div>
        </div>
    );
}

function IconRenderer({ icon: Icon }: { icon: any }) {
    return <Icon className="w-4 h-4" />;
}

function SummaryItem({ label, value, highlighted = false }: { label: string, value: string, highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-700/60 leading-none">{label}</p>
            <p className={`text-base font-black truncate leading-tight ${highlighted ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
}



