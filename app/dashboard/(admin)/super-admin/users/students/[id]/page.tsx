"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentService, Student } from "@/services/user/student.service";
import { studentProfileService, StudentProfile } from "@/services/user/studentProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { toast } from "sonner";
import { ArrowLeft, Users, Mail, Phone, Calendar, MapPin, BookOpen, GraduationCap, Trash2, Edit, User, School, Clock, Heart, Flag, CreditCard, Home, Contact, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, p, depts, progs, batchesData, sessionsData] = await Promise.all([
        studentService.getById(id),
        studentProfileService.get(id).catch(() => null),
        departmentService.getAllDepartments(),
        programService.getAllPrograms(),
        batchService.getAllBatches(),
        sessionService.getAllSessions(),
      ]);

      setStudent(s);
      setProfile(p);
      setDepartments(Array.isArray(depts) ? depts : []);
      setPrograms(Array.isArray(progs) ? progs : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (error) {
      toast.error("Failed to load student details");
      router.push("/dashboard/admin/users/students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    setIsDeleting(true);
    try {
      await studentService.delete(id);
      toast.success("Student deleted");
      router.push("/dashboard/admin/users/students");
    } catch (error) {
      toast.error("Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const getName = (list: any[], id: string) => {
    const item = list.find((i) => (i.id || i._id) === id);
    return item ? item.name : "N/A";
  };

  const getBatchLabel = (id: string) => {
    const b = batches.find((i) => (i.id || i._id) === id);
    if (!b) return "N/A";
    if (b.code) return String(b.code);
    const name = String(b.name || "");
    const s = String(b.shift || "").toLowerCase();
    const prefix = s === "evening" ? "E" : "D";
    return `${prefix}-${name}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.fullName}
        subtitle={student.registrationNumber}
        icon={GraduationCap}
        onBack={() => router.push("/dashboard/admin/users/students")}
        actionLabel="Edit"
        onAction={() => router.push(`/dashboard/admin/users/students/${id}/edit`)}
        extraActions={
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800">
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Tabs defaultValue="academic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger value="academic" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600">Academic Info</TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600">Personal Info</TabsTrigger>
            <TabsTrigger value="address" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600">Address</TabsTrigger>
            <TabsTrigger value="guardian" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600">Guardian & Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="academic" className="mt-6">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><School className="h-5 w-5" /> Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <InfoRow icon={Mail} label="Email" value={student.email} />
                <InfoRow icon={School} label="Department" value={getName(departments, student.departmentId)} />
                <InfoRow icon={BookOpen} label="Program" value={getName(programs, student.programId)} />
                <InfoRow icon={Users} label="Batch" value={getBatchLabel(student.batchId)} />
                <InfoRow icon={Clock} label="Session" value={getName(sessions, student.sessionId)} />
                <InfoRow icon={Calendar} label="Admission Date" value={new Date(student.admissionDate).toLocaleDateString()} />
                <InfoRow icon={GraduationCap} label="Status" value={student.enrollmentStatus} valueClass="capitalize" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="mt-6">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {profile ? (
                  <>
                    <InfoRow icon={Phone} label="Mobile" value={profile.studentMobile || "N/A"} />
                    <InfoRow icon={User} label="Gender" value={profile.gender || "N/A"} />
                    <InfoRow icon={Calendar} label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"} />
                    <InfoRow icon={Heart} label="Blood Group" value={profile.bloodGroup || "N/A"} />
                    <InfoRow icon={BookOpen} label="Religion" value={profile.religion || "N/A"} />
                    <InfoRow icon={Users} label="Marital Status" value={profile.maritalStatus || "N/A"} />
                    <InfoRow icon={Flag} label="Nationality" value={profile.nationality || "N/A"} />
                    <InfoRow icon={CreditCard} label="NID / Passport" value={profile.nidOrPassportNo || "N/A"} />
                  </>
                ) : (
                  <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">No personal information available.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Home className="h-5 w-5" /> Permanent Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.permanentAddress ? (
                    <>
                      <InfoRow icon={MapPin} label="Street" value={profile.permanentAddress.street || "N/A"} />
                      <InfoRow icon={MapPin} label="City" value={profile.permanentAddress.city || "N/A"} />
                      <InfoRow icon={Flag} label="Country" value={profile.permanentAddress.country || "N/A"} />
                    </>
                  ) : (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">No address details.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Mail className="h-5 w-5" /> Mailing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.mailingAddress ? (
                    <>
                      <InfoRow icon={MapPin} label="Street" value={profile.mailingAddress.street || "N/A"} />
                      <InfoRow icon={MapPin} label="City" value={profile.mailingAddress.city || "N/A"} />
                      <InfoRow icon={Flag} label="Country" value={profile.mailingAddress.country || "N/A"} />
                    </>
                  ) : (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">No address details.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guardian" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Users className="h-5 w-5" /> Parents & Guardian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile ? (
                    <>
                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Father</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoRow icon={User} label="Name" value={profile.father?.name || "N/A"} />
                          <InfoRow icon={Phone} label="Cell" value={profile.father?.cell || "N/A"} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Mother</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoRow icon={User} label="Name" value={profile.mother?.name || "N/A"} />
                          <InfoRow icon={Phone} label="Cell" value={profile.mother?.cell || "N/A"} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">Guardian</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <InfoRow icon={User} label="Name" value={profile.guardian?.name || "N/A"} />
                          <InfoRow icon={Phone} label="Cell" value={profile.guardian?.cell || "N/A"} />
                          <InfoRow icon={School} label="Occupation" value={profile.guardian?.occupation || "N/A"} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">No guardian details.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Contact className="h-5 w-5" /> Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.emergencyContact ? (
                    <>
                      <InfoRow icon={User} label="Name" value={profile.emergencyContact.name || "N/A"} />
                      <InfoRow icon={Phone} label="Cell" value={profile.emergencyContact.cell || "N/A"} />
                      <InfoRow icon={Users} label="Relation" value={profile.emergencyContact.relation || "N/A"} />
                    </>
                  ) : (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">No emergency contact details.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueClass = "" }: { icon: any; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className={cn("text-sm font-medium text-slate-900 dark:text-slate-100", valueClass)}>{value}</p>
      </div>
    </div>
  );
}
