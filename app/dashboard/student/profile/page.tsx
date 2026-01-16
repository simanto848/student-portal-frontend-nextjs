"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  AlertCircle,
  Users,
  Heart,
  Shield,
  GraduationCap,
  Building,
  Hash,
  Globe,
  Droplets,
  Sparkles,
  Clock,
  Award,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { studentService, Profile } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { Department, Program, Batch, Session } from "@/services/academic/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

const GlassCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden rounded-[2rem] border-2 border-white/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/40 ${className}`}
  >
    {children}
  </motion.div>
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-cyan-600",
  iconBg = "bg-cyan-50",
}: {
  icon: any;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
}) => (
  <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-all duration-300">
    <div
      className={`h-9 w-9 shrink-0 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
    >
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const studentId = user.id || (user as any)._id;

      if (studentId) {
        const student = await studentService.getById(studentId);
        setStudentData(student);

        const [deptData, progData, batchData, sessData] = await Promise.all([
          student.departmentId
            ? departmentService.getDepartmentById(student.departmentId).catch(() => null)
            : Promise.resolve(null),
          student.programId
            ? programService.getProgramById(student.programId).catch(() => null)
            : Promise.resolve(null),
          student.batchId
            ? batchService.getBatchById(student.batchId).catch(() => null)
            : Promise.resolve(null),
          student.sessionId
            ? sessionService.getSessionById(student.sessionId).catch(() => null)
            : Promise.resolve(null),
        ]);

        setDepartment(deptData);
        setProgram(progData);
        setBatch(batchData);
        setSession(sessData);
      }
    } catch (err: any) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <Skeleton className="h-[280px] w-full rounded-[2.5rem]" />
          <div className="grid gap-6 lg:grid-cols-12">
            <Skeleton className="h-[450px] w-full lg:col-span-7 rounded-[2rem]" />
            <Skeleton className="h-[450px] w-full lg:col-span-5 rounded-[2rem]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const student = studentData || (user as any);
  const profile: Profile | any = student?.profile;
  const profilePictureUrl = getImageUrl(profile?.profilePicture);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatAddress = (addr?: { street?: string; city?: string; country?: string }) => {
    if (!addr) return "N/A";
    const parts = [addr.street, addr.city, addr.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8 pb-12"
      >
        {/* Hero Profile Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-cyan-900 to-sky-900 p-8 md:p-10 text-white shadow-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-sky-500/15 blur-[80px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1),_transparent_50%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Profile Picture */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="h-32 w-32 md:h-36 md:w-36 rounded-[2rem] bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/30">
                <div className="h-full w-full rounded-[1.5rem] bg-white/10 flex items-center justify-center overflow-hidden">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="h-full w-full object-cover rounded-[1.5rem]"
                    />
                  ) : (
                    <User className="h-16 w-16 text-white/70" />
                  )}
                </div>
              </div>
              {/* Status Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                  {student?.fullName || "Student"}
                </h1>
                <p className="text-cyan-200/80 text-lg font-medium mt-1">
                  {student?.registrationNumber || student?.email}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {program && (
                  <Badge className="px-4 py-1.5 rounded-xl bg-white/10 text-white border-white/20 font-bold text-xs backdrop-blur-sm">
                    <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                    {program.shortName || program.name}
                  </Badge>
                )}
                {batch && (
                  <Badge className="px-4 py-1.5 rounded-xl bg-white/10 text-white border-white/20 font-bold text-xs backdrop-blur-sm capitalize">
                    <Award className="h-3.5 w-3.5 mr-1.5" />
                    {batch.shift} • {batch.name}
                  </Badge>
                )}
                {session && (
                  <Badge className="px-4 py-1.5 rounded-xl bg-white/10 text-white border-white/20 font-bold text-xs backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {session.name}
                  </Badge>
                )}
              </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="hidden lg:flex gap-4"
            >
              <div className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-black text-white">{student?.currentSemester || 1}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200/70">Semester</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Personal Information */}
          <GlassCard className="lg:col-span-7 p-0" delay={0.1}>
            <div className="p-6 border-b border-slate-100/80 bg-gradient-to-r from-cyan-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Identity & Contact</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <InfoItem icon={User} label="Full Name" value={student?.fullName || "N/A"} />
                <InfoItem icon={Hash} label="Registration No." value={student?.registrationNumber || "N/A"} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
                <InfoItem icon={Mail} label="Email Address" value={student?.email || "N/A"} iconColor="text-rose-600" iconBg="bg-rose-50" />
                <InfoItem icon={Phone} label="Mobile Number" value={profile?.studentMobile || "N/A"} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(profile?.dateOfBirth)} iconColor="text-amber-600" iconBg="bg-amber-50" />
                <InfoItem icon={User} label="Gender" value={profile?.gender || "N/A"} iconColor="text-violet-600" iconBg="bg-violet-50" />
                <InfoItem icon={Droplets} label="Blood Group" value={profile?.bloodGroup || "N/A"} iconColor="text-red-600" iconBg="bg-red-50" />
                <InfoItem icon={Globe} label="Nationality" value={profile?.nationality || "N/A"} iconColor="text-sky-600" iconBg="bg-sky-50" />
                <div className="md:col-span-2">
                  <InfoItem icon={MapPin} label="Permanent Address" value={formatAddress(profile?.permanentAddress)} iconColor="text-teal-600" iconBg="bg-teal-50" />
                </div>
                <div className="md:col-span-2">
                  <InfoItem icon={MapPin} label="Mailing Address" value={formatAddress(profile?.mailingAddress)} iconColor="text-slate-600" iconBg="bg-slate-100" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Academic Information */}
          <GlassCard className="lg:col-span-5 p-0" delay={0.2}>
            <div className="p-6 border-b border-slate-100/80 bg-gradient-to-r from-indigo-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Academic Info</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Program & Enrollment</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-1">
              <InfoItem icon={Building} label="Department" value={department ? `${department.name} (${department.shortName})` : "N/A"} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
              <InfoItem icon={GraduationCap} label="Program" value={program?.name || "N/A"} iconColor="text-cyan-600" iconBg="bg-cyan-50" />
              <InfoItem icon={Users} label="Batch" value={batch ? `${batch.shift || ""} ${batch.name}`.trim() : "N/A"} iconColor="text-amber-600" iconBg="bg-amber-50" />
              <InfoItem icon={Calendar} label="Session" value={session?.name || "N/A"} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
              <InfoItem icon={BookOpen} label="Current Semester" value={String(student?.currentSemester || "N/A")} iconColor="text-rose-600" iconBg="bg-rose-50" />
              <InfoItem icon={Calendar} label="Admission Date" value={formatDate(student?.admissionDate)} iconColor="text-violet-600" iconBg="bg-violet-50" />
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-transparent">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Enrollment Status</span>
                  <Badge
                    className={`px-4 py-1.5 rounded-xl font-black text-xs capitalize ${student?.enrollmentStatus === "enrolled"
                      ? "bg-emerald-100 text-emerald-700"
                      : student?.enrollmentStatus === "graduated"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                      }`}
                  >
                    {student?.enrollmentStatus?.replace(/_/g, " ") || "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Family Information */}
        {(profile?.father || profile?.mother || profile?.guardian) && (
          <GlassCard className="p-0" delay={0.3}>
            <div className="p-6 border-b border-slate-100/80 bg-gradient-to-r from-pink-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-200">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Family Information</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parents & Guardian</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile?.father && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Father</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{profile.father.name || "N/A"}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {profile.father.cell || "N/A"}
                    </p>
                  </motion.div>
                )}

                {profile?.mother && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-200">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-black text-pink-600 uppercase tracking-widest">Mother</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{profile.mother.name || "N/A"}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {profile.mother.cell || "N/A"}
                    </p>
                  </motion.div>
                )}

                {profile?.guardian && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Guardian</span>
                    </div>
                    <p className="text-lg font-black text-slate-900">{profile.guardian.name || "N/A"}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase">{profile.guardian.relation || ""}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {profile.guardian.cell || "N/A"}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Emergency Contact */}
        {profile?.emergencyContact && (
          <GlassCard className="p-0" delay={0.4}>
            <div className="p-6 border-b border-slate-100/80 bg-gradient-to-r from-red-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-200">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Emergency Contact</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">In Case of Emergency</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                <InfoItem icon={User} label="Name" value={profile.emergencyContact.name || "N/A"} iconColor="text-red-600" iconBg="bg-red-50" />
                <InfoItem icon={Users} label="Relationship" value={profile.emergencyContact.relation || "N/A"} iconColor="text-rose-600" iconBg="bg-rose-50" />
                <InfoItem icon={Phone} label="Phone" value={profile.emergencyContact.cell || "N/A"} iconColor="text-pink-600" iconBg="bg-pink-50" />
                <InfoItem icon={Building} label="Occupation" value={profile.emergencyContact.occupation || "N/A"} iconColor="text-fuchsia-600" iconBg="bg-fuchsia-50" />
              </div>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
