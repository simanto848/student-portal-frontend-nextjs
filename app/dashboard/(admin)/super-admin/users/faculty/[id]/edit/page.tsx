"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teacherService, TeacherDesignation, Teacher, TeacherUpdatePayload } from "@/services/user/teacher.service";
import { teacherProfileService, TeacherProfile, TeacherProfilePayload } from "@/services/user/teacherProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { toast } from "sonner";
import { GraduationCap, ChevronRight, ChevronLeft, CheckCircle2, Network, User, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditFacultyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const [step, setStep] = useState<number>(1);
  const [useAdvanced, setUseAdvanced] = useState(true);
  const [useProfile, setUseProfile] = useState(true);
  const [useAddressStep, setUseAddressStep] = useState(true);

  const [basic, setBasic] = useState({ fullName: "", departmentId: "", designation: "" as TeacherDesignation | "", phone: "" });
  const [advanced, setAdvanced] = useState({ joiningDate: "", registeredIps: [] as string[], ipInput: "" });
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", middleName: "", phoneNumber: "", dateOfBirth: "", gender: "" });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressDraft, setAddressDraft] = useState({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  useEffect(() => { if (id) fetchAll(); }, [id]);

  const designationMap: Record<TeacherDesignation, string> = {
    professor: "Professor",
    associate_professor: "Associate Professor",
    assistant_professor: "Assistant Professor",
    lecturer: "Lecturer",
    senior_lecturer: "Senior Lecturer",
  };

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const t = await teacherService.getById(id);
      setTeacher(t);
      setBasic({ fullName: t.fullName, departmentId: t.departmentId, designation: t.designation || "", phone: t.phone || "" });
      setAdvanced({ joiningDate: t.joiningDate?.substring(0, 10) || "", registeredIps: t.registeredIpAddress || [], ipInput: "" });
      try {
        const p = await teacherProfileService.get(id);
        if (p) {
          setProfile(p);
          setProfileForm({ firstName: p.firstName, lastName: p.lastName, middleName: p.middleName || "", phoneNumber: p.phoneNumber || "", dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : "", gender: p.gender || "" });
          setAddresses(p.addresses || []);
        }
      } catch { }
      try { const d = await departmentService.getAllDepartments(); setDepartments(Array.isArray(d) ? d : []); } catch { }
    } catch (e: any) { toast.error(e?.message || "Failed to load teacher"); router.push("/dashboard/admin/users/faculty"); }
    finally { setIsLoading(false); }
  };

  const updateBasic = (key: keyof typeof basic, value: any) => setBasic(prev => ({ ...prev, [key]: value }));
  const updateAdvanced = (key: keyof typeof advanced, value: any) => setAdvanced(prev => ({ ...prev, [key]: value }));
  const updateProfile = (key: keyof typeof profileForm, value: any) => setProfileForm(prev => ({ ...prev, [key]: value }));

  const addIp = () => {
    const ip = advanced.ipInput.trim();
    if (!ip) return; if (advanced.registeredIps.includes(ip)) { toast.error("IP already added"); return; }
    setAdvanced(prev => ({ ...prev, registeredIps: [...prev.registeredIps, ip], ipInput: "" }));
  };
  const removeIp = (ip: string) => setAdvanced(prev => ({ ...prev, registeredIps: prev.registeredIps.filter(i => i !== ip) }));

  const clearAddressDraft = () => setAddressDraft({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
  const addAddress = () => {
    if (!addressDraft.street && !addressDraft.city && !addressDraft.country) { toast.error("Provide at least street/city/country"); return; }
    setAddresses(prev => {
      let next = [...prev];
      if (addressDraft.isPrimary) next = next.map(a => ({ ...a, isPrimary: false }));
      next.push(addressDraft);
      return next;
    });
    clearAddressDraft();
  };
  const removeAddress = (idx: number) => setAddresses(prev => prev.filter((_, i) => i !== idx));
  const makePrimary = (idx: number) => setAddresses(prev => prev.map((a, i) => ({ ...a, isPrimary: i === idx })));

  const nextStep = () => {
    if (step === 1) setStep(useAdvanced ? 2 : (useProfile ? 3 : (useAddressStep ? 4 : 5)));
    else if (step === 2) setStep(useProfile ? 3 : (useAddressStep ? 4 : 5));
    else if (step === 3) setStep(useAddressStep ? 4 : 5);
    else if (step === 4) setStep(5);
  };
  const prevStep = () => {
    if (step === 5) setStep(useAddressStep ? 4 : (useProfile ? 3 : (useAdvanced ? 2 : 1)));
    else if (step === 4) setStep(useProfile ? 3 : (useAdvanced ? 2 : 1));
    else if (step === 3) setStep(useAdvanced ? 2 : 1);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async () => {
    if (!teacher) return;
    setIsSubmitting(true);
    try {
      const payload: TeacherUpdatePayload = {
        fullName: basic.fullName.trim(),
        departmentId: basic.departmentId,
        designation: basic.designation || undefined,
        phone: basic.phone?.trim() || undefined,
        joiningDate: useAdvanced && advanced.joiningDate ? advanced.joiningDate : undefined,
        registeredIpAddress: useAdvanced ? advanced.registeredIps : undefined,
      } as any;
      let dataToSend: TeacherUpdatePayload | FormData = payload;
      if (profilePicture) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        formData.append('profilePicture', profilePicture);
        dataToSend = formData;
      }

      const updatedTeacher = await teacherService.update(teacher.id, dataToSend);

      if (useProfile && profileForm.firstName && profileForm.lastName) {
        const profilePayload: TeacherProfilePayload = {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          middleName: profileForm.middleName ? profileForm.middleName.trim() : undefined,
          phoneNumber: profileForm.phoneNumber ? profileForm.phoneNumber.trim() : undefined,
          dateOfBirth: profileForm.dateOfBirth || undefined,
          gender: profileForm.gender || undefined,
          addresses: useAddressStep && addresses.length ? addresses.map(a => ({ ...a })) : undefined,
        };
        try {
          if (profile) await teacherProfileService.upsert(teacher.id, profilePayload);
          else await teacherProfileService.create(teacher.id, profilePayload);
        } catch (e: any) { toast.warning(e?.message || "Profile update failed"); }
      }

      toast.success("Teacher updated successfully");
      router.push(`/dashboard/admin/users/faculty/${updatedTeacher.id}`);
    } catch (e: any) { toast.error(e?.message || "Failed to update teacher"); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (!teacher) return null;

  const StepIndicator = () => {
    const steps = [
      { id: 1, label: "Basic" },
      ...(useAdvanced ? [{ id: 2, label: "Advanced" }] : []),
      ...(useProfile ? [{ id: 3, label: "Profile" }] : []),
      ...(useAddressStep ? [{ id: 4, label: "Addresses" }] : []),
      { id: 5, label: "Review" },
    ];
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s, idx) => {
          const active = step === s.id;
          const completed = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <motion.div
                initial={false}
                animate={{ scale: active ? 1.05 : 1 }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
                  active && "bg-indigo-600 text-white border-indigo-600",
                  completed && "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
                  !active && !completed && "bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
                )}
              >
                {completed ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 flex items-center justify-center text-xs font-bold">{idx + 1}</span>}
                {s.label}
              </motion.div>
              {idx < steps.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${teacher.fullName}`}
        subtitle="Update teacher information"
        icon={GraduationCap}
        onBack={() => router.push(`/dashboard/admin/users/faculty/${teacher.id}`)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <StepIndicator />
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" variant={useAdvanced ? "default" : "outline"} onClick={() => { if (useAdvanced && step === 2) setStep(1); setUseAdvanced(v => !v); }} className={cn("text-sm", useAdvanced && "bg-indigo-600 hover:bg-indigo-700")} size="sm">
                  <Network className="h-4 w-4 mr-1" /> Advanced
                </Button>
                <Button type="button" variant={useProfile ? "default" : "outline"} onClick={() => { if (useProfile && step === 3) setStep(useAdvanced ? 2 : 1); setUseProfile(v => !v); }} className={cn("text-sm", useProfile && "bg-indigo-600 hover:bg-indigo-700")} size="sm">
                  <User className="h-4 w-4 mr-1" /> Profile
                </Button>
                <Button type="button" variant={useAddressStep ? "default" : "outline"} onClick={() => { if (useAddressStep && step === 4) setStep(useProfile ? 3 : (useAdvanced ? 2 : 1)); setUseAddressStep(v => !v); }} className={cn("text-sm", useAddressStep && "bg-indigo-600 hover:bg-indigo-700")} size="sm">
                  Addresses
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label><Input value={basic.fullName} onChange={e => updateBasic("fullName", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label><Input value={basic.phone} onChange={e => updateBasic("phone", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                  <Select value={basic.departmentId} onValueChange={(v) => updateBasic("departmentId", v)}>
                    <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{departments.map(d => <SelectItem key={d.id || d._id} value={d.id || d._id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
                  <Select value={basic.designation} onValueChange={(v) => updateBasic("designation", v as TeacherDesignation)}>
                    <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select designation" /></SelectTrigger>
                    <SelectContent>{Object.entries(designationMap).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {step === 2 && useAdvanced && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Joining Date</label><Input type="date" value={advanced.joiningDate} onChange={e => updateAdvanced("joiningDate", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">Add IP Address <Network className="h-4 w-4" /></label>
                    <div className="flex gap-2">
                      <Input value={advanced.ipInput} onChange={e => updateAdvanced("ipInput", e.target.value)} placeholder="e.g. 192.168.1.10" className="border-slate-200 dark:border-slate-700 flex-1" onKeyDown={(e) => e.key === 'Enter' && addIp()} />
                      <Button type="button" onClick={addIp} variant="secondary" size="sm">Add</Button>
                    </div>
                  </div>
                </div>
                {advanced.registeredIps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Registered IPs</p>
                    <div className="flex flex-wrap gap-2">
                      {advanced.registeredIps.map(ip => <Badge key={ip} variant="secondary" className="flex items-center gap-1">{ip}<button type="button" onClick={() => removeIp(ip)} className="ml-1 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button></Badge>)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && useProfile && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label><Input value={profileForm.firstName} onChange={e => updateProfile("firstName", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label><Input value={profileForm.lastName} onChange={e => updateProfile("lastName", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Middle Name</label><Input value={profileForm.middleName} onChange={e => updateProfile("middleName", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label><Input value={profileForm.phoneNumber} onChange={e => updateProfile("phoneNumber", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label><Input type="date" value={profileForm.dateOfBirth} onChange={e => updateProfile("dateOfBirth", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                    <Select value={profileForm.gender} onValueChange={(v) => updateProfile("gender", v)}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">Profile Picture <User className="h-4 w-4" /></label>
                    <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; setProfilePicture(file || null); }} className="border-slate-200 dark:border-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    {profilePicture && <p className="text-sm text-indigo-600 dark:text-indigo-400">Selected: {profilePicture.name}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && useAddressStep && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Street</label><Input value={addressDraft.street} onChange={e => setAddressDraft(prev => ({ ...prev, street: e.target.value }))} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label><Input value={addressDraft.city} onChange={e => setAddressDraft(prev => ({ ...prev, city: e.target.value }))} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">State</label><Input value={addressDraft.state} onChange={e => setAddressDraft(prev => ({ ...prev, state: e.target.value }))} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Zip Code</label><Input value={addressDraft.zipCode} onChange={e => setAddressDraft(prev => ({ ...prev, zipCode: e.target.value }))} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</label><Input value={addressDraft.country} onChange={e => setAddressDraft(prev => ({ ...prev, country: e.target.value }))} className="border-slate-200 dark:border-slate-700" /></div>
                  <div className="space-y-2 flex items-end gap-2">
                    <Button type="button" variant={addressDraft.isPrimary ? "default" : "outline"} onClick={() => setAddressDraft(prev => ({ ...prev, isPrimary: !prev.isPrimary }))} className={cn(addressDraft.isPrimary && "bg-indigo-600 hover:bg-indigo-700")}>{addressDraft.isPrimary ? 'Primary' : 'Set Primary'}</Button>
                    <Button type="button" onClick={addAddress} className="bg-indigo-600 hover:bg-indigo-700 ml-auto">Add Address</Button>
                  </div>
                </div>
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Addresses</p>
                    <div className="space-y-2">
                      {addresses.map((addr, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">{[addr.street, addr.city, addr.state].filter(Boolean).join(', ') || '(No street)'} {addr.isPrimary && <Badge className="bg-indigo-600">PRIMARY</Badge>}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{[addr.country, addr.zipCode].filter(Boolean).join(' - ') || '(No country)'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!addr.isPrimary && <Button variant="outline" size="sm" onClick={() => makePrimary(idx)}>Make Primary</Button>}
                            <Button variant="outline" size="sm" onClick={() => removeAddress(idx)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Remove</Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 5 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Basic Information</p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                      <SummaryItem label="Name" value={basic.fullName} />
                      <SummaryItem label="Department" value={departments.find(d => (d.id || d._id) === basic.departmentId)?.name || basic.departmentId} />
                      {basic.designation && <SummaryItem label="Designation" value={designationMap[basic.designation as TeacherDesignation]} />}
                      {basic.phone && <SummaryItem label="Phone" value={basic.phone} />}
                    </div>
                  </div>
                  {useAdvanced && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Network className="h-4 w-4" /> Advanced</p>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                        {advanced.joiningDate && <SummaryItem label="Joining Date" value={new Date(advanced.joiningDate).toLocaleDateString()} />}
                        {advanced.registeredIps.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Registered IPs:</p>
                            <div className="flex flex-wrap gap-1">{advanced.registeredIps.map(ip => <Badge key={ip} variant="secondary">{ip}</Badge>)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {useProfile && (profileForm.firstName || profileForm.lastName) && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><User className="h-4 w-4" /> Profile</p>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                        <SummaryItem label="Full Name" value={`${profileForm.firstName} ${profileForm.middleName ? profileForm.middleName + ' ' : ''}${profileForm.lastName}`} />
                        {profileForm.phoneNumber && <SummaryItem label="Phone" value={profileForm.phoneNumber} />}
                        {profileForm.gender && <SummaryItem label="Gender" value={profileForm.gender} />}
                        {profileForm.dateOfBirth && <SummaryItem label="Date of Birth" value={new Date(profileForm.dateOfBirth).toLocaleDateString()} />}
                      </div>
                    </div>
                  )}
                  {useAddressStep && addresses.length > 0 && (
                    <div className="space-y-3 md:col-span-2">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Addresses</p>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                        {addresses.map((a, i) => (
                          <div key={i} className="flex items-start justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                            <p className="flex-1">{[a.street, a.city, a.state, a.country, a.zipCode].filter(Boolean).join(', ')}</p>
                            {a.isPrimary && <Badge className="bg-indigo-600 ml-2">PRIMARY</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div className="flex gap-2">
                {step < 5 && <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700">Next <ChevronRight className="h-4 w-4 ml-1" /></Button>}
                {step === 5 && (
                  <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Save Changes</>}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 last:border-0">
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}
