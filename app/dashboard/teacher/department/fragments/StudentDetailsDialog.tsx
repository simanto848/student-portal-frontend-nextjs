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
import { getImageUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Student } from "@/services/user/student.service";

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
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto block p-0 bg-transparent border-0 shadow-none">
                <DialogTitle className="sr-only">Student Details</DialogTitle>
                <div className="bg-slate-50 rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-full">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                                        <GraduationCap className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Student Profile</span>
                                    </Badge>
                                    <span className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                                        <Hash className="w-3 h-3" />
                                        {student.registrationNumber}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">{student.fullName}</h1>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="self-start md:self-auto rounded-full hover:bg-slate-200">
                            Close
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Main Profile Card */}
                            <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-amber-500/10 via-slate-100 to-amber-500/5" />
                                <CardContent className="p-10 pt-16">
                                    <div className="flex flex-col sm:flex-row gap-10 items-start">
                                        <div className="relative flex-shrink-0 group">
                                            <div className="h-44 w-44 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10">
                                                {profile?.profilePicture ? (
                                                    <img
                                                        src={getImageUrl(profile.profilePicture)}
                                                        alt={student.fullName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-amber-50 text-amber-600 font-black text-5xl">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-white border-2 border-slate-50 shadow-xl flex items-center justify-center text-amber-600 z-20">
                                                <Sparkles className="w-7 h-7" />
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-8 pt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <InfoBlock icon={Mail} label="Email Address" value={student.email} />
                                                <InfoBlock icon={Calendar} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "N/A"} />
                                                <InfoBlock icon={Building2} label="Department" value={getName(departments, student.departmentId)} />
                                                <InfoBlock icon={Phone} label="Phone Number" value={(profile as any)?.studentMobile || "N/A"} />
                                            </div>

                                            <div className="flex flex-wrap gap-3 pt-4">
                                                <Badge className="px-4 py-2 rounded-xl bg-amber-50 border-2 border-amber-100/50 text-amber-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                    <Layers className="w-3 h-3" />
                                                    {getBatchLabel(student.batchId)}
                                                </Badge>
                                                <Badge className="px-4 py-2 rounded-xl bg-slate-900 border-none text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                                    <BookOpen className="w-3 h-3 text-amber-400" />
                                                    {getName(programs, student.programId)}
                                                </Badge>
                                                <Badge className="px-4 py-2 rounded-xl bg-emerald-100 border-none text-emerald-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    {student.enrollmentStatus?.replace(/_/g, " ") || "N/A"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabs Section */}
                            <Tabs defaultValue="personal" className="w-full">
                                <TabsList className="bg-slate-200/50 p-1.5 rounded-[2rem] gap-2 mb-8 inline-flex flex-wrap md:flex-nowrap h-auto">
                                    <TabsTrigger value="personal" className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg transition-all flex-1 md:flex-none">Personal Info</TabsTrigger>
                                    <TabsTrigger value="locus" className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg transition-all flex-1 md:flex-none">Addresses</TabsTrigger>
                                    <TabsTrigger value="kin" className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg transition-all flex-1 md:flex-none">Guardian Info</TabsTrigger>
                                </TabsList>

                                <AnimatePresence mode="wait">
                                    <TabsContent value="personal" key="personal" className="mt-0">
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 p-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                    <SummaryItem label="Date of Birth" value={(profile as any)?.dateOfBirth ? new Date((profile as any).dateOfBirth).toLocaleDateString() : "N/A"} icon={Calendar} />
                                                    <SummaryItem label="Gender" value={(profile as any)?.gender || "N/A"} icon={UserIcon} />
                                                    <SummaryItem label="Blood Group" value={(profile as any)?.bloodGroup || "N/A"} icon={Heart} />
                                                    <SummaryItem label="Nationality" value={(profile as any)?.nationality || "N/A"} icon={Flag} />
                                                    <SummaryItem label="NID/Passport" value={(profile as any)?.nidOrPassportNo || "N/A"} icon={CreditCard} />
                                                    <SummaryItem label="Religion" value={(profile as any)?.religion || "N/A"} icon={Sparkles} />
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </TabsContent>

                                    <TabsContent value="locus" key="locus" className="mt-0">
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 p-8">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                                        <Home className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permanent Address</p>
                                                </div>
                                                {(profile as any)?.permanentAddress ? (
                                                    <div className="space-y-4">
                                                        <LocusItem label="Street" value={(profile as any).permanentAddress.street || ""} />
                                                        <LocusItem label="City" value={(profile as any).permanentAddress.city || ""} />
                                                        <LocusItem label="Country" value={(profile as any).permanentAddress.country || ""} />
                                                    </div>
                                                ) : <EmptyLocus />}
                                            </Card>
                                            <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 p-8">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mailing Address</p>
                                                </div>
                                                {(profile as any)?.mailingAddress ? (
                                                    <div className="space-y-4">
                                                        <LocusItem label="Street" value={(profile as any).mailingAddress.street || ""} />
                                                        <LocusItem label="City" value={(profile as any).mailingAddress.city || ""} />
                                                        <LocusItem label="Country" value={(profile as any).mailingAddress.country || ""} />
                                                    </div>
                                                ) : <EmptyLocus />}
                                            </Card>
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
                            <Card className="bg-slate-900 text-white border-none rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                    <Clock className="w-32 h-32" />
                                </div>
                                <CardContent className="p-10 relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 px-1">System Info</p>
                                    <div className="space-y-6">
                                        <StatItem label="Registration Date" value={new Date(student.createdAt || "").toDateString()} />
                                        <StatItem label="System ID" value={student.id.slice(0, 8)} />
                                        <StatItem label="Status" value="ACTIVE" highlighted />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 p-8">
                                <div className="grid grid-cols-1 gap-6">
                                    <SummaryItem label="Current Semester" value={`Semester ${student.currentSemester || 1}`} icon={Layers} />
                                    <SummaryItem label="Session" value={getName(sessions, student.sessionId)} icon={Clock} />
                                </div>
                            </Card>
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
            <div className="flex items-center gap-3 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover/block:text-amber-500 transition-colors" />
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
                <Icon className={`w-3.5 h-3.5 ${highlighted ? 'text-amber-500' : 'text-slate-400'}`} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            </div>
            <p className={`text-base font-black px-1 ${highlighted ? 'text-amber-600' : 'text-slate-800'}`}>{value}</p>
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
        <Card className={`p-6 rounded-[2.5rem] border-2 transition-all ${highlighted ? 'bg-amber-50 border-amber-100 shadow-xl' : 'bg-white border-slate-50'}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${highlighted ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
            </div>
            <div className="space-y-1.5 px-1">
                <p className={`text-lg font-black leading-tight ${highlighted ? 'text-amber-700' : 'text-slate-900'}`}>{name || "N/A"}</p>
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
            <p className={`text-sm font-black leading-none ${highlighted ? 'text-amber-500' : 'text-white'}`}>{value}</p>
        </div>
    );
}
