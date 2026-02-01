"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentService, StudentCreatePayload } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { toast } from "sonner";
import { Users, ArrowLeft, Loader2, CheckCircle2, ChevronRight, GraduationCap, User, Home, Phone, Heart, BookOpen } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

export default function CreateStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

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
    setIsLoadingOptions(true);
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
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchBatchesByDepartment = async (departmentId: string) => {
    try {
      setIsLoadingOptions(true);
      const batchesData = await batchService.getAllBatches({ departmentId });
      setBatches(Array.isArray(batchesData) ? batchesData : []);
    } catch (error) {
      toast.error("Failed to load batches for department");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "batchId") {
      const selectedBatch = batches.find((b) => (b.id || b._id) === value);
      const sessionIdFromBatch = (selectedBatch?.sessionId && (selectedBatch.sessionId.id || selectedBatch.sessionId._id)) || selectedBatch?.sessionId || "";
      const programIdFromBatch = (selectedBatch?.programId && (selectedBatch.programId.id || selectedBatch.programId._id)) || selectedBatch?.programId || selectedBatch?.program?.id || selectedBatch?.program?._id || "";
      const departmentIdFromBatch = (selectedBatch?.departmentId && (selectedBatch.departmentId.id || selectedBatch.departmentId._id)) || selectedBatch?.departmentId || selectedBatch?.department?.id || selectedBatch?.department?._id || "";
      setFormData((prev) => ({
        ...prev,
        sessionId: sessionIdFromBatch || prev.sessionId,
        programId: programIdFromBatch || prev.programId,
        departmentId: departmentIdFromBatch || prev.departmentId,
      }));
    }
    if (key === "departmentId") {
      if (value) { fetchBatchesByDepartment(value); }
      setFormData((prev) => ({ ...prev, batchId: "", sessionId: "" }));
    }
  };

  const handleProfileChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, studentProfile: { ...prev.studentProfile, [key]: value } }));
  };

  const handleNestedProfileChange = (parent: string, key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      studentProfile: { ...prev.studentProfile, [parent]: { ...prev.studentProfile[parent], [key]: value } },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.departmentId || !formData.programId || !formData.batchId || !formData.sessionId) {
      toast.error("Please fill all required fields in Step 1");
      setStep(1);
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

      const created = await studentService.create(dataToSend);
      toast.success("Student created successfully");
      router.push(`/dashboard/admin/users/students/${created.id}`);
    } catch (error) {
      const err = error as Error;
      toast.error(err?.message || "Failed to create student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrograms = programs.filter(
    (p) =>
      !formData.departmentId ||
      p.departmentId === formData.departmentId ||
      (typeof p.departmentId === "object" && (p.departmentId as any).id === formData.departmentId) ||
      (typeof p.departmentId === "object" && (p.departmentId as any)._id === formData.departmentId) ||
      p.department?._id === formData.departmentId ||
      p.department?.id === formData.departmentId
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Student"
        subtitle="Enroll a new student"
        icon={GraduationCap}
        onBack={() => router.push("/dashboard/admin/users/students")}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all", step === 1 ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700")}>
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">1</span>
                Academic Info
              </div>
              <ChevronRight className="text-slate-400" />
              <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all", step === 2 ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700")}>
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">2</span>
                Personal Info
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="rounded-md border border-amber-200 dark:border-amber-800 p-3 bg-amber-50 dark:bg-amber-950/30 text-sm text-amber-800 dark:text-amber-200">
                    Select batch first — it auto-fills session, program, and department.
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch *</label>
                      <SearchableSelect
                        options={batches.map((b) => ({ label: b.code || `${String(b.shift || "").toLowerCase() === "evening" ? "E" : "D"}-${b.name}`, value: b.id || b._id }))}
                        value={formData.batchId}
                        onChange={(v) => handleChange("batchId", v)}
                        placeholder="Search and select batch"
                        disabled={isLoadingOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Session *</label>
                      <SearchableSelect
                        options={sessions.map((s) => ({ label: s.name, value: s.id || s._id }))}
                        value={formData.sessionId}
                        onChange={(v) => handleChange("sessionId", v)}
                        placeholder="Search and select session"
                        disabled={isLoadingOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Program *</label>
                      <SearchableSelect
                        options={filteredPrograms.map((p) => ({ label: p.name, value: p.id || p._id }))}
                        value={formData.programId}
                        onChange={(v) => handleChange("programId", v)}
                        placeholder="Search and select program"
                        disabled={isLoadingOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department *</label>
                      <SearchableSelect
                        options={departments.map((d) => ({ label: d.name, value: d.id || d._id }))}
                        value={formData.departmentId}
                        onChange={(v) => handleChange("departmentId", v)}
                        placeholder="Search and select department"
                        disabled={isLoadingOptions}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                      <Input value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="John Doe" className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email *</label>
                      <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="student@example.com" className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admission Date</label>
                      <Input type="date" value={formData.admissionDate} onChange={(e) => handleChange("admissionDate", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700">Next Step <ChevronRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mobile Number</label>
                      <Input value={formData.studentProfile.studentMobile} onChange={(e) => handleProfileChange("studentMobile", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                      <Select value={formData.studentProfile.gender} onValueChange={(v) => handleProfileChange("gender", v)}>
                        <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
                      <Input type="date" value={formData.studentProfile.dateOfBirth} onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Blood Group</label>
                      <Select value={formData.studentProfile.bloodGroup} onValueChange={(v) => handleProfileChange("bloodGroup", v)}>
                        <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                        <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Father&apos;s Name</label>
                      <Input value={formData.studentProfile.father.name} onChange={(e) => handleNestedProfileChange("father", "name", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mother&apos;s Name</label>
                      <Input value={formData.studentProfile.mother.name} onChange={(e) => handleNestedProfileChange("mother", "name", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Religion</label>
                      <Select value={formData.studentProfile.religion} onValueChange={(v) => handleProfileChange("religion", v)}>
                        <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select Religion" /></SelectTrigger>
                        <SelectContent>{["Islam", "Hinduism", "Christianity", "Buddhism", "Other"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Marital Status</label>
                      <Select value={formData.studentProfile.maritalStatus} onValueChange={(v) => handleProfileChange("maritalStatus", v)}>
                        <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select Status" /></SelectTrigger>
                        <SelectContent>{["Single", "Married", "Divorced", "Widowed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nationality</label>
                      <Input value={formData.studentProfile.nationality} onChange={(e) => handleProfileChange("nationality", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">NID / Passport</label>
                      <Input value={formData.studentProfile.nidOrPassportNo} onChange={(e) => handleProfileChange("nidOrPassportNo", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">Profile Picture <User className="h-4 w-4" /></label>
                      <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; setProfilePicture(file || null); }} className="border-slate-200 dark:border-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                      {profilePicture && <p className="text-sm text-indigo-600 dark:text-indigo-400">Selected: {profilePicture.name}</p>}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2"><Home className="h-5 w-5" /> Address Information</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">Permanent Address</h4>
                        <Input placeholder="Street" value={formData.studentProfile.permanentAddress?.street} onChange={(e) => handleNestedProfileChange("permanentAddress", "street", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="City" value={formData.studentProfile.permanentAddress?.city} onChange={(e) => handleNestedProfileChange("permanentAddress", "city", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="Country" value={formData.studentProfile.permanentAddress?.country} onChange={(e) => handleNestedProfileChange("permanentAddress", "country", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">Mailing Address</h4>
                        <Input placeholder="Street" value={formData.studentProfile.mailingAddress?.street} onChange={(e) => handleNestedProfileChange("mailingAddress", "street", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="City" value={formData.studentProfile.mailingAddress?.city} onChange={(e) => handleNestedProfileChange("mailingAddress", "city", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="Country" value={formData.studentProfile.mailingAddress?.country} onChange={(e) => handleNestedProfileChange("mailingAddress", "country", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2"><Phone className="h-5 w-5" /> Guardian & Emergency Contact</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">Guardian</h4>
                        <Input placeholder="Name" value={formData.studentProfile.guardian?.name} onChange={(e) => handleNestedProfileChange("guardian", "name", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="Cell" value={formData.studentProfile.guardian?.cell} onChange={(e) => handleNestedProfileChange("guardian", "cell", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="Occupation" value={formData.studentProfile.guardian?.occupation} onChange={(e) => handleNestedProfileChange("guardian", "occupation", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">Emergency Contact</h4>
                        <Input placeholder="Name" value={formData.studentProfile.emergencyContact?.name} onChange={(e) => handleNestedProfileChange("emergencyContact", "name", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="Cell" value={formData.studentProfile.emergencyContact?.cell} onChange={(e) => handleNestedProfileChange("emergencyContact", "cell", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                        <Input placeholder="Relation" value={formData.studentProfile.emergencyContact?.relation} onChange={(e) => handleNestedProfileChange("emergencyContact", "relation", e.target.value)} className="border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Create Student
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
