"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { teacherService, Teacher, TeacherDesignation } from "@/services/user/teacher.service";
import { teacherProfileService, TeacherProfile } from "@/services/user/teacherProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, Mail, Phone, Calendar, MapPin, Network, User as UserIcon, Trash2, X, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

const designationLabel: Record<TeacherDesignation, string> = {
  professor: "Professor",
  associate_professor: "Associate Professor",
  assistant_professor: "Assistant Professor",
  lecturer: "Lecturer",
  senior_lecturer: "Senior Lecturer",
};

export default function TeacherDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ipInput, setIpInput] = useState("");
  const [isIpUpdating, setIsIpUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const t = await teacherService.getById(id);
      setTeacher(t);
      try {
        const p = await teacherProfileService.get(id);
        setProfile(p);
      } catch (e) {
        setProfile(null);
      }
      try {
        const d = await departmentService.getAllDepartments();
        setDepartments(Array.isArray(d) ? d : []);
      } catch { }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load teacher");
      router.push("/dashboard/admin/users/faculty");
    } finally { setIsLoading(false); }
  };

  const addIp = async () => {
    if (!teacher || !ipInput.trim()) { toast.error("Enter an IP"); return; }
    setIsIpUpdating(true);
    try {
      const updated = await teacherService.addRegisteredIp(teacher.id, ipInput.trim());
      setTeacher(updated);
      setIpInput("");
      toast.success("IP added");
    } catch (e: any) { toast.error(e?.message || "Failed to add IP"); } finally { setIsIpUpdating(false); }
  };
  const removeIp = async (ip: string) => {
    if (!teacher) return;
    setIsIpUpdating(true);
    try {
      const updated = await teacherService.removeRegisteredIp(teacher.id, ip);
      setTeacher(updated);
      toast.success("IP removed");
    } catch (e: any) { toast.error(e?.message || "Failed to remove IP"); } finally { setIsIpUpdating(false); }
  };

  const handleDeleteTeacher = async () => {
    if (!teacher) return;
    if (!confirm(`Delete ${teacher.fullName}?`)) return;
    setIsDeleting(true);
    try { await teacherService.delete(teacher.id); toast.success("Teacher deleted"); router.push("/dashboard/admin/users/faculty"); }
    catch (e: any) { toast.error(e?.message || "Failed to delete teacher"); }
    finally { setIsDeleting(false); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!teacher) return null;
  const departmentName = departments.find(d => (d.id || d._id) === teacher.departmentId)?.name || teacher.department?.name || teacher.departmentId;

  return (
    <div className="space-y-6">
      <PageHeader
        title={teacher.fullName}
        subtitle="Teacher profile overview"
        icon={GraduationCap}
        onBack={() => router.push("/dashboard/admin/users/faculty")}
        actionLabel="Edit"
        onAction={() => router.push(`/dashboard/admin/users/faculty/${teacher.id}/edit`)}
        extraActions={
          <Button variant="outline" size="sm" onClick={handleDeleteTeacher} disabled={isDeleting} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800">
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="md:col-span-2">
          <Card className="border-slate-200 dark:border-slate-700 h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  {profile?.profilePicture ? (
                    <img src={getImageUrl(profile.profilePicture)} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-indigo-600" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{teacher.fullName}</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{teacher.email}</p>
                  {teacher.designation && (
                    <Badge className="mt-1 bg-indigo-600">{designationLabel[teacher.designation]}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Mail} label="Email" value={teacher.email} />
                <InfoRow icon={MapPin} label="Registration" value={teacher.registrationNumber} />
                <InfoRow icon={GraduationCap} label="Designation" value={teacher.designation ? designationLabel[teacher.designation] : "Not set"} />
                <InfoRow icon={Calendar} label="Joining Date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "Not set"} />
                <InfoRow icon={Network} label="Department" value={departmentName} />
                <InfoRow icon={Phone} label="Phone" value={teacher.phone || profile?.phoneNumber || "Not provided"} />
              </div>

              {profile && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Profile Information</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Extended personal details</p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-600">Complete</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ProfileField label="First Name" value={profile.firstName} />
                      <ProfileField label="Last Name" value={profile.lastName} />
                      {profile.middleName && <ProfileField label="Middle Name" value={profile.middleName} />}
                      <ProfileField label="Full Name" value={`${profile.firstName} ${profile.middleName ? profile.middleName + " " : ""}${profile.lastName}`} highlighted />
                    </div>
                    {(profile.dateOfBirth || profile.gender) && (
                      <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        {profile.dateOfBirth && <ProfileField label="Date of Birth" value={new Date(profile.dateOfBirth).toLocaleDateString()} />}
                        {profile.dateOfBirth && <ProfileField label="Age" value={`${Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`} />}
                        {profile.gender && <ProfileField label="Gender" value={profile.gender} />}
                      </div>
                    )}
                    {profile.phoneNumber && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <ProfileField label="Phone Number" value={profile.phoneNumber} icon={Phone} />
                      </div>
                    )}
                    {profile.addresses && profile.addresses.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Addresses</p>
                        <div className="space-y-2">
                          {profile.addresses.map((addr, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{[addr.street, addr.city, addr.state].filter(Boolean).join(', ') || '(No street)'}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{[addr.country, addr.zipCode].filter(Boolean).join(' - ') || '(No country)'} {addr.isPrimary && <Badge className="ml-2 bg-indigo-600">PRIMARY</Badge>}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {!profile && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                      <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">No Profile Information</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">This teacher doesn&apos;t have an extended profile yet.</p>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/admin/users/faculty/${teacher.id}/edit`)}>
                        <UserIcon className="h-3 w-3 mr-1" /> Add Profile Information
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Registered IPs</span>
                <Badge variant="secondary">{teacher.registeredIpAddress?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={ipInput} onChange={(e) => setIpInput(e.target.value)} placeholder="Add IP" className="border-slate-200 dark:border-slate-700" disabled={isIpUpdating} onKeyDown={(e) => e.key === 'Enter' && addIp()} />
                <Button onClick={addIp} disabled={isIpUpdating} className="bg-indigo-600 hover:bg-indigo-700">{isIpUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {teacher.registeredIpAddress && teacher.registeredIpAddress.length > 0 ? teacher.registeredIpAddress.map(ip => (
                  <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                    {ip}
                    <button type="button" onClick={() => removeIp(ip)} className="ml-1 hover:text-red-500 transition-colors" disabled={isIpUpdating}><X className="h-3 w-3" /></button>
                  </Badge>
                )) : <p className="text-sm text-slate-500 dark:text-slate-400">No IPs registered</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
        <Icon className="h-4 w-4 text-slate-400" />
        <span>{value}</span>
      </div>
    </div>
  );
}

function ProfileField({ label, value, highlighted, icon: Icon }: { label: string; value: string; highlighted?: boolean; icon?: any }) {
  return (
    <div className={cn("p-3 rounded-lg text-sm", highlighted ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-slate-900")}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <span className="text-slate-500 dark:text-slate-400">{label}:</span>
        <span className={cn("font-medium", highlighted && "text-indigo-700 dark:text-indigo-300")}>{value}</span>
      </div>
    </div>
  );
}
