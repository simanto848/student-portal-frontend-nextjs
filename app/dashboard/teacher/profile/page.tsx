"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Building2,
    GraduationCap,
    BookOpen,
    Award,
    Briefcase,
    Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getImageUrl } from "@/lib/utils";
import type { Easing, Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as Easing } }
};

export default function TeacherProfilePage() {
    const { user } = useAuth();
    const [teacherData, setTeacherData] = useState<Teacher | null>(null);
    const [profileData, setProfileData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const teacherId = user.id || user._id;
            if (teacherId) {
                const teacher = await teacherService.getById(teacherId);
                setTeacherData(teacher);
                setProfileData((teacher as any)?.profile || null);
            }
        } catch (err: any) {
            console.error("Failed to fetch profile", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <Skeleton className="h-[280px] w-full rounded-3xl" />
                <div className="grid md:grid-cols-3 gap-6">
                    <Skeleton className="h-[200px] md:col-span-2 rounded-3xl" />
                    <Skeleton className="h-[200px] rounded-3xl" />
                </div>
            </div>
        );
    }

    if (error || !teacherData) {
        return (
            <div className="glass-panel rounded-2xl p-6">
                <Alert variant="destructive">
                    <AlertDescription>{error || "Profile not found"}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const joiningDate = teacherData.joiningDate
        ? new Date(teacherData.joiningDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "N/A";

    const profilePicture = getImageUrl(profileData?.profilePicture || (user as any)?.profile?.profilePicture);

    return (
        <motion.div
            className="flex flex-col gap-6 font-display"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Profile Header Card */}
            <motion.div
                variants={itemVariants}
                className="glass-panel rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
                {/* Header Banner */}
                <div className="relative h-36 bg-gradient-to-r from-[#0d9488] via-[#14b8a6] to-[#2dd4bf] overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                    <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -top-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Profile Info Section */}
                <div className="relative px-6 pb-6">
                    {/* Avatar */}
                    <div className="absolute -top-16 left-6">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 overflow-hidden shadow-xl ring-4 ring-[#2dd4bf]/20">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt={teacherData.fullName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#2dd4bf] to-[#0d9488] text-white">
                                        <span className="text-4xl font-bold">
                                            {teacherData.fullName?.charAt(0) || "T"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                        </div>
                    </div>

                    {/* Name & Info */}
                    <div className="pt-20 md:pt-6 md:pl-40">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {teacherData.fullName}
                                    </h1>
                                    <Badge className="bg-[#2dd4bf]/10 text-[#0d9488] hover:bg-[#2dd4bf]/20 border-0 capitalize font-medium">
                                        {teacherData.designation?.replace(/_/g, " ") || "Teacher"}
                                    </Badge>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-[#2dd4bf]" />
                                    {teacherData.department?.name || "Department Not Assigned"}
                                </p>
                            </div>

                            {/* Contact Info Pills */}
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                    <Mail className="h-3.5 w-3.5 text-[#2dd4bf]" />
                                    {teacherData.email}
                                </span>
                                {teacherData.phone && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                        <Phone className="h-3.5 w-3.5 text-[#2dd4bf]" />
                                        {teacherData.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Professional Bio */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-2 glass-panel rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10">
                            <User className="h-5 w-5 text-[#2dd4bf]" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Professional Bio
                        </h2>
                    </div>
                    {profileData?.bio ? (
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {profileData.bio}
                        </p>
                    ) : (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No bio added yet.</p>
                            <p className="text-xs mt-1">Add a professional bio from your settings.</p>
                        </div>
                    )}
                </motion.div>

                {/* Details Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Quick Details Card */}
                    <div className="glass-panel rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-[#2dd4bf]" />
                            Quick Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                <div className="p-2 rounded-lg bg-[#2dd4bf]/10">
                                    <Shield className="h-4 w-4 text-[#2dd4bf]" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                        Registration ID
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {teacherData.registrationNumber || "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                        Joined
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {joiningDate}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                    <MapPin className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                        Address
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">
                                        {profileData?.address || "Not provided"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Card */}
                    <div className="glass-panel rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-[#2dd4bf]/5 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-[#0d9488] flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">
                                    Academic Role
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Faculty Member
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            As a{" "}
                            <span className="font-semibold text-[#0d9488]">
                                {teacherData.designation?.replace(/_/g, " ") || "Teacher"}
                            </span>
                            , you have access to course management, grading workflows, and
                            student assessment tools.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Stats Row */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    {
                        icon: BookOpen,
                        label: "Courses",
                        value: "Active",
                        color: "text-[#2dd4bf]",
                        bg: "bg-[#2dd4bf]/10",
                    },
                    {
                        icon: Award,
                        label: "Experience",
                        value: teacherData.joiningDate
                            ? `${Math.floor((Date.now() - new Date(teacherData.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365))}+ Years`
                            : "N/A",
                        color: "text-blue-500",
                        bg: "bg-blue-500/10",
                    },
                    {
                        icon: GraduationCap,
                        label: "Department",
                        value: teacherData.department?.code || "N/A",
                        color: "text-orange-500",
                        bg: "bg-orange-500/10",
                    },
                    {
                        icon: Clock,
                        label: "Status",
                        value: "Active",
                        color: "text-green-500",
                        bg: "bg-green-500/10",
                    },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="glass-panel rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}
                            >
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                    {stat.label}
                                </p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
