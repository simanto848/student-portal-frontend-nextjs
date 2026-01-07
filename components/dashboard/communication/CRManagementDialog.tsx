"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, UserMinus, UserCheck, Users, SearchIcon, X } from "lucide-react";
import { Batch } from "@/services/academic/types";
import { batchService } from "@/services/academic/batch.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { motion, AnimatePresence } from "framer-motion";

interface CRManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: Batch | null;
    onSuccess: () => void;
}

export function CRManagementDialog({ open, onOpenChange, batch, onSuccess }: CRManagementDialogProps) {
    const theme = useDashboardTheme();
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open && batch) {
            fetchStudents();
        }
    }, [open, batch]);

    const fetchStudents = async () => {
        if (!batch) return;
        setLoading(true);
        try {
            const data = await enrollmentService.listEnrollments({
                batchId: batch.id,
                semester: batch.currentSemester,
                status: 'active',
                limit: 1000
            });

            const enrollments = (data as any).enrollments || [];
            const uniqueStudentsMap = new Map();
            enrollments.forEach((enrollment: any) => {
                if (enrollment.studentId && !uniqueStudentsMap.has(enrollment.studentId)) {
                    uniqueStudentsMap.set(enrollment.studentId, enrollment);
                }
            });

            setStudents(Array.from(uniqueStudentsMap.values()));
        } catch (error) {
            console.error("Fetch students error:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (studentId: string) => {
        if (!batch) return;
        setProcessing(true);
        try {
            await batchService.assignClassRepresentative(batch.id, studentId);
            toast.success("Class Representative assigned successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Assign CR error:", error);
            toast.error("Failed to assign Class Representative");
        } finally {
            setProcessing(false);
        }
    };

    const handleRemove = async () => {
        if (!batch) return;
        setProcessing(true);
        try {
            await batchService.removeClassRepresentative(batch.id);
            toast.success("Class Representative removed successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Remove CR error:", error);
            toast.error("Failed to remove Class Representative");
        } finally {
            setProcessing(false);
        }
    };

    const filteredStudents = students.filter(s =>
    (s.student?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.student?.registrationNumber?.toLowerCase().includes(search.toLowerCase()))
    );

    const accentPrimary = theme.colors.accent.primary;
    const accentSecondary = theme.colors.accent.secondary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/5';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
                <DialogHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`h-12 w-12 rounded-[1.25rem] ${accentSecondary} flex items-center justify-center text-white shadow-lg shadow-indigo-200`}>
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">Manage CR</DialogTitle>
                            <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">
                                Batch: {batch?.name} • Semester {batch?.currentSemester}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6 bg-white">
                    {batch?.classRepresentativeId && (
                        <div className={`p-6 bg-indigo-50/30 border-2 border-dashed border-indigo-100/50 rounded-[2rem] flex items-center justify-between`}>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-indigo-50">
                                    <AvatarFallback className="bg-indigo-600 text-white font-black">
                                        {(batch.classRepresentativeId as any).fullName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Representative</p>
                                    <p className="text-lg font-black text-slate-900">{(batch.classRepresentativeId as any).fullName}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">{(batch.classRepresentativeId as any).registrationNumber}</p>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                disabled={processing}
                                className="rounded-xl h-10 px-4 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100"
                            >
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4 mr-2" />}
                                Dismiss
                            </Button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Assign New CR</h4>
                            <span className="text-[10px] font-bold text-slate-400">{filteredStudents.length} Students Available</span>
                        </div>

                        <div className="relative group">
                            <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:${accentPrimary} transition-colors`} />
                            <Input
                                placeholder="Search by name or registration number..."
                                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus-visible:ring-indigo-600 focus-visible:ring-offset-0 transition-all shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[320px] rounded-[1.5rem] border border-slate-100 bg-slate-50/30">
                            {loading ? (
                                <div className="flex flex-col justify-center items-center h-[320px] gap-3">
                                    <Loader2 className={`h-8 w-8 animate-spin ${accentPrimary}`} />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Students...</span>
                                </div>
                            ) : filteredStudents.length > 0 ? (
                                <div className="p-3 space-y-2">
                                    {filteredStudents.map((enrollment) => {
                                        const isCurrent = (batch?.classRepresentativeId as any)?._id === enrollment.studentId || batch?.classRepresentativeId === enrollment.studentId;
                                        return (
                                            <div
                                                key={enrollment.studentId}
                                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${isCurrent ? 'bg-white border-indigo-100 shadow-sm' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm'} group`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 ring-2 ring-white">
                                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                            {enrollment.student?.fullName?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-sm text-slate-900 leading-tight">{enrollment.student?.fullName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{enrollment.student?.registrationNumber}</p>
                                                    </div>
                                                </div>
                                                {isCurrent ? (
                                                    <Badge variant="secondary" className="bg-indigo-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg border-2 border-white shadow-sm">ACTIVE CR</Badge>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className={`opacity-0 group-hover:opacity-100 h-8 rounded-xl px-4 ${accentPrimary} font-bold text-xs hover:${accentBgSubtle} transition-all`}
                                                        onClick={() => handleAssign(enrollment.studentId)}
                                                        disabled={processing}
                                                    >
                                                        <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                                        Assign
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[320px] p-8 text-center gap-4">
                                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                                        <X className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-800">No students found</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Try a different search term</p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 sm:justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl px-6 font-bold text-slate-600 hover:bg-white"
                    >
                        Dismiss
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
