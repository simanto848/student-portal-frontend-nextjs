"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Loader2,
    User,
    BookOpen,
    Users,
    Calendar,
    Mail,
    GraduationCap,
    CheckCircle2,
    AlertCircle,
    XCircle,
    History,
    Fingerprint,
    Cpu,
    Satellite,
    Zap,
    LucideIcon
} from "lucide-react";
import { format } from "date-fns";
import { notifySuccess, notifyError, notifyWarning } from "@/components/toast";
import { updateEnrollmentAction, deleteEnrollmentAction } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

interface EnrollmentDetailClientProps {
    enrollment: any;
    student: any;
    course: any;
    batch: any;
}

export function EnrollmentDetailClient({
    enrollment,
    student,
    course,
    batch
}: EnrollmentDetailClientProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Edit Form State
    const [editStatus, setEditStatus] = useState(enrollment.status);
    const [editSemester, setEditSemester] = useState(enrollment.semester);
    const [editAcademicYear, setEditAcademicYear] = useState(enrollment.academicYear || "");

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to terminate this presence lifecycle? This action is irreversible.")) return;

        setIsDeleting(true);
        try {
            const result = await deleteEnrollmentAction(enrollment.id);
            if (result.success) {
                notifySuccess("Presence lifecycle terminated successfully");
                router.push("/dashboard/admin/enrollment/enrollments");
                router.refresh();
            } else {
                notifyError(result.message || "Termination failure");
            }
        } catch (error) {
            notifyError("A system error occurred during termination");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const result = await updateEnrollmentAction(enrollment.id, {
                status: editStatus,
                semester: Number(editSemester),
                academicYear: editAcademicYear
            });

            if (result.success) {
                notifySuccess("Temporal configuration updated");
                setIsEditing(false);
                router.refresh();
            } else {
                notifyError(result.message || "Configuration update failure");
            }
        } catch (error) {
            notifyError("A system error occurred during configuration update");
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "enrolled":
                return { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2, label: "Active Presence" };
            case "completed":
                return { color: "text-blue-500", bg: "bg-blue-500/10", icon: Satellite, label: "Mission Accomplished" };
            case "dropped":
                return { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertCircle, label: "Aborted Presence" };
            case "failed":
                return { color: "text-rose-500", bg: "bg-rose-500/10", icon: XCircle, label: "Critical Failure" };
            default:
                return { color: "text-slate-500", bg: "bg-slate-500/10", icon: History, label: status };
        }
    };

    const statusConfig = getStatusConfig(enrollment.status);

    const DetailItem = ({ label, value, icon: Icon, mono = false }: { label: string, value: string | number, icon: LucideIcon, mono?: boolean }) => (
        <div className="group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block flex items-center gap-2">
                <Icon className="w-3 h-3 text-slate-300 group-hover:text-amber-500 transition-colors" />
                {label}
            </label>
            <div className={`text-sm font-black text-slate-800 tracking-tight ${mono ? 'font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit' : ''}`}>
                {value || "---"}
            </div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lifecycle Intelligence</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Induction Details</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        className={`h-14 px-8 rounded-2xl border-2 font-black tracking-tight transition-all active:scale-95 ${isEditing ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-500' : 'bg-white text-slate-600 border-slate-100 hover:border-amber-500/30 hover:text-amber-600 shadow-lg shadow-slate-200/40'}`}
                    >
                        {isEditing ? <Zap className="w-5 h-5 mr-3" /> : <Edit className="w-5 h-5 mr-3" />}
                        {isEditing ? "Abort Configuration" : "Alter Configuration"}
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        variant="destructive"
                        className="h-14 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black tracking-tight shadow-xl shadow-rose-200/40 active:scale-95 transition-all"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5 mr-3" />}
                        Terminate
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key="edit-form"
                            >
                                <Card className="bg-slate-900 border-2 border-slate-800 rounded-[3rem] shadow-2xl shadow-slate-900/40 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.05] rotate-12">
                                        <Cpu className="w-40 h-40 text-white" />
                                    </div>
                                    <CardHeader className="p-10 pb-0 relative z-10">
                                        <CardTitle className="text-2xl font-black text-white tracking-tight">System Override</CardTitle>
                                        <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Updating temporal induction parameters</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-10 space-y-8 relative z-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Temporal Phase</label>
                                                <Input
                                                    type="number"
                                                    value={editSemester}
                                                    onChange={(e) => setEditSemester(Number(e.target.value))}
                                                    className="bg-slate-800/50 border-slate-700 h-14 rounded-2xl font-black focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Frequency</label>
                                                <Input
                                                    value={editAcademicYear}
                                                    onChange={(e) => setEditAcademicYear(e.target.value)}
                                                    className="bg-slate-800/50 border-slate-700 h-14 rounded-2xl font-black focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lifecycle Status</label>
                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                <SelectTrigger className="bg-slate-800/50 border-slate-700 h-14 rounded-2xl font-black text-white focus:ring-amber-500/50 focus:border-amber-500 transition-all capitalize">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                    <SelectItem value="enrolled" className="focus:bg-amber-500 focus:text-white capitalize">Enrolled</SelectItem>
                                                    <SelectItem value="completed" className="focus:bg-amber-500 focus:text-white capitalize">Completed</SelectItem>
                                                    <SelectItem value="dropped" className="focus:bg-amber-500 focus:text-white capitalize">Dropped</SelectItem>
                                                    <SelectItem value="failed" className="focus:bg-amber-500 focus:text-white capitalize">Failed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="pt-6">
                                            <Button
                                                onClick={handleUpdate}
                                                disabled={isUpdating}
                                                className="w-full h-16 rounded-[1.5rem] bg-amber-600 hover:bg-amber-500 text-white font-black tracking-tight text-lg shadow-xl shadow-amber-900/40 transition-all active:scale-[0.98]"
                                            >
                                                {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Commit Configuration"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                key="view-details"
                                className="space-y-10"
                            >
                                {/* Intelligence Hub */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden group">
                                        <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                                                    <GraduationCap className="w-6 h-6" />
                                                </div>
                                                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Student Intel</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-10 space-y-8">
                                            <DetailItem label="Presence Name" value={student?.fullName} icon={User} />
                                            <DetailItem label="Protocol ID" value={student?.registrationNumber} icon={Fingerprint} mono />
                                            <DetailItem label="Neural Link" value={student?.email} icon={Mail} />
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden group">
                                        <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Stream Intel</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-10 space-y-8">
                                            <DetailItem label="Global Stream" value={course?.name} icon={BookOpen} />
                                            <DetailItem label="Stream Signature" value={course?.code} icon={Zap} mono />
                                            <div className="grid grid-cols-2 gap-4">
                                                <DetailItem label="Complexity" value={`${course?.credit || 'N/A'} Credits`} icon={Cpu} />
                                                <DetailItem label="Origin" value={course?.courseType || "Standard"} icon={Satellite} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden group">
                                    <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Cohort Intel</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <DetailItem label="Target Cohort" value={batch?.name || batch?.code} icon={Users} />
                                            <DetailItem label="Active Phase" value={`Phase ${batch?.currentSemester || enrollment.semester}`} icon={Calendar} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Status & Metrics Side Panel */}
                <div className="space-y-10">
                    <Card className="bg-white/70 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black text-slate-800 tracking-tight leading-none text-center">Lifecycle Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 flex flex-col items-center">
                            <div className={`h-24 w-24 rounded-[2rem] ${statusConfig.bg} flex items-center justify-center ${statusConfig.color} mb-6 shadow-inner`}>
                                <statusConfig.icon className="w-12 h-12" />
                            </div>
                            <h3 className={`text-2xl font-black tracking-tighter ${statusConfig.color}`}>{statusConfig.label}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Current Presence State</p>

                            <div className="w-full mt-10 pt-10 border-t-2 border-slate-50 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Induction Date</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-800 tracking-tight">
                                        {enrollment.enrollmentDate ? format(new Date(enrollment.enrollmentDate), "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                                {enrollment.completionDate && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completion</span>
                                        </div>
                                        <span className="text-sm font-black text-emerald-600 tracking-tight">
                                            {format(new Date(enrollment.completionDate), "MMM dd, yyyy")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata Card */}
                    <Card className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Fingerprint className="w-5 h-5 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Trace</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 break-all leading-relaxed">UUID: {enrollment.id}</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
