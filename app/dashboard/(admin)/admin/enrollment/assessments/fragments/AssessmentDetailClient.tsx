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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Assessment, AssessmentSubmission } from "@/services/enrollment/assessment.service";
import {
    ArrowLeft,
    Calendar,
    Edit3,
    Sparkles,
    Trash2,
    FileText,
    Award,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    RefreshCcw,
    User,
    BookOpen,
    Layers,
    Target
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    deleteAssessmentAction,
    publishAssessmentAction,
    closeAssessmentAction,
    markGradedAction,
    gradeSubmissionAction
} from "../actions";

interface AssessmentDetailClientProps {
    assessment: Assessment;
    submissions: AssessmentSubmission[];
}

export function AssessmentDetailClient({
    assessment: initialAssessment,
    submissions: initialSubmissions
}: AssessmentDetailClientProps) {
    const router = useRouter();
    const [assessment, setAssessment] = useState(initialAssessment);
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Grading State
    const [gradingSubmission, setGradingSubmission] = useState<AssessmentSubmission | null>(null);
    const [gradeData, setGradeData] = useState({ obtainedMarks: 0, feedback: "" });
    const [isGrading, setIsGrading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${assessment.title}?`)) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteAssessmentAction(assessment.id, null, formData);
            if (result.success) {
                notifySuccess("Assessment deleted successfully");
                router.push("/dashboard/admin/enrollment/assessments");
            } else {
                notifyError(result.message || "Deletion failed");
            }
        } catch (error) {
            notifyError("An error occurred during deletion");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (action: 'publish' | 'close' | 'mark-graded') => {
        setIsUpdatingStatus(true);
        try {
            let result;
            if (action === 'publish') result = await publishAssessmentAction(assessment.id);
            else if (action === 'close') result = await closeAssessmentAction(assessment.id);
            else result = await markGradedAction(assessment.id);

            if (result.success) {
                notifySuccess(`Assessment ${action.replace('-', ' ')}ed successfully`);
                router.refresh();
            } else {
                notifyError(result.message || `Failed to ${action} assessment`);
            }
        } catch (error) {
            notifyError(`An error occurred while trying to ${action} assessment`);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSubmission) return;
        setIsGrading(true);
        try {
            const result = await gradeSubmissionAction(gradingSubmission.id, assessment.id, gradeData);
            if (result.success) {
                notifySuccess("Submission graded successfully");
                setGradingSubmission(null);
                router.refresh();
            } else {
                notifyError(result.message || "Failed to grade submission");
            }
        } catch (error) {
            notifyError("An error occurred during grading");
        } finally {
            setIsGrading(false);
        }
    };

    const openGradingDialog = (submission: AssessmentSubmission) => {
        setGradingSubmission(submission);
        setGradeData({
            obtainedMarks: submission.obtainedMarks || 0,
            feedback: submission.feedback || ""
        });
    };

    const statusColors = {
        draft: "bg-slate-100 text-slate-600 border-slate-200",
        published: "bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-100",
        closed: "bg-red-100 text-red-700 border-red-200",
        graded: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
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
                            <Badge className={`${statusColors[assessment.status]} border-none px-3 py-1 rounded-full flex items-center gap-2 font-black text-[10px] uppercase tracking-widest`}>
                                {assessment.status === 'published' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                {assessment.status}
                            </Badge>
                            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">
                                {assessment.type?.name}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{assessment.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2 mr-2">
                        {assessment.status === 'draft' && (
                            <Button
                                onClick={() => handleStatusChange('publish')}
                                disabled={isUpdatingStatus}
                                className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all active:scale-95"
                            >
                                {isUpdatingStatus ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Publish
                            </Button>
                        )}
                        {assessment.status === 'published' && (
                            <Button
                                onClick={() => handleStatusChange('close')}
                                disabled={isUpdatingStatus}
                                variant="destructive"
                                className="h-12 px-6 rounded-xl font-bold transition-all active:scale-95"
                            >
                                {isUpdatingStatus ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                Close
                            </Button>
                        )}
                        {assessment.status === 'closed' && (
                            <Button
                                onClick={() => handleStatusChange('mark-graded')}
                                disabled={isUpdatingStatus}
                                className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all active:scale-95"
                            >
                                {isUpdatingStatus ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Award className="w-4 h-4 mr-2" />}
                                Finalize Grades
                            </Button>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-14 px-6 rounded-2xl border-2 border-red-100 text-red-600 hover:bg-red-50 font-black tracking-tight transition-all active:scale-95"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/admin/enrollment/assessments/${assessment.id}/edit`)}
                        className="h-14 px-8 rounded-[2rem] bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group"
                    >
                        <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Edit Assessment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Overview Card */}
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-amber-500/10 via-slate-50/50 to-amber-500/5" />
                        <CardContent className="p-0 relative z-10 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                            <BookOpen className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Course & Module</p>
                                            <p className="text-xl font-black text-slate-800">{(assessment as any).course?.name || "No course assigned"}</p>
                                            <p className="text-sm font-bold text-slate-500 italic mt-1">{(assessment as any).batch?.name || "No batch assigned"}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <StatBox icon={Award} label="Total Marks" value={assessment.totalMarks} />
                                        <StatBox icon={Target} label="Passing Marks" value={assessment.passingMarks} highlight />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Calendar className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Due Date</p>
                                            <p className="text-xl font-black text-slate-800">
                                                {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : "Open Ended"}
                                            </p>
                                            <p className="text-sm font-bold text-slate-500 italic mt-1">
                                                Weightage: {assessment.weightPercentage}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100/50">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
                                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic line-clamp-3">
                                            {assessment.description || "No description provided for this assessment."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submissions Section */}
                    <Tabs defaultValue="submissions" className="w-full">
                        <TabsList className="bg-slate-100/50 p-1.5 rounded-[2rem] gap-2 mb-8 inline-flex">
                            <TabsTrigger value="submissions" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-xl transition-all">
                                Submissions ({submissions.length})
                            </TabsTrigger>
                            <TabsTrigger value="stats" className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-xl transition-all">
                                Insights & Metrics
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent value="submissions" key="submissions">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-50 md:table-header-group hidden">
                                                <TableRow className="hover:bg-transparent border-slate-100">
                                                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Information</TableHead>
                                                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Submitted At</TableHead>
                                                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Current Status</TableHead>
                                                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Marks</TableHead>
                                                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {submissions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="py-20 text-center">
                                                            <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                                                                <FileText className="w-12 h-12" />
                                                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">No submissions found yet</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    submissions.map((submission) => (
                                                        <TableRow key={submission.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors group">
                                                            <TableCell className="py-6 px-8">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform cursor-default">
                                                                        {submission.student?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-amber-600 transition-colors">
                                                                            {submission.student?.fullName || "Anonymous"}
                                                                        </p>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            {submission.student?.studentId || "N/A"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-6 text-center">
                                                                <p className="text-xs font-bold text-slate-600">
                                                                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : "-"}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-400">
                                                                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell className="py-6 text-center">
                                                                <Badge variant="outline" className={`rounded-lg px-2.5 py-0.5 font-black text-[9px] uppercase tracking-widest ${submission.status === 'graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                        submission.status === 'late' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                            'bg-blue-50 text-blue-700 border-blue-100'
                                                                    }`}>
                                                                    {submission.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-6 text-center">
                                                                {submission.status === 'graded' ? (
                                                                    <div className="inline-flex flex-col items-center">
                                                                        <span className="text-base font-black text-amber-600 leading-none">{submission.obtainedMarks}</span>
                                                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">/ {assessment.totalMarks}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-300 font-bold text-xs uppercase italic tracking-widest">Pending</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-6 px-8 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openGradingDialog(submission)}
                                                                    className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5 mr-2" />
                                                                    Grade Result
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="stats" key="stats">
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="bg-slate-900 border-none rounded-[3rem] p-10 text-white relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                                <Award className="w-24 h-24" />
                                            </div>
                                            <div className="relative z-10">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 px-1">Average Performance</h4>
                                                <div className="text-5xl font-black italic tracking-tighter text-amber-500 mb-2">
                                                    {submissions.length > 0
                                                        ? (submissions.filter(s => s.status === 'graded').reduce((acc, s) => acc + (s.obtainedMarks || 0), 0) / (submissions.filter(s => s.status === 'graded').length || 1)).toFixed(1)
                                                        : "0.0"
                                                    }%
                                                </div>
                                                <p className="text-sm font-bold text-slate-400">Class Average Result</p>
                                            </div>
                                        </Card>

                                        <Card className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/40 col-span-2">
                                            <div className="flex items-center justify-between mb-8">
                                                <h4 className="text-xl font-black text-slate-900 underline decoration-amber-500/30 decoration-4 underline-offset-4">Distribution Analysis</h4>
                                                <Layers className="text-slate-100 w-12 h-12" />
                                            </div>
                                            <div className="space-y-6 pt-2">
                                                <DistributionItem label="High Performers (>80%)" count={submissions.filter(s => (s.obtainedMarks || 0) >= assessment.totalMarks * 0.8).length} total={submissions.length} color="bg-emerald-500" />
                                                <DistributionItem label="Average Performers (40-80%)" count={submissions.filter(s => (s.obtainedMarks || 0) >= assessment.passingMarks && (s.obtainedMarks || 0) < assessment.totalMarks * 0.8).length} total={submissions.length} color="bg-amber-500" />
                                                <DistributionItem label="Requires Attention (<40%)" count={submissions.filter(s => s.status === 'submitted' && (s.obtainedMarks || 0) < assessment.passingMarks).length} total={submissions.length} color="bg-rose-500" />
                                            </div>
                                        </Card>
                                    </div>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* System Info Card */}
                    <Card className="bg-slate-900 text-white border-none rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <Clock className="w-32 h-32" />
                        </div>
                        <CardContent className="p-10 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 px-1">Security & Audit</p>
                            <div className="space-y-6">
                                <StatItem label="Created On" value={new Date((assessment as any).createdAt || "").toDateString()} />
                                <StatItem label="Infrastructure" value="Academic Core" />
                                <StatItem label="Last Updated" value={new Date((assessment as any).updatedAt || "").toLocaleTimeString()} />
                                <StatItem label="Assessment ID" value={assessment.id.slice(-8).toUpperCase()} highlighted />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-10 overflow-hidden relative group">
                        <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                            <Sparkles className="w-40 h-40" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 underline decoration-amber-500/30 decoration-4 underline-offset-4">Quick Insights</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                        <ArrowLeft className="w-5 h-5 rotate-180" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Submission Rate</span>
                                </div>
                                <span className="text-lg font-black text-slate-800">100%</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pass Percentage</span>
                                </div>
                                <span className="text-lg font-black text-slate-800">85%</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Grading Dialog */}
            <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                <DialogContent className="max-w-xl rounded-[2.5rem] border-2 border-slate-100 p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                                <Award className="w-6 h-6" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900">Finalize Intelligence Grade</DialogTitle>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic ml-16">Assign marks and feedback for {gradingSubmission?.student?.fullName}</p>
                    </DialogHeader>
                    <form onSubmit={handleGradeSubmit} className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="obtainedMarks" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Obtained Marks</Label>
                                <div className="relative">
                                    <Input
                                        id="obtainedMarks"
                                        type="number"
                                        value={gradeData.obtainedMarks}
                                        onChange={(e) => setGradeData({ ...gradeData, obtainedMarks: Number(e.target.value) })}
                                        min="0"
                                        max={assessment.totalMarks}
                                        required
                                        className="h-14 rounded-2xl border-2 border-slate-100 focus:border-amber-500/50 focus:ring-amber-500/10 font-black text-xl pl-6 transition-all"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm uppercase">/ {assessment.totalMarks}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Performance Index</Label>
                                <div className="h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center px-6 gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full ${gradeData.obtainedMarks >= assessment.passingMarks ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                    <span className={`text-sm font-black uppercase tracking-widest ${gradeData.obtainedMarks >= assessment.passingMarks ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {gradeData.obtainedMarks >= assessment.passingMarks ? 'PASS QUALIFIED' : 'BELOW THRESHOLD'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feedback" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Intelligence Feedback</Label>
                            <Textarea
                                id="feedback"
                                value={gradeData.feedback}
                                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                placeholder="Provide detailed and constructive evaluation..."
                                className="min-h-[160px] rounded-3xl border-2 border-slate-100 focus:border-amber-500/50 focus:ring-amber-500/10 font-bold text-slate-700 p-6 leading-relaxed transition-all resize-none italic"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setGradingSubmission(null)}
                                className="h-14 rounded-2xl border-2 border-slate-100 text-slate-400 font-black uppercase tracking-[0.1em] text-[10px] hover:bg-slate-50 transition-all active:scale-95"
                            >
                                ABORT COMMAND
                            </Button>
                            <Button
                                type="submit"
                                disabled={isGrading}
                                className="h-14 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black uppercase tracking-[0.1em] text-[10px] shadow-2xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {isGrading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5 transition-transform group-hover:rotate-12" />}
                                FINALIZE EVALUATION
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatBox({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string | number; highlight?: boolean }) {
    return (
        <div className={`p-6 rounded-[2rem] border-2 transition-all group/stat ${highlight ? 'bg-white border-amber-200/50 shadow-xl shadow-amber-500/5' : 'bg-white border-slate-50'}`}>
            <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-4 h-4 ${highlight ? 'text-amber-500' : 'text-slate-300'}`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black italic tracking-tighter ${highlight ? 'text-amber-600' : 'text-slate-800'}`}>{value}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Points</span>
            </div>
        </div>
    );
}

function StatItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
            <p className={`text-sm font-black leading-none ${highlighted ? 'text-amber-400 underline decoration-amber-500/30' : 'text-slate-100'}`}>{value}</p>
        </div>
    );
}

function DistributionItem({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-slate-800">{count}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">Users</span>
                </div>
            </div>
            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full shadow-lg brightness-110`}
                />
            </div>
        </div>
    );
}
