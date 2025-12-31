"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Workspace, Assignment, Material, StreamItem } from "@/services/classroom/types";
import { CreateAssignmentDialog } from "@/components/classroom/CreateAssignmentDialog";
import { CreateMaterialDialog } from "@/components/classroom/CreateMaterialDialog";
import { GradingView } from "@/components/classroom/GradingView";
import {
    Loader2,
    MessageSquare,
    FileText,
    BookOpen,
    Users,
    ArrowLeft,
    Settings,
    Edit,
    Trash2,
    GraduationCap,
    Clock,
    User,
    ChevronRight,
    Search,
    Sparkles
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { deleteAssignmentAction, deleteMaterialAction } from "../actions";

interface ClassroomDetailClientProps {
    workspace: Workspace;
    course: any;
    batch: any;
    teachers: any[];
    students: any[];
    assignments: Assignment[];
    materials: Material[];
    stream: StreamItem[];
}

export function ClassroomDetailClient({
    workspace,
    course,
    batch,
    teachers,
    students,
    assignments: initialAssignments,
    materials: initialMaterials,
    stream
}: ClassroomDetailClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [assignments, setAssignments] = useState(initialAssignments);
    const [materials, setMaterials] = useState(initialMaterials);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("stream");

    const handleDeleteAssignment = async (assignmentId: string) => {
        if (!confirm("Are you sure you want to dissolve this assignment?")) return;
        try {
            const formData = new FormData();
            const result = await deleteAssignmentAction(assignmentId, null, formData);
            if (result.success) {
                notifySuccess("Assignment dissolved");
                setAssignments(assignments.filter(a => a.id !== assignmentId));
            } else {
                notifyError(result.message || "Failed to dissolve assignment");
            }
        } catch (error) {
            notifyError("A failure occurred in the erasure protocol");
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm("Are you sure you want to erase this material?")) return;
        try {
            const formData = new FormData();
            const result = await deleteMaterialAction(materialId, null, formData);
            if (result.success) {
                notifySuccess("Material erased");
                setMaterials(materials.filter(m => m.id !== materialId));
            } else {
                notifyError(result.message || "Failed to erase material");
            }
        } catch (error) {
            notifyError("A failure occurred in the erasure protocol");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/admin/classroom")}
                        className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all text-slate-600"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-2 rounded-md flex items-center gap-1 h-5 text-[10px] font-bold uppercase tracking-wider">
                                <BookOpen className="w-3 h-3" />
                                Classroom
                            </Badge>
                            <span className="text-slate-300">/</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{course?.code}</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">{workspace.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/admin/classroom/${workspace.id}/edit`)}
                        className="h-12 px-6 rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-2 group transition-all"
                    >
                        <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-90 transition-transform duration-500" />
                        Infrastructure Settings
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="stream" className="w-full" onValueChange={setActiveTab}>
                <div className="bg-white/50 backdrop-blur-xl p-1.5 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 sticky top-4 z-40 w-fit mx-auto sm:mx-0">
                    <TabsList className="bg-transparent h-12 gap-1 p-0">
                        {[
                            { value: "stream", label: "Stream", icon: MessageSquare },
                            { value: "classwork", label: "Classwork", icon: FileText },
                            { value: "people", label: "People", icon: Users },
                            { value: "grades", label: "Grades", icon: GraduationCap }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={`
                                    h-10 px-6 rounded-2xl font-bold flex items-center gap-2 transition-all
                                    data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30
                                    text-slate-500 hover:text-slate-700 hover:bg-slate-100/50
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="stream" className="mt-8 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid gap-8 md:grid-cols-[1fr_320px]"
                        >
                            <div className="space-y-8">
                                <Card className="bg-slate-900 border-none rounded-[2.5rem] overflow-hidden group shadow-2xl relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-50" />
                                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/[0.03] skew-x-12 transform translate-x-20 transition-transform duration-1000 group-hover:translate-x-10" />
                                    <CardHeader className="relative z-10 p-10 pb-4">
                                        <CardTitle className="text-4xl font-black text-white leading-tight">{workspace.title}</CardTitle>
                                        <CardDescription className="text-slate-400 text-xl font-medium mt-2 flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm border border-slate-700">{course?.name}</span>
                                            <span className="text-slate-700">•</span>
                                            <span className="text-amber-500 font-bold">{batch?.name}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative z-10 p-10 pt-0">
                                        <div className="h-px w-full bg-slate-800 my-6" />
                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Roster Count</span>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-amber-500" />
                                                    <span className="text-lg font-black text-white">{students.length} Students</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Assigned Faculty</span>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4 text-amber-500" />
                                                    <span className="text-lg font-black text-white">{teachers.length} Instructors</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Class Timeline</h3>
                                    {stream.length > 0 ? (
                                        stream.map((item, index) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                key={item.id}
                                            >
                                                <Card className="hover:shadow-xl hover:shadow-slate-200/50 transition-all border-slate-200/60 rounded-3xl overflow-hidden group">
                                                    <CardContent className="p-6 flex gap-5 items-start">
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${item.type === 'assignment'
                                                            ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {item.type === 'assignment' ? <FileText className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                                                                    {item.actorName} <span className="text-slate-400 font-medium tracking-tight">is activating a new {item.type}</span>
                                                                </p>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                    <Clock className="w-3 h-3" />
                                                                    {format(new Date(item.createdAt), "MMM d")}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-lg font-black text-slate-800 leading-snug">{item.title}</h4>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                                            <CardContent className="p-16 text-center">
                                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                                                    <MessageSquare className="h-10 w-10 text-slate-300" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 mb-2">The stream is empty</h3>
                                                <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm leading-relaxed tracking-tight">No announcements or activities have materialized in this workspace yet.</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-white border-slate-200/60 rounded-[2.5rem] shadow-xl shadow-slate-200/30 overflow-hidden sticky top-24">
                                    <div className="p-1 bg-amber-500" />
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-lg font-black flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-amber-500" />
                                            Administrative Forge
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 space-y-3">
                                        <CreateAssignmentDialog
                                            workspaceId={workspace.id}
                                            onSuccess={() => router.refresh()}
                                            trigger={
                                                <Button variant="outline" className="w-full h-14 justify-start px-5 rounded-2xl border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 font-black tracking-tight flex items-center gap-4 transition-all group">
                                                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    New Assignment
                                                </Button>
                                            }
                                        />
                                        <CreateMaterialDialog
                                            workspaceId={workspace.id}
                                            onSuccess={() => router.refresh()}
                                            trigger={
                                                <Button variant="outline" className="w-full h-14 justify-start px-5 rounded-2xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 group font-black tracking-tight flex items-center gap-4 transition-all">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                                                        <BookOpen className="h-4 w-4" />
                                                    </div>
                                                    Resource Material
                                                </Button>
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="classwork" className="mt-8 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto space-y-8"
                        >
                            <div className="flex items-center justify-between px-4">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                        Academic Curriculum
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                    </h2>
                                    <p className="text-slate-500 font-bold text-sm">Managed inventory of materials and evaluated assessments.</p>
                                </div>
                                <div className="flex gap-3">
                                    <CreateMaterialDialog workspaceId={workspace.id} onSuccess={() => router.refresh()} />
                                    <CreateAssignmentDialog workspaceId={workspace.id} onSuccess={() => router.refresh()} />
                                </div>
                            </div>

                            {assignments.length === 0 && materials.length === 0 ? (
                                <Card className="border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                                    <CardContent className="p-24 text-center">
                                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                                            <BookOpen className="h-12 w-12 text-slate-200" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3">No Classwork Formed</h3>
                                        <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">Start by forging an assignment or uploading foundational materials for your students.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {assignments.map((assignment) => (
                                        <Card key={assignment.id} className="hover:shadow-2xl hover:shadow-slate-200/50 transition-all border-slate-200 rounded-3xl overflow-hidden group">
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                    <FileText className="h-7 w-7" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-xl text-slate-800 tracking-tight truncate group-hover:text-amber-600 transition-colors">{assignment.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] uppercase font-black tracking-widest py-0.5 px-2 bg-slate-100 text-slate-500 rounded-md border border-slate-200">Assignment</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Due {assignment.dueAt ? format(new Date(assignment.dueAt), "MMMM d, yyyy") : "No expiry"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pr-2">
                                                    <CreateAssignmentDialog
                                                        workspaceId={workspace.id}
                                                        assignment={assignment}
                                                        onSuccess={() => router.refresh()}
                                                        trigger={
                                                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all">
                                                                <Edit className="h-5 w-5" />
                                                            </Button>
                                                        }
                                                    />
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assignment.id)} className="h-11 w-11 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {materials.map((material) => (
                                        <Card key={material.id} className="hover:shadow-2xl hover:shadow-slate-200/50 transition-all border-slate-200/60 rounded-3xl overflow-hidden group">
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                    <BookOpen className="h-7 w-7" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-xl text-slate-800 tracking-tight truncate group-hover:text-slate-900 transition-colors">{material.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] uppercase font-black tracking-widest py-0.5 px-2 bg-slate-100 text-slate-500 rounded-md border border-slate-200">Resource</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{material.type} Content</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pr-2">
                                                    <CreateMaterialDialog
                                                        workspaceId={workspace.id}
                                                        material={material}
                                                        onSuccess={() => router.refresh()}
                                                        trigger={
                                                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all">
                                                                <Edit className="h-5 w-5" />
                                                            </Button>
                                                        }
                                                    />
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(material.id)} className="h-11 w-11 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="people" className="mt-8 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto space-y-10"
                        >
                            <div className="grid gap-10 md:grid-cols-2">
                                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/20">
                                    <CardHeader className="p-10 pb-6 border-b border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-slate-900 font-black text-2xl flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                                                    <GraduationCap className="h-6 w-6" />
                                                </div>
                                                Faculty
                                            </CardTitle>
                                            <span className="h-8 min-w-[32px] px-2 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-900/20">{teachers.length}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-8 space-y-6">
                                        {teachers.length > 0 ? (
                                            teachers.map((teacher, index) => (
                                                <motion.div
                                                    key={teacher.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-center gap-4 group cursor-default"
                                                >
                                                    <div className="relative">
                                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform duration-500">
                                                            {teacher.fullName?.substring(0, 1).toUpperCase() || "T"}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-lg border-2 border-white shadow-sm" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-800 text-lg group-hover:text-amber-600 transition-colors truncate">{teacher.fullName}</p>
                                                        <p className="text-sm font-bold text-slate-400 group-hover:text-slate-500 transition-colors truncate">{teacher.email}</p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-slate-400 font-bold italic underline decoration-slate-200 underline-offset-8">No designated faculty members</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/20">
                                    <CardHeader className="p-10 pb-6 border-b border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-slate-900 font-black text-2xl flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Users className="h-6 w-6" />
                                                </div>
                                                Scholars
                                            </CardTitle>
                                            <span className="h-8 min-w-[32px] px-2 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-900/20">{students.length}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-8 space-y-6">
                                        {students.length > 0 ? (
                                            students.map((student, index) => (
                                                <motion.div
                                                    key={student.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="flex items-center gap-4 group cursor-default"
                                                >
                                                    <div className="relative">
                                                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xl border border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-500 shadow-inner">
                                                            {student.fullName?.substring(0, 1).toUpperCase() || "S"}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-500 rounded-lg border-2 border-white shadow-sm" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors truncate">{student.fullName}</p>
                                                        <p className="text-sm font-bold text-slate-400 group-hover:text-slate-500 transition-colors truncate">{student.registrationNumber}</p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-3xl">No student enrollment detected</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="grades" className="mt-8 focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[340px_1fr]"
                        >
                            <Card className="h-fit rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/20 sticky top-24">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-black flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-amber-500" />
                                        Evaluations
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Select focus for synthesis</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex flex-col gap-2">
                                        {assignments.map((assignment) => (
                                            <button
                                                key={assignment.id}
                                                onClick={() => setSelectedAssignmentId(assignment.id)}
                                                className={`
                                                    text-left px-6 py-4 rounded-2xl text-sm font-black transition-all group flex items-center justify-between
                                                    ${selectedAssignmentId === assignment.id
                                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 ring-4 ring-slate-100"
                                                        : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-lg hover:shadow-slate-200/50"
                                                    }
                                                `}
                                            >
                                                <span className="truncate flex-1">{assignment.title}</span>
                                                {selectedAssignmentId === assignment.id ? (
                                                    <ChevronRight className="w-4 h-4 text-amber-500 animate-pulse" />
                                                ) : (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover:bg-amber-500 transition-colors" />
                                                )}
                                            </button>
                                        ))}
                                        {assignments.length === 0 && (
                                            <div className="p-10 text-center space-y-3">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                                                    <Search className="w-6 h-6" />
                                                </div>
                                                <p className="text-slate-400 font-bold text-xs">No assignments forged</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                {selectedAssignmentId ? (
                                    <motion.div
                                        key={selectedAssignmentId}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <GradingView assignmentId={selectedAssignmentId} />
                                    </motion.div>
                                ) : (
                                    <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white/50 backdrop-blur-xl border border-slate-200/20">
                                        <CardContent className="p-32 text-center">
                                            <div className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-slate-200/80 border border-slate-50 overflow-hidden relative group">
                                                <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition-opacity" />
                                                <FileText className="h-16 w-16 text-slate-100 group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                                    <Search className="w-8 h-8 opacity-20" />
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 mb-4 items-center gap-3 justify-center hidden sm:flex">
                                                Synthesis Dashboard
                                            </h3>
                                            <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto leading-relaxed tracking-tight group">
                                                Select an <span className="text-amber-600 underline underline-offset-8 decoration-amber-200 decoration-2">assignment</span> from the evaluation list to perform grading orchestration.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
