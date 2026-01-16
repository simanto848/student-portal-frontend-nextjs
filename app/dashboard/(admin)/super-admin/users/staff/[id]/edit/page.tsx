"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  staffService,
  StaffRole,
  Staff,
  StaffUpdatePayload,
} from "@/services/user/staff.service";
import {
  staffProfileService,
  StaffProfile,
  StaffProfilePayload,
  StaffAddress,
} from "@/services/user/staffProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { toast } from "sonner";
import {
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Network,
  User,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [departments, setDepartments] = useState<
    Array<{ id?: string; _id?: string; name: string }>
  >([]);

  const [step, setStep] = useState<number>(1);
  const [useAdvanced, setUseAdvanced] = useState(true);
  const [useProfile, setUseProfile] = useState(true);
  const [useAddressStep, setUseAddressStep] = useState(true);

  const [basic, setBasic] = useState({
    fullName: "",
    departmentId: "",
    role: "" as StaffRole | "",
  });
  const [advanced, setAdvanced] = useState({
    joiningDate: "",
    registeredIps: [] as string[],
    ipInput: "",
  });
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
  });
  const [addresses, setAddresses] = useState<Array<StaffAddress>>([]);
  const [addressDraft, setAddressDraft] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isPrimary: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  useEffect(() => {
    if (id) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const roleMap: Record<StaffRole, string> = {
    program_controller: "Program Controller",
    admission: "Admission",
    library: "Library",
    it: "IT",
    exam_controller: "Exam Controller",
  };

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const s = await staffService.getById(id);
      setStaff(s);
      setBasic({
        fullName: s.fullName,
        departmentId: s.departmentId,
        role: s.role || "",
      });
      setAdvanced({
        joiningDate: s.joiningDate?.substring(0, 10) || "",
        registeredIps: s.registeredIpAddress || [],
        ipInput: "",
      });
      try {
        const p = await staffProfileService.get(id);
        if (p) {
          setProfile(p);
          setProfileForm({
            firstName: p.firstName,
            lastName: p.lastName,
            middleName: p.middleName || "",
            phoneNumber: p.phoneNumber || "",
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : "",
            gender: p.gender || "",
          });
          setAddresses(p.addresses || []);
        }
      } catch { }
      try {
        const d = await departmentService.getAllDepartments();
        setDepartments(Array.isArray(d) ? d : []);
      } catch { }
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to load staff");
      router.push("/dashboard/admin/users/staff");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBasic = (key: keyof typeof basic, value: string) =>
    setBasic((prev) => ({ ...prev, [key]: value }));
  const updateAdvanced = (
    key: keyof typeof advanced,
    value: string | string[]
  ) => setAdvanced((prev) => ({ ...prev, [key]: value }));
  const updateProfile = (key: keyof typeof profileForm, value: string) =>
    setProfileForm((prev) => ({ ...prev, [key]: value }));

  const addIp = () => {
    const ip = advanced.ipInput.trim();
    if (!ip) return;
    if (advanced.registeredIps.includes(ip)) {
      toast.error("IP already added");
      return;
    }
    setAdvanced((prev) => ({
      ...prev,
      registeredIps: [...prev.registeredIps, ip],
      ipInput: "",
    }));
  };
  const removeIp = (ip: string) =>
    setAdvanced((prev) => ({
      ...prev,
      registeredIps: prev.registeredIps.filter((i) => i !== ip),
    }));

  const clearAddressDraft = () =>
    setAddressDraft({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isPrimary: false,
    });
  const addAddress = () => {
    if (!addressDraft.street && !addressDraft.city && !addressDraft.country) {
      toast.error("Provide at least street/city/country");
      return;
    }
    setAddresses((prev) => {
      let next = [...prev];
      if (addressDraft.isPrimary)
        next = next.map((a) => ({ ...a, isPrimary: false }));
      next.push(addressDraft);
      return next;
    });
    clearAddressDraft();
  };
  const removeAddress = (idx: number) =>
    setAddresses((prev) => prev.filter((_, i) => i !== idx));
  const makePrimary = (idx: number) =>
    setAddresses((prev) =>
      prev.map((a, i) => ({ ...a, isPrimary: i === idx }))
    );

  const nextStep = () => {
    if (step === 1)
      setStep(useAdvanced ? 2 : useProfile ? 3 : useAddressStep ? 4 : 5);
    else if (step === 2) setStep(useProfile ? 3 : useAddressStep ? 4 : 5);
    else if (step === 3) setStep(useAddressStep ? 4 : 5);
    else if (step === 4) setStep(5);
  };
  const prevStep = () => {
    if (step === 5)
      setStep(useAddressStep ? 4 : useProfile ? 3 : useAdvanced ? 2 : 1);
    else if (step === 4) setStep(useProfile ? 3 : useAdvanced ? 2 : 1);
    else if (step === 3) setStep(useAdvanced ? 2 : 1);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async () => {
    if (!staff) return;
    setIsSubmitting(true);
    try {
      const payload: StaffUpdatePayload = {
        fullName: basic.fullName.trim(),
        departmentId: basic.departmentId,
        role: basic.role || undefined,
        joiningDate:
          useAdvanced && advanced.joiningDate
            ? advanced.joiningDate
            : undefined,
        registeredIpAddress: useAdvanced ? advanced.registeredIps : undefined,
      };

      let dataToSend: StaffUpdatePayload | FormData = payload;

      if (profilePicture) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        formData.append('profilePicture', profilePicture);
        dataToSend = formData;
      }

      const updatedStaff = await staffService.update(staff.id, dataToSend);

      if (useProfile && profileForm.firstName && profileForm.lastName) {
        const profilePayload: StaffProfilePayload = {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          middleName: profileForm.middleName
            ? profileForm.middleName.trim()
            : undefined,
          phoneNumber: profileForm.phoneNumber
            ? profileForm.phoneNumber.trim()
            : undefined,
          dateOfBirth: profileForm.dateOfBirth || undefined,
          gender: profileForm.gender || undefined,
          addresses:
            useAddressStep && addresses.length
              ? addresses.map((a) => ({ ...a }))
              : undefined,
        };
        try {
          if (profile)
            await staffProfileService.upsert(staff.id, profilePayload);
          else await staffProfileService.create(staff.id, profilePayload);
        } catch (e) {
          const error = e as Error;
          toast.warning(error?.message || "Profile update failed");
        }
      }

      toast.success("Staff updated successfully");
      router.push(`/dashboard/admin/users/staff/${updatedStaff.id}`);
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to update staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }
  if (!staff) return null;

  const StepIndicator = () => {
    const steps = [
      { id: 1, label: "Basic" },
      ...(useAdvanced ? [{ id: 2, label: "Advanced" }] : []),
      ...(useProfile ? [{ id: 3, label: "Profile" }] : []),
      ...(useAddressStep ? [{ id: 4, label: "Addresses" }] : []),
      { id: 5, label: "Review" },
    ];
    return (
      <div className="flex items-center gap-3 flex-wrap mb-2">
        {steps.map((s, idx) => {
          const active = step === s.id;
          const completed = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${active
                  ? "bg-[#588157] text-white border-[#588157] shadow-md scale-105"
                  : completed
                    ? "bg-[#a3b18a] text-white border-[#a3b18a]"
                    : "bg-white text-[#344e41] border-[#a3b18a]/50"
                  }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="h-5 w-5 flex items-center justify-center text-xs font-bold rounded-full bg-white/20">
                    {idx + 1}
                  </span>
                )}
                <span className="font-semibold">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 text-[#344e41]/40" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[#dad7cd] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#344e41]" />
          </button>
          <PageHeader
            title={`Edit ${staff.fullName}`}
            subtitle="Update staff information"
            icon={Users}
          />
        </div>

        <Card className="border-[#a3b18a]/30">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <StepIndicator />
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant={useAdvanced ? "default" : "outline"}
                  onClick={() => {
                    if (useAdvanced && step === 2) setStep(1);
                    setUseAdvanced((v) => !v);
                  }}
                  className={`transition-all ${useAdvanced
                    ? "bg-[#588157] hover:bg-[#3a5a40] text-white shadow-md"
                    : "border-2 border-[#a3b18a] text-[#344e41] hover:bg-[#dad7cd]"
                    }`}
                  size="sm"
                >
                  <Network className="h-4 w-4 mr-1" />
                  Advanced {useAdvanced ? "✓" : ""}
                </Button>
                <Button
                  type="button"
                  variant={useProfile ? "default" : "outline"}
                  onClick={() => {
                    if (useProfile && step === 3) setStep(useAdvanced ? 2 : 1);
                    setUseProfile((v) => !v);
                  }}
                  className={`transition-all ${useProfile
                    ? "bg-[#588157] hover:bg-[#3a5a40] text-white shadow-md"
                    : "border-2 border-[#a3b18a] text-[#344e41] hover:bg-[#dad7cd]"
                    }`}
                  size="sm"
                >
                  <User className="h-4 w-4 mr-1" />
                  Profile {useProfile ? "✓" : ""}
                </Button>
                <Button
                  type="button"
                  variant={useAddressStep ? "default" : "outline"}
                  onClick={() => {
                    if (useAddressStep && step === 4)
                      setStep(useProfile ? 3 : useAdvanced ? 2 : 1);
                    setUseAddressStep((v) => !v);
                  }}
                  className={`transition-all ${useAddressStep
                    ? "bg-[#588157] hover:bg-[#3a5a40] text-white shadow-md"
                    : "border-2 border-[#a3b18a] text-[#344e41] hover:bg-[#dad7cd]"
                    }`}
                  size="sm"
                >
                  Addresses {useAddressStep ? "✓" : ""}
                </Button>
              </div>
            </div>

            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41]">
                    Full Name
                  </label>
                  <Input
                    value={basic.fullName}
                    onChange={(e) => updateBasic("fullName", e.target.value)}
                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41]">
                    Department
                  </label>
                  <Select
                    value={basic.departmentId}
                    onValueChange={(v) => updateBasic("departmentId", v)}
                  >
                    <SelectTrigger className="bg-white border-[#a3b18a]/60 text-[#344e41]">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem
                          key={d.id || d._id}
                          value={(d.id || d._id) as string}
                        >
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#344e41]">
                    Role
                  </label>
                  <Select
                    value={basic.role}
                    onValueChange={(v) => updateBasic("role", v as StaffRole)}
                  >
                    <SelectTrigger className="bg-white border-[#a3b18a]/60 text-[#344e41]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleMap).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && useAdvanced && (
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Joining Date
                    </label>
                    <Input
                      type="date"
                      value={advanced.joiningDate}
                      onChange={(e) =>
                        updateAdvanced("joiningDate", e.target.value)
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41] flex items-center gap-2">
                      Add IP Address <Network className="h-4 w-4" />
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={advanced.ipInput}
                        onChange={(e) =>
                          updateAdvanced("ipInput", e.target.value)
                        }
                        placeholder="e.g. 192.168.1.10"
                        className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                      />
                      <Button
                        type="button"
                        onClick={addIp}
                        className="bg-[#588157] text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
                {advanced.registeredIps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">
                      Registered IPs
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {advanced.registeredIps.map((ip) => (
                        <Badge
                          key={ip}
                          className="bg-[#588157] text-white flex items-center gap-1"
                        >
                          {ip}
                          <button
                            type="button"
                            onClick={() => removeIp(ip)}
                            className="ml-1 text-white/80 hover:text-white"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && useProfile && (
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      First Name
                    </label>
                    <Input
                      value={profileForm.firstName}
                      onChange={(e) =>
                        updateProfile("firstName", e.target.value)
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Last Name
                    </label>
                    <Input
                      value={profileForm.lastName}
                      onChange={(e) =>
                        updateProfile("lastName", e.target.value)
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Middle Name
                    </label>
                    <Input
                      value={profileForm.middleName}
                      onChange={(e) =>
                        updateProfile("middleName", e.target.value)
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Phone Number
                    </label>
                    <Input
                      value={profileForm.phoneNumber}
                      onChange={(e) =>
                        updateProfile("phoneNumber", e.target.value)
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) =>
                        updateProfile("dateOfBirth", e.target.value)
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Gender
                    </label>
                    <Select
                      value={profileForm.gender}
                      onValueChange={(v) => updateProfile("gender", v)}
                    >
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
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-[#344e41] flex items-center gap-2">Profile Picture <User className="h-4 w-4" /></label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setProfilePicture(file || null);
                      }}
                      className="bg-white border-[#a3b18a]/60 text-[#344e41] file:bg-[#588157] file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-4 file:hover:bg-[#3a5a40] transition-colors"
                    />
                    {profilePicture && <p className="text-xs text-[#588157]">Selected: {profilePicture.name}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && useAddressStep && (
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Street
                    </label>
                    <Input
                      value={addressDraft.street}
                      onChange={(e) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      City
                    </label>
                    <Input
                      value={addressDraft.city}
                      onChange={(e) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      State
                    </label>
                    <Input
                      value={addressDraft.state}
                      onChange={(e) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Zip Code
                    </label>
                    <Input
                      value={addressDraft.zipCode}
                      onChange={(e) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Country
                    </label>
                    <Input
                      value={addressDraft.country}
                      onChange={(e) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <label className="text-sm font-medium text-[#344e41]">
                      Primary?
                    </label>
                    <input
                      type="checkbox"
                      checked={addressDraft.isPrimary}
                      onChange={(e) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          isPrimary: e.target.checked,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      onClick={addAddress}
                      className="ml-auto bg-[#588157] text-white"
                    >
                      Add Address
                    </Button>
                  </div>
                </div>
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">
                      Addresses
                    </p>
                    <div className="space-y-2">
                      {addresses.map((addr, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-white/70 border border-[#a3b18a]/30 flex items-start justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#344e41] flex items-center gap-2">
                              {[addr.street, addr.city, addr.state]
                                .filter(Boolean)
                                .join(", ") || "(No street)"}{" "}
                              {addr.isPrimary && (
                                <Badge className="bg-[#588157] text-white">
                                  PRIMARY
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-[#344e41]/70">
                              {[addr.country, addr.zipCode]
                                .filter(Boolean)
                                .join(" - ") || "(No country)"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!addr.isPrimary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => makePrimary(idx)}
                                className="border-[#588157] text-[#588157]"
                              >
                                Make Primary
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAddress(idx)}
                              className="border-red-500 text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#588157]/10 to-[#a3b18a]/10 p-4 rounded-lg border-l-4 border-[#588157]">
                  <p className="text-sm text-[#344e41] font-medium">
                    <span className="text-[#588157] font-semibold">
                      Review:
                    </span>{" "}
                    Please review all changes before saving.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-[#588157] flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-wide text-[#344e41]">
                        Basic Information
                      </p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-white to-[#dad7cd]/20 rounded-lg border-2 border-[#a3b18a]/30 shadow-sm space-y-2 text-sm text-[#344e41]">
                      <div className="flex justify-between py-2 border-b border-[#a3b18a]/20">
                        <span className="font-medium text-[#344e41]/70">
                          Name:
                        </span>
                        <span className="font-semibold">{basic.fullName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#a3b18a]/20">
                        <span className="font-medium text-[#344e41]/70">
                          Department:
                        </span>
                        <span className="font-semibold">
                          {departments.find(
                            (d) => (d.id || d._id) === basic.departmentId
                          )?.name || basic.departmentId}
                        </span>
                      </div>
                      {basic.role && (
                        <div className="flex justify-between py-2">
                          <span className="font-medium text-[#344e41]/70">
                            Role:
                          </span>
                          <Badge className="bg-[#588157] text-white">
                            {roleMap[basic.role as StaffRole]}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {useAdvanced && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-[#588157] flex items-center justify-center">
                          <Network className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[#344e41]">
                          Advanced
                        </p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-white to-[#dad7cd]/20 rounded-lg border-2 border-[#a3b18a]/30 shadow-sm space-y-2 text-sm text-[#344e41]">
                        {advanced.joiningDate && (
                          <div className="flex justify-between py-2 border-b border-[#a3b18a]/20">
                            <span className="font-medium text-[#344e41]/70">
                              Joining Date:
                            </span>
                            <span className="font-semibold">
                              {new Date(
                                advanced.joiningDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {advanced.registeredIps.length > 0 && (
                          <div className="py-2">
                            <span className="font-medium text-[#344e41]/70 mb-2 block">
                              Registered IPs:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {advanced.registeredIps.map((ip) => (
                                <Badge
                                  key={ip}
                                  className="bg-[#588157] text-white text-xs"
                                >
                                  {ip}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {useProfile && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-[#588157] flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[#344e41]">
                          Profile
                        </p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-white to-[#dad7cd]/20 rounded-lg border-2 border-[#a3b18a]/30 shadow-sm space-y-2 text-sm text-[#344e41]">
                        <div className="flex justify-between py-2 border-b border-[#a3b18a]/20">
                          <span className="font-medium text-[#344e41]/70">
                            Full Name:
                          </span>
                          <span className="font-semibold">
                            {profileForm.firstName}{" "}
                            {profileForm.middleName &&
                              profileForm.middleName + " "}{" "}
                            {profileForm.lastName}
                          </span>
                        </div>
                        {profileForm.phoneNumber && (
                          <div className="flex justify-between py-2 border-b border-[#a3b18a]/20">
                            <span className="font-medium text-[#344e41]/70">
                              Phone:
                            </span>
                            <span>{profileForm.phoneNumber}</span>
                          </div>
                        )}
                        {profileForm.gender && (
                          <div className="flex justify-between py-2 border-b border-[#a3b18a]/20">
                            <span className="font-medium text-[#344e41]/70">
                              Gender:
                            </span>
                            <span>{profileForm.gender}</span>
                          </div>
                        )}
                        {profileForm.dateOfBirth && (
                          <div className="flex justify-between py-2">
                            <span className="font-medium text-[#344e41]/70">
                              Date of Birth:
                            </span>
                            <span>
                              {new Date(
                                profileForm.dateOfBirth
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {useAddressStep && addresses.length > 0 && (
                    <div className="space-y-3 md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-[#588157] flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[#344e41]">
                          Addresses
                        </p>
                      </div>
                      <div className="p-5 bg-gradient-to-br from-white to-[#dad7cd]/20 rounded-lg border-2 border-[#a3b18a]/30 shadow-sm space-y-3 text-sm text-[#344e41]">
                        {addresses.map((a, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between p-3 bg-white rounded border border-[#a3b18a]/20"
                          >
                            <p className="flex-1">
                              {[a.street, a.city, a.state, a.country, a.zipCode]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            {a.isPrimary && (
                              <Badge className="bg-[#588157] text-white ml-2">
                                PRIMARY
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t-2 border-[#a3b18a]/30">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-2 border-[#a3b18a] text-[#344e41] hover:bg-[#dad7cd]"
                    disabled={false}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[#588157] hover:bg-[#3a5a40] text-white shadow-lg hover:shadow-xl transition-all px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step !== 5 && (
              <div className="flex items-center justify-between pt-6 border-t-2 border-[#a3b18a]/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="border-2 border-[#a3b18a] text-[#344e41] hover:bg-[#dad7cd]"
                  disabled={step === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="text-xs text-[#344e41]/60">
                  Step {step} of{" "}
                  {5 -
                    (useAdvanced ? 0 : 1) -
                    (useProfile ? 0 : 1) -
                    (useAddressStep ? 0 : 1)}
                </div>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#588157] hover:bg-[#3a5a40] text-white shadow-md hover:shadow-lg transition-all"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
