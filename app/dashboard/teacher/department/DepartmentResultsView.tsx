"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGradingWorkflow } from "@/hooks/queries/useTeacherQueries";
import { courseGradeService, ResultWorkflow } from "@/services/enrollment/courseGrade.service";
import { Loader2, CheckCircle, FileText, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function DepartmentResultsView() {
    const router = useRouter();
    const { data: workflows, isLoading, refetch } = useGradingWorkflow();

    const [selectedWorkflow, setSelectedWorkflow] = useState<ResultWorkflow | null>(null);
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    const relevantWorkflows = workflows?.filter(w =>
        w.status === 'approved' || w.status === 'published'
    ) || [];

    const handlePublishClick = (workflow: ResultWorkflow) => {
        setSelectedWorkflow(workflow);
        setOtp("");
        setIsOtpDialogOpen(true);
    };

    const handlePublishConfirm = async () => {
        if (!selectedWorkflow || !otp) return;

        setIsPublishing(true);
        try {
            await courseGradeService.publishResult(selectedWorkflow.id, otp);
            toast.success("Result published successfully");
            setIsOtpDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to publish result");
        } finally {
            setIsPublishing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-xl">
                        Awaiting Broadcast
                    </Badge>
                );
            case 'published':
                return (
                    <Badge className="bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] border-[#2dd4bf]/20 font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-xl flex items-center gap-1.5 w-fit">
                        <Globe className="w-3 h-3" /> Deployed
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest rounded-xl px-3 py-1">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-4">
            <AnimatePresence mode="wait">
                {relevantWorkflows.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/30 dark:bg-slate-900/10"
                    >
                        <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-xl ring-1 ring-slate-100 dark:ring-slate-700 mb-6">
                            <FileText className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Zero Pending Broadcasts</h3>
                        <p className="text-slate-400 dark:text-slate-500 font-medium text-sm max-w-sm mt-2 italic">
                            All academic nodes are currently synchronized. No results require immediate publishing.
                        </p>
                    </motion.div>
                ) : (
                    <GlassCard className="border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/40 overflow-hidden p-0 relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <FileText className="w-64 h-64 text-slate-900 dark:text-white" />
                        </div>

                        <div className="overflow-x-auto relative z-10">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <TableRow className="hover:bg-transparent border-slate-200/60 dark:border-slate-800/50">
                                        <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Academic Node</TableHead>
                                        <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Batch Vector</TableHead>
                                        <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Phase</TableHead>
                                        <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Broadcast Status</TableHead>
                                        <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Last Timestamp</TableHead>
                                        <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right pr-10">Protocols</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relevantWorkflows.map((workflow, index) => (
                                        <motion.tr
                                            key={workflow.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-[#2dd4bf]/5 transition-colors border-b border-slate-100 dark:border-slate-800/50 group"
                                        >
                                            <TableCell className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center shadow-inner ring-1 ring-[#2dd4bf]/20">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 dark:text-white group-hover:text-[#2dd4bf] transition-colors leading-tight">{workflow.grade?.course?.name || "Global Module"}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1 font-mono">{workflow.grade?.course?.code}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6 text-center">
                                                <Badge className="bg-slate-950 dark:bg-[#2dd4bf]/10 text-white dark:text-[#2dd4bf] border-none px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                                    {workflow.grade?.batch?.name || "SEC-00"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-6 text-center font-black text-slate-600 dark:text-slate-400 text-xs tracking-tight">
                                                Sem {workflow.grade?.semester || "???"}
                                            </TableCell>
                                            <TableCell className="p-6 text-center">{getStatusBadge(workflow.status)}</TableCell>
                                            <TableCell className="p-6 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                {workflow.actionAt ? format(new Date(workflow.actionAt), 'MMM dd, HH:mm') : 'NO_SIGNAL'}
                                            </TableCell>
                                            <TableCell className="p-6 text-right pr-10">
                                                <div className="flex items-center justify-end gap-3 translate-x-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                    {workflow.status === 'approved' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-10 px-5 rounded-xl bg-[#0d9488] dark:bg-[#2dd4bf] text-white dark:text-slate-900 hover:bg-[#0f766e] dark:hover:bg-[#14b8a6] shadow-lg shadow-teal-500/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                                            onClick={() => handlePublishClick(workflow)}
                                                        >
                                                            <Globe className="h-3.5 w-3.5" />
                                                            Broadcast
                                                        </Button>
                                                    )}
                                                    {workflow.status === 'published' && (
                                                        <div className="flex items-center gap-2 text-[#0d9488] dark:text-[#2dd4bf] font-black text-[10px] uppercase tracking-[0.2em] bg-[#2dd4bf]/10 px-4 py-2 rounded-xl border border-[#2dd4bf]/20">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Deployed
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </GlassCard>
                )}
            </AnimatePresence>

            {/* OTP Dialog */}
            <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center mb-6 shadow-lg rotate-3 ring-1 ring-[#2dd4bf]/30">
                            <Globe className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Initialize Broadcast</DialogTitle>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm pt-2 italic">Authenticating security token for global result publication.</p>
                    </DialogHeader>

                    <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                        <div className="space-y-3">
                            <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Authorization Key (OTP)</Label>
                            <Input
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                                autoComplete="off"
                                className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-2xl tracking-[0.3em] font-black text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-6 flex flex-col-reverse sm:flex-row gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsOtpDialogOpen(false)}
                            className="rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            Abort Signal
                        </Button>
                        <Button
                            onClick={handlePublishConfirm}
                            disabled={!otp || isPublishing}
                            className="rounded-xl h-12 px-8 bg-[#0d9488] dark:bg-[#2dd4bf] text-white dark:text-slate-900 hover:bg-[#0f766e] dark:hover:bg-[#14b8a6] shadow-xl shadow-teal-500/20 font-black text-[10px] uppercase tracking-widest flex-1 transition-all"
                        >
                            {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Globe className="h-5 w-5 mr-2" />}
                            Confirm Broadcast
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
