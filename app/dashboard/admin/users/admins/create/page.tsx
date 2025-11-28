"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService, AdminRole } from "@/services/user/admin.service";
import { adminProfileService } from "@/services/user/adminProfile.service";
import { toast } from "sonner";
import { ShieldPlus, ChevronRight, ChevronLeft, Loader2, Settings2, CheckCircle2, Network, User } from "lucide-react";

interface BasicForm {
  fullName: string;
  email: string;
  role: AdminRole;
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
  role: "moderator",
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

export default function CreateAdminPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [useProfile, setUseProfile] = useState(false);
  const [basic, setBasic] = useState<BasicForm>(initialBasic);
  const [advanced, setAdvanced] = useState<AdvancedForm>(initialAdvanced);
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);
  const [addresses, setAddresses] = useState<AddressForm[]>([]);
  const [addressDraft, setAddressDraft] = useState<AddressForm>({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
  const [useAddressStep, setUseAddressStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRegistrationNumber = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const value = `ADM-${new Date().getFullYear()}-${rand}`;
    setBasic(prev => ({ ...prev, registrationNumber: value }));
  };

  const canProceedBasic = () => {
    return (
      basic.fullName.trim().length >= 3 &&
      /.+@.+\..+/.test(basic.email.trim())
    );
  };

  const nextStep = () => {
    if (step === 1) {
      if (!canProceedBasic()) {
        toast.error("Provide a valid full name (>=3 chars) and email");
        return;
      }
      if (!basic.registrationNumber.trim()) {
        generateRegistrationNumber();
      }
      if (useAdvanced) {
        setStep(2);
      } else if (useProfile) {
        setStep(3);
      } else if (useAddressStep) {
        setStep(4);
      } else {
        setStep(5); // Review
      }
    } else if (step === 2) {
      if (useProfile) {
        setStep(3);
      } else if (useAddressStep) {
        setStep(4);
      } else {
        setStep(5); // Review
      }
    } else if (step === 3) {
      if (useAddressStep) {
        setStep(4);
      } else {
        setStep(5); // Review
      }
    } else if (step === 4) {
      setStep(5); // Review
    }
  };

  const prevStep = () => {
    if (step === 5) {
      if (useAddressStep) {
        setStep(4);
      } else if (useProfile) {
        setStep(3);
      } else if (useAdvanced) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 4) {
      if (useProfile) {
        setStep(3);
      } else if (useAdvanced) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 3) {
      if (useAdvanced) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 2) {
      setStep(1);
    }
  };

  const updateBasic = (key: keyof BasicForm, value: string | AdminRole) => {
    setBasic(prev => ({ ...prev, [key]: value }));
  };

  const updateAdvanced = (key: keyof AdvancedForm, value: any) => {
    setAdvanced(prev => ({ ...prev, [key]: value }));
  };

  const updateProfile = (key: keyof ProfileForm, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const clearAddressDraft = () => setAddressDraft({ street: "", city: "", state: "", zipCode: "", country: "", isPrimary: false });
  const addAddress = () => {
    if (!addressDraft.street && !addressDraft.city && !addressDraft.country) {
      toast.error("Provide at least street/city/country");
      return;
    }
    setAddresses(prev => {
      let next = [...prev];
      if (addressDraft.isPrimary) {
        next = next.map(a => ({ ...a, isPrimary: false }));
      }
      next.push(addressDraft);
      return next;
    });
    clearAddressDraft();
  };
  const removeAddress = (idx: number) => setAddresses(prev => prev.filter((_, i) => i !== idx));
  const makePrimary = (idx: number) => setAddresses(prev => prev.map((a,i) => ({ ...a, isPrimary: i === idx })));

  const addIp = () => {
    const ip = advanced.ipInput.trim();
    if (!ip) return;
    if (advanced.registeredIps.includes(ip)) { toast.error("IP already added"); return; }
    setAdvanced(prev => ({ ...prev, registeredIps: [...prev.registeredIps, ip], ipInput: "" }));
  };
  const removeIp = (ip: string) => setAdvanced(prev => ({ ...prev, registeredIps: prev.registeredIps.filter(i => i !== ip) }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        fullName: basic.fullName.trim(),
        email: basic.email.trim().toLowerCase(),
        role: basic.role,
        registrationNumber: basic.registrationNumber.trim() || undefined,
      };
      if (useAdvanced) {
        if (advanced.joiningDate) payload.joiningDate = advanced.joiningDate;
        if (advanced.registeredIps.length) payload.registeredIpAddress = advanced.registeredIps;
      }
      const created = await adminService.create(payload);

      if (useProfile && profile.firstName && profile.lastName) {
        try {
          const profilePayload: any = {
            firstName: profile.firstName.trim(),
            lastName: profile.lastName.trim(),
          };
          if (profile.middleName) profilePayload.middleName = profile.middleName.trim();
          if (profile.phoneNumber) profilePayload.phoneNumber = profile.phoneNumber.trim();
          if (profile.dateOfBirth) profilePayload.dateOfBirth = profile.dateOfBirth;
          if (profile.gender) profilePayload.gender = profile.gender;
          if (useAddressStep && addresses.length) profilePayload.addresses = addresses.map(a => ({ ...a }));

          await adminProfileService.create(created.id, profilePayload);
        } catch (profileError: any) {
          toast.warning(`Admin created but profile failed: ${profileError?.message || 'Unknown error'}`);
        }
      }

      toast.success("Admin created successfully");
      router.push(`/dashboard/admin/users/admins/${created.id}`);
    } catch (error: any) {
      const message = error?.message || "Failed to create admin";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex items-center gap-3 flex-wrap">
        {steps.map((s, idx) => {
          const active = step === s.id;
          const completed = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium transition-colors ${active ? "bg-[#588157] text-white border-[#588157]" : completed ? "bg-[#a3b18a] text-[#344e41] border-[#a3b18a]" : "bg-white text-[#344e41] border-[#a3b18a]/50"}`}
              >
                {completed ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 flex items-center justify-center text-xs font-bold">{idx + 1}</span>}
                {s.label}
              </div>
              {idx < steps.length - 1 && <ChevronRight className="h-4 w-4 text-[#344e41]/40" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Create New Admin"
          subtitle="Provision a new administrator account"
          icon={ShieldPlus}
        />

        <Card className="border-[#a3b18a]/30">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <StepIndicator />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={useAdvanced ? "default" : "outline"}
                  onClick={() => {
                    // If toggling off advanced while on step 2, go back to 1
                    if (useAdvanced && step === 2) setStep(1);
                    setUseAdvanced(v => !v);
                  }}
                  className={useAdvanced ? "bg-[#588157] text-white" : "border-[#a3b18a] text-[#344e41]"}
                >
                  {useAdvanced ? "Advanced On" : "Advanced Off"}
                </Button>
                <Button
                  type="button"
                  variant={useProfile ? "default" : "outline"}
                  onClick={() => {
                    // If toggling off profile while on step 3, adjust
                    if (useProfile && step === 3) {
                      if (useAdvanced) setStep(2);
                      else setStep(1);
                    }
                    setUseProfile(v => !v);
                  }}
                  className={useProfile ? "bg-[#588157] text-white" : "border-[#a3b18a] text-[#344e41]"}
                >
                  <User className="h-4 w-4 mr-1" />
                  {useProfile ? "Profile On" : "Profile Off"}
                </Button>
                <Button
                  type="button"
                  variant={useAddressStep ? "default" : "outline"}
                  onClick={() => {
                    // If toggling off address while on step 4, adjust
                    if (useAddressStep && step === 4) {
                      if (useProfile) setStep(3);
                      else if (useAdvanced) setStep(2);
                      else setStep(1);
                    }
                    setUseAddressStep(v => !v);
                  }}
                  className={useAddressStep ? "bg-[#588157] text-white" : "border-[#a3b18a] text-[#344e41]"}
                >
                  Addresses {useAddressStep ? "On" : "Off"}
                </Button>
              </div>
            </div>

            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41]">Full Name</label>
                  <Input
                    value={basic.fullName}
                    onChange={e => updateBasic("fullName", e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41]">Email</label>
                  <Input
                    type="email"
                    value={basic.email}
                    onChange={e => updateBasic("email", e.target.value)}
                    placeholder="admin@example.com"
                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41]">Role</label>
                  <Select value={basic.role} onValueChange={(v) => updateBasic("role", v as AdminRole)}>
                    <SelectTrigger className="bg-white border-[#a3b18a]/60 text-[#344e41]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41] flex items-center justify-between">Registration Number
                    <Button type="button" variant="outline" size="sm" onClick={generateRegistrationNumber} className="ml-2 border-[#a3b18a] text-[#344e41]">Generate</Button>
                  </label>
                  <Input
                    value={basic.registrationNumber}
                    onChange={e => updateBasic("registrationNumber", e.target.value)}
                    placeholder="ADM-2025-XXXX"
                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                  />
                </div>
              </div>
            )}

            {step === 2 && useAdvanced && (
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Joining Date</label>
                    <Input
                      type="date"
                      value={advanced.joiningDate}
                      onChange={e => updateAdvanced("joiningDate", e.target.value)}
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41] flex items-center gap-2">Add IP Address <Network className="h-4 w-4" /></label>
                    <div className="flex gap-2">
                      <Input
                        value={advanced.ipInput}
                        onChange={e => updateAdvanced("ipInput", e.target.value)}
                        placeholder="e.g. 192.168.1.10"
                        className="bg-white border-[#a3b18a]/60 text-[#344e41] flex-1"
                      />
                      <Button type="button" onClick={addIp} variant="outline" className="border-[#a3b18a] text-[#344e41]">Add</Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41]">Initial Registered IPs</label>
                  <div className="flex flex-wrap gap-2">
                    {advanced.registeredIps.length === 0 && (
                      <p className="text-xs text-[#344e41]/60">No IPs added</p>
                    )}
                    {advanced.registeredIps.map(ip => (
                      <Badge key={ip} variant="outline" className="border-[#a3b18a] text-[#344e41] flex items-center gap-2">
                        {ip}
                        <button
                          type="button"
                          onClick={() => removeIp(ip)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && useProfile && (
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">First Name <span className="text-red-500">*</span></label>
                    <Input
                      value={profile.firstName}
                      onChange={e => updateProfile("firstName", e.target.value)}
                      placeholder="Jane"
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Last Name <span className="text-red-500">*</span></label>
                    <Input
                      value={profile.lastName}
                      onChange={e => updateProfile("lastName", e.target.value)}
                      placeholder="Doe"
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Middle Name</label>
                    <Input
                      value={profile.middleName}
                      onChange={e => updateProfile("middleName", e.target.value)}
                      placeholder="Optional"
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Phone Number</label>
                    <Input
                      value={profile.phoneNumber}
                      onChange={e => updateProfile("phoneNumber", e.target.value)}
                      placeholder="+1 234 567 890"
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Date of Birth</label>
                    <Input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={e => updateProfile("dateOfBirth", e.target.value)}
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Gender</label>
                    <Select value={profile.gender} onValueChange={(v) => updateProfile("gender", v)}>
                      <SelectTrigger className="bg-white border-[#a3b18a]/60 text-[#344e41]">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && useAddressStep && (
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Street</label>
                    <Input value={addressDraft.street} onChange={e => setAddressDraft(d => ({ ...d, street: e.target.value }))} className="bg-white border-[#a3b18a]/60 text-[#344e41]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">City</label>
                    <Input value={addressDraft.city} onChange={e => setAddressDraft(d => ({ ...d, city: e.target.value }))} className="bg-white border-[#a3b18a]/60 text-[#344e41]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">State</label>
                    <Input value={addressDraft.state} onChange={e => setAddressDraft(d => ({ ...d, state: e.target.value }))} className="bg-white border-[#a3b18a]/60 text-[#344e41]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Zip Code</label>
                    <Input value={addressDraft.zipCode} onChange={e => setAddressDraft(d => ({ ...d, zipCode: e.target.value }))} className="bg-white border-[#a3b18a]/60 text-[#344e41]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">Country</label>
                    <Input value={addressDraft.country} onChange={e => setAddressDraft(d => ({ ...d, country: e.target.value }))} className="bg-white border-[#a3b18a]/60 text-[#344e41]" />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <Button type="button" variant="outline" onClick={() => setAddressDraft(d => ({ ...d, isPrimary: !d.isPrimary }))} className={`border-[#a3b18a] ${addressDraft.isPrimary? 'bg-[#588157] text-white':'text-[#344e41]'}`}>{addressDraft.isPrimary? 'Primary':'Set Primary'}</Button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={addAddress} className="bg-[#588157] hover:bg-[#3a5a40] text-white">Add Address</Button>
                  <Button type="button" variant="outline" onClick={clearAddressDraft} className="border-[#a3b18a] text-[#344e41]">Clear</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#344e41]">Added Addresses</p>
                  {addresses.length === 0 && <p className="text-xs text-[#344e41]/60">No addresses yet.</p>}
                  <div className="space-y-2">
                    {addresses.map((a,i) => (
                      <div key={i} className="flex items-center justify-between bg-white/60 border border-[#a3b18a]/40 rounded p-3">
                        <div className="text-sm text-[#344e41]">
                          <p className="font-medium">{a.street || '(No street)'}{a.city? ', '+a.city:''}{a.state? ', '+a.state:''}</p>
                          <p className="text-xs text-[#344e41]/70">{a.country || 'No country'}{a.zipCode? ' - '+a.zipCode:''}</p>
                          {a.isPrimary && <Badge className="mt-1 bg-[#588157] text-white">Primary</Badge>}
                        </div>
                        <div className="flex gap-2">
                          {!a.isPrimary && <Button size="sm" variant="outline" onClick={() => makePrimary(i)} className="border-[#a3b18a] text-[#344e41]">Make Primary</Button>}
                          <Button size="sm" variant="outline" onClick={() => removeAddress(i)} className="border-red-300 text-red-600 hover:bg-red-500/10">Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <SummaryItem label="Full Name" value={basic.fullName} />
                  <SummaryItem label="Email" value={basic.email} />
                  <SummaryItem label="Role" value={basic.role.replace("_", " ")} />
                  <SummaryItem label="Registration Number" value={basic.registrationNumber} />
                  {useAdvanced && (
                    <SummaryItem label="Joining Date" value={advanced.joiningDate || "Not provided"} />
                  )}
                  {useAdvanced && (
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-[#344e41]/60">Registered IPs</p>
                      <div className="flex flex-wrap gap-2">
                        {advanced.registeredIps.length === 0 && <span className="text-xs text-[#344e41]/50">None</span>}
                        {advanced.registeredIps.map(ip => (
                          <Badge key={ip} variant="outline" className="border-[#a3b18a] text-[#344e41]">{ip}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {useProfile && (
                  <div className="border-t border-[#a3b18a]/30 pt-4">
                    <p className="text-sm font-semibold text-[#344e41] mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Information
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <SummaryItem label="First Name" value={profile.firstName || "Not provided"} />
                      <SummaryItem label="Last Name" value={profile.lastName || "Not provided"} />
                      {profile.middleName && <SummaryItem label="Middle Name" value={profile.middleName} />}
                      {profile.phoneNumber && <SummaryItem label="Phone" value={profile.phoneNumber} />}
                      {profile.dateOfBirth && <SummaryItem label="Date of Birth" value={profile.dateOfBirth} />}
                      {profile.gender && <SummaryItem label="Gender" value={profile.gender} />}
                    </div>
                  </div>
                )}
                {useAddressStep && addresses.length > 0 && (
                  <div className="border-t border-[#a3b18a]/30 pt-4">
                    <p className="text-sm font-semibold text-[#344e41] mb-3">Addresses</p>
                    <div className="space-y-2">
                      {addresses.map((a,i) => (
                        <div key={i} className="text-sm text-[#344e41] flex items-center justify-between">
                          <span>{a.street || '(No street)'}{a.city? ', '+a.city:''}{a.state? ', '+a.state:''}{a.country? ', '+a.country:''}{a.zipCode? ' - '+a.zipCode:''}</span>
                          {a.isPrimary && <Badge className="bg-[#588157] text-white">Primary</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-[#dad7cd]/60 rounded-lg p-4 text-sm text-[#344e41]/80 flex items-start gap-2">
                  <Settings2 className="h-4 w-4 mt-0.5" />
                  <p>On creation a temporary password will be emailed automatically. Ensure the email address is correct before submitting.</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#a3b18a]/30">
              <div className="flex gap-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="border-[#a3b18a] text-[#344e41]">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                )}
                {step < 5 && (
                  <Button type="button" onClick={nextStep} className="bg-[#588157] hover:bg-[#3a5a40] text-white">
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
              {step === 5 && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4 mr-2" />}
                  {isSubmitting ? "Creating..." : "Create Admin"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/admin/users/admins")}
            className="border-[#a3b18a] text-[#344e41]"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-[#344e41]/60">{label}</p>
      <p className="text-sm font-medium text-[#344e41] break-all">{value}</p>
    </div>
  );
}
