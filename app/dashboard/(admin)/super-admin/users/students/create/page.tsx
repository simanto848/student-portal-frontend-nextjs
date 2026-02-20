/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentService, StudentCreatePayload } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { toast } from "sonner";
import { GraduationCap, Loader2, CheckCircle2, User, Home, Zap, ShieldCheck, Globe, Users } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function CreateStudentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    const [formData, setFormData] = useState<StudentCreatePayload>({
        fullName: "",
        email: "",
        departmentId: "",
        programId: "",
        batchId: "",
        sessionId: "",
        admissionDate: new Date().toISOString().split("T")[0],
        studentProfile: {
            studentMobile: "",
            gender: "",
            dateOfBirth: "",
            bloodGroup: "",
            nationality: "Bangladeshi",
            father: { name: "", cell: "" },
            mother: { name: "", cell: "" },
            permanentAddress: { street: "", city: "", country: "Bangladesh" },
            mailingAddress: { street: "", city: "", country: "Bangladesh" },
            religion: "",
            maritalStatus: "",
            nidOrPassportNo: "",
            guardian: { name: "", cell: "", occupation: "" },
            emergencyContact: { name: "", cell: "", relation: "" },
        },
    });

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [depts, progs, batchesData, sessionsData] = await Promise.all([
                departmentService.getAllDepartments(),
                programService.getAllPrograms(),
                batchService.getAllBatches(),
                sessionService.getAllSessions(),
            ]);
            setDepartments(Array.isArray(depts) ? depts : []);
            setPrograms(Array.isArray(progs) ? progs : []);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        } catch (error) {
            toast.error("Failed to load options");
        }
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));

        if (key === "batchId") {
            const selectedBatch = batches.find((b) => (b.id || b._id) === value);
            if (selectedBatch) {
                const sessionId = selectedBatch.sessionId?.id || selectedBatch.sessionId?._id || selectedBatch.sessionId || "";
                const programId = selectedBatch.programId?.id || selectedBatch.programId?._id || selectedBatch.programId || "";
                const departmentId = selectedBatch.departmentId?.id || selectedBatch.departmentId?._id || selectedBatch.departmentId || "";

                setFormData(prev => ({
                    ...prev,
                    batchId: value,
                    sessionId: sessionId || prev.sessionId,
                    programId: programId || prev.programId,
                    departmentId: departmentId || prev.departmentId
                }));
            }
        }
    };

    const handleProfileChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, studentProfile: { ...prev.studentProfile, [key]: value } }));
    };

    const handleNestedProfileChange = (parent: string, key: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            studentProfile: {
                ...prev.studentProfile,
                [parent]: { ...(prev.studentProfile as any)[parent], [key]: value }
            },
        }));
    };

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.email || !formData.batchId) {
            toast.error("Please fill Name, Email, and Batch");
            return;
        }

        setIsSubmitting(true);
        try {
            let dataToSend: StudentCreatePayload | FormData = formData;
            if (profilePicture) {
                const fd = new FormData();
                fd.append("data", JSON.stringify(formData));
                fd.append("profilePicture", profilePicture);
                dataToSend = fd;
            }

            await studentService.create(dataToSend);
            toast.success("Student enrollment successful");
            router.push(`/dashboard/super-admin/users/students`);
        } catch (error: any) {
            toast.error(error?.message || "Failed to create student");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <PageHeader
                title="Student Enrollment"
                subtitle="Provision a new learner identity"
                icon={GraduationCap}
                onBack={() => router.push("/dashboard/super-admin/users/students")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Academic Placement */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Academic Placement
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Batch *</label>
                                    <SearchableSelect
                                        options={batches.map((b) => ({
                                            label: b.code || `${String(b.shift || "").toLowerCase() === "evening" ? "E" : "D"}-${b.name}`,
                                            value: b.id || b._id
                                        }))}
                                        value={formData.batchId}
                                        onSelect={(v) => handleChange("batchId", v)}
                                        placeholder="Select batch (auto-fills other fields)"
                                        className="h-10 border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department</label>
                                    <Select value={formData.departmentId} onValueChange={(v) => handleChange("departmentId", v)}>
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 shadow-none bg-slate-50 font-medium">
                                            <SelectValue placeholder="Linked to Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(d => <SelectItem key={d.id || d._id} value={d.id || d._id}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Program</label>
                                    <Select value={formData.programId} onValueChange={(v) => handleChange("programId", v)}>
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 shadow-none bg-slate-50 font-medium">
                                            <SelectValue placeholder="Linked to Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programs.map(p => <SelectItem key={p.id || p._id} value={p.id || p._id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Academic Session</label>
                                    <Select value={formData.sessionId} onValueChange={(v) => handleChange("sessionId", v)}>
                                        <SelectTrigger className="h-10 rounded-lg border-slate-200 shadow-none bg-slate-50 font-medium">
                                            <SelectValue placeholder="Linked to Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sessions.map(s => <SelectItem key={s.id || s._id} value={s.id || s._id}>{s.name || s.year}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Admission Date</label>
                                    <Input
                                        type="date"
                                        value={formData.admissionDate}
                                        onChange={(e) => handleChange("admissionDate", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Identity Details */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-500" />
                                Individual Identity
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Legal Name *</label>
                                    <Input
                                        value={formData.fullName}
                                        onChange={(e) => handleChange("fullName", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                        placeholder="First M. Last"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institutional Email *</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none font-mono"
                                        placeholder="student@institution.edu"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                                    <Input
                                        value={formData.studentProfile.studentMobile}
                                        onChange={(e) => handleProfileChange("studentMobile", e.target.value)}
                                        className="h-10 rounded-lg border-slate-200 shadow-none"
                                        placeholder="+880..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                                        <Select value={formData.studentProfile.gender} onValueChange={(v) => handleProfileChange("gender", v)}>
                                            <SelectTrigger className="h-10 border-slate-200"><SelectValue placeholder="Pick one" /></SelectTrigger>
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
                                            value={formData.studentProfile.dateOfBirth}
                                            onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                                            className="h-10 border-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Blood Group</label>
                                    <Select value={formData.studentProfile.bloodGroup} onValueChange={(v) => handleProfileChange("bloodGroup", v)}>
                                        <SelectTrigger className="h-10 border-slate-200"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nationality</label>
                                    <Input
                                        value={formData.studentProfile.nationality}
                                        onChange={(e) => handleProfileChange("nationality", e.target.value)}
                                        className="h-10 border-slate-200"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Family & Guardian */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-500" />
                                Family & Legal Guardian
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Father&apos;s Name</label>
                                        <Input value={formData.studentProfile.father?.name} onChange={(e) => handleNestedProfileChange("father", "name", e.target.value)} className="h-10 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Father&apos;s Contact</label>
                                        <Input value={formData.studentProfile.father?.cell} onChange={(e) => handleNestedProfileChange("father", "cell", e.target.value)} className="h-10 border-slate-200" />
                                    </div>
                                </div>
                                <div className="space-y-4 border-l pl-6 border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mother&apos;s Name</label>
                                        <Input value={formData.studentProfile.mother?.name} onChange={(e) => handleNestedProfileChange("mother", "name", e.target.value)} className="h-10 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mother&apos;s Contact</label>
                                        <Input value={formData.studentProfile.mother?.cell} onChange={(e) => handleNestedProfileChange("mother", "cell", e.target.value)} className="h-10 border-slate-200" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Context */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Home className="w-4 h-4 text-blue-500" />
                                Residential Data
                            </h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Permanent Address</h4>
                                    <div className="space-y-2">
                                        <Input placeholder="Street" value={formData.studentProfile.permanentAddress?.street} onChange={(e) => handleNestedProfileChange("permanentAddress", "street", e.target.value)} className="h-10 border-slate-200" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input placeholder="City" value={formData.studentProfile.permanentAddress?.city} onChange={(e) => handleNestedProfileChange("permanentAddress", "city", e.target.value)} className="h-10 border-slate-200" />
                                            <Input placeholder="Country" value={formData.studentProfile.permanentAddress?.country} onChange={(e) => handleNestedProfileChange("permanentAddress", "country", e.target.value)} className="h-10 border-slate-200" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 border-l pl-6 border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Mailing Address</h4>
                                    <div className="space-y-2">
                                        <Input placeholder="Street" value={formData.studentProfile.mailingAddress?.street} onChange={(e) => handleNestedProfileChange("mailingAddress", "street", e.target.value)} className="h-10 border-slate-200" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input placeholder="City" value={formData.studentProfile.mailingAddress?.city} onChange={(e) => handleNestedProfileChange("mailingAddress", "city", e.target.value)} className="h-10 border-slate-200" />
                                            <Input placeholder="Country" value={formData.studentProfile.mailingAddress?.country} onChange={(e) => handleNestedProfileChange("mailingAddress", "country", e.target.value)} className="h-10 border-slate-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                Execution Control
                            </h3>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Identity Document</label>
                                <Input
                                    placeholder="NID or Passport Number"
                                    value={formData.studentProfile.nidOrPassportNo}
                                    onChange={(e) => handleProfileChange("nidOrPassportNo", e.target.value)}
                                    className="h-10 border-slate-200 font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Avatar</label>
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
                                Enroll Student
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
