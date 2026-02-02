"use client";

import { useState } from "react";
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
import { Admin as Moderator } from "@/services/user/admin.service";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Trash2,
    User as UserIcon,
    Edit3,
    Sparkles,
    Shield,
    Clock,
    Hash,
    Ban,
    Unlock,
    Settings2
} from "lucide-react";
import { getImageUrl, cn } from "@/lib/utils";
import { adminService } from "@/services/user/admin.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import { deleteModeratorAction } from "../actions";

interface ModeratorDetailClientProps {
    moderator: Moderator;
}

export function ModeratorDetailClient({
    moderator: initialModerator
}: ModeratorDetailClientProps) {
    const router = useRouter();
    const [moderator, setModerator] = useState(initialModerator);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${moderator.fullName}?`)) return;
        setIsDeleting(true);
        try {
            const result = await deleteModeratorAction(moderator.id, null, new FormData());
            if (result.success) {
                notifySuccess("Moderator deleted successfully");
                router.push("/dashboard/admin/users/moderators");
            } else {
                notifyError(result.message || "Deletion failed");
            }
        } catch (error) {
            notifyError("An error occurred during deletion");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBlockToggle = async () => {
        try {
            if (moderator.isBlocked) {
                await adminService.unblockUser("admin", moderator.id);
                setModerator({ ...moderator, isBlocked: false });
                notifySuccess("Moderator unblocked");
            } else {
                const reason = window.prompt("Enter block reason:");
                if (!reason) return;
                await adminService.blockUser("admin", moderator.id, reason);
                setModerator({ ...moderator, isBlocked: true, blockReason: reason });
                notifySuccess("Moderator blocked");
            }
        } catch (error) {
            notifyError("Action failed");
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                                <Shield className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Moderator Profile</span>
                            </Badge>
                            <span className="text-slate-300 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                                <Hash className="w-3 h-3" />
                                {moderator.registrationNumber}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{moderator.fullName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleBlockToggle}
                        className={cn(
                            "h-14 px-6 rounded-2xl border-2 font-black tracking-tight transition-all active:scale-95",
                            moderator.isBlocked ? "border-emerald-100 text-emerald-600 hover:bg-emerald-50" : "border-red-100 text-red-600 hover:bg-red-50"
                        )}
                    >
                        {moderator.isBlocked ? <Unlock className="w-5 h-5 mr-2" /> : <Ban className="w-5 h-5 mr-2" />}
                        {moderator.isBlocked ? "Unblock Moderator" : "Block Moderator"}
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/admin/users/moderators/${moderator.id}/edit`)}
                        className="h-14 px-8 rounded-[2rem] bg-slate-900 hover:bg-blue-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group"
                    >
                        <Settings2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Edit Moderator
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/10 via-slate-100 to-blue-500/5" />
                        <CardContent className="p-10 pt-16">
                            <div className="flex flex-col sm:flex-row gap-10 items-start">
                                <div className="relative flex-shrink-0 group">
                                    <div className="h-44 w-44 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                                        {moderator.profile?.profilePicture ? (
                                            <img
                                                src={getImageUrl(moderator.profile.profilePicture)}
                                                alt={moderator.fullName}
                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-600 font-black text-5xl">
                                                {moderator.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-white border-2 border-slate-50 shadow-xl flex items-center justify-center text-blue-600 z-20 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-7 h-7" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8 pt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <InfoBlock icon={Mail} label="Email Address" value={moderator.email} />
                                        <InfoBlock icon={Calendar} label="Joining Date" value={moderator.joiningDate ? new Date(moderator.joiningDate).toLocaleDateString() : "N/A"} />
                                        <InfoBlock icon={Shield} label="Account Role" value={moderator.role.toUpperCase()} />
                                        <InfoBlock icon={Phone} label="Phone Number" value={moderator.profile?.phoneNumber || "N/A"} />
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-4">
                                        <Badge className="px-4 py-2 rounded-xl bg-blue-50 border-2 border-blue-100/50 text-blue-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                            <Shield className="w-3 h-3" />
                                            System Moderator
                                        </Badge>
                                        <Badge className={cn(
                                            "px-4 py-2 rounded-xl border-none font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm",
                                            moderator.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            <span className={cn("h-1.5 w-1.5 rounded-full", moderator.isBlocked ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
                                            {moderator.isBlocked ? "Account Blocked" : "Active Session"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-slate-100/50 p-1.5 rounded-[2rem] gap-2 mb-8 inline-flex">
                            <TabsTrigger value="overview" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">Overview</TabsTrigger>
                            <TabsTrigger value="security" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xl transition-all">Security & IP</TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent value="overview" key="overview">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <SummaryItem label="First Name" value={moderator.profile?.firstName || "N/A"} icon={UserIcon} />
                                            <SummaryItem label="Last Name" value={moderator.profile?.lastName || "N/A"} icon={UserIcon} />
                                            <SummaryItem label="Last Login" value={moderator.lastLoginAt ? new Date(moderator.lastLoginAt).toLocaleString() : "Never"} icon={Clock} />
                                            <SummaryItem label="Last Login IP" value={moderator.lastLoginIp || "N/A"} icon={Globe} />
                                        </div>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="security" key="security">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10">
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Registered Access IPs</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {moderator.registeredIpAddress?.length ? moderator.registeredIpAddress.map(ip => (
                                                    <Badge key={ip} variant="outline" className="px-4 py-2 rounded-xl bg-slate-50 border-slate-200 text-slate-700 font-mono">
                                                        {ip}
                                                    </Badge>
                                                )) : <p className="text-slate-400 italic text-sm">No IP addresses registered</p>}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </div>

                <div className="space-y-8">
                    <Card className="bg-slate-900 text-white border-none rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <Clock className="w-32 h-32" />
                        </div>
                        <CardContent className="p-10 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 px-1">User Details</p>
                            <div className="space-y-6">
                                <StatItem label="Created On" value={new Date(moderator.createdAt || "").toDateString()} />
                                <StatItem label="Account Type" value="System Moderator" />
                                <StatItem label="Status" value={moderator.isBlocked ? "LOCKED" : "VERIFIED"} highlighted={!moderator.isBlocked} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10 overflow-hidden relative group">
                        <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                            <Sparkles className="w-40 h-40" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 underline decoration-blue-500/30 decoration-4 underline-offset-4">Quick Actions</h3>
                        <div className="space-y-4 relative z-10">
                            <ActionButton label="View Activity Log" icon={Shield} color="slate" />
                            <ActionButton label="Reset Password" icon={Settings2} color="slate" />
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="w-full h-14 rounded-2xl font-black tracking-widest uppercase text-[10px]"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                            </Button>
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
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover/block:text-blue-500 transition-colors" />
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
                <Icon className={`w-3.5 h-3.5 ${highlighted ? 'text-blue-500' : 'text-slate-400'}`} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            </div>
            <p className={`text-base font-black px-1 ${highlighted ? 'text-blue-600' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
}

function StatItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
            <p className={`text-sm font-black leading-none ${highlighted ? 'text-blue-500' : 'text-white'}`}>{value}</p>
        </div>
    );
}

function ActionButton({ label, icon: Icon, color, onClick }: { label: string; icon: any; color: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between px-6 group hover:bg-slate-900 hover:text-white transition-all active:scale-95 duration-500`}>
            <div className="flex items-center gap-4">
                <Icon className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors`} />
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
        </button>
    );
}

import { Globe } from "lucide-react";
