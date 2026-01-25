"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Mail,
    Phone,
    Calendar,
    MapPin,
    User as UserIcon,
    Sparkles,
    Building2,
    GraduationCap,
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
import { getImageUrl, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Student } from "@/services/user/student.service";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";

interface StudentDetailsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
    departments: any[];
    programs: any[];
    batches: any[];
    sessions: any[];
}

export default function StudentDetailsDialog({
    isOpen,
    onOpenChange,
    student,
    departments,
    programs,
    batches,
    sessions,
}: StudentDetailsDialogProps) {
    if (!student) return null;

    const profile = student.profile;

    const getBatchLabel = (bId: string) => {
        const b = batches.find((x) => (x.id || x._id) === bId);
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
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto block p-0 bg-transparent border-0 shadow-none">
                <DialogTitle className="sr-only">Student Details Identity Node</DialogTitle>
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[3.5rem] p-6 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative overflow-hidden min-h-full border border-slate-200/50 dark:border-slate-800/50">
                    <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#2dd4bf]/5 to-transparent pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <Badge className="bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] border-[#2dd4bf]/20 px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-sm font-black text-[10px] tracking-widest uppercase">
                                        <GraduationCap className="w-4 h-4" />
                                        Student Profile
                                    </Badge>
                                    <span className="text-slate-400 dark:text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Hash className="w-3.5 h-3.5" />
                                        {student.registrationNumber}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{student.fullName}</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-3 italic">Detailed student information and academic records.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <GlassCard className="border-slate-200/60 dark:border-slate-700/50 rounded-[3.5rem] shadow-2xl shadow-slate-200/20 dark:shadow-slate-950/50 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-[#2dd4bf]/10 via-slate-50/50 dark:via-slate-800/50 to-[#2dd4bf]/5" />
                                <CardContent className="p-12 pt-20">
                                    <div className="flex flex-col xl:flex-row gap-12 items-start">
                                        <div className="relative flex-shrink-0">
                                            <div className="h-56 w-56 rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl relative z-10 transition-transform duration-700 hover:scale-[1.02]">
                                                {profile?.profilePicture ? (
                                                    <img
                                                        src={getImageUrl(profile.profilePicture)}
                                                        alt={student.fullName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] font-black text-6xl">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-[1.5rem] bg-white dark:bg-slate-950 border-4 border-slate-50 dark:border-slate-900 shadow-2xl flex items-center justify-center text-[#2dd4bf] z-20 animate-bounce transition-all">
                                                <Sparkles className="w-8 h-8" />
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-8 pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <InfoBlock icon={Mail} label="Email Address" value={student.email} />
                                                <InfoBlock icon={Calendar} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "N/A"} />
                                                <InfoBlock icon={Building2} label="Department" value={getName(departments, student.departmentId)} />
                                                <InfoBlock icon={Phone} label="Phone Number" value={(profile as any)?.studentMobile || "N/A"} />
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-4">
                                                <Badge className="px-5 py-2.5 rounded-2xl bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20 border border-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    {getBatchLabel(student.batchId)}
                                                </Badge>
                                                <Badge className="px-5 py-2.5 rounded-2xl bg-slate-950 dark:bg-white border-none text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl">
                                                    <BookOpen className="w-3.5 h-3.5 text-[#2dd4bf]" />
                                                    {getName(programs, student.programId)}
                                                </Badge>
                                                <Badge className="px-5 py-2.5 rounded-2xl bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                    {student.enrollmentStatus?.replace(/_/g, " ") || "ACTIVE"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </GlassCard>

                            {/* Tabs Section */}
                            <Tabs defaultValue="personal" className="w-full">
                                <TabsList className="bg-slate-100/80 dark:bg-slate-800/50 p-2 rounded-[2.5rem] gap-3 mb-10 h-auto w-full md:w-fit backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                                    <TabsTrigger value="personal" className="px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#0d9488] dark:data-[state=active]:text-[#2dd4bf] data-[state=active]:shadow-xl transition-all flex-1 md:flex-none">Personal Details</TabsTrigger>
                                    <TabsTrigger value="locus" className="px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#0d9488] dark:data-[state=active]:text-[#2dd4bf] data-[state=active]:shadow-xl transition-all flex-1 md:flex-none">Address info</TabsTrigger>
                                    <TabsTrigger value="kin" className="px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#0d9488] dark:data-[state=active]:text-[#2dd4bf] data-[state=active]:shadow-xl transition-all flex-1 md:flex-none">Guardian Details</TabsTrigger>
                                </TabsList>

                                <AnimatePresence mode="wait">
                                    <TabsContent value="personal" key="personal" className="mt-0 focus-visible:ring-0">
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                                            <GlassCard className="border-slate-200/60 dark:border-slate-800 p-12 shadow-2xl shadow-slate-200/10 dark:shadow-slate-950/40">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                                    <SummaryItem label="Date of Birth" value={(profile as any)?.dateOfBirth ? new Date((profile as any).dateOfBirth).toLocaleDateString() : "UNDEFINED"} icon={Calendar} />
                                                    <SummaryItem label="Gender" value={(profile as any)?.gender || "UNDEFINED"} icon={UserIcon} />
                                                    <SummaryItem label="Blood Group" value={(profile as any)?.bloodGroup || "UNDEFINED"} icon={Heart} />
                                                    <SummaryItem label="Nationality" value={(profile as any)?.nationality || "BANGLADESHI"} icon={Flag} />
                                                    <SummaryItem label="NID/Passport" value={(profile as any)?.nidOrPassportNo || "PENDING"} icon={CreditCard} />
                                                    <SummaryItem label="Religion" value={(profile as any)?.religion || "ISLAM"} icon={Sparkles} />
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent value="locus" key="locus" className="mt-0 focus-visible:ring-0">
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <GlassCard className="border-slate-200/60 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/10 dark:shadow-slate-950/40 relative group/locus">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="h-14 w-14 rounded-2xl bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center shadow-inner ring-1 ring-[#2dd4bf]/20 transition-transform group-hover/locus:scale-110">
                                                        <Home className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d9488] dark:text-[#2dd4bf]">Permanent Address</p>
                                                    </div>
                                                </div>
                                                {(profile as any)?.permanentAddress ? (
                                                    <div className="space-y-6">
                                                        <LocusItem label="Street" value={(profile as any).permanentAddress.street || ""} />
                                                        <LocusItem label="City" value={(profile as any).permanentAddress.city || ""} />
                                                        <LocusItem label="Country" value={(profile as any).permanentAddress.country || ""} />
                                                    </div>
                                                ) : <EmptyLocus />}
                                            </GlassCard>
                                            <GlassCard className="border-slate-200/60 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/10 dark:shadow-slate-950/40 relative group/locus">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="h-14 w-14 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl transition-transform group-hover/locus:scale-110">
                                                        <MapPin className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Mailing Address</p>
                                                    </div>
                                                </div>
                                                {(profile as any)?.mailingAddress ? (
                                                    <div className="space-y-6">
                                                        <LocusItem label="Street" value={(profile as any).mailingAddress.street || ""} />
                                                        <LocusItem label="City" value={(profile as any).mailingAddress.city || ""} />
                                                        <LocusItem label="Country" value={(profile as any).mailingAddress.country || ""} />
                                                    </div>
                                                ) : <EmptyLocus />}
                                            </GlassCard>
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent value="kin" key="kin" className="mt-0">
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <KinBlock label="Father's Info" icon={UserIcon} name={(profile as any)?.father?.name} phone={(profile as any)?.father?.cell} />
                                                <KinBlock label="Mother's Info" icon={UserIcon} name={(profile as any)?.mother?.name} phone={(profile as any)?.mother?.cell} />
                                            </div>
                                            <div className="space-y-6">
                                                <KinBlock label="Primary Guardian" icon={ShieldAlert} name={(profile as any)?.guardian?.name} phone={(profile as any)?.guardian?.cell} extra={(profile as any)?.guardian?.occupation} />
                                                <KinBlock label="Emergency Contact" icon={Contact} name={(profile as any)?.emergencyContact?.name} phone={(profile as any)?.emergencyContact?.cell} extra={(profile as any)?.emergencyContact?.relation} highlighted />
                                            </div>
                                        </motion.div>
                                    </TabsContent>
                                </AnimatePresence>
                            </Tabs>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-8">
                            <GlassCard className="bg-slate-950 dark:bg-slate-900 text-white border-none rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                                    <Clock className="w-48 h-48" />
                                </div>
                                <CardContent className="p-12 relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-10 px-1">System Details</p>
                                    <div className="space-y-8">
                                        <StatItem label="Registration Date" value={new Date(student.createdAt || "").toDateString()} />
                                        <StatItem label="System ID" value={student.id.slice(0, 12).toUpperCase()} />
                                        <StatItem label="Status" value="ACTIVE" highlighted />
                                    </div>
                                </CardContent>
                            </GlassCard>

                            <GlassCard className="border-slate-200/60 dark:border-slate-800 rounded-[3rem] shadow-2xl p-10">
                                <div className="grid grid-cols-1 gap-10">
                                    <SummaryItem label="Current Semester" value={`Semester ${student.currentSemester || 1}`} icon={Layers} highlighted />
                                    <SummaryItem label="Program Session" value={getName(sessions, student.sessionId)} icon={Clock} />
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Sub-components adapted from StudentDetailClient
function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="group/block">
            <div className="flex items-center gap-4 mb-2">
                <Icon className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover/block:text-[#2dd4bf] transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 group-hover/block:text-slate-500 transition-colors">{label}</p>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white truncate pl-8 leading-none tracking-tight">{value}</p>
        </div>
    );
}

function SummaryItem({ label, value, icon: Icon, highlighted = false }: { label: string; value: string; icon: any; highlighted?: boolean }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                <Icon className={`w-4 h-4 ${highlighted ? 'text-[#2dd4bf]' : 'text-slate-400 dark:text-slate-600'}`} />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">{label}</p>
            </div>
            <p className={`text-lg font-black px-1 leading-tight tracking-tight ${highlighted ? 'text-[#0d9488] dark:text-[#2dd4bf]' : 'text-slate-800 dark:text-slate-200'}`}>{value}</p>
        </div>
    );
}

function LocusItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 leading-none">{label}</p>
            <p className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight">{value || "UNDEFINED"}</p>
        </div>
    );
}

function EmptyLocus() {
    return <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic pt-4">Data fragment missing from locale</p>;
}

function KinBlock({ label, icon: Icon, name, phone, extra, highlighted = false }: { label: string; icon: any; name?: string; phone?: string; extra?: string; highlighted?: boolean }) {
    return (
        <GlassCard className={cn(
            "p-8 rounded-[3rem] border transition-all duration-500 relative group/kin overflow-hidden",
            highlighted
                ? "bg-[#2dd4bf]/5 border-[#2dd4bf]/20 shadow-2xl shadow-[#2dd4bf]/10"
                : "bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20"
        )}>
            <div className="flex items-center gap-5 mb-8">
                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover/kin:scale-110",
                    highlighted
                        ? "bg-slate-950 dark:bg-white text-white dark:text-slate-900 shadow-2xl"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">{label}</p>
                    <p className="text-xs font-bold text-slate-400">Guardian Node</p>
                </div>
            </div>
            <div className="space-y-3 px-1 relative z-10">
                <p className={cn(
                    "text-2xl font-black leading-tight tracking-tighter",
                    highlighted ? "text-[#0d9488] dark:text-[#2dd4bf]" : "text-slate-900 dark:text-white"
                )}>{name || "UNIDENTIFIED"}</p>
                <div className="flex items-center gap-3 text-sm font-black text-slate-400 dark:text-slate-500 italic">
                    <Phone className="w-4 h-4 text-[#2dd4bf]/40" />
                    {phone || "NO_SIGNAL"}
                </div>
                {extra && (
                    <div className="pt-4">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
                            {extra}
                        </Badge>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

function StatItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] leading-none">{label}</p>
            <p className={cn(
                "text-lg font-black leading-none tracking-tight",
                highlighted ? "text-[#2dd4bf] shadow-[#2dd4bf]/20 drop-shadow-sm" : "text-white"
            )}>{value}</p>
        </div>
    );
}
