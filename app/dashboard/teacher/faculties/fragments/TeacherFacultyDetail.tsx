"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Teacher, TeacherDesignation } from "@/services/user/teacher.service";
import { TeacherProfile } from "@/services/user/teacherProfile.service";
import {
    ArrowLeft,
    GraduationCap,
    Mail,
    Phone,
    Calendar,
    Network,
    User as UserIcon,
    Trash2,
    Clock,
    Globe,
    Lock,
    Edit3,
    Sparkles,
    RefreshCcw,
    Bookmark,
    Plus
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion } from "framer-motion";
import { updateTeacherIpAction, deleteTeacherAction } from "../actions";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";

interface TeacherFacultyDetailProps {
    teacher: Teacher;
    profile: TeacherProfile | null;
    departments: any[];
}

const designationLabel: Record<TeacherDesignation, string> = {
    professor: "Professor",
    associate_professor: "Associate Professor",
    assistant_professor: "Assistant Professor",
    lecturer: "Lecturer",
    senior_lecturer: "Senior Lecturer",
};

const designationColor: Record<TeacherDesignation, string> = {
    professor: "bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] border-[#2dd4bf]/20",
    associate_professor: "bg-blue-100/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
    assistant_professor: "bg-cyan-100/50 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50",
    lecturer: "bg-emerald-100/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
    senior_lecturer: "bg-teal-100/50 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50",
};

export function TeacherFacultyDetail({ teacher: initialTeacher, profile, departments }: TeacherFacultyDetailProps) {
    const router = useRouter();
    const [teacher, setTeacher] = useState(initialTeacher);
    const [ipInput, setIpInput] = useState("");
    const [isIpUpdating, setIsIpUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const departmentName = departments.find(d => (d.id || d._id) === teacher.departmentId)?.name || teacher.department?.name || teacher.departmentId;

    const handleAddIp = async () => {
        if (!ipInput.trim()) return;
        setIsIpUpdating(true);
        try {
            const formData = new FormData();
            formData.append("ip", ipInput.trim());
            formData.append("method", "add");
            const result = await updateTeacherIpAction(teacher.id, null, formData);
            if (result.success) {
                setTeacher({
                    ...teacher,
                    registeredIpAddress: [...(teacher.registeredIpAddress || []), ipInput.trim()]
                });
                setIpInput("");
                notifySuccess("IP address added");
            } else {
                notifyError(result.message || "Failed to add IP");
            }
        } catch (error) {
            notifyError("Failed to add IP address");
        } finally {
            setIsIpUpdating(false);
        }
    };

    const handleRemoveIp = async (ip: string) => {
        setIsIpUpdating(true);
        try {
            const formData = new FormData();
            formData.append("ip", ip);
            formData.append("method", "remove");
            const result = await updateTeacherIpAction(teacher.id, null, formData);
            if (result.success) {
                setTeacher({
                    ...teacher,
                    registeredIpAddress: teacher.registeredIpAddress?.filter(i => i !== ip) || []
                });
                notifySuccess("IP address removed");
            } else {
                notifyError(result.message || "Failed to remove IP");
            }
        } catch (error) {
            notifyError("Failed to remove IP address");
        } finally {
            setIsIpUpdating(false);
        }
    };

    const handleDeleteTeacher = async () => {
        if (!confirm(`Are you sure you want to delete ${teacher.fullName}?`)) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteTeacherAction(teacher.id, null, formData);
            if (result.success) {
                notifySuccess("Faculty member deleted");
                router.push("/dashboard/teacher/faculties");
            } else {
                notifyError(result.message || "Deletion failed");
            }
        } catch (error) {
            notifyError("An error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <GlassCard className="relative overflow-hidden p-8 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-[#2dd4bf]/10 blur-[100px] opacity-60 dark:opacity-20" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[#2dd4bf] dark:hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 dark:hover:border-[#2dd4bf]/30 transition-all shadow-lg shadow-slate-200/40 dark:shadow-slate-900/20 active:scale-95 group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className={`${teacher.designation ? designationColor[teacher.designation] : designationColor.lecturer} ring-1 ring-[#2dd4bf]/20 border-none px-3.5 py-1 rounded-full flex items-center gap-2 shadow-sm`}>
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                        {teacher.designation ? designationLabel[teacher.designation] : "FACULTY"}
                                    </span>
                                </Badge>
                                <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest">Registration Number: <span className="text-[#2dd4bf]">{teacher.registrationNumber}</span></span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                {teacher.fullName.split(' ')[0]}<span className="text-[#2dd4bf]"> {teacher.fullName.split(' ').slice(1).join(' ')}</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleDeleteTeacher}
                            disabled={isDeleting}
                            className="h-14 px-8 rounded-[1.5rem] border-2 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 font-black uppercase text-xs tracking-widest flex items-center gap-3 active:scale-95 transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Account
                        </Button>
                        <Button
                            onClick={() => router.push(`/dashboard/teacher/faculties/${teacher.id}/edit`)}
                            className="h-14 px-8 rounded-[1.5rem] bg-[#0d9488] dark:bg-[#2dd4bf] hover:bg-[#0f766e] dark:hover:bg-[#14b8a6] text-white dark:text-slate-900 shadow-xl shadow-teal-500/20 font-black uppercase text-xs tracking-widest flex items-center gap-3 active:scale-95 transition-all group"
                        >
                            <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/30 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <Bookmark className="w-64 h-64 text-slate-900 dark:text-white" />
                        </div>
                        <CardContent className="p-10 pt-16">
                            <div className="flex flex-col sm:flex-row gap-12 items-start">
                                <div className="relative flex-shrink-0 group/img">
                                    <div className="h-44 w-44 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl relative z-10 bg-slate-50 dark:bg-slate-800">
                                        {profile?.profilePicture ? (
                                            <img
                                                src={getImageUrl(profile.profilePicture)}
                                                alt={teacher.fullName}
                                                className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-[#2dd4bf] font-black text-6xl">
                                                {teacher.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-[1.5rem] bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 shadow-xl flex items-center justify-center text-[#2dd4bf] z-20 group-hover/img:scale-110 transition-transform animate-pulse-slow">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-10 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                                        <InfoBlock icon={Mail} label="Email" value={teacher.email} />
                                        <InfoBlock icon={Calendar} label="Joining Date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "N/A"} />
                                        <InfoBlock icon={Network} label="Department" value={departmentName} />
                                        <InfoBlock icon={Phone} label="Phone Number" value={teacher.phone || profile?.phoneNumber || "N/A"} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </GlassCard>

                    {profile && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard className="border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/30 relative group overflow-hidden p-10">
                                <div className="absolute top-0 left-0 p-10 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                    <UserIcon className="w-56 h-56 text-slate-900 dark:text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-950 dark:bg-[#2dd4bf] text-white dark:text-slate-900 flex items-center justify-center shadow-lg">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Personal Portfolio</h2>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm italic">Additional academic and personal identification records.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
                                        <ProfileItem label="First Name" value={profile.firstName} />
                                        <ProfileItem label="Middle Name" value={profile.middleName || "N/A"} />
                                        <ProfileItem label="Last Name" value={profile.lastName} />
                                        <ProfileItem label="Birth Orbit" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"} />
                                        <ProfileItem label="Biometric Gender" value={profile.gender || "N/A"} />
                                        <ProfileItem label="Account Status" value="ACTIVE" highlighted />
                                    </div>

                                    {profile.addresses && profile.addresses.length > 0 && (
                                        <div className="mt-12 pt-10 border-t border-slate-200/60 dark:border-slate-800/50">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">Address</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {profile.addresses.map((addr, idx) => (
                                                    <div key={idx} className="p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/30 border-2 border-slate-100 dark:border-slate-800/50 hover:border-[#2dd4bf]/20 transition-colors group/addr shadow-sm">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/addr:text-[#2dd4bf] transition-colors ring-1 ring-slate-100 dark:ring-slate-700">
                                                                <Globe className="w-4 h-4" />
                                                            </div>
                                                            {addr.isPrimary && (
                                                                <Badge className="bg-slate-950 dark:bg-[#2dd4bf]/10 text-white dark:text-[#2dd4bf] font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none">Primary Home</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">
                                                            {[addr.street, addr.city, addr.state].filter(Boolean).join(', ')}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{addr.country} • {addr.zipCode}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </div>

                <div className="space-y-8">
                    <GlassCard className="bg-slate-950 dark:bg-slate-900/80 text-white border-slate-800 dark:border-slate-800/80 rounded-[2.5rem] shadow-2xl relative overflow-hidden group p-10">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.1] group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
                            <Clock className="w-40 h-40 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Last Login</p>
                                <RefreshCcw className="w-4 h-4 text-[#2dd4bf] animate-spin-slow" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">
                                {teacher.lastLoginAt ? new Date(teacher.lastLoginAt).toLocaleString() : "NEVER DETECTED"}
                            </h3>
                            <p className="text-[#2dd4bf] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2.5">
                                <span className="h-2 w-2 rounded-full bg-[#2dd4bf] shadow-[0_0_12px_rgba(45,212,191,0.8)] animate-pulse" />
                                Last Login IP: {teacher.lastLoginIp || "N/A"}
                            </p>
                        </div>
                    </GlassCard>

                    <GlassCard className="border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/30 overflow-hidden group p-10">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ring-1 ring-[#2dd4bf]/20">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Access Control</h3>
                                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em]">Network Access Control</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-2 relative">
                                    <Input
                                        placeholder="Add IP Address..."
                                        value={ipInput}
                                        onChange={(e) => setIpInput(e.target.value)}
                                        className="h-14 px-6 rounded-[1.25rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20 focus:border-[#2dd4bf]/30 transition-all pr-16"
                                        disabled={isIpUpdating}
                                    />
                                    <button
                                        onClick={handleAddIp}
                                        disabled={isIpUpdating}
                                        className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-slate-950 dark:bg-[#2dd4bf] text-white dark:text-slate-900 flex items-center justify-center hover:bg-[#0d9488] dark:hover:bg-[#14b8a6] transition-all active:scale-95 z-10 shadow-lg shadow-teal-500/20"
                                    >
                                        {isIpUpdating ? (
                                            <RefreshCcw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2.5 min-h-[50px]">
                                    {teacher.registeredIpAddress && teacher.registeredIpAddress.length > 0 ? (
                                        teacher.registeredIpAddress.map((ip) => (
                                            <Badge key={ip} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-3 transition-all hover:border-rose-200/50 dark:hover:border-rose-900/50 group/ip shadow-sm">
                                                {ip}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIp(ip)}
                                                    className="text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-colors group-hover/ip:text-rose-500"
                                                    disabled={isIpUpdating}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="w-full py-10 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3">
                                            <Globe className="w-7 h-7 text-slate-200 dark:text-slate-800" />
                                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] leading-none text-center px-4">Encryption Open • No IP Layer active</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="group/block">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-[#2dd4bf] group-hover/block:scale-110 transition-transform" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover/block:text-[#0d9488] dark:group-hover/block:text-[#2dd4bf] transition-colors">{label}</p>
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white truncate pl-7">{value}</p>
        </div>
    );
}

function ProfileItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-2 group/item">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 group-hover/item:text-[#2dd4bf] transition-colors">{label}</p>
            <p className={`text-base font-black transition-colors leading-tight ${highlighted ? 'text-[#0d9488] dark:text-[#2dd4bf] italic tracking-tight' : 'text-slate-900 dark:text-white'}`}>{value}</p>
        </div>
    );
}
