"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { workspaceService } from "@/services/classroom/workspace.service";
import { streamService } from "@/services/classroom/stream.service";
import { assignmentService } from "@/services/classroom/assignment.service";
import { materialService } from "@/services/classroom/material.service";
import { Workspace, Assignment, Material, StreamItem } from "@/services/classroom/types";
import { SubmissionView } from "@/components/classroom/SubmissionView";
import { StudentAttendanceView } from "@/components/classroom/StudentAttendanceView";
import { StudentAssessmentView } from "@/components/classroom/StudentAssessmentView";
import { StudentGradeView } from "@/components/classroom/StudentGradeView";
import { Loader2, MessageSquare, FileText, BookOpen, Users, ArrowLeft, Link as LinkIcon, File } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { downloadBlob } from "@/lib/download";

export default function StudentClassroomDetailPage() {
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
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!workspace) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/student/classroom")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
                                {(workspace as any).courseName || workspace.title}
                            </h1>
                            <p className="text-muted-foreground">
                                {(workspace as any).courseCode || workspace.courseId} • Batch {(workspace as any).batchName || workspace.batchId}
                                {(workspace as any).programId?.shortName && ` • ${(workspace as any).programId.shortName}`}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="stream" className="w-full">
                    <TabsList className="grid w-full grid-cols-7 lg:w-[700px]">
                        <TabsTrigger value="stream">Stream</TabsTrigger>
                        <TabsTrigger value="classwork">Classwork</TabsTrigger>
                        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                        <TabsTrigger value="people">People</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="grades">Grades</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stream" className="mt-6">
                        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                            <div className="space-y-6">
                                <Card className="bg-linear-to-r from-[#344e41] to-[#588157] text-white border-none">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">
                                            {(workspace as any).courseName || workspace.title}
                                        </CardTitle>
                                        <CardDescription className="text-gray-100">
                                            {(workspace as any).courseCode || workspace.courseId} • Batch {(workspace as any).batchName || workspace.batchId}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm opacity-90">
                                            Check here for announcements and upcoming assignments.
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    {stream.length > 0 ? (
                                        stream.map((item) => (
                                            <Card key={item.id}>
                                                <CardContent className="p-4 flex gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-[#3e6253]/10 flex items-center justify-center text-[#3e6253] shrink-0">
                                                        {item.type === 'assignment' ? <FileText className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#1a3d32]">
                                                            {item.actorName} posted a new {item.type}: <span className="font-bold">{item.title}</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card>
                                            <CardContent className="p-6 text-center text-muted-foreground">
                                                <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                                <p>No announcements yet</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {assignments.filter(a => new Date(a.dueAt!) > new Date()).length > 0 ? (
                                            <div className="space-y-2">
                                                {assignments
                                                    .filter(a => new Date(a.dueAt!) > new Date())
                                                    .slice(0, 3)
                                                    .map(a => (
                                                        <div key={a.id} className="text-sm">
                                                            <p className="font-medium">{a.title}</p>
                                                            <p className="text-xs text-muted-foreground">Due {format(new Date(a.dueAt!), "MMM d")}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No work due soon</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="classwork" className="mt-6">
                        {selectedAssignmentId ? (
                            <div className="space-y-4">
                                <Button variant="ghost" onClick={() => setSelectedAssignmentId(null)} className="mb-2">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Classwork
                                </Button>
                                <SubmissionView assignmentId={selectedAssignmentId} studentId={user?.id || ""} />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {assignments.length === 0 && materials.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center text-muted-foreground">
                                            <BookOpen className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                            <h3 className="text-lg font-medium text-[#1a3d32] mb-2">Classwork</h3>
                                            <p>No assignments or materials yet</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {assignments.map((assignment) => (
                                            <Card
                                                key={assignment.id}
                                                className="hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => setSelectedAssignmentId(assignment.id)}
                                            >
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-[#3e6253]/10 flex items-center justify-center text-[#3e6253]">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-[#1a3d32]">{assignment.title}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            Due {assignment.dueAt ? format(new Date(assignment.dueAt), "MMM d, yyyy") : "No due date"}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {materials.map((material) => (
                                            <Card key={material.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                        {material.type === 'link' ? <LinkIcon className="h-5 w-5" /> :
                                                            material.type === 'file' ? <File className="h-5 w-5" /> :
                                                                <BookOpen className="h-5 w-5" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-[#1a3d32]">{material.title}</h4>
                                                        <p className="text-xs text-muted-foreground">Material</p>
                                                        {material.type === 'text' && <p className="text-sm text-gray-600 mt-2">{material.content}</p>}
                                                        {material.type === 'link' && material.content ? (
                                                            <a href={material.content} target="_blank" rel="noopener noreferrer" className="text-[#3e6253] hover:underline text-sm font-medium block mt-1">
                                                                {material.content}
                                                            </a>
                                                        ) : null}

                                                        {material.type === 'file' && material.attachments?.length ? (
                                                            <div className="mt-2 space-y-1">
                                                                {material.attachments.map((att, idx) => (
                                                                    <Button
                                                                        key={att.id || `${material.id}-${idx}`}
                                                                        variant="ghost"
                                                                        className="h-auto p-0 justify-start text-[#3e6253] hover:underline"
                                                                        onClick={() => handleDownloadMaterialAttachment(material, idx)}
                                                                    >
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        {att.name}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="people" className="mt-6">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-[#3e6253]">Teachers</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">{workspace.teacherIds?.length || 0} teacher(s)</span>
                                            <Users className="h-5 w-5 text-[#3e6253]" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {((workspace as any).teachers?.length > 0 || workspace.teacherIds?.length > 0) ? (
                                            ((workspace as any).teachers || workspace.teacherIds?.map((id: string) => ({ id, fullName: "Unknown Teacher" }))).map((teacher: any, idx: number) => (
                                                <div key={teacher.id || idx} className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[#3e6253]/10 flex items-center justify-center text-[#3e6253] font-medium">
                                                        {teacher.fullName?.substring(0, 2).toUpperCase() || `T${idx + 1}`}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#1a3d32]">{teacher.fullName || "Course Instructor"}</p>
                                                        {teacher.email && <p className="text-xs text-muted-foreground">{teacher.email}</p>}
                                                        {!teacher.email && <p className="text-xs text-muted-foreground">Course Instructor</p>}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No teachers assigned</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-[#3e6253]">Batch Students</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {(workspace as any).totalBatchStudents || workspace.studentIds?.length || 0} students in Batch {(workspace as any).batchName || ""}
                                            </span>
                                            <Users className="h-5 w-5 text-[#3e6253]" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                        <p className="font-medium text-[#1a3d32]">
                                            {(workspace as any).totalBatchStudents || 0} Students in Batch {(workspace as any).batchName || ""}
                                        </p>
                                        <p className="text-sm mt-1">
                                            All students enrolled in this batch have access to this classroom.
                                        </p>
                                        {(workspace as any).programId?.shortName && (
                                            <p className="text-xs mt-2 text-gray-400">
                                                Program: {(workspace as any).programId.shortName}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-6">
                        <StudentAttendanceView
                            courseId={workspace.courseId}
                            batchId={workspace.batchId}
                            studentId={user?.id || ""}
                        />
                    </TabsContent>

                    <TabsContent value="quizzes" className="mt-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#344e41]">Quizzes & Exams</h2>
                                    <p className="text-sm text-muted-foreground">Take quizzes and track your progress</p>
                                </div>
                                <Button
                                    className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                                    onClick={() => router.push(`/dashboard/student/classroom/${id}/quiz`)}
                                >
                                    View All Quizzes
                                </Button>
                            </div>
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-[#344e41] mb-2">Quiz Center</h3>
                                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                        Take timed quizzes, view your results, and track your progress.
                                    </p>
                                    <Button
                                        className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                                        onClick={() => router.push(`/dashboard/student/classroom/${id}/quiz`)}
                                    >
                                        Open Quiz Center
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="assessments" className="mt-6">
                        <StudentAssessmentView
                            courseId={workspace.courseId}
                            batchId={workspace.batchId}
                            studentId={user?.id || ""}
                        />
                    </TabsContent>

                    <TabsContent value="grades" className="mt-6">
                        <StudentGradeView
                            courseId={workspace.courseId}
                            batchId={workspace.batchId}
                            studentId={user?.id || ""}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
