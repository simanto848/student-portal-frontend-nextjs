"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assignmentService } from "@/services/classroom/assignment.service";
import { materialService } from "@/services/classroom/material.service";
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
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

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

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Modern Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push("/dashboard/teacher/classroom")}
                        className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                                <Sparkles className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">
                                    Classroom Hub
                                </span>
                            </Badge>
                            <span className="text-slate-300 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" />
                                {workspace.courseCode}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            {workspace.title}
                        </h1>
                        <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
                            {workspace.courseName}
                            <span className="text-slate-300 mx-1">•</span>
                            {workspace.batchName}
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
                                className="h-12 px-6 rounded-xl border-2 border-slate-100 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                                Add Material
                            </Button>
                        }
                    />
                    <CreateAssignmentDialog
                        workspaceId={id}
                        onSuccess={onRefresh}
                        trigger={
                            <Button className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                                <FileText className="w-4 h-4 mr-2" />
                                Create Task
                            </Button>
                        }
                    />
                </div>
            </div>

            <Tabs defaultValue="stream" className="w-full">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-4xl gap-2 mb-10 overflow-x-auto inline-flex whitespace-nowrap scrollbar-hide">
                    {["Stream", "Classwork", "Quizzes", "People", "Assessments", "Grades"].map(
                        (tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab.toLowerCase()}
                                className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-indigo-600/40 transition-all"
                            >
                                {tab}
                            </TabsTrigger>
                        ),
                    )}
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent value="stream" key="stream" className="mt-0 outline-none">
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
                                    <Card className="border-2 border-dashed border-slate-100 rounded-[3rem] p-20 text-center bg-white">
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
                                <Card className="border-2 border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 p-10 bg-white">
                                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                        <GraduationCap className="h-5 w-5 text-indigo-500" />
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

                                <Card className="bg-slate-900 text-white border-none rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                        <BookOpen className="h-40 w-40" />
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight mb-4 relative z-10">
                                        Academic Excellence
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed relative z-10">
                                        Engage your students through collaborative stream posts and timely
                                        feedback on their academic tasks.
                                    </p>
                                </Card>
                            </aside>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="classwork" key="classwork" className="mt-0 outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {assignments.length === 0 && materials.length === 0 ? (
                                <Card className="border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center bg-white">
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
                                <div className="grid gap-8 max-w-4xl">
                                    {/* Assignments Section */}
                                    {assignments.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                                    Assignments
                                                </h3>
                                                <div className="flex-1 h-px bg-slate-100" />
                                            </div>
                                            <div className="grid gap-4">
                                                {assignments.map((assignment, index) => (
                                                    <ClassworkCard
                                                        key={`asgn-${assignment.id || index}`}
                                                        item={assignment}
                                                        type="assignment"
                                                        onEdit={() => { }}
                                                        onDelete={handleDeleteAssignment}
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
                                                <div className="flex-1 h-px bg-slate-100" />
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

                    <TabsContent value="people" key="people" className="mt-0 outline-none">
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-12"
                        >
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                        Academic Mentors
                                    </h3>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                        {teachers.length} ACTIVE
                                    </span>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {teachers.map((teacher, index) => (
                                        <Card
                                            key={`teacher-${teacher.id || index}`}
                                            className="border-2 border-slate-50 p-6 rounded-4xl flex items-center gap-4 bg-white shadow-lg shadow-slate-200/30"
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 border-2 border-white overflow-hidden flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
                                                {(teacher.fullName || teacher.email || "T")
                                                    .substring(0, 1)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">
                                                    {teacher.fullName || "Faculty Member"}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400 italic">
                                                    {teacher.email}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                            Student Scholars
                                        </h3>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                            {students.length} ENROLLED
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-4 max-w-4xl">
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

                    <TabsContent value="quizzes" key="quizzes" className="mt-0 outline-none">
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
                                    className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                                    onClick={() => router.push(`/dashboard/teacher/classroom/${id}/quiz`)}
                                >
                                    Launch Manager
                                </Button>
                            </div>

                            <Card className="border-2 border-dashed border-slate-100 rounded-[3rem] p-20 text-center bg-white overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-400 via-rose-400 to-indigo-400" />
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-4xl bg-slate-50 text-slate-200 mb-8">
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
                                    variant="outline"
                                    className="h-12 px-8 rounded-xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50 active:scale-95"
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
                        className="mt-0 outline-none"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] border-2 border-slate-100 p-2 overflow-hidden shadow-2xl shadow-slate-200/40"
                        >
                            <AssessmentView
                                courseId={workspace.courseId}
                                batchId={workspace.batchId}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="grades" key="grades" className="mt-0 outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            <Tabs defaultValue="assignments" className="w-full">
                                <TabsList className="bg-slate-50 p-1.5 rounded-2xl gap-2 mb-8 inline-flex">
                                    <TabsTrigger
                                        value="assignments"
                                        className="px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg transition-all"
                                    >
                                        Assignments
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="course-grades"
                                        className="px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg transition-all"
                                    >
                                        Course Final
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="assignments" className="mt-0">
                                    <div className="grid gap-10 lg:grid-cols-12">
                                        <div className="lg:col-span-4">
                                            <Card className="border-2 border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/40 p-0">
                                                <CardHeader className="bg-slate-50/50 p-8 border-b-2 border-slate-50">
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
                                                                    ? "bg-indigo-50/50 text-indigo-700 font-black"
                                                                    : "text-slate-600 font-bold hover:bg-slate-50"
                                                                    }`}
                                                            >
                                                                {selectedAssignmentId === assignment.id && (
                                                                    <motion.div
                                                                        layoutId="active-indicator"
                                                                        className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600 rounded-r-full"
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
                                                <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-2 shadow-2xl shadow-slate-200/40">
                                                    <GradingView assignmentId={selectedAssignmentId} />
                                                </div>
                                            ) : (
                                                <Card className="border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center bg-white">
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
                                    <div className="bg-white rounded-[3rem] border-2 border-slate-100 p-2 overflow-hidden shadow-2xl shadow-slate-200/40">
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
        </div>
    );
}
