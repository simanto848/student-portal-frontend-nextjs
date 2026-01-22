/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    AlertCircle,
    Users,
    Heart,
    Shield,
    GraduationCap,
    Building,
    Hash,
    Globe,
    Sparkles,
    Clock,
    Award,
    Smartphone,
    Map,
    Dna
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentProfileAction } from "../action";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getImageUrl, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import StudentLoading from "@/components/StudentLoading";
import Image from "next/image";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
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

const NexusCard = ({
    children,
    className = "",
    delay = 0,
    title,
    subtitle,
    icon: Icon,
    accent = "teal"
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    title: string;
    subtitle?: string;
    icon: any;
    accent?: "teal" | "indigo" | "rose" | "amber" | "red" | "sky" | "violet" | "slate";
}) => {
    const accentColors = {
        teal: "text-teal-600 bg-teal-500/10 border-teal-500/20 shadow-teal-500/5",
        indigo: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5",
        rose: "text-rose-600 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
        amber: "text-amber-600 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
        red: "text-red-600 bg-red-500/10 border-red-500/20 shadow-red-500/5",
        sky: "text-sky-600 bg-sky-500/10 border-sky-500/20 shadow-sky-500/5",
        violet: "text-violet-600 bg-violet-500/10 border-violet-500/20 shadow-violet-500/5",
        slate: "text-slate-600 bg-slate-500/10 border-slate-500/20 shadow-slate-500/5",
    };

    return (
        <motion.div
            variants={itemVariants}
            className={cn(
                "glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl border-white/40 flex flex-col h-full",
                className
            )}
        >
            <div className="p-6 border-b border-white/20 bg-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner", accentColors[accent])}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">{title}</h3>
                        {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">{subtitle}</p>}
                    </div>
                </div>
            </div>
            <div className="p-6 flex-1">
                {children}
            </div>
        </motion.div>
    );
};

const NexusInfoItem = ({
    icon: Icon,
    label,
    value,
    accent = "teal"
}: {
    icon: any;
    label: string;
    value: string;
    accent?: "teal" | "indigo" | "rose" | "amber" | "violet" | "red" | "sky" | "slate";
}) => {
    const colors: Record<string, string> = {
        teal: "text-teal-600 bg-teal-500/5 border-teal-500/10",
        indigo: "text-indigo-600 bg-indigo-500/5 border-indigo-500/10",
        rose: "text-rose-600 bg-rose-500/5 border-rose-500/10",
        amber: "text-amber-600 bg-amber-500/5 border-amber-500/10",
        violet: "text-violet-600 bg-violet-500/5 border-violet-500/10",
        red: "text-red-600 bg-red-500/5 border-red-500/10",
        sky: "text-sky-600 bg-sky-500/5 border-sky-500/10",
        slate: "text-slate-600 bg-slate-500/5 border-slate-500/10",
    };

    return (
        <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-all duration-300 border border-transparent hover:border-white/20">
            <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border shadow-inner transition-transform duration-300 group-hover:scale-110", colors[accent])}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-bold text-slate-700 truncate leading-tight">{value}</p>
            </div>
        </div>
    );
};

export default function ProfileClient() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const studentId = user?.id || (user as any)?._id;
            if (studentId) {
                const data = await getStudentProfileAction(studentId);
                setProfileData(data);
            }
        } catch (err: any) {
            setError("Nexus connection failed. Unable to fetch profile intelligence.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <StudentLoading />;

    if (error || !profileData) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="glass-panel p-10 rounded-[3rem] max-w-md text-center border-rose-500/20 shadow-rose-500/5">
                    <div className="h-20 w-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                        <AlertCircle className="h-10 w-10 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">Transmission Error</h2>
                    <Alert variant="destructive" className="bg-rose-500/5 border-none mb-6">
                        <AlertDescription className="text-rose-600 font-bold uppercase tracking-wider text-[10px]">
                            {error}
                        </AlertDescription>
                    </Alert>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full h-12 glass-inner rounded-2xl font-black uppercase tracking-widest text-[#0088A9] hover:bg-white/60 transition-all border border-white/40 shadow-lg"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const { student, department, program, batch, session } = profileData;
    const profile = student?.profile;
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
        <div className="h-full min-h-0 overflow-hidden -m-4 md:-m-8 bg-architectural/20">
            <ScrollArea className="h-full w-full">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="p-4 md:p-8 max-w-7xl mx-auto space-y-8"
                >
                    {/* Header Hero Island */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-[3rem] glass-panel border-white/40 shadow-2xl p-8 md:p-12 mb-8"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-teal-500/10 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-10">
                            {/* Avatar Island */}
                            <div className="relative shrink-0 mx-auto lg:mx-0">
                                <div className="h-40 w-40 md:h-48 md:w-48 rounded-[3rem] glass-inner p-2 border-white/60 shadow-2xl">
                                    <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-white/40 border border-white/20 flex items-center justify-center shadow-inner relative">
                                        {profilePictureUrl ? (
                                            <Image
                                                src={profilePictureUrl}
                                                alt="Profile"
                                                fill
                                                unoptimized
                                                priority
                                                className="object-cover transition-transform duration-700 hover:scale-110"
                                            />
                                        ) : (
                                            <User className="h-24 w-24 text-slate-300" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-14 w-14 rounded-2xl bg-teal-500 flex items-center justify-center shadow-xl shadow-teal-500/30 border-4 border-white/50 animate-pulse">
                                    <Sparkles className="h-7 w-7 text-white" />
                                </div>
                            </div>

                            {/* Identity Info */}
                            <div className="flex-1 text-center lg:text-left">
                                <div className="space-y-4">
                                    <div>
                                        <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter uppercase mb-2">
                                            {student?.fullName || "Student Nexus"}
                                        </h1>
                                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                            <span className="text-sm font-black text-teal-600 bg-teal-500/10 px-4 py-1.5 rounded-xl border border-teal-500/20 uppercase tracking-[0.2em] shadow-sm">
                                                {student?.registrationNumber || "Unidentified"}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic opacity-60">
                                                Established Since {formatDate(student?.admissionDate)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                                        {program && (
                                            <Badge className="px-5 py-2 rounded-xl bg-white/40 text-slate-700 border-white/60 font-black text-[10px] uppercase tracking-widest backdrop-blur-md shadow-sm">
                                                <GraduationCap className="h-4 w-4 mr-2 text-teal-600" />
                                                {program.shortName || program.name}
                                            </Badge>
                                        )}
                                        {batch && (
                                            <Badge className="px-5 py-2 rounded-xl bg-white/40 text-slate-700 border-white/60 font-black text-[10px] uppercase tracking-widest backdrop-blur-md shadow-sm">
                                                <Award className="h-4 w-4 mr-2 text-indigo-600" />
                                                {batch.shift} • {batch.name}
                                            </Badge>
                                        )}
                                        {session && (
                                            <Badge className="px-5 py-2 rounded-xl bg-white/40 text-slate-700 border-white/60 font-black text-[10px] uppercase tracking-widest backdrop-blur-md shadow-sm">
                                                <Clock className="h-4 w-4 mr-2 text-amber-600" />
                                                {session.name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="hidden xl:block">
                                <div className="glass-inner p-6 rounded-[2.5rem] border-white/40 flex flex-col items-center">
                                    <div className="text-5xl font-black text-teal-600 mb-1">{student?.currentSemester || 1}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Semester</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Detailed Content Grid */}
                    <div className="grid gap-8 lg:grid-cols-12">
                        {/* Core Nexus Data */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            <NexusCard title="Biographical Intel" subtitle="Personal Identity & Physical Markers" icon={User} accent="teal">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <NexusInfoItem icon={User} label="Primary Identity" value={student?.fullName || "N/A"} accent="teal" />
                                    <NexusInfoItem icon={Mail} label="Nexus Communication" value={student?.email || "N/A"} accent="rose" />
                                    <NexusInfoItem icon={Smartphone} label="Mobile Link" value={profile?.studentMobile || "N/A"} accent="sky" />
                                    <NexusInfoItem icon={Calendar} label="Timeline Origin" value={formatDate(profile?.dateOfBirth)} accent="amber" />
                                    <NexusInfoItem icon={Users} label="Gender Ref" value={profile?.gender || "N/A"} accent="violet" />
                                    <NexusInfoItem icon={Dna} label="Biological Group" value={profile?.bloodGroup || "N/A"} accent="red" />
                                    <NexusInfoItem icon={Globe} label="Region Origin" value={profile?.nationality || "N/A"} accent="indigo" />
                                    <NexusInfoItem icon={Hash} label="Nexus Index" value={student?.registrationNumber || "N/A"} accent="slate" />
                                </div>
                            </NexusCard>

                            <NexusCard title="Territorial Data" subtitle="Nexus Residency & Mailing Channels" icon={MapPin} accent="indigo">
                                <div className="space-y-4">
                                    <NexusInfoItem icon={Map} label="Permanent Coordinates" value={formatAddress(profile?.permanentAddress)} accent="indigo" />
                                    <NexusInfoItem icon={MapPin} label="Mailing Channel" value={formatAddress(profile?.mailingAddress)} accent="slate" />
                                </div>
                            </NexusCard>
                        </div>

                        {/* Academic & Family Sidebars */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            <NexusCard title="Nexus Standing" subtitle="Academic Integrity & Enrollment" icon={GraduationCap} accent="amber">
                                <div className="space-y-4">
                                    <NexusInfoItem icon={Building} label="Sector" value={department?.shortName || "Unknown"} accent="teal" />
                                    <div className="p-5 glass-inner rounded-3xl border-white/40 mt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Current Integrity</p>
                                            <p className="text-2xl font-black text-teal-600 uppercase tracking-tighter">Verified</p>
                                        </div>
                                        <Shield className="h-10 w-10 text-teal-600/20" />
                                    </div>
                                </div>
                            </NexusCard>

                            <NexusCard title="Kinship Links" subtitle="Family Nexus Connections" icon={Users} accent="rose">
                                <div className="space-y-3">
                                    {profile?.father && (
                                        <div className="p-4 glass-inner rounded-3xl border-white/20 hover:bg-white/40 transition-all cursor-default group/kin">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                    <User className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Paternal Link</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-700">{profile.father.name}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-1 group-hover/kin:text-indigo-600 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                                                <Phone className="h-3 w-3" /> {profile.father.cell || "N/A"}
                                            </p>
                                        </div>
                                    )}
                                    {profile?.mother && (
                                        <div className="p-4 glass-inner rounded-3xl border-white/20 hover:bg-white/40 transition-all cursor-default group/kin">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                                    <Heart className="h-4 w-4 text-rose-600" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Maternal Link</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-700">{profile.mother.name}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-1 group-hover/kin:text-rose-600 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                                                <Phone className="h-3 w-3" /> {profile.mother.cell || "N/A"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </NexusCard>

                            {profile?.emergencyContact && (
                                <NexusCard title="Emergency Hub" icon={Smartphone} accent="red">
                                    <div className="space-y-3">
                                        <NexusInfoItem icon={User} label="Coordinator" value={profile.emergencyContact.name} accent="red" />
                                        <NexusInfoItem icon={Smartphone} label="Direct Frequency" value={profile.emergencyContact.cell} accent="rose" />
                                        <p className="text-[9px] font-black text-red-600/60 uppercase tracking-widest text-center mt-2 italic px-4">
                                            Priority communication channel for critical operations.
                                        </p>
                                    </div>
                                </NexusCard>
                            )}
                        </div>
                    </div>
                </motion.div>
            </ScrollArea>
        </div>
    );
}
