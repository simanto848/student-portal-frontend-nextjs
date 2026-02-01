"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { staffService, StaffRole, StaffCreatePayload } from "@/services/user/staff.service";
import { staffProfileService, StaffProfilePayload } from "@/services/user/staffProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { toast } from "sonner";
import { Users, ChevronRight, ChevronLeft, CheckCircle2, Network, User, MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BasicForm {
  fullName: string;
  email: string;
  departmentId: string;
  role?: StaffRole;
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

interface AddressForm {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

const initialBasic: BasicForm = {
  fullName: "",
  email: "",
  departmentId: "",
  role: undefined,
  registrationNumber: "",
};

const initialAdvanced: AdvancedForm = {
  joiningDate: "",
  registeredIps: [],
  ipInput: "",
};

const initialProfile: ProfileForm = {
  firstName: "",
  lastName: "",
  middleName: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
};

export default function CreateStaffPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [useProfile, setUseProfile] = useState(false);
  const [useAddressStep, setUseAddressStep] = useState(false);

  const [basic, setBasic] = useState<BasicForm>(initialBasic);
  const [advanced, setAdvanced] = useState<AdvancedForm>(initialAdvanced);
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);
  const [addresses, setAddresses] = useState<AddressForm[]>([]);
  const [addressDraft, setAddressDraft] = useState<AddressForm>({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const d = await departmentService.getAllDepartments();
        setDepartments(Array.isArray(d) ? d : []);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };
    loadDepartments();
  }, []);

  const roleLabels: Record<StaffRole, string> = {
    program_controller: "Program Controller",
    admission: "Admission",
    library: "Library",
    it: "IT",
    exam_controller: "Exam Controller",
  };

  const generateRegistrationNumber = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const value = `STAFF-${new Date().getFullYear()}-${rand}`;
    setBasic(prev => ({ ...prev, registrationNumber: value }));
  };

  const updateBasic = (key: keyof BasicForm, value: string) => setBasic(prev => ({ ...prev, [key]: value }));
  const updateAdvanced = (key: keyof AdvancedForm, value: string | string[]) => setAdvanced(prev => ({ ...prev, [key]: value }));
  const updateProfile = (key: keyof ProfileForm, value: string) => setProfile(prev => ({ ...prev, [key]: value }));

  const addIp = () => {
    const ip = advanced.ipInput.trim();
    if (!ip) return;
    if (advanced.registeredIps.includes(ip)) { toast.error("IP already added"); return; }
    setAdvanced(prev => ({ ...prev, registeredIps: [...prev.registeredIps, ip], ipInput: "" }));
  };
  const removeIp = (ip: string) => setAdvanced(prev => ({ ...prev, registeredIps: prev.registeredIps.filter(i => i !== ip) }));

  const clearAddressDraft = () => setAddressDraft({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
  const addAddress = () => {
    if (!addressDraft.street && !addressDraft.city && !addressDraft.country) {
      toast.error("Provide at least street/city/country");
      return;
    }
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

  const canProceedBasic = () => {
    return (
      basic.fullName.trim().length >= 3 &&
      /.+@.+\..+/.test(basic.email.trim()) &&
      basic.departmentId.trim().length > 0
    );
  };

  const nextStep = () => {
    if (step === 1) {
      if (!canProceedBasic()) { toast.error("Provide valid name, email, department"); return; }
      if (!basic.registrationNumber.trim()) generateRegistrationNumber();
      if (useAdvanced) setStep(2);
      else if (useProfile) setStep(3);
      else if (useAddressStep) setStep(4);
      else setStep(5);
    } else if (step === 2) {
      if (useProfile) setStep(3);
      else if (useAddressStep) setStep(4);
      else setStep(5);
    } else if (step === 3) {
      if (useAddressStep) setStep(4); else setStep(5);
    } else if (step === 4) { setStep(5); }
  };

  const prevStep = () => {
    if (step === 5) {
      if (useAddressStep) setStep(4);
      else if (useProfile) setStep(3);
      else if (useAdvanced) setStep(2);
      else setStep(1);
    } else if (step === 4) {
      if (useProfile) setStep(3);
      else if (useAdvanced) setStep(2);
      else setStep(1);
    } else if (step === 3) {
      if (useAdvanced) setStep(2); else setStep(1);
    } else if (step === 2) setStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: StaffCreatePayload = {
        fullName: basic.fullName.trim(),
        email: basic.email.trim().toLowerCase(),
        departmentId: basic.departmentId,
        role: basic.role,
        joiningDate: useAdvanced && advanced.joiningDate ? advanced.joiningDate : undefined,
        registeredIpAddress: useAdvanced && advanced.registeredIps.length ? advanced.registeredIps : undefined,
      };

      let dataToSend: StaffCreatePayload | FormData = payload;
      if (profilePicture) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        formData.append('profilePicture', profilePicture);
        dataToSend = formData;
      }

      const created = await staffService.create(dataToSend);

      if (useProfile && profile.firstName && profile.lastName) {
        try {
          const profilePayload: StaffProfilePayload = {
            firstName: profile.firstName.trim(),
            lastName: profile.lastName.trim(),
            middleName: profile.middleName ? profile.middleName.trim() : undefined,
            phoneNumber: profile.phoneNumber ? profile.phoneNumber.trim() : undefined,
            dateOfBirth: profile.dateOfBirth || undefined,
            gender: profile.gender || undefined,
            addresses: useAddressStep && addresses.length ? addresses.map(a => ({ ...a })) : undefined,
          };
          await staffProfileService.create(created.id, profilePayload);
        } catch (profileError: any) {
          toast.warning(`Staff created but profile failed: ${profileError?.message || 'Unknown error'}`);
        }
      }

      toast.success("Staff created successfully");
      router.push(`/dashboard/admin/users/staff/${created.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create staff");
    } finally { setIsSubmitting(false); }
  };

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
        title="Create New Staff"
        subtitle="Add a new administrative staff member"
        icon={Users}
        onBack={() => router.push("/dashboard/admin/users/staff")}
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
                  <MapPin className="h-4 w-4 mr-1" /> Addresses
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                      <Input value={basic.fullName} onChange={e => updateBasic("fullName", e.target.value)} placeholder="John Doe" className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></label>
                      <Input type="email" value={basic.email} onChange={e => updateBasic("email", e.target.value)} placeholder="staff@example.com" className="border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">Department <span className="text-red-500">*</span>{loadingDepartments && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}</label>
                      <Select value={basic.departmentId} onValueChange={(v) => updateBasic("departmentId", v)}>
                        <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>{departments.map(d => <SelectItem key={d.id || d._id} value={d.id || d._id}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                      <Select value={basic.role || ""} onValueChange={(v) => updateBasic("role", v as StaffRole)}>
                        <SelectTrigger className="border-slate-200 dark:border-slate-700"><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>{Object.entries(roleLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">Registration Number<Button type="button" variant="outline" size="sm" onClick={generateRegistrationNumber} className="h-7 text-xs">Generate</Button></label>
                      <Input value={basic.registrationNumber} onChange={e => updateBasic("registrationNumber", e.target.value)} placeholder="STAFF-2025-XXXX" className="border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && useAdvanced && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
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
                      <div className="flex flex-wrap gap-2">{advanced.registeredIps.map(ip => <Badge key={ip} variant="secondary" className="flex items-center gap-1">{ip}<button type="button" onClick={() => removeIp(ip)} className="ml-1 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button></Badge>)}</div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 3 && useProfile && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label><Input value={profile.firstName} onChange={e => updateProfile("firstName", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label><Input value={profile.lastName} onChange={e => updateProfile("lastName", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Middle Name</label><Input value={profile.middleName} onChange={e => updateProfile("middleName", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label><Input value={profile.phoneNumber} onChange={e => updateProfile("phoneNumber", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label><Input type="date" value={profile.dateOfBirth} onChange={e => updateProfile("dateOfBirth", e.target.value)} className="border-slate-200 dark:border-slate-700" /></div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                      <Select value={profile.gender} onValueChange={(v) => updateProfile("gender", v)}>
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
                <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
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
                <motion.div key="step5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Users className="h-4 w-4" /> Basic Information</p>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                        <SummaryItem label="Name" value={basic.fullName} />
                        <SummaryItem label="Email" value={basic.email} />
                        <SummaryItem label="Department" value={departments.find(d => (d.id || d._id) === basic.departmentId)?.name || basic.departmentId} />
                        {basic.role && <SummaryItem label="Role" value={roleLabels[basic.role]} />}
                        <SummaryItem label="Registration" value={basic.registrationNumber} />
                      </div>
                    </div>
                    {useAdvanced && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Network className="h-4 w-4" /> Advanced</p>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                          {advanced.joiningDate && <SummaryItem label="Joining Date" value={new Date(advanced.joiningDate).toLocaleDateString()} />}
                          {advanced.registeredIps.length > 0 && <div className="space-y-1"><p className="text-xs text-slate-500 dark:text-slate-400">Registered IPs:</p><div className="flex flex-wrap gap-1">{advanced.registeredIps.map(ip => <Badge key={ip} variant="secondary">{ip}</Badge>)}</div></div>}
                        </div>
                      </div>
                    )}
                    {useProfile && (profile.firstName || profile.lastName) && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><User className="h-4 w-4" /> Profile</p>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                          <SummaryItem label="Full Name" value={`${profile.firstName} ${profile.middleName ? profile.middleName + ' ' : ''}${profile.lastName}`} />
                          {profile.phoneNumber && <SummaryItem label="Phone" value={profile.phoneNumber} />}
                          {profile.gender && <SummaryItem label="Gender" value={profile.gender} />}
                          {profile.dateOfBirth && <SummaryItem label="Date of Birth" value={new Date(profile.dateOfBirth).toLocaleDateString()} />}
                        </div>
                      </div>
                    )}
                    {useAddressStep && addresses.length > 0 && (
                      <div className="space-y-3 md:col-span-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><MapPin className="h-4 w-4" /> Addresses</p>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                          {addresses.map((a, i) => <div key={i} className="flex items-start justify-between p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700"><p className="flex-1">{[a.street, a.city, a.state, a.country, a.zipCode].filter(Boolean).join(', ')}</p>{a.isPrimary && <Badge className="bg-indigo-600 ml-2">PRIMARY</Badge>}</div>)}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div className="flex gap-2">
                {step < 5 && <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700">Next <ChevronRight className="h-4 w-4 ml-1" /></Button>}
                {step === 5 && <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">{isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Create Staff</>}</Button>}
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
