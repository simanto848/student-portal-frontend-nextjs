"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  studentService,
  StudentCreatePayload,
} from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { toast } from "sonner";
import {
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function CreateStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Data for dropdowns
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Form Data
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
      const sessionIdFromBatch =
        (selectedBatch?.sessionId &&
          (selectedBatch.sessionId.id || selectedBatch.sessionId._id)) ||
        selectedBatch?.sessionId ||
        "";
      const programIdFromBatch =
        (selectedBatch?.programId &&
          (selectedBatch.programId.id || selectedBatch.programId._id)) ||
        selectedBatch?.programId ||
        selectedBatch?.program?.id ||
        selectedBatch?.program?._id ||
        "";
      const departmentIdFromBatch =
        (selectedBatch?.departmentId &&
          (selectedBatch.departmentId.id || selectedBatch.departmentId._id)) ||
        selectedBatch?.departmentId ||
        selectedBatch?.department?.id ||
        selectedBatch?.department?._id ||
        "";
      setFormData((prev) => ({
        ...prev,
        sessionId: sessionIdFromBatch || prev.sessionId,
        programId: programIdFromBatch || prev.programId,
        departmentId: departmentIdFromBatch || prev.departmentId,
      }));
    }

    if (key === "departmentId") {
      if (value) {
        fetchBatchesByDepartment(value);
      }
      setFormData((prev) => ({ ...prev, batchId: "", sessionId: "" }));
    }
  };

  const handleProfileChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      studentProfile: { ...prev.studentProfile, [key]: value },
    }));
  };

  const handleNestedProfileChange = (
    parent: string,
    key: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      studentProfile: {
        ...prev.studentProfile,
        [parent]: { ...prev.studentProfile[parent], [key]: value },
      },
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.departmentId ||
      !formData.programId ||
      !formData.batchId ||
      !formData.sessionId
    ) {
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
      (typeof p.departmentId === "object" &&
        (p.departmentId as any).id === formData.departmentId) ||
      (typeof p.departmentId === "object" &&
        (p.departmentId as any)._id === formData.departmentId) ||
      p.department?._id === formData.departmentId ||
      p.department?.id === formData.departmentId
  );

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
            title="Create New Student"
            subtitle="Enroll a new student"
            icon={Users}
          />
        </div>

        <Card className="border-[#a3b18a]/30">
          <CardContent className="p-6">
            {/* Steps */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  step === 1
                    ? "bg-[#588157] text-white border-[#588157]"
                    : "bg-white text-[#344e41] border-[#a3b18a]"
                }`}
              >
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  1
                </span>
                Academic Info
              </div>
              <ChevronRight className="text-[#a3b18a]" />
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  step === 2
                    ? "bg-[#588157] text-white border-[#588157]"
                    : "bg-white text-[#344e41] border-[#a3b18a]"
                }`}
              >
                <span className="h-5 w-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  2
                </span>
                Personal Info
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="rounded-md border border-[#a3b18a]/30 p-3 bg-[#f8f9fa] text-sm text-[#344e41]">
                  Select batch first — it auto-fills session, program, and
                  department.
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Batch *
                    </label>
                    <SearchableSelect
                      options={batches.map((b) => ({
                        label: b.name,
                        value: b.id || b._id,
                      }))}
                      value={formData.batchId}
                      onChange={(v) => handleChange("batchId", v)}
                      placeholder="Search and select batch"
                      disabled={isLoadingOptions}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Session *
                    </label>
                    <Select
                      value={formData.sessionId}
                      onValueChange={(v) => handleChange("sessionId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((s) => (
                          <SelectItem key={s.id || s._id} value={s.id || s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Program *
                    </label>
                    <Select
                      value={formData.programId}
                      onValueChange={(v) => handleChange("programId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPrograms.map((p) => (
                          <SelectItem key={p.id || p._id} value={p.id || p._id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Department *
                    </label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(v) => handleChange("departmentId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id || d._id} value={d.id || d._id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Full Name *
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="student@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Admission Date
                    </label>
                    <Input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) =>
                        handleChange("admissionDate", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    className="bg-[#588157] text-white"
                  >
                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Mobile Number
                    </label>
                    <Input
                      value={formData.studentProfile.studentMobile}
                      onChange={(e) =>
                        handleProfileChange("studentMobile", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Gender
                    </label>
                    <Select
                      value={formData.studentProfile.gender}
                      onValueChange={(v) => handleProfileChange("gender", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={formData.studentProfile.dateOfBirth}
                      onChange={(e) =>
                        handleProfileChange("dateOfBirth", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Blood Group
                    </label>
                    <Select
                      value={formData.studentProfile.bloodGroup}
                      onValueChange={(v) =>
                        handleProfileChange("bloodGroup", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (bg) => (
                            <SelectItem key={bg} value={bg}>
                              {bg}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Father&apos;s Name
                    </label>
                    <Input
                      value={formData.studentProfile.father.name}
                      onChange={(e) =>
                        handleNestedProfileChange(
                          "father",
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Mother&apos;s Name
                    </label>
                    <Input
                      value={formData.studentProfile.mother.name}
                      onChange={(e) =>
                        handleNestedProfileChange(
                          "mother",
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Religion
                    </label>
                    <Select
                      value={formData.studentProfile.religion}
                      onValueChange={(v) => handleProfileChange("religion", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Religion" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Islam",
                          "Hinduism",
                          "Christianity",
                          "Buddhism",
                          "Other",
                        ].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Marital Status
                    </label>
                    <Select
                      value={formData.studentProfile.maritalStatus}
                      onValueChange={(v) =>
                        handleProfileChange("maritalStatus", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Single", "Married", "Divorced", "Widowed"].map(
                          (s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      Nationality
                    </label>
                    <Input
                      value={formData.studentProfile.nationality}
                      onChange={(e) =>
                        handleProfileChange("nationality", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#344e41]">
                      NID / Passport
                    </label>
                    <Input
                      value={formData.studentProfile.nidOrPassportNo}
                      onChange={(e) =>
                        handleProfileChange("nidOrPassportNo", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-[#344e41] flex items-center gap-2">
                      Profile Picture <Users className="h-4 w-4" />
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setProfilePicture(file || null);
                      }}
                      className="bg-white border-[#a3b18a]/60 text-[#344e41] file:bg-[#588157] file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-4 file:hover:bg-[#3a5a40] transition-colors"
                    />
                    {profilePicture && (
                      <p className="text-xs text-[#588157]">
                        Selected: {profilePicture.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#a3b18a]/20 pt-6">
                  <h3 className="text-lg font-semibold text-[#344e41] mb-4">
                    Address Information
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-[#344e41]">
                        Permanent Address
                      </h4>
                      <Input
                        placeholder="Street"
                        value={formData.studentProfile.permanentAddress?.street}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "permanentAddress",
                            "street",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="City"
                        value={formData.studentProfile.permanentAddress?.city}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "permanentAddress",
                            "city",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Country"
                        value={
                          formData.studentProfile.permanentAddress?.country
                        }
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "permanentAddress",
                            "country",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-[#344e41]">
                        Mailing Address
                      </h4>
                      <Input
                        placeholder="Street"
                        value={formData.studentProfile.mailingAddress?.street}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "mailingAddress",
                            "street",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="City"
                        value={formData.studentProfile.mailingAddress?.city}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "mailingAddress",
                            "city",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Country"
                        value={formData.studentProfile.mailingAddress?.country}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "mailingAddress",
                            "country",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#a3b18a]/20 pt-6">
                  <h3 className="text-lg font-semibold text-[#344e41] mb-4">
                    Guardian & Emergency Contact
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-[#344e41]">
                        Guardian
                      </h4>
                      <Input
                        placeholder="Name"
                        value={formData.studentProfile.guardian?.name}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "guardian",
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Cell"
                        value={formData.studentProfile.guardian?.cell}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "guardian",
                            "cell",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Occupation"
                        value={formData.studentProfile.guardian?.occupation}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "guardian",
                            "occupation",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-[#344e41]">
                        Emergency Contact
                      </h4>
                      <Input
                        placeholder="Name"
                        value={formData.studentProfile.emergencyContact?.name}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "emergencyContact",
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Cell"
                        value={formData.studentProfile.emergencyContact?.cell}
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "emergencyContact",
                            "cell",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Relation"
                        value={
                          formData.studentProfile.emergencyContact?.relation
                        }
                        onChange={(e) =>
                          handleNestedProfileChange(
                            "emergencyContact",
                            "relation",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[#588157] text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Create Student
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
