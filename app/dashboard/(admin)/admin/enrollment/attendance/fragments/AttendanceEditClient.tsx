"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Attendance } from "@/services/enrollment/attendance.service";
import {
    Loader2,
    Save,
    ArrowLeft,
    Sparkles,
    User,
    BookOpen,
    Users,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    FileText
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion } from "framer-motion";
import { updateAttendanceAction } from "../actions";

interface AttendanceEditClientProps {
    attendance: Attendance;
}

export function AttendanceEditClient({ attendance }: AttendanceEditClientProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Form Data
    const [status, setStatus] = useState(attendance.status);
    const [remarks, setRemarks] = useState(attendance.remarks || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const result = await updateAttendanceAction(attendance.id, { status, remarks });
            if (result.success) {
                notifySuccess("Intelligence calibrated correctly");
                router.push("/dashboard/admin/enrollment/attendance");
            } else {
                notifyError(result.message || "Calibration failed");
            }
        } catch (error: any) {
            notifyError("Critical system error during calibration");
        } finally {
            setIsSaving(false);
        }
    };

    const statusConfig: Record<string, { icon: any, color: string, activeClass: string, label: string }> = {
        present: { label: "Present", icon: CheckCircle2, color: "text-emerald-500", activeClass: "bg-emerald-100 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-100" },
        absent: { label: "Absent", icon: XCircle, color: "text-rose-500", activeClass: "bg-rose-100 border-rose-500 text-rose-700 shadow-sm shadow-rose-100" },
        late: { label: "Late", icon: Clock, color: "text-amber-500", activeClass: "bg-amber-100 border-amber-500 text-amber-700 shadow-sm shadow-amber-100" },
        excused: { label: "Excused", icon: FileText, color: "text-blue-500", activeClass: "bg-blue-100 border-blue-500 text-blue-700 shadow-sm shadow-blue-100" },
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Refinement</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Calibrate Presence</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Information Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="bg-white/50 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10 space-y-8">
                        <div className="flex items-center gap-5 pb-8 border-b border-slate-100">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-slate-900/20">
                                {attendance.student?.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{attendance.student?.fullName || "Anonymous Intel"}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">#{attendance.student?.studentId || "UNREGISTERED"}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <InfoRow icon={BookOpen} label="Environment" value={attendance.course?.name || "Global Stream"} />
                            <InfoRow icon={Users} label="Cohort" value={attendance.batch?.name || "Ungrouped"} />
                            <InfoRow icon={Calendar} label="Temporal Stamp" value={new Date(attendance.date).toLocaleDateString(undefined, { dateStyle: 'full' })} />
                        </div>
                    </Card>
                </motion.div>

                {/* Adjustment Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 rotate-12">
                            <Sparkles className="w-40 h-40 text-slate-900" />
                        </div>

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
                            <div className="space-y-6">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Status Calibration</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(statusConfig).map(([s, config]) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatus(s as any)}
                                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group/btn ${status === s
                                                ? config.activeClass
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:bg-amber-50'
                                                }`}
                                        >
                                            <config.icon className={`h-6 w-6 ${status === s ? '' : 'opacity-40 group-hover/btn:opacity-100 transition-opacity'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Observation Details</Label>
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter analytical notes..."
                                    className="min-h-[150px] border-2 border-slate-100 rounded-[2rem] p-6 focus:border-amber-500/50 focus:ring-amber-500/10 transition-all font-bold text-slate-800"
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all text-[10px]"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 h-16 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 active:scale-95 transition-all text-[10px] flex items-center justify-center gap-3"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Update Intelligence
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 group/row">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover/row:scale-110 transition-transform">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
