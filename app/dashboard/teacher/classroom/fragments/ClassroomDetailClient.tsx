"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { assignmentService } from "@/services/classroom/assignment.service";
import { materialService } from "@/services/classroom/material.service";
import { batchService } from "@/services/academic/batch.service";
import {
    Workspace,
    Assignment,
    Material,
    StreamItem,
} from "@/services/classroom/types";
import { Student } from "@/services/user/student.service";
import { Teacher } from "@/services/user/teacher.service";
import { CreateAssignmentDialog } from "@/components/classroom/CreateAssignmentDialog";
import { CreateMaterialDialog } from "@/components/classroom/CreateMaterialDialog";
import { GradingView } from "@/components/classroom/GradingView";
import { AssessmentView } from "@/components/classroom/AssessmentView";
import { CourseGradeView } from "@/components/classroom/CourseGradeView";
import {
    FileText,
    BookOpen,
    ArrowLeft,
    Sparkles,
    Layers,
    GraduationCap,
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { downloadBlob } from "@/lib/download";
import { motion, AnimatePresence } from "framer-motion";
import { StreamItemCard } from "./StreamItemCard";
import { ClassworkCard } from "./ClassworkCard";
import { StudentRow } from "./StudentRow";
import { MaterialFolderCard } from "@/components/classroom/MaterialFolderCard";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface ClassroomDetailClientProps {
    id: string;
    workspace: Workspace;
    assignments: Assignment[];
    materials: Material[];
    stream: StreamItem[];
    students: Student[];
    teachers: Teacher[];
    onRefresh: () => void;
}

export function ClassroomDetailClient({
    id,
    workspace,
    assignments,
    materials,
    stream,
    students,
    teachers,
    onRefresh,
}: ClassroomDetailClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
    const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [batchDetails, setBatchDetails] = useState<any>(null);

    useEffect(() => {
        const fetchBatchDetails = async () => {
            if (workspace.batchId) {
                try {
                    const batch = await batchService.getBatchById(workspace.batchId);
                    setBatchDetails(batch);
                } catch (error) {
                    console.error("Failed to fetch batch details", error);
                }
            }
        };
        fetchBatchDetails();
    }, [workspace.batchId]);

    const getBatchDisplayName = () => {
        if (!batchDetails) return workspace.batchName;
        const prefix = batchDetails.shift === "day" ? "D" : batchDetails.shift === "evening" ? "E" : "";
        return prefix ? `${prefix} ${batchDetails.name}` : batchDetails.name;
    };

    const handleDeleteAssignment = async (assignmentId: string) => {
        if (!confirm("Are you sure you want to delete this assignment?")) return;
        try {
            await assignmentService.delete(assignmentId);
            notifySuccess("Assignment deleted");
            onRefresh();
        } catch (error) {
            const message = getErrorMessage(error, "Failed to delete assignment");
            notifyError(message);
        }
    };

    const handleEditAssignment = (assignment: Assignment) => {
        setEditingAssignment(assignment);
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        try {
            await materialService.delete(materialId);
            notifySuccess("Material deleted");
            onRefresh();
        } catch (error) {
            const message = getErrorMessage(error, "Failed to delete material");
            notifyError(message);
        }
    };

    const handleDownloadMaterialAttachment = async (
        material: Material,
        index: number,
    ) => {
        try {
            const attachment = material.attachments?.[index];
            if (!attachment) return;
            const blob = await materialService.downloadAttachment(attachment);
            downloadBlob(blob, attachment.name || "material");
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Failed to download attachment");
            notifyError(message);
        }
    };

    const handlePublishAssignment = async (assignmentId: string) => {
        if (!confirm("Are you sure you want to publish this assignment? It will become visible to students.")) return;
        try {
            await assignmentService.publish(assignmentId);
            notifySuccess("Assignment published");
            onRefresh();
        } catch (error) {
            const message = getErrorMessage(error, "Failed to publish assignment");
            notifyError(message);
        }
    };

    const handleCloseAssignment = async (assignmentId: string) => {
        if (!confirm("Are you sure you want to close this assignment? Students will no longer be able to submit.")) return;
        try {
            await assignmentService.close(assignmentId);
            notifySuccess("Assignment closed");
            onRefresh();
        } catch (error) {
            const message = getErrorMessage(error, "Failed to close assignment");
            notifyError(message);
        }
    };

    return (
        <div className="space-y-6 pb-20 w-full">
            {/* Modern Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-5">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/dashboard/teacher/classroom")}
                            className={`h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-sm hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/5 hover:${theme.colors.accent.primary} transition-all`}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${theme.colors.accent.primary.replace('text-', 'bg-')}/10 ${theme.colors.accent.primary} border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm`}>
                                <Sparkles className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Classroom Hub
                                </span>
                            </Badge>
                            <span className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" />
                                {workspace.courseCode}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            {workspace.title}
                        </h1>
                        <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
                            {workspace.courseName}
                            <span className="text-slate-300 mx-1">•</span>
                            {getBatchDisplayName()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <CreateMaterialDialog
                        workspaceId={id}
                        onSuccess={onRefresh}
                        trigger={
                            <Button
                                variant="outline"
                                className={`h-12 px-6 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:${theme.colors.accent.primary} hover:border-${theme.colors.accent.primary.replace('text-', '')}/30 transition-all active:scale-95`}
                            >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Add Material
                            </Button>
                        }
                    />
                    <CreateAssignmentDialog
                        workspaceId={id}
                        onSuccess={onRefresh}
                        trigger={
                            <Button className={`h-12 px-8 rounded-xl bg-[#2dd4bf] hover:bg-[#25b0a0] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all active:scale-95`}>
                                <FileText className="w-4 h-4 mr-2" />
                                Create Task
                            </Button>
                        }
                    />
                </div>
            </div>

            <Tabs defaultValue="stream" className="w-full">
                <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 inline-flex min-w-max">
                        {["Stream", "Classwork", "Quizzes", "People", "Assessments", "Grades"].map(
                            (tab) => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab.toLowerCase()}
                                    className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}
                                >
                                    {tab}
                                </TabsTrigger>
                            ),
                        )}
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="stream" key="stream" className="mt-6 outline-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid gap-8 lg:grid-cols-12"
                        >
                            <div className="lg:col-span-8 space-y-6">
                                {stream.length > 0 ? (
                                    stream.map((item, index) => (
                                        <StreamItemCard key={`stream-${item.id || index}`} item={item} />
                                    ))
                                ) : (
                                    <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center bg-white">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-6">
                                            <Sparkles className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">
                                            The stream is empty
                                        </h3>
                                        <p className="text-slate-500 font-medium">
                                            Post announcements or tasks to engage with your students.
                                        </p>
                                    </Card>
                                )}
                            </div>

                            <aside className="lg:col-span-4 space-y-8">
                                <Card className="border border-slate-200 rounded-[2.5rem] shadow-sm p-10 bg-white">
                                    <h3 className={`text-xl font-black text-slate-900 mb-6 flex items-center gap-3`}>
                                        <GraduationCap className={`h-5 w-5 ${theme.colors.accent.primary}`} />
                                        Quick Insights
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Enrolled Scholars
                                            </p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                                {students.length}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Pending Evaluations
                                            </p>
                                            <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                                {assignments.length}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </aside>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="classwork" key="classwork" className="mt-6 outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {assignments.length === 0 && materials.length === 0 ? (
                                <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center bg-white">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-6">
                                        <Layers className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">
                                        Infrastructure Ready
                                    </h3>
                                    <p className="text-slate-500 font-medium">
                                        Create assignments or upload materials to populate your classroom
                                        workspace.
                                    </p>
                                </Card>
                            ) : (
                                <div className="grid gap-8 w-full">
                                    {/* Assignments Section */}
                                    {assignments.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                                    Assignments
                                                </h3>
                                                <div className="flex-1 h-px bg-slate-200" />
                                            </div>
                                            <div className="grid gap-4">
                                                {assignments.map((assignment, index) => (
                                                    <ClassworkCard
                                                        key={`asgn-${assignment.id || index}`}
                                                        item={assignment}
                                                        type="assignment"
                                                        onEdit={() => handleEditAssignment(assignment)}
                                                        onDelete={handleDeleteAssignment}
                                                        onPublish={handlePublishAssignment}
                                                        onClose={handleCloseAssignment}
                                                        onClick={() => setViewingAssignmentId(assignment.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Materials Section - Folder Style */}
                                    {materials.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                                    Materials & Resources
                                                </h3>
                                                <div className="flex-1 h-px bg-slate-200" />
                                            </div>
                                            <div className="grid gap-4">
                                                {materials.map((material, index) => (
                                                    <MaterialFolderCard
                                                        key={`mat-${material.id || index}`}
                                                        material={material}
                                                        variant="teacher"
                                                        onDownload={handleDownloadMaterialAttachment}
                                                        onEdit={() => { }}
                                                        onDelete={handleDeleteMaterial}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="people" key="people" className="mt-6 outline-none">
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-12"
                        >
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                            Student List
                                        </h3>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                            {students.length} ENROLLED
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-4 w-full">
                                    {students.map((stu, index) => (
                                        <StudentRow
                                            key={`stu-${stu.id || index}`}
                                            student={stu}
                                            onViewDetails={(stuId) =>
                                                router.push(`/dashboard/teacher/classroom/${id}/${stuId}`)
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="quizzes" key="quizzes" className="mt-6 outline-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-10"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                        Quiz Management
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        Design and deploy assessments for your stream.
                                    </p>
                                </div>
                                <Button
                                    className="h-12 px-8 rounded-xl bg-[#2dd4bf] hover:bg-[#25b0a0] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all active:scale-95"
                                    onClick={() => router.push(`/dashboard/teacher/classroom/${id}/quiz`)}
                                >
                                    Launch Manager
                                </Button>
                            </div>

                            <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center bg-white overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-200 mb-8">
                                    <FileText className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-4 px-2">
                                    Knowledge Evaluation Protocol
                                </h3>
                                <p className="text-slate-500 font-medium max-w-xl mx-auto mb-10 leading-relaxed px-4">
                                    Create multiple choice, true/false, or structured response quizzes.
                                    Define time limits, grading schemas, and monitor student performance
                                    in real-time.
                                </p>
                                <Button
                                    className="h-12 px-8 rounded-xl bg-[#2dd4bf] hover:bg-[#25b0a0] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all active:scale-95"
                                    onClick={() => router.push(`/dashboard/teacher/classroom/${id}/quiz`)}
                                >
                                    Launch Architecture
                                </Button>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    <TabsContent
                        value="assessments"
                        key="assessments"
                        className="mt-6 outline-none"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] border border-slate-200 p-2 overflow-hidden shadow-sm"
                        >
                            <AssessmentView
                                courseId={workspace.courseId}
                                batchId={workspace.batchId}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="grades" key="grades" className="mt-6 outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            <Tabs defaultValue="assignments" className="w-full">
                                <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 inline-flex min-w-max mb-8">
                                    <TabsTrigger
                                        value="assignments"
                                        className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}
                                    >
                                        Assignments
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="course-grades"
                                        className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${theme.colors.accent.secondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all`}
                                    >
                                        Course Final
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="assignments" className="mt-0">
                                    <div className="grid gap-10 lg:grid-cols-12">
                                        <div className="lg:col-span-4">
                                            <Card className="border border-slate-200 rounded-[2.5rem] overflow-hidden bg-white shadow-sm p-0">
                                                <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                                                    <CardTitle className="text-xl font-black text-slate-900 tracking-tight">
                                                        Active Tasks
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-0 max-h-[500px] overflow-y-auto scrollbar-hide">
                                                    <div className="flex flex-col">
                                                        {assignments.map((assignment, index) => (
                                                            <button
                                                                key={`grade-asgn-${assignment.id || index}`}
                                                                onClick={() => setSelectedAssignmentId(assignment.id)}
                                                                className={`text-left px-8 py-5 text-sm transition-all relative group ${selectedAssignmentId === assignment.id
                                                                    ? `${theme.colors.accent.primary.replace('text-', 'bg-')}/10 ${theme.colors.accent.primary} font-black`
                                                                    : "text-slate-600 font-bold hover:bg-slate-50"
                                                                    }`}
                                                            >
                                                                {selectedAssignmentId === assignment.id && (
                                                                    <motion.div
                                                                        layoutId="active-indicator"
                                                                        className={`absolute left-0 top-0 w-1.5 h-full ${theme.colors.accent.secondary} rounded-r-full`}
                                                                    />
                                                                )}
                                                                {assignment.title}
                                                            </button>
                                                        ))}
                                                        {assignments.length === 0 && (
                                                            <div className="p-10 text-center text-slate-400 font-bold italic text-sm">
                                                                No tasks deployed.
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="lg:col-span-8">
                                            {selectedAssignmentId ? (
                                                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-2 shadow-sm">
                                                    <GradingView assignmentId={selectedAssignmentId} />
                                                </div>
                                            ) : (
                                                <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center bg-white">
                                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-200 mb-6">
                                                        <Sparkles className="h-8 w-8" />
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 mb-2 px-2">
                                                        Task Evaluation Matrix
                                                    </h3>
                                                    <p className="text-slate-500 font-medium px-4">
                                                        Select a task from the portfolio to begin the grading cycle.
                                                    </p>
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="course-grades" className="mt-0">
                                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-2 overflow-hidden shadow-sm">
                                        <CourseGradeView
                                            courseId={workspace.courseId}
                                            batchId={workspace.batchId}
                                            semester={1}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            <CreateAssignmentDialog
                workspaceId={id}
                assignment={editingAssignment || undefined}
                trigger={null}
                open={!!editingAssignment}
                onOpenChange={(open) => !open && setEditingAssignment(null)}
                onSuccess={() => {
                    setEditingAssignment(null);
                    onRefresh();
                }}
            />

            <Dialog open={!!viewingAssignmentId} onOpenChange={(open) => !open && setViewingAssignmentId(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assignment Details & Grading</DialogTitle>
                    </DialogHeader>
                    {viewingAssignmentId && <GradingView assignmentId={viewingAssignmentId} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
