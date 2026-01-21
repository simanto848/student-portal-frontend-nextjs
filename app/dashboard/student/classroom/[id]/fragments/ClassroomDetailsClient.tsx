"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { workspaceService } from "@/services/classroom/workspace.service";
import { streamService } from "@/services/classroom/stream.service";
import { assignmentService } from "@/services/classroom/assignment.service";
import { materialService } from "@/services/classroom/material.service";
import { Workspace, Assignment, Material, StreamItem } from "@/services/classroom/types";
import { SubmissionView } from "@/components/classroom/SubmissionView";
import { StudentGradeView } from "@/components/classroom/StudentGradeView";
import {
    MessageSquare,
    FileText,
    BookOpen,
    ArrowLeft,
    Calendar,
    ChevronRight,
    Zap,
    Trophy,
    Search,
    Clock,
    Download,
    LayoutGrid,
    Users,
    Activity,
    Rocket,
    Shield
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { downloadBlob } from "@/lib/download";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialFolderCard } from "@/components/classroom/MaterialFolderCard";
import { cn } from "@/lib/utils";
import StudentLoading from "@/components/StudentLoading";

export default function ClassroomDetailsClient() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as string;

    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [stream, setStream] = useState<StreamItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [ws, asgn, mat, st] = await Promise.all([
                workspaceService.getById(id),
                assignmentService.listByWorkspace(id),
                materialService.listByWorkspace(id),
                streamService.listByWorkspace(id)
            ]);
            setWorkspace(ws);
            setAssignments(asgn);
            setMaterials(mat);
            setStream(st);
        } catch (error) {
            toast.error("Failed to load classroom data");
            router.push("/dashboard/student/classroom");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadMaterialAttachment = async (material: Material, index: number) => {
        try {
            const attachment = material.attachments?.[index];
            if (!attachment) return;
            const blob = await materialService.downloadAttachment(attachment);
            downloadBlob(blob, attachment.name || 'material');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to download attachment';
            toast.error(message);
        }
    };

    if (isLoading) {
        return <StudentLoading />;
    }

    if (!workspace) return null;

    const wsData = workspace as any;
    const courseTitle = wsData.courseName || workspace.title;
    const subtitle = `${wsData.courseCode || workspace.courseId} • Batch ${wsData.batchName || workspace.batchId}${wsData.programId?.shortName ? ` • ${wsData.programId.shortName}` : ""}`;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Dashboard-Style Header */}
            <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 py-8 px-8 glass-panel rounded-[2.5rem] border border-white/50 shadow-2xl">
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100">
                            <BookOpen className="h-6 w-6 text-[#0088A9]" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">{courseTitle}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-[#006680] font-black uppercase tracking-[0.25em] text-[10px] flex items-center gap-2 bg-[#0088A9]/10 px-3 py-1 rounded-full border border-[#0088A9]/20">
                            <Activity className="h-3 w-3" />
                            {subtitle}
                        </p>
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active Session</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/dashboard/student/classroom")}
                        className="h-14 rounded-2xl border border-gray-100 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-gray-700 hover:text-[#0088A9] hover:bg-white/80 font-black uppercase tracking-[0.2em] text-[10px] px-8 shadow-sm transition-all hover:translate-x-1"
                    >
                        <ArrowLeft className="mr-3 h-4 w-4" />
                        Back
                    </Button>
                    <div className="h-14 px-8 rounded-2xl bg-white text-gray-900 border border-gray-100 dark:bg-slate-800 dark:text-white flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">
                        <Users className="h-4 w-4 text-[#0088A9]" />
                        {workspace.teacherIds?.length || 0} Teachers
                    </div>
                </div>
            </header>

            <Tabs defaultValue="stream" className="w-full relative z-10">
                {/* Dashboard-Style Tab Bar */}
                <div className="flex overflow-x-auto pb-6 scrollbar-hide">
                    <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl p-2 rounded-full border border-white/60 dark:border-white/5 flex h-auto shadow-2xl">
                        {[
                            { value: "stream", label: "Updates", icon: LayoutGrid },
                            { value: "classwork", label: "Classwork", icon: FileText },
                            { value: "quizzes", label: "Quizzes", icon: Trophy },
                            { value: "grades", label: "Grades", icon: Activity },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.25em] transition-all flex items-center gap-3 data-[state=active]:bg-[#0088A9] data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-[#0088A9]/20"
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="stream" className="mt-8 outline-none animate-in slide-in-from-bottom-4 duration-700">
                    <div className="grid gap-12 md:grid-cols-[1fr_400px]">
                        {/* Main Feed */}
                        <div className="space-y-10">
                            {/* Dashboard-Style Hero Card */}
                            <div className="glass-panel group p-12 rounded-[4rem] relative overflow-hidden bg-white border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,136,169,0.15)]">
                                <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-1000">
                                    <Rocket className="h-64 w-64 text-[#0088A9]" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-[#0088A9] text-white border-none px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-[#0088A9]/40">Active</Badge>
                                            <div className="h-px w-12 bg-[#0088A9]/30" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0088A9] opacity-90">Online</span>
                                        </div>
                                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none text-slate-900">{courseTitle}</h2>
                                    </div>
                                    <p className="text-slate-600 font-bold text-sm uppercase tracking-widest max-w-sm leading-loose">
                                        Welcome to your classroom. Stay updated with the latest activity and course materials.
                                    </p>
                                    <div className="flex gap-8 pt-4">
                                        <div className="px-8 py-4 rounded-3xl bg-gray-50 border border-gray-100 backdrop-blur-2xl flex items-center gap-5 group/stat shadow-inner">
                                            <div className="h-12 w-12 rounded-2xl bg-[#0088A9]/10 flex items-center justify-center text-[#0088A9] shadow-inner">
                                                <Activity className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-0.5">Total Updates</p>
                                                <span className="text-2xl font-black tracking-tight text-slate-900">{stream.length} Posts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 px-4 pb-2">
                                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Recent Activity</h3>
                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>
                                <AnimatePresence mode="popLayout">
                                    {stream.length > 0 ? (
                                        stream.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                                            >
                                                <div className="glass-panel group p-10 rounded-[3rem] bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-gray-100 dark:border-white/5 hover:border-[#0088A9]/40 hover:shadow-[0_20px_60px_-15px_rgba(0,136,169,0.15)] transition-all duration-700 cursor-default">
                                                    <div className="flex gap-8">
                                                        <div className={cn(
                                                            "h-16 w-16 rounded-[2rem] shadow-sm flex items-center justify-center shrink-0 transition-transform duration-700 group-hover:scale-110 border-2 border-white",
                                                            item.type === 'assignment' ? 'bg-orange-100 text-orange-700' : 'bg-[#0088A9]/20 text-[#006680]'
                                                        )}>
                                                            {item.type === 'assignment' ? <FileText className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 border border-gray-100">
                                                                        <Users className="h-3.5 w-3.5" />
                                                                    </div>
                                                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">
                                                                        {item.actorName} • {format(new Date(item.createdAt), "MMM d, yyyy")}
                                                                    </p>
                                                                </div>
                                                                <Badge className={cn(
                                                                    "text-[9px] font-black uppercase tracking-[0.25em] border-none px-4 py-1 rounded-xl shadow-inner",
                                                                    item.type === 'assignment' ? 'bg-orange-500 text-white' : 'bg-[#0088A9] text-white'
                                                                )}>
                                                                    {item.type}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                                                                {item.actorName} shared a new {item.type}: <span className="text-[#0088A9] group-hover:underline font-black">{item.title}</span>
                                                            </h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-32 flex flex-col items-center justify-center glass-panel rounded-[4rem] border-dashed border-gray-200 bg-gray-50/20">
                                            <div className="p-10 rounded-[3rem] bg-white shadow-xl mb-8 border border-gray-50 scale-110">
                                                <MessageSquare className="h-16 w-16 text-gray-100" />
                                            </div>
                                            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[11px]">No activity found yet.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-12">
                            {/* Deadline Card */}
                            <div className="glass-panel p-12 rounded-[4rem] bg-white border border-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5">
                                    <Calendar className="h-32 w-32 text-[#0088A9]" />
                                </div>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-200 ring-4 ring-slate-100/50">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Upcoming Deadlines</h3>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Pending Assignments</p>
                                    </div>
                                </div>

                                {assignments.filter(a => new Date(a.dueAt!) > new Date()).length > 0 ? (
                                    <div className="space-y-8">
                                        {assignments
                                            .filter(a => new Date(a.dueAt!) > new Date())
                                            .slice(0, 3)
                                            .map(a => (
                                                <div
                                                    key={a.id}
                                                    className="relative pl-8 border-l-4 border-[#0088A9]/10 group cursor-pointer space-y-3 py-1 hover:border-[#0088A9]/40 transition-all"
                                                    onClick={() => {
                                                        setSelectedAssignmentId(a.id);
                                                        const classworkTrigger = document.querySelector('[value="classwork"]') as HTMLElement;
                                                        classworkTrigger?.click();
                                                    }}
                                                >
                                                    <div className="absolute top-0 -left-[6px] h-[12px] w-[12px] rounded-full bg-white border-2 border-slate-200 group-hover:border-[#0088A9] group-hover:bg-[#0088A9] transition-all" />
                                                    <h4 className="text-[13px] font-black text-gray-800 leading-tight group-hover:text-[#0088A9] transition-colors uppercase tracking-tight">{a.title}</h4>
                                                    <div className="flex items-center gap-3 text-gray-600">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Due {format(new Date(a.dueAt!), "MMM d, yyyy")}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        <Button
                                            className="w-full h-16 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] bg-[#0088A9] text-white hover:bg-[#0088A9]/90 shadow-2xl shadow-[#0088A9]/40 group border-none"
                                            onClick={() => {
                                                const classworkTrigger = document.querySelector('[value="classwork"]') as HTMLElement;
                                                classworkTrigger?.click();
                                            }}
                                        >
                                            View All <ChevronRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-16 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">No deadlines yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Ledger Promo */}
                            <div className="glass-panel p-12 rounded-[4rem] relative overflow-hidden group border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,180,216,0.15)] bg-white">
                                <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                                    <Trophy className="h-56 w-56 text-[#0088A9]" />
                                </div>
                                <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
                                    <div className="p-5 rounded-3xl bg-[#0088A9]/5 shadow-inner border border-[#0088A9]/10">
                                        <Activity className="h-8 w-8 text-[#0088A9]" />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none mb-1">Academic Hub</p>
                                        <h3 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4 text-slate-900">Grades Report</h3>
                                    </div>
                                    <Button
                                        className="w-full h-16 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl bg-white text-[#0088A9] hover:bg-white/90 hover:scale-[1.05] transition-all duration-300 border-none group"
                                        onClick={() => {
                                            const gradesTrigger = document.querySelector('[value="grades"]') as HTMLElement;
                                            gradesTrigger?.click();
                                        }}
                                    >
                                        View Grades <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                    </Button>
                                </div>
                            </div>

                            {/* Faculty Contact Mini-Card */}
                            <div className="glass-panel p-10 rounded-[3.5rem] bg-white border border-gray-100 shadow-xl text-center space-y-6">
                                <div className="p-4 rounded-2xl bg-[#0088A9]/10 text-[#006680] flex items-center justify-center w-fit mx-auto border border-[#0088A9]/20 shadow-inner">
                                    <Shield className="h-7 w-7" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Student Support</h4>
                                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest leading-relaxed">Connect with teachers for academic assistance.</p>
                                </div>
                                <button className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#0088A9] hover:bg-[#0088A9]/5 rounded-2xl border border-dashed border-[#0088A9]/30 transition-all">
                                    Contact Teacher
                                </button>
                            </div>
                        </aside>
                    </div>
                </TabsContent>

                <TabsContent value="classwork" className="mt-8 outline-none animate-in slide-in-from-bottom-4 duration-700">
                    {selectedAssignmentId ? (
                        <div className="space-y-8 animate-in slide-in-from-left duration-700">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedAssignmentId(null)}
                                className="h-16 rounded-[2rem] px-10 font-black text-[11px] uppercase tracking-[0.3em] text-[#0088A9] hover:bg-[#0088A9]/5 group border-2 border-white bg-white/60 backdrop-blur-2xl shadow-xl"
                            >
                                <ArrowLeft className="mr-4 h-5 w-5 transition-transform group-hover:-translate-x-2" />
                                Return to Classwork
                            </Button>
                            <div className="glass-panel rounded-[4rem] p-4 bg-white/40 border border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden min-h-[600px]">
                                <SubmissionView assignmentId={selectedAssignmentId} studentId={user?.id || ""} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-16 max-w-6xl pb-20">
                            {assignments.length === 0 && materials.length === 0 ? (
                                <div className="py-40 flex flex-col items-center justify-center glass-panel rounded-[5rem] border-dashed border-gray-200 bg-gray-50/20">
                                    <div className="p-12 rounded-[3.5rem] bg-white shadow-2xl mb-10 border border-gray-100 scale-125">
                                        <BookOpen className="h-24 w-24 text-gray-100" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">No Materials Found</h3>
                                    <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[12px]">No assignments or materials available yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-16">
                                    {assignments.length > 0 && (
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between px-8">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Assignments</h3>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse" />
                                                </div>
                                                <Badge className="bg-orange-500 text-white border-none font-black text-[10px] px-5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20">{assignments.length} Pending</Badge>
                                            </div>
                                            <div className="grid gap-6">
                                                {assignments.map((assignment, idx) => (
                                                    <motion.div
                                                        key={assignment.id}
                                                        initial={{ opacity: 0, x: -30 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                                                    >
                                                        <div
                                                            className="glass-panel group p-10 rounded-[3rem] bg-white border border-white cursor-pointer hover:border-[#0088A9]/40 hover:shadow-[0_30px_60px_-15px_rgba(0,136,169,0.2)] transition-all duration-700"
                                                            onClick={() => setSelectedAssignmentId(assignment.id)}
                                                        >
                                                            <div className="flex items-center gap-10">
                                                                <div className="h-16 w-16 rounded-[2rem] bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-all duration-700 border-2 border-white">
                                                                    <FileText className="h-8 w-8" />
                                                                </div>
                                                                <div className="flex-1 min-w-0 space-y-3">
                                                                    <h4 className="font-black text-gray-900 dark:text-white tracking-tighter group-hover:text-[#0088A9] transition-colors uppercase text-xl leading-none">{assignment.title}</h4>
                                                                    <div className="flex items-center gap-6">
                                                                        <div className="flex items-center gap-3">
                                                                            <Calendar className="h-4 w-4 text-gray-600" />
                                                                            <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest leading-none">
                                                                                Due Date: {assignment.dueAt ? format(new Date(assignment.dueAt), "MMM d, yyyy") : "No Due Date"}
                                                                            </p>
                                                                        </div>
                                                                        {assignment.dueAt && new Date(assignment.dueAt) < new Date() && (
                                                                            <Badge className="bg-red-500 text-white border-none text-[9px] font-black h-6 px-4 rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-red-500/20">Closed</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 group-hover:bg-[#0088A9] group-hover:text-white transition-all shadow-sm border border-gray-100">
                                                                    <ChevronRight className="h-7 w-7 group-hover:translate-x-1 transition-transform" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {materials.length > 0 && (
                                        <div className="space-y-8 pt-8">
                                            <div className="flex items-center justify-between px-8">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.4em]">Resource Materials</h3>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-[#0088A9] shadow-[0_0_8px_rgba(0,136,169,0.6)] animate-pulse" />
                                                </div>
                                                <Badge className="bg-[#0088A9] text-white border-none font-black text-[10px] px-5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-xl shadow-[#0088A9]/20">{materials.length} Materials</Badge>
                                            </div>
                                            <div className="grid gap-8 px-2">
                                                {materials.map((material, idx) => (
                                                    <motion.div
                                                        key={material.id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.08 }}
                                                    >
                                                        <MaterialFolderCard
                                                            material={material}
                                                            variant="student"
                                                            onDownload={handleDownloadMaterialAttachment}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="quizzes" className="mt-8 outline-none animate-in slide-in-from-bottom-4 duration-700 pb-20">
                    <div className="space-y-12">
                        {/* High-Contrast Hub Card */}
                        <div className="glass-panel group p-16 flex flex-col md:flex-row items-center justify-between gap-12 bg-white border border-gray-100 shadow-[0_50px_100px_-20px_rgba(0,136,169,0.15)] relative overflow-hidden rounded-[4rem]">
                            <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-1000">
                                <Trophy className="h-80 w-80 text-[#0088A9]" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <Badge className="bg-[#0088A9] text-white border-none font-black text-[11px] uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-[0_10px_30px_rgba(0,136,169,0.4)] ring-4 ring-[#0088A9]/20">Quiz Portal</Badge>
                                <h2 className="text-6xl font-black text-slate-900 leading-none tracking-tighter uppercase">Quiz <span className="text-[#0088A9]">Hub</span></h2>
                                <p className="text-slate-600 font-bold text-base uppercase tracking-[0.25em] max-w-lg leading-loose italic">Access your quizzes and track your academic performance.</p>
                            </div>
                            <Button
                                className="h-20 px-14 rounded-[2rem] bg-slate-900 text-white border-none hover:bg-[#0088A9] hover:text-white font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl relative z-10 group/btn transition-all hover:scale-[1.05] active:scale-[0.95] ring-8 ring-slate-100"
                                onClick={() => router.push(`/dashboard/student/classroom/${id}/quiz`)}
                            >
                                Enter Quiz Hub
                                <Rocket className="ml-4 h-6 w-6 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="md:col-span-3 py-24 flex flex-col items-center justify-center glass-panel rounded-[5rem] border-dashed border-gray-200 bg-gray-50/20 shadow-inner">
                                <div className="h-32 w-32 rounded-[3.5rem] bg-white flex items-center justify-center text-[#0088A9] mb-10 ring-8 ring-slate-100/50 shadow-2xl animate-float border border-gray-100">
                                    <Activity className="h-14 w-14" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4 leading-none">Quiz Details</h3>
                                <p className="text-[12px] font-black text-gray-500 uppercase tracking-[0.4em] max-w-xl text-center leading-loose px-12">
                                    Quizzes are managed in the central hub. View your previous results and take active quizzes.
                                </p>
                                <Button
                                    variant="ghost"
                                    className="mt-14 h-16 rounded-3xl border-2 border-dashed border-[#0088A9]/30 bg-white/60 text-[#0088A9] hover:bg-[#0088A9] hover:text-white font-black text-[12px] uppercase tracking-[0.4em] px-16 shadow-xl transition-all hover:scale-[1.05] hover:border-transparent active:scale-[0.95]"
                                    onClick={() => router.push(`/dashboard/student/classroom/${id}/quiz`)}
                                >
                                    Open Quiz Hub
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="grades" className="mt-8 outline-none animate-in slide-in-from-bottom-4 duration-700 pb-20">
                    <div className="glass-panel group p-2 rounded-[5rem] bg-white border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden min-h-[700px]">
                        <StudentGradeView
                            courseId={workspace.courseId}
                            batchId={workspace.batchId}
                            studentId={user?.id || ""}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
