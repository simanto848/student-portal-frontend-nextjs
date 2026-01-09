"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
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
    Loader2,
    MessageSquare,
    FileText,
    BookOpen,
    Users,
    ArrowLeft,
    Link as LinkIcon,
    File,
    Calendar,
    ChevronRight,
    Download,
    ExternalLink,
    Zap,
    Trophy
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { downloadBlob } from "@/lib/download";
import { motion, AnimatePresence } from "framer-motion";

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
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-cyan-100 border-t-cyan-500 animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-cyan-500 animate-pulse" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Establishing Nexus Link...</p>
            </div>
        );
    }

    if (!workspace) return null;

    const wsData = workspace as any;
    const courseTitle = wsData.courseName || workspace.title;
    const subtitle = `${wsData.courseCode || workspace.courseId} • Batch ${wsData.batchName || workspace.batchId}${wsData.programId?.shortName ? ` • ${wsData.programId.shortName}` : ""}`;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title={courseTitle}
                subtitle={subtitle}
                icon={BookOpen}
                extraActions={
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/dashboard/student/classroom")}
                            className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-black uppercase tracking-widest text-[10px]"
                        >
                            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                            Return to Classroom Grid
                        </Button>
                        <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-100 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">
                            {workspace.teacherIds?.length || 0} Faculty
                        </Badge>
                    </div>
                }
            />

            <Tabs defaultValue="stream" className="w-full">
                <div className="flex overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="bg-slate-100/50 p-1.5 rounded-[2rem] border border-slate-200/50 flex h-14 w-full md:w-auto h-auto">
                        <TabsTrigger value="stream" className="px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">Stream</TabsTrigger>
                        <TabsTrigger value="classwork" className="px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">Classwork</TabsTrigger>
                        <TabsTrigger value="quizzes" className="px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">Quizzes</TabsTrigger>
                        <TabsTrigger value="grades" className="px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">Grades</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="stream" className="mt-8">
                    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
                        <div className="space-y-6">
                            <GlassCard className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Zap className="h-32 w-32" />
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-black mb-2 tracking-tight">{courseTitle}</h2>
                                    <p className="text-slate-400 font-bold text-sm mb-6 max-w-md">
                                        Welcome to the classroom of {courseTitle}.
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stream Active</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                                                <span className="text-xs font-bold">{stream.length} Signals</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {stream.length > 0 ? (
                                        stream.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <GlassCard className="p-6 group transition-all duration-300 hover:border-cyan-200/50">
                                                    <div className="flex gap-5">
                                                        <div className={`h-12 w-12 rounded-[1.2rem] shadow-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.type === 'assignment' ? 'bg-amber-100 text-amber-600' : 'bg-cyan-100 text-cyan-600'}`}>
                                                            {item.type === 'assignment' ? <FileText className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                    {item.actorName} • {format(new Date(item.createdAt), "MMM d, yyyy")}
                                                                </p>
                                                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${item.type === 'assignment' ? 'text-amber-500 border-amber-100' : 'text-cyan-500 border-cyan-100'}`}>
                                                                    {item.type}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-800 leading-snug">
                                                                {item.actorName} broadcasted a new {item.type}: <span className="text-cyan-600">{item.title}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <GlassCard className="p-16 flex flex-col items-center justify-center border-dashed">
                                            <MessageSquare className="h-12 w-12 text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Registry Empty: No transmissions yet</p>
                                        </GlassCard>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <GlassCard className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-slate-900 shadow-xl shadow-slate-200">
                                        <Calendar className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Upcoming Assignments</h3>
                                </div>
                                {assignments.filter(a => new Date(a.dueAt!) > new Date()).length > 0 ? (
                                    <div className="space-y-4">
                                        {assignments
                                            .filter(a => new Date(a.dueAt!) > new Date())
                                            .slice(0, 3)
                                            .map(a => (
                                                <div key={a.id} className="relative pl-4 border-l-2 border-slate-100 group cursor-pointer" onClick={() => {
                                                    setSelectedAssignmentId(a.id);
                                                    const classworkTrigger = document.querySelector('[value="classwork"]') as HTMLElement;
                                                    classworkTrigger?.click();
                                                }}>
                                                    <div className="absolute top-1/2 -translate-y-1/2 -left-[6px] h-[10px] w-[10px] rounded-full bg-white border-2 border-slate-200 group-hover:border-cyan-500 transition-colors" />
                                                    <p className="text-xs font-black text-slate-700 leading-none mb-1 group-hover:text-cyan-600 transition-colors">{a.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due {format(new Date(a.dueAt!), "MMM d")}</p>
                                                </div>
                                            ))}
                                        <Button variant="ghost" className="w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-cyan-600 hover:bg-cyan-50" onClick={() => {
                                            const classworkTrigger = document.querySelector('[value="classwork"]') as HTMLElement;
                                            classworkTrigger?.click();
                                        }}>
                                            View All Tasks
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active tasks</p>
                                    </div>
                                )}
                            </GlassCard>

                            <GlassCard className="p-6 bg-cyan-600 text-white relative overflow-hidden group border-none">
                                <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Trophy className="h-20 w-20 text-white" />
                                </div>
                                <div className="relative z-10 text-center">
                                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 leading-none">Intelligence Check</p>
                                    <p className="text-3xl font-black text-cyan-400 mb-4">View Grades</p>
                                    <Button
                                        className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-cyan-900/40 bg-white text-cyan-700 hover:bg-cyan-50 hover:scale-[1.02] transition-all duration-300 border-none px-6 hover:cursor-pointer"
                                        onClick={() => {
                                            const gradesTrigger = document.querySelector('[value="grades"]') as HTMLElement;
                                            gradesTrigger?.click();
                                        }}
                                    >
                                        View Grades
                                    </Button>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="classwork" className="mt-8">
                    {selectedAssignmentId ? (
                        <div className="space-y-6">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedAssignmentId(null)}
                                className="h-10 rounded-xl px-4 font-black text-[10px] uppercase tracking-widest text-cyan-600 hover:bg-cyan-50 group mb-2"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Terminal / Return to Grid
                            </Button>
                            <GlassCard className="p-1">
                                <SubmissionView assignmentId={selectedAssignmentId} studentId={user?.id || ""} />
                            </GlassCard>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {assignments.length === 0 && materials.length === 0 ? (
                                <GlassCard className="p-24 flex flex-col items-center justify-center border-dashed">
                                    <BookOpen className="h-16 w-16 text-slate-100 mb-6" />
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Curriculum Locked</h3>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No research materials or targets identified</p>
                                </GlassCard>
                            ) : (
                                <div className="grid gap-6">
                                    {assignments.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Assignments & Targets</h3>
                                            <div className="grid gap-4">
                                                {assignments.map((assignment) => (
                                                    <GlassCard
                                                        key={assignment.id}
                                                        className="p-6 cursor-pointer group transition-all duration-300 hover:border-cyan-200"
                                                        onClick={() => setSelectedAssignmentId(assignment.id)}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="h-12 w-12 rounded-[1.25rem] bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                                <FileText className="h-6 w-6" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-slate-800 tracking-tight group-hover:text-cyan-600 transition-colors uppercase text-sm mb-1">{assignment.title}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                        Deadline: {assignment.dueAt ? format(new Date(assignment.dueAt), "MMM d, yyyy") : "OPEN ENROLLMENT"}
                                                                    </p>
                                                                    {assignment.dueAt && new Date(assignment.dueAt) < new Date() && (
                                                                        <Badge className="bg-rose-500 text-white border-none text-[8px] font-black h-4 px-1 rounded-full uppercase">Terminated</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {materials.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Intel & Documentation</h3>
                                            <div className="grid gap-4">
                                                {materials.map((material) => (
                                                    <GlassCard key={material.id} className="p-6 group hover:border-slate-300 transition-all duration-300">
                                                        <div className="flex items-start gap-5">
                                                            <div className="h-12 w-12 rounded-[1.25rem] bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all duration-300">
                                                                {material.type === 'link' ? <LinkIcon className="h-6 w-6" /> :
                                                                    material.type === 'file' ? <File className="h-6 w-6" /> :
                                                                        <BookOpen className="h-6 w-6" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className="font-black text-slate-800 tracking-tight group-hover:text-cyan-600 transition-colors uppercase text-sm">{material.title}</h4>
                                                                    <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest bg-slate-100 group-hover:bg-cyan-100 group-hover:text-cyan-700 h-4">{material.type}</Badge>
                                                                </div>
                                                                {material.type === 'text' && <p className="text-xs text-slate-500 leading-relaxed mt-2">{material.content}</p>}

                                                                {material.type === 'link' && material.content ? (
                                                                    <a
                                                                        href={material.content}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 mt-4 text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3" />
                                                                        Establish External Link
                                                                    </a>
                                                                ) : null}

                                                                {material.type === 'file' && material.attachments?.length ? (
                                                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        {material.attachments.map((att, idx) => (
                                                                            <Button
                                                                                key={att.id || `${material.id}-${idx}`}
                                                                                variant="outline"
                                                                                className="h-10 rounded-xl justify-start text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-cyan-600 hover:border-cyan-200 transition-all group/att"
                                                                                onClick={() => handleDownloadMaterialAttachment(material, idx)}
                                                                            >
                                                                                <Download className="mr-2 h-3 w-3" />
                                                                                <span className="truncate text-[10px] font-black uppercase tracking-tighter">{att.name}</span>
                                                                            </Button>
                                                                        ))}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="quizzes" className="mt-8">
                    <div className="space-y-8">
                        <GlassCard className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Trophy className="h-32 w-32" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-1 leading-tight tracking-tight text-cyan-600">Quiz Section</h2>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Evaluate your progress & claim credentials</p>
                            </div>
                            <Button
                                className="h-12 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-900/50 relative z-10 group/btn"
                                onClick={() => router.push(`/dashboard/student/classroom/${id}/quiz`)}
                            >
                                Go to Quiz Section
                                <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </GlassCard>

                        <div className="grid md:grid-cols-3 gap-6">
                            <GlassCard className="p-6 border-dashed text-center flex flex-col items-center justify-center min-h-[250px] md:col-span-3">
                                <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-4 ring-4 ring-slate-50/50">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Central Evaluation Center</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm mb-8 leading-relaxed">
                                    Timed evaluations, automated results, and historical performance tracking are available in the dedicated module.
                                </p>
                                <Button
                                    variant="outline"
                                    className="h-10 rounded-xl border-cyan-100 text-cyan-600 hover:bg-cyan-50 font-black text-[10px] uppercase tracking-widest px-8"
                                    onClick={() => router.push(`/dashboard/student/classroom/${id}/quiz`)}
                                >
                                    Establish Link
                                </Button>
                            </GlassCard>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="grades" className="mt-8">
                    <GlassCard className="p-1 min-h-[500px]">
                        <StudentGradeView
                            courseId={workspace.courseId}
                            batchId={workspace.batchId}
                            studentId={user?.id || ""}
                        />
                    </GlassCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
