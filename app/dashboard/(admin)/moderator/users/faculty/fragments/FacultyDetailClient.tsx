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
    MapPin,
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

interface FacultyDetailClientProps {
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

export function FacultyDetailClient({ teacher: initialTeacher, profile, departments }: FacultyDetailClientProps) {
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
                router.push("/dashboard/moderator/users/faculty");
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                                <GraduationCap className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {teacher.designation ? designationLabel[teacher.designation] : "FACULTY"}
                                </span>
                            </Badge>
                            <span className="text-slate-300 font-black text-xs uppercase tracking-widest">ID: {teacher.registrationNumber}</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{teacher.fullName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDeleteTeacher}
                        disabled={isDeleting}
                        className="h-14 px-8 rounded-[2rem] border-2 border-red-100 text-red-600 hover:bg-red-50 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete Account
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/moderator/users/faculty/${teacher.id}/edit`)}
                        className="h-14 px-8 rounded-[2rem] bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group"
                    >
                        <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            <Bookmark className="w-48 h-48 text-slate-900" />
                        </div>
                        <CardContent className="p-10 pt-16">
                            <div className="flex flex-col sm:flex-row gap-10 items-start">
                                <div className="relative flex-shrink-0 group/img">
                                    <div className="h-40 w-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-slate-50">
                                        {profile?.profilePicture ? (
                                            <img
                                                src={getImageUrl(profile.profilePicture)}
                                                alt={teacher.fullName}
                                                className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-amber-600 font-black text-5xl">
                                                {teacher.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-white border-2 border-slate-50 shadow-xl flex items-center justify-center text-amber-600 z-20 group-hover/img:scale-110 transition-transform">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <InfoBlock icon={Mail} label="Email Address" value={teacher.email} />
                                        <InfoBlock icon={Calendar} label="Joining Date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "N/A"} />
                                        <InfoBlock icon={Network} label="Department" value={departmentName} />
                                        <InfoBlock icon={Phone} label="Phone Number" value={teacher.phone || profile?.phoneNumber || "N/A"} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {profile && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 relative group overflow-hidden">
                                <div className="absolute top-0 left-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                    <UserIcon className="w-40 h-40 text-slate-900" />
                                </div>
                                <CardContent className="p-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900">Personal Details</h2>
                                            <p className="text-slate-500 font-bold text-sm italic">Additional information for faculty records.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                        <ProfileItem label="First Name" value={profile.firstName} />
                                        <ProfileItem label="Middle Name" value={profile.middleName || "N/A"} />
                                        <ProfileItem label="Last Name" value={profile.lastName} />
                                        <ProfileItem label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toDateString() : "N/A"} />
                                        <ProfileItem label="Gender" value={profile.gender || "N/A"} />
                                        <ProfileItem label="Status" value="ACTIVE" highlighted />
                                    </div>

                                    {profile.addresses && profile.addresses.length > 0 && (
                                        <div className="mt-12 pt-10 border-t border-slate-100">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">Addresses</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {profile.addresses.map((addr, idx) => (
                                                    <div key={idx} className="p-6 rounded-3xl bg-slate-50/50 border-2 border-slate-100 hover:border-amber-500/20 transition-colors group/addr">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover/addr:text-amber-600 transition-colors">
                                                                <Globe className="w-4 h-4" />
                                                            </div>
                                                            {addr.isPrimary && (
                                                                <Badge className="bg-slate-900 text-white font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md">Primary Address</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-black text-slate-800 leading-tight">
                                                            {[addr.street, addr.city, addr.state].filter(Boolean).join(', ')}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{addr.country} • {addr.zipCode}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                <div className="space-y-8">
                    <Card className="bg-slate-900 text-white border-none rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <Clock className="w-32 h-32" />
                        </div>
                        <CardContent className="p-10 relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Login Status</p>
                                <RefreshCcw className="w-4 h-4 text-amber-500 animate-spin-slow" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 leading-tight uppercase">
                                {teacher.lastLoginAt ? new Date(teacher.lastLoginAt).toLocaleString() : "NEVER LOGGED IN"}
                            </h3>
                            <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                Last IP: {teacher.lastLoginIp || "N/A"}
                            </p>

                            <div className="mt-12 space-y-1">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Database ID</p>
                                <p className="text-[10px] font-mono text-slate-400 truncate opacity-50">{teacher.id}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden group">
                        <CardContent className="p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">IP Restrictions</h3>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Allowed IP Addresses</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-2 relative">
                                    <Input
                                        placeholder="Add network node (IP)..."
                                        value={ipInput}
                                        onChange={(e) => setIpInput(e.target.value)}
                                        className="h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-900 focus:ring-amber-500/20 transition-all pr-16"
                                        disabled={isIpUpdating}
                                    />
                                    <button
                                        onClick={handleAddIp}
                                        disabled={isIpUpdating}
                                        className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-amber-600 transition-all active:scale-95 z-10"
                                    >
                                        {isIpUpdating ? (
                                            <RefreshCcw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[50px]">
                                    {teacher.registeredIpAddress && teacher.registeredIpAddress.length > 0 ? (
                                        teacher.registeredIpAddress.map((ip) => (
                                            <Badge key={ip} className="bg-white border-2 border-slate-100 text-slate-700 font-black text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-3 transition-all hover:border-red-200 group/ip">
                                                {ip}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIp(ip)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors group-hover/ip:text-red-400"
                                                    disabled={isIpUpdating}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="w-full py-8 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-2">
                                            <Globe className="w-6 h-6 text-slate-200" />
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none text-center">No IP Restrictions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
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
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover/block:text-amber-500 transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/block:text-slate-600 transition-colors">{label}</p>
            </div>
            <p className="text-base font-black text-slate-900 truncate pl-6.5">{value}</p>
        </div>
    );
}

function ProfileItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className={`text-sm font-black transition-colors ${highlighted ? 'text-amber-600 italic' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}
