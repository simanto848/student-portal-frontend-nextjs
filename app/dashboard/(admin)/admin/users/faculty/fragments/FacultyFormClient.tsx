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
    ShieldPlus,
    UploadCloud,
    Phone,
    Briefcase
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format as formatDate } from "date-fns";

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
    }, [profilePicture, isEdit, teacher, getImageUrl]);

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
                setDepartments(Array.isArray(d) ? d : []);
            } catch (e: any) {
                toast.error("Failed to load departments");
            } finally {
                setLoadingDepartments(false);
            }
        };
        loadDepartments();
    }, []);


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
        <div className="space-y-6 pb-10 mx-auto">
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
                            {isEdit ? `Edit Faculty: ${teacher?.fullName}` : "New Faculty Member"}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isEdit ? "Update faculty information and details." : "Enter the details to add a new faculty member into the system."}
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
                                <FormGroup label="Department" error={errors.departmentId}>
                                    <Select
                                        value={basic.departmentId}
                                        onValueChange={(v) => {
                                            setBasic({ ...basic, departmentId: v });
                                            if (errors.departmentId) setErrors(prev => ({ ...prev, departmentId: "" }));
                                        }}
                                        disabled={loadingDepartments}
                                    >
                                        <SelectTrigger className={`h-10 ${errors.departmentId ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder={loadingDepartments ? "Loading..." : "Select Department"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => (
                                                <SelectItem key={d.id || d._id} value={d.id || d._id}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormGroup>
                                <FormGroup label="Designation" error={errors.designation}>
                                    <Select
                                        value={basic.designation}
                                        onValueChange={(v) => {
                                            setBasic({ ...basic, designation: v as TeacherDesignation });
                                            if (errors.designation) setErrors(prev => ({ ...prev, designation: "" }));
                                        }}
                                    >
                                        <SelectTrigger className={`h-10 ${errors.designation ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder="Select Designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(designationLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormGroup>
                                <FormGroup label="Registration Number">
                                    <Input
                                        value={isEdit ? basic.registrationNumber : "Auto-generated by system"}
                                        readOnly
                                        className="h-10 bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                </FormGroup>
                                <FormGroup label="Phone Number">
                                    <Input
                                        value={basic.phone}
                                        onChange={e => setBasic({ ...basic, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="h-10"
                                    />
                                </FormGroup>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormGroup label="Joining Date" error={errors.joiningDate}>
                                    <DatePicker
                                        date={advanced.joiningDate ? parseISO(advanced.joiningDate) : undefined}
                                        onChange={d => {
                                            setAdvanced({ ...advanced, joiningDate: d ? formatDate(d, "yyyy-MM-dd") : "" });
                                            if (errors.joiningDate) setErrors(prev => ({ ...prev, joiningDate: "" }));
                                        }}
                                    />
                                </FormGroup>
                                <FormGroup label="Allowed IPs">
                                    <div className="flex gap-2">
                                        <Input
                                            value={advanced.ipInput}
                                            onChange={e => setAdvanced({ ...advanced, ipInput: e.target.value })}
                                            placeholder="e.g. 192.168.1.1"
                                            className="h-10 flex-1"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddIp}
                                            variant="secondary"
                                            className="h-10"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </FormGroup>
                            </div>

                            <div className="pt-4">
                                <p className="text-sm font-medium text-slate-700 mb-3">Allowed IP Addresses</p>
                                <div className="flex flex-wrap gap-2">
                                    {advanced.registeredIps.length === 0 ? (
                                        <div className="w-full p-4 border border-dashed border-slate-200 rounded-lg text-sm text-slate-500 text-center">
                                            No IP restrictions (Open Access)
                                        </div>
                                    ) : (
                                        advanced.registeredIps.map(ip => (
                                            <Badge key={ip} variant="secondary" className="px-3 py-1.5 flex items-center gap-2">
                                                {ip}
                                                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => handleRemoveIp(ip)} />
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormGroup label="First Name" error={errors.firstName}>
                                    <Input
                                        value={profileForm.firstName}
                                        onChange={e => {
                                            setProfileForm({ ...profileForm, firstName: e.target.value });
                                            if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
                                        }}
                                        placeholder="First Name"
                                        className={`h-10 ${errors.firstName ? 'border-red-500' : ''}`}
                                    />
                                </FormGroup>
                                <FormGroup label="Middle Name">
                                    <Input value={profileForm.middleName} onChange={e => setProfileForm({ ...profileForm, middleName: e.target.value })} placeholder="Middle Name" className="h-10" />
                                </FormGroup>
                                <FormGroup label="Last Name" error={errors.lastName}>
                                    <Input
                                        value={profileForm.lastName}
                                        onChange={e => {
                                            setProfileForm({ ...profileForm, lastName: e.target.value });
                                            if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
                                        }}
                                        placeholder="Last Name"
                                        className={`h-10 ${errors.lastName ? 'border-red-500' : ''}`}
                                    />
                                </FormGroup>
                                <FormGroup label="Date of Birth">
                                    <DatePicker
                                        date={profileForm.dateOfBirth ? parseISO(profileForm.dateOfBirth) : undefined}
                                        onChange={d => setProfileForm({ ...profileForm, dateOfBirth: d ? formatDate(d, "yyyy-MM-dd") : "" })}
                                    />
                                </FormGroup>
                                <FormGroup label="Phone Number">
                                    <Input value={profileForm.phoneNumber} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} placeholder="+X XXX XXX XXXX" className="h-10" />
                                </FormGroup>
                                <FormGroup label="Gender" error={errors.gender}>
                                    <Select
                                        value={profileForm.gender}
                                        onValueChange={(v) => {
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
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-sm font-medium text-slate-700 mb-4">Profile Picture</p>
                                <div className="flex items-center gap-6">
                                    <div className="h-24 w-24 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setProfilePicture(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="pfp-upload"
                                        />
                                        <label
                                            htmlFor="pfp-upload"
                                            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                                        >
                                            <UploadCloud className="w-4 h-4 mr-2" />
                                            {profilePicture ? profilePicture.name : "Upload Picture"}
                                        </label>
                                        <p className="text-xs text-slate-500 mt-2">PNG, JPG or WEBP (MAX. 2MB)</p>
                                        {profilePicture && (
                                            <button
                                                onClick={() => setProfilePicture(null)}
                                                className="text-xs text-red-500 hover:text-red-600 mt-2 block"
                                            >
                                                Remove picture
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <FormGroup label="Street Address">
                                        <Input value={addressDraft.street} onChange={e => setAddressDraft({ ...addressDraft, street: e.target.value })} className="h-10" />
                                    </FormGroup>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormGroup label="City">
                                            <Input value={addressDraft.city} onChange={e => setAddressDraft({ ...addressDraft, city: e.target.value })} className="h-10" />
                                        </FormGroup>
                                        <FormGroup label="State">
                                            <Input value={addressDraft.state} onChange={e => setAddressDraft({ ...addressDraft, state: e.target.value })} className="h-10" />
                                        </FormGroup>
                                    </div>
                                    <FormGroup label="Country">
                                        <Input value={addressDraft.country} onChange={e => setAddressDraft({ ...addressDraft, country: e.target.value })} className="h-10" />
                                    </FormGroup>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={addressDraft.isPrimary} onChange={e => setAddressDraft({ ...addressDraft, isPrimary: e.target.checked })} />
                                            <span className="text-sm text-slate-700">Set as Primary Address</span>
                                        </label>
                                        <Button type="button" onClick={addAddress} variant="secondary">Add Address</Button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                                    <p className="text-sm font-medium text-slate-700 mb-4">Added Addresses</p>
                                    <div className="space-y-3">
                                        {addresses.length === 0 ? (
                                            <div className="py-8 text-center text-slate-500 text-sm">
                                                No addresses added yet
                                            </div>
                                        ) : (
                                            addresses.map((a, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-md border border-slate-200 relative">
                                                    <div className="flex items-center justify-between mb-1">
                                                        {a.isPrimary && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Primary</Badge>}
                                                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => setAddresses(addresses.filter((_, i) => i !== idx))} />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900">{a.street}, {a.city}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{a.country} • {a.zipCode}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Faculty Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <SummaryItem label="Full Name" value={basic.fullName} />
                                    {!isEdit && <SummaryItem label="Email" value={basic.email} />}
                                    <SummaryItem label="Department" value={departments.find(d => (d.id || d._id) === basic.departmentId)?.name || "Unknown"} />
                                    <SummaryItem label="Designation" value={designationLabels[basic.designation] || "None"} />
                                    <SummaryItem label="Joined" value={advanced.joiningDate || "N/A"} />
                                    <SummaryItem label="ID" value={basic.registrationNumber} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 1 || isSubmitting}
                        className="h-10"
                    >
                        Back
                    </Button>
                    {step < 5 ? (
                        <Button
                            onClick={nextStep}
                            className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-10 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Save Faculty Member
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}

function FormGroup({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SummaryItem({ label, value }: { label: string, value: string | undefined }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value || "N/A"}</p>
        </div>
    );
}
