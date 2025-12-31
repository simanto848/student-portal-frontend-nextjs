"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExamCommittee } from "@/services/academic/types";
import { Label } from "@/components/ui/label";
import { User, Mail, Hash, Building2, Clock, Layers, ShieldCheck } from "lucide-react";

interface ExamCommitteeViewModalProps {
    member: ExamCommittee | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ExamCommitteeViewModal({
    member,
    isOpen,
    onClose,
}: ExamCommitteeViewModalProps) {
    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-max-w-[425px] rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
                <div className="bg-slate-900 p-6 text-white relative h-32 flex items-end">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="w-24 h-24" />
                    </div>
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Member Profile</DialogTitle>
                        <p className="text-slate-400 text-sm font-medium">Exam Committee Records</p>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <User className="w-3 h-3" /> Teacher Name
                            </Label>
                            <p className="text-sm font-bold text-slate-900">{member.teacher?.fullName || "Unknown"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Mail className="w-3 h-3" /> Email Address
                            </Label>
                            <p className="text-sm font-medium text-slate-600 truncate">{member.teacher?.email || "N/A"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" /> Department
                            </Label>
                            <p className="text-sm font-bold text-slate-700">{member.department?.name || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Shift
                            </Label>
                            <div>
                                <Badge variant="outline" className="capitalize bg-slate-50 text-slate-700 border-slate-200 py-0 font-bold">
                                    {member.shift}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <Layers className="w-3 h-3" /> Batch Context
                            </Label>
                            <p className="text-sm font-bold text-slate-700">
                                {member.batch ? member.batch.name : <span className="text-slate-400 font-medium">General / All Batches</span>}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" /> Assignment Status
                            </Label>
                            <div>
                                <Badge className={`font-bold rounded-lg shadow-none ${member.status
                                        ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                                    }`}>
                                    {member.status ? "Active Member" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-2 space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unique Identifier</Label>
                        <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                            <code className="text-[10px] text-slate-500 font-mono break-all">{member.id}</code>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
