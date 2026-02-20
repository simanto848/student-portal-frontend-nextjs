"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    User as UserIcon,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Sparkles,
    Settings2,
    Loader2,
    MapPin,
    Home,
    UploadCloud
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
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
        { id: 1, label: "Basic Info" },
        { id: 2, label: "Academic Info" },
        { id: 3, label: "Contact Info" },
        { id: 4, label: "Addresses" },
        { id: 5, label: "Guardian Info" },
        { id: 6, label: "Review" },
    ];

    const getBatchLabel = (bId: string) => {
        const b = batches.find(x => (x.id || x._id) === bId);
        if (!b) return "N/A";
        const shift = String(b.shift || "").toLowerCase();
        const prefix = shift === "evening" ? "E" : "D";
        return `${prefix}-${b.name || b.code}`;
    };

    return (
        <div className="space-y-6 pb-10 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {isEdit ? `Edit Student: ${student?.fullName}` : "New Student Registration"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isEdit ? "Update student information and academic details." : "Enter the details to enroll a new student into the system."}
                        </p>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-slate-200 shadow-sm">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
                    {steps.map((s, idx) => {
                        const active = step === s.id;
                        const completed = step > s.id;
                        return (
                            <div key={s.id} className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {completed ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                                </div>
                                <div className="hidden sm:block">
                                    <p className={`text-sm font-medium ${active ? 'text-slate-900' : 'text-slate-500'}`}>{s.label}</p>
                                </div>
                                {idx < steps.length - 1 && <div className="hidden lg:block h-px w-12 bg-slate-200 mx-2" />}
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 md:p-8 min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormGroup label="Full Name" error={errors.fullName}>
                                    <Input
                                        value={basic.fullName}
                                        onChange={e => {
                                            setBasic({ ...basic, fullName: e.target.value });
                                            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                                        }}
                                        placeholder="Enter full name"
                                        className={`h-10 ${errors.fullName ? 'border-red-500' : ''}`}
                                    />
                                </FormGroup>
                                {!isEdit && (
                                    <FormGroup label="Email Address" error={errors.email}>
                                        <Input
                                            value={basic.email}
                                            onChange={e => {
                                                setBasic({ ...basic, email: e.target.value });
                                                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                            }}
                                            placeholder="email@university.edu"
                                            className={`h-10 ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                    </FormGroup>
                                )}
                                <FormGroup label="Registration Number">
                                    <Input
                                        value={isEdit ? basic.registrationNumber : "Auto-generated by system"}
                                        readOnly
                                        className="h-10 bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                </FormGroup>
                                <FormGroup label="Admission Date" error={errors.admissionDate}>
                                    <DatePicker
                                        date={basic.admissionDate ? parseISO(basic.admissionDate) : undefined}
                                        onChange={d => {
                                            setBasic({ ...basic, admissionDate: d ? formatDate(d, "yyyy-MM-dd") : "" });
                                            if (errors.admissionDate) setErrors(prev => ({ ...prev, admissionDate: "" }));
                                        }}
                                    />
                                </FormGroup>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Select batch first — it will automatically update session, program, and department fields.
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormGroup label="Batch" error={errors.batchId}>
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
                                <FormGroup label="Session" error={errors.sessionId}>
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
                                <FormGroup label="Program" error={errors.programId}>
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
                                <FormGroup label="Department" error={errors.departmentId}>
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
                                <FormGroup label="Current Semester">
                                    <Input type="number" min={1} max={12} value={basic.currentSemester} onChange={e => setBasic({ ...basic, currentSemester: parseInt(e.target.value) })} className="h-10" />
                                </FormGroup>
                                <FormGroup label="Enrollment Status">
                                    <Select value={basic.enrollmentStatus} onValueChange={v => setBasic({ ...basic, enrollmentStatus: v as EnrollmentStatus })}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["enrolled", "not_enrolled", "graduated", "suspended", "on_leave"].map(s => (
                                                <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormGroup>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <FormGroup label="Phone Number" error={errors.studentMobile}>
                                    <Input
                                        value={profileForm.studentMobile}
                                        onChange={e => {
                                            setProfileForm({ ...profileForm, studentMobile: e.target.value });
                                            if (errors.studentMobile) setErrors(prev => ({ ...prev, studentMobile: "" }));
                                        }}
                                        placeholder="+X XXX XXX XXXX"
                                        className={`h-10 ${errors.studentMobile ? 'border-red-500' : ''}`}
                                    />
                                </FormGroup>
                                <FormGroup label="Date of Birth" error={errors.dateOfBirth}>
                                    <DatePicker
                                        date={profileForm.dateOfBirth ? parseISO(profileForm.dateOfBirth) : undefined}
                                        onChange={d => {
                                            setProfileForm({ ...profileForm, dateOfBirth: d ? formatDate(d, "yyyy-MM-dd") : "" });
                                            if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: "" }));
                                        }}
                                    />
                                </FormGroup>
                                <FormGroup label="Gender" error={errors.gender}>
                                    <Select
                                        value={profileForm.gender}
                                        onValueChange={v => {
                                            setProfileForm({ ...profileForm, gender: v });
                                            if (errors.gender) setErrors(prev => ({ ...prev, gender: "" }));
                                        }}
                                    >
                                        <SelectTrigger className={`h-10 ${errors.gender ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormGroup>
                                <FormGroup label="Blood Group">
                                    <Select value={profileForm.bloodGroup} onValueChange={v => setProfileForm({ ...profileForm, bloodGroup: v })}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormGroup>
                                <FormGroup label="NID/Passport Number">
                                    <Input value={profileForm.nidOrPassportNo} onChange={e => setProfileForm({ ...profileForm, nidOrPassportNo: e.target.value })} className="h-10" />
                                </FormGroup>
                                <FormGroup label="Nationality">
                                    <Input value={profileForm.nationality} onChange={e => setProfileForm({ ...profileForm, nationality: e.target.value })} className="h-10" />
                                </FormGroup>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-slate-900">Profile Picture</p>
                                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                                    <div className="h-24 w-24 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setProfilePicture(e.target.files?.[0] || null)}
                                                className="hidden"
                                                id="pfp-upload"
                                            />
                                            <label
                                                htmlFor="pfp-upload"
                                                className="flex flex-col items-center justify-center w-full h-24 rounded-lg border border-dashed border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                                                    <p className="text-sm text-slate-600">
                                                        {profilePicture ? profilePicture.name : "Click to upload profile picture"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG or WEBP (MAX. 2MB)</p>
                                                </div>
                                            </label>
                                        </div>

                                        {profilePicture && (
                                            <div className="flex items-center justify-between px-1">
                                                <p className="text-sm text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Ready for upload
                                                </p>
                                                <button
                                                    onClick={() => setProfilePicture(null)}
                                                    className="text-sm text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                        <Home className={`w-4 h-4 ${errors.permanent ? 'text-red-500' : 'text-slate-500'}`} />
                                        <h3 className={`text-sm font-semibold ${errors.permanent ? 'text-red-500' : 'text-slate-900'}`}>Permanent Address</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <FormGroup label="Street">
                                            <Input
                                                value={addresses.permanent.street}
                                                onChange={e => {
                                                    setAddresses({ ...addresses, permanent: { ...addresses.permanent, street: e.target.value } });
                                                    if (errors.permanent) setErrors(prev => ({ ...prev, permanent: "" }));
                                                }}
                                                className={`h-10 ${errors.permanent ? 'border-red-500' : ''}`}
                                            />
                                        </FormGroup>
                                        <FormGroup label="City">
                                            <Input
                                                value={addresses.permanent.city}
                                                onChange={e => {
                                                    setAddresses({ ...addresses, permanent: { ...addresses.permanent, city: e.target.value } });
                                                    if (errors.permanent) setErrors(prev => ({ ...prev, permanent: "" }));
                                                }}
                                                className={`h-10 ${errors.permanent ? 'border-red-500' : ''}`}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Country">
                                            <Input
                                                value={addresses.permanent.country}
                                                onChange={e => {
                                                    setAddresses({ ...addresses, permanent: { ...addresses.permanent, country: e.target.value } });
                                                    if (errors.permanent) setErrors(prev => ({ ...prev, permanent: "" }));
                                                }}
                                                className={`h-10 ${errors.permanent ? 'border-red-500' : ''}`}
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                        <MapPin className={`w-4 h-4 ${errors.mailing ? 'text-red-500' : 'text-slate-500'}`} />
                                        <h3 className={`text-sm font-semibold ${errors.mailing ? 'text-red-500' : 'text-slate-900'}`}>Mailing Address</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <FormGroup label="Street">
                                            <Input
                                                value={addresses.mailing.street}
                                                onChange={e => {
                                                    setAddresses({ ...addresses, mailing: { ...addresses.mailing, street: e.target.value } });
                                                    if (errors.mailing) setErrors(prev => ({ ...prev, mailing: "" }));
                                                }}
                                                className={`h-10 ${errors.mailing ? 'border-red-500' : ''}`}
                                            />
                                        </FormGroup>
                                        <FormGroup label="City">
                                            <Input
                                                value={addresses.mailing.city}
                                                onChange={e => {
                                                    setAddresses({ ...addresses, mailing: { ...addresses.mailing, city: e.target.value } });
                                                    if (errors.mailing) setErrors(prev => ({ ...prev, mailing: "" }));
                                                }}
                                                className={`h-10 ${errors.mailing ? 'border-red-500' : ''}`}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Country">
                                            <Input
                                                value={addresses.mailing.country}
                                                onChange={e => {
                                                    setAddresses({ ...addresses, mailing: { ...addresses.mailing, country: e.target.value } });
                                                    if (errors.mailing) setErrors(prev => ({ ...prev, mailing: "" }));
                                                }}
                                                className={`h-10 ${errors.mailing ? 'border-red-500' : ''}`}
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <KinInputSection label="Father's Info" data={kinForm.father} onChange={v => setKinForm({ ...kinForm, father: v })} errors={errors.father} setErrors={setErrors} />
                                <KinInputSection label="Mother's Info" data={kinForm.mother} onChange={v => setKinForm({ ...kinForm, mother: v })} errors={errors.mother} setErrors={setErrors} />
                                <KinInputSection label="Guardian Info" data={kinForm.guardian} onChange={v => setKinForm({ ...kinForm, guardian: v })} hasOccupation errors={errors.guardian} setErrors={setErrors} />
                                <KinInputSection label="Emergency Contact" data={kinForm.emergencyContact} onChange={v => setKinForm({ ...kinForm, emergencyContact: v })} hasRelation errors={errors.emergencyContact} setErrors={setErrors} />
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Settings2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Review Details</h3>
                                        <p className="text-sm text-slate-500">Please review the details below before saving the student.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
                                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm">
                                            A temporary password will be sent to the student's email address upon creation.
                                            Please ensure all information is correct before saving.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 1 || isSubmitting}
                        className="h-10 px-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    {step < 6 ? (
                        <Button
                            onClick={nextStep}
                            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Next Step
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
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
            </Card>
        </div>
    );
}

function FormGroup({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${error ? 'text-red-500' : 'text-slate-700'}`}>{label}</label>
                {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
            {children}
        </div>
    );
}

function KinInputSection({ label, data, onChange, hasOccupation = false, hasRelation = false, errors, setErrors }: { label: string, data: any, onChange: (v: any) => void, hasOccupation?: boolean, hasRelation?: boolean, errors?: string, setErrors?: any }) {
    return (
        <div className={`p-6 rounded-xl border ${errors ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-slate-50/50'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className={`text-sm font-semibold ${errors ? 'text-red-600' : 'text-slate-900'}`}>{label}</h3>
                {errors && <span className="text-xs text-red-500">{errors}</span>}
            </div>
            <div className="space-y-4">
                <FormGroup label="Full Name" error={errors && !data.name ? "Required" : ""}>
                    <Input
                        value={data.name}
                        onChange={e => {
                            onChange({ ...data, name: e.target.value });
                            if (errors && setErrors) {
                                if (e.target.value && data.cell) {
                                    const key = label.toLowerCase().replace("'s info", "").replace(" info", "").replace(" contact", "Contact");
                                    setErrors((prev: any) => ({ ...prev, [key]: "" }));
                                }
                            }
                        }}
                        className={`h-10 ${errors && !data.name ? 'border-red-500' : ''}`}
                    />
                </FormGroup>
                <FormGroup label="Phone Number" error={errors && !data.cell ? "Required" : ""}>
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
                        className={`h-10 ${errors && !data.cell ? 'border-red-500' : ''}`}
                    />
                </FormGroup>
                {hasOccupation && (
                    <FormGroup label="Occupation">
                        <Input value={data.occupation} onChange={e => onChange({ ...data, occupation: e.target.value })} className="h-10" />
                    </FormGroup>
                )}
                {hasRelation && (
                    <FormGroup label="Relation">
                        <Input value={data.relation} onChange={e => onChange({ ...data, relation: e.target.value })} className="h-10" />
                    </FormGroup>
                )}
            </div>
        </div>
    );
}

function SummaryItem({ label, value, highlighted = false }: { label: string, value: string, highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`text-sm font-semibold truncate ${highlighted ? 'text-blue-600' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
}



