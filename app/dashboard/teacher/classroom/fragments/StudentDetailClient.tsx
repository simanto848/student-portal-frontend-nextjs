"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Student } from "@/services/user/student.service";
import { StudentProfile } from "@/services/user/studentProfile.service";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    User as UserIcon,
    Sparkles,
    Building2,
    GraduationCap,
    School,
    BookOpen,
    Clock,
    Heart,
    Flag,
    CreditCard,
    Home,
    Contact,
    Layers,
    Hash,
    ShieldAlert
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StudentDetailClientProps {
    student: Student;
    profile: StudentProfile | null;
    departments: any[];
    programs: any[];
    batches: any[];
    sessions: any[];
    classroomId: string;
}

export function StudentDetailClient({
    student,
    profile,
    departments,
    programs,
    batches,
    sessions,
    classroomId
}: StudentDetailClientProps) {
    const router = useRouter();

    const getBatchLabel = (bId: string) => {
        const b = batches.find(x => (x.id || x._id) === bId);
        if (!b) return "N/A";
        const shift = String(b.shift || "").toLowerCase();
        const prefix = shift === "evening" ? "E" : "D";
        return `${prefix}-${b.name || b.code}`;
    };

    const getName = (list: any[], id: string) => {
        const item = list.find((i) => (i.id || i._id) === id);
        return item ? item.name : "N/A";
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/dashboard/teacher/classroom/${classroomId}`)}
                        className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                                <GraduationCap className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Student Scholar</span>
                            </Badge>
                            <span className="text-slate-300 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                                <Hash className="w-3 h-3" />
                                {student.registrationNumber}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{student.fullName}</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500/10 via-slate-100 to-indigo-500/5" />
                        <CardContent className="p-10 pt-16">
                            <div className="flex flex-col sm:flex-row gap-10 items-start">
                                <div className="relative flex-shrink-0 group">
                                    <div className="h-44 w-44 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                                        {student.profile?.profilePicture ? (
                                            <img
                                                src={getImageUrl(student.profile.profilePicture)}
                                                alt={student.fullName}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-5xl">
                                                {student.fullName ? student.fullName.charAt(0) : "S"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-white border-2 border-slate-50 shadow-xl flex items-center justify-center text-amber-500 z-20 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <InfoBlock icon={Mail} label="University Email" value={student.email} />
                                        <InfoBlock icon={Calendar} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "N/A"} />
                                        <InfoBlock icon={Building2} label="Department" value={getName(departments, student.departmentId)} />
                                        <InfoBlock icon={Phone} label="Contact Mobile" value={profile?.studentMobile || "N/A"} />
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-4">
                                        <Badge className="px-4 py-2 rounded-xl bg-indigo-50 border-2 border-indigo-100/50 text-indigo-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                            <Layers className="w-3 h-3" />
                                            {getBatchLabel(student.batchId)}
                                        </Badge>
                                        <Badge className="px-4 py-2 rounded-xl bg-slate-900 border-none text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                            <BookOpen className="w-3 h-3 text-amber-400" />
                                            {getName(programs, student.programId)}
                                        </Badge>
                                        <Badge className="px-4 py-2 rounded-xl bg-emerald-100 border-none text-emerald-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            {student.enrollmentStatus ? student.enrollmentStatus.replace(/_/g, " ") : "N/A"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="academic" className="w-full">
                        <TabsList className="bg-slate-100/50 p-1.5 rounded-[2rem] gap-2 mb-8 inline-flex">
                            <TabsTrigger value="academic" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all uppercase">Academic</TabsTrigger>
                            <TabsTrigger value="personal" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all uppercase">Personal</TabsTrigger>
                            <TabsTrigger value="locus" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all uppercase">Address</TabsTrigger>
                            <TabsTrigger value="kin" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-xl transition-all uppercase">Guardian</TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent value="academic" key="academic">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <SummaryItem label="Current Semester" value={`Semester ${student.currentSemester || 1}`} icon={Layers} />
                                            <SummaryItem label="Academic Session" value={getName(sessions, student.sessionId)} icon={Clock} />
                                            <SummaryItem label="Enrollment Status" value={student.enrollmentStatus ? student.enrollmentStatus.replace(/_/g, " ") : "N/A"} icon={GraduationCap} highlighted />
                                            <SummaryItem label="Academic Progress" value="85% (Estimated)" icon={Sparkles} />
                                        </div>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="personal" key="personal">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                            <SummaryItem label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"} icon={Calendar} />
                                            <SummaryItem label="Gender" value={profile?.gender || "N/A"} icon={UserIcon} />
                                            <SummaryItem label="Blood Group" value={profile?.bloodGroup || "N/A"} icon={Heart} />
                                            <SummaryItem label="Nationality" value={profile?.nationality || "N/A"} icon={Flag} />
                                            <SummaryItem label="NID/Passport" value={profile?.nidOrPassportNo || "N/A"} icon={CreditCard} />
                                            <SummaryItem label="Religion" value={profile?.religion || "N/A"} icon={Sparkles} />
                                        </div>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="locus" key="locus">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Home className="w-5 h-5" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permanent Address</p>
                                        </div>
                                        {profile?.permanentAddress ? (
                                            <div className="space-y-4">
                                                <LocusItem label="Street" value={profile.permanentAddress.street || ""} />
                                                <LocusItem label="City" value={profile.permanentAddress.city || ""} />
                                                <LocusItem label="Country" value={profile.permanentAddress.country || ""} />
                                            </div>
                                        ) : <EmptyLocus />}
                                    </Card>
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mailing Address</p>
                                        </div>
                                        {profile?.mailingAddress ? (
                                            <div className="space-y-4">
                                                <LocusItem label="Street" value={profile.mailingAddress.street || ""} />
                                                <LocusItem label="City" value={profile.mailingAddress.city || ""} />
                                                <LocusItem label="Country" value={profile.mailingAddress.country || ""} />
                                            </div>
                                        ) : <EmptyLocus />}
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="kin" key="kin">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <KinBlock label="Father's Info" icon={UserIcon} name={profile?.father?.name} phone={profile?.father?.cell} />
                                        <KinBlock label="Mother's Info" icon={UserIcon} name={profile?.mother?.name} phone={profile?.mother?.cell} />
                                    </div>
                                    <div className="space-y-6">
                                        <KinBlock label="Primary Guardian" icon={ShieldAlert} name={profile?.guardian?.name} phone={profile?.guardian?.cell} extra={profile?.guardian?.occupation} />
                                        <KinBlock label="Emergency Contact" icon={Contact} name={profile?.emergencyContact?.name} phone={profile?.emergencyContact?.cell} extra={profile?.emergencyContact?.relation} highlighted />
                                    </div>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </div>

                <div className="space-y-8">
                    <Card className="bg-indigo-950 text-white border-none rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <Clock className="w-32 h-32" />
                        </div>
                        <CardContent className="p-10 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 px-1">System Meta</p>
                            <div className="space-y-6">
                                <StatItem label="Registered Since" value={student.createdAt ? new Date(student.createdAt).toDateString() : "N/A"} />
                                <StatItem label="Academic Standing" value="Good" />
                                <StatItem label="Verification" value="ACTIVE" highlighted />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10 overflow-hidden relative group">
                        <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                            <Sparkles className="w-40 h-40" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 underline decoration-indigo-500/30 decoration-4 underline-offset-4">Teacher Insight</h3>
                        <div className="space-y-4 relative z-10">
                            <ActionButton label="Attendance History" icon={Clock} />
                            <ActionButton label="Grade Performance" icon={Layers} />
                            <ActionButton label="Note for Student" icon={CreditCard} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="group/block">
            <div className="flex items-center gap-3 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover/block:text-indigo-500 transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/block:text-slate-600 transition-colors">{label}</p>
            </div>
            <p className="text-base font-black text-slate-900 truncate pl-6.5">{value}</p>
        </div>
    );
}

function SummaryItem({ label, value, icon: Icon, highlighted = false }: { label: string; value: string; icon: any; highlighted?: boolean }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <Icon className={`w-3.5 h-3.5 ${highlighted ? 'text-indigo-500' : 'text-slate-400'}`} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            </div>
            <p className={`text-base font-black px-1 ${highlighted ? 'text-indigo-600' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}

function LocusItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">{label}</p>
            <p className="text-sm font-black text-slate-900 leading-tight">{value || "N/A"}</p>
        </div>
    );
}

function EmptyLocus() {
    return <p className="text-[10px] font-black text-slate-300 uppercase italic">Address not provided</p>;
}

function KinBlock({ label, icon: Icon, name, phone, extra, highlighted = false }: { label: string; icon: any; name?: string; phone?: string; extra?: string; highlighted?: boolean }) {
    return (
        <Card className={`p-6 rounded-[2.5rem] border-2 transition-all ${highlighted ? 'bg-indigo-50 border-indigo-100 shadow-xl' : 'bg-white border-slate-50'}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${highlighted ? 'bg-indigo-950 text-white shadow-lg shadow-indigo-900/30' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
            </div>
            <div className="space-y-1.5 px-1">
                <p className={`text-lg font-black leading-tight ${highlighted ? 'text-indigo-700' : 'text-slate-900'}`}>{name || "N/A"}</p>
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 italic">
                    <Phone className="w-3 h-3" />
                    {phone || "N/A"}
                </div>
                {extra && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 w-fit px-2 py-0.5 rounded-md mt-2">{extra}</p>}
            </div>
        </Card>
    );
}

function StatItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
            <p className={`text-sm font-black leading-none ${highlighted ? 'text-amber-400' : 'text-white'}`}>{value}</p>
        </div>
    );
}

function ActionButton({ label, icon: Icon }: { label: string; icon: any }) {
    return (
        <button className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between px-6 group hover:bg-indigo-950 hover:text-white transition-all active:scale-95 duration-500">
            <div className="flex items-center gap-4">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
        </button>
    );
}
