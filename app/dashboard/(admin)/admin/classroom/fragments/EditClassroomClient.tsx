"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MultiSearchableSelect } from "@/components/ui/multi-searchable-select";
import { Loader2, ArrowLeft, Save, Sparkles, Shield, UserCheck, Zap } from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { updateWorkspaceAction } from "../actions";
import { motion } from "framer-motion";

interface EditClassroomClientProps {
    workspace: any;
    teachers: any[];
}

export function EditClassroomClient({ workspace, teachers }: EditClassroomClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState(workspace.title || "");
    const [allowLateSubmission, setAllowLateSubmission] = useState(workspace.settings?.allowLateSubmission ?? false);
    const [lateGraceMinutes, setLateGraceMinutes] = useState(workspace.settings?.lateGraceMinutes ?? 0);
    const [maxAttachmentSizeMB, setMaxAttachmentSizeMB] = useState(workspace.settings?.maxAttachmentSizeMB ?? 10);
    const [selectedTeachers, setSelectedTeachers] = useState<string[]>(workspace.teacherIds || []);

    const handleSave = async () => {
        if (!title) {
            notifyError("Workspace title is required for synthesis");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("id", workspace.id);
            formData.append("title", title);
            formData.append("allowLateSubmission", String(allowLateSubmission));
            formData.append("lateGraceMinutes", String(lateGraceMinutes));
            formData.append("maxAttachmentSizeMB", String(maxAttachmentSizeMB));

            // For multi-select, we might need a specific way to pass it to server action if using createFormAction
            // But let's assume updateWorkspaceAction handles it or we'll adapt it
            selectedTeachers.forEach(id => formData.append("teacherIds", id));

            const result = await updateWorkspaceAction(workspace.id, null, formData);
            if (result.success) {
                notifySuccess("Infrastructure reconfigured successfully");
                router.push(`/dashboard/admin/classroom/${workspace.id}`);
                router.refresh();
            } else {
                notifyError(result.message || "Configuration update failed");
            }
        } catch (error: any) {
            notifyError("A catastrophic failure occurred during reconfiguration");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-10 pb-20"
        >
            <div className="flex items-center gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/admin/classroom/${workspace.id}`)}
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all text-slate-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4 outline-none">
                        Reconfigure Workspace
                        <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                    </h1>
                    <p className="text-slate-500 font-bold mt-1">Adjusting the divine parameters of {workspace.title}.</p>
                </div>
            </div>

            <div className="grid gap-10">
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl group">
                    <div className="h-3 bg-slate-900 group-hover:bg-amber-600 transition-colors duration-700" />
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-2xl font-black flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-500" />
                            Core Identity
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-bold">Modify the primary designation of this workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-4">
                        <div className="space-y-4">
                            <Label htmlFor="title" className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Workspace Designation</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Advanced Quantum Mechanics"
                                className="h-14 px-6 rounded-2xl border-slate-200 focus:ring-amber-500 focus:border-amber-500 font-bold text-lg shadow-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl group">
                    <div className="h-3 bg-slate-100 group-hover:bg-amber-500 transition-colors duration-700" />
                    <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
                            <UserCheck className="w-6 h-6 text-emerald-500" />
                            Faculty Allocation
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-bold">Designate instructors with total administrative authority.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-4">
                        <div className="space-y-4">
                            <Label className="text-sm font-black uppercase tracking-widest text-slate-400 ml-1">Authorized Teachers</Label>
                            <MultiSearchableSelect
                                options={teachers.map((t: any) => ({
                                    label: `${t.fullName} (${t.email})`,
                                    value: t.id
                                }))}
                                value={selectedTeachers}
                                onChange={setSelectedTeachers}
                                placeholder="Select authorized faculty..."
                            />
                            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/30 flex gap-3">
                                <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs font-bold text-amber-800/70 leading-relaxed italic">
                                    Assigned faculty inherit complete sovereignty over roster evaluations, content sharing, and assessment orchestration.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-slate-900 text-white relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent pointer-events-none" />
                    <CardHeader className="p-10 pb-4 border-b border-white/5">
                        <CardTitle className="text-2xl font-black flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-500" />
                            Submission Protocols
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-bold">Configure the logistical constraints for academic submissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-12">
                        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors">
                            <div className="space-y-1">
                                <Label className="text-xl font-black text-white">Leniency Override</Label>
                                <p className="text-sm font-bold text-slate-400">
                                    Permit scholarly submissions past the designated terminal date.
                                </p>
                            </div>
                            <Switch
                                checked={allowLateSubmission}
                                onCheckedChange={setAllowLateSubmission}
                                className="data-[state=checked]:bg-amber-500 shadow-xl shadow-amber-500/20"
                            />
                        </div>

                        {allowLateSubmission && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4 px-6 py-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20"
                            >
                                <Label htmlFor="gracePeriod" className="text-sm font-black uppercase tracking-widest text-amber-500/70">Temporal Grace (Minutes)</Label>
                                <Input
                                    id="gracePeriod"
                                    type="number"
                                    min="0"
                                    value={lateGraceMinutes}
                                    onChange={(e) => setLateGraceMinutes(parseInt(e.target.value) || 0)}
                                    className="h-14 px-6 rounded-2xl bg-white/5 border-white/10 text-white font-black text-lg focus:ring-amber-500"
                                />
                                <p className="text-xs font-bold text-slate-500 italic">Temporal window allowed before a submission is flagged as non-synchronous.</p>
                            </motion.div>
                        )}

                        <div className="space-y-4 px-6">
                            <Label htmlFor="maxSize" className="text-sm font-black uppercase tracking-widest text-slate-500">Volumetric Limit (MB)</Label>
                            <div className="flex items-center gap-6">
                                <Input
                                    id="maxSize"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={maxAttachmentSizeMB}
                                    onChange={(e) => setMaxAttachmentSizeMB(parseInt(e.target.value) || 10)}
                                    className="h-14 w-32 px-6 rounded-2xl bg-white/5 border-white/10 text-white font-black text-lg focus:ring-amber-500"
                                />
                                <div className="flex-1">
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(maxAttachmentSizeMB / 100) * 100}%` }}
                                            className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mt-2 tracking-widest text-right">{maxAttachmentSizeMB}% OF MAX SYSTEM CAPACITY</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-6 flex justify-end gap-4 border-t border-white/5 bg-white/[0.02]">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/dashboard/admin/classroom/${workspace.id}`)}
                            className="h-14 px-8 rounded-2xl text-slate-400 font-black hover:text-white hover:bg-white/5 transition-all"
                        >
                            Abort Changes
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-14 px-10 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-xl shadow-amber-900/40 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Sync Infrastructure
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </motion.div>
    );
}
