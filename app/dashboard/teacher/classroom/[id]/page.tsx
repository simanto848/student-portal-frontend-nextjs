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
import { CreateAssignmentDialog } from "@/components/classroom/CreateAssignmentDialog";
import { CreateMaterialDialog } from "@/components/classroom/CreateMaterialDialog";
import { GradingView } from "@/components/classroom/GradingView";
import { AttendanceView } from "@/components/classroom/AttendanceView";
import { AssessmentView } from "@/components/classroom/AssessmentView";
import { CourseGradeView } from "@/components/classroom/CourseGradeView";
import { Loader2, MessageSquare, FileText, BookOpen, Users, ArrowLeft, Settings, Edit, Trash2, ClipboardCheck, Calendar, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TeacherClassroomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [stream, setStream] = useState<StreamItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Grading View State
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
            router.push("/dashboard/teacher/classroom");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId: string) => {
        if (!confirm("Are you sure you want to delete this assignment?")) return;
        try {
            await assignmentService.delete(assignmentId);
            toast.success("Assignment deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete assignment");
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        try {
            await materialService.delete(materialId);
            toast.success("Material deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete material");
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
                        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/teacher/classroom")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">{workspace.title}</h1>
                            <p className="text-muted-foreground">
                                {workspace.courseId} • {workspace.batchId}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="stream" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 lg:w-[600px]">
                        <TabsTrigger value="stream">Stream</TabsTrigger>
                        <TabsTrigger value="classwork">Classwork</TabsTrigger>
                        <TabsTrigger value="people">People</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="grades">Grades</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stream" className="mt-6">
                        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-r from-[#344e41] to-[#588157] text-white border-none">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{workspace.title}</CardTitle>
                                        <CardDescription className="text-gray-100">
                                            {workspace.courseId} • {workspace.batchId}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm opacity-90">
                                            Welcome to your classroom stream.
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
                                        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <CreateAssignmentDialog
                                            workspaceId={id}
                                            onSuccess={fetchData}
                                            trigger={
                                                <Button variant="outline" className="w-full justify-start">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    New Assignment
                                                </Button>
                                            }
                                        />
                                        <CreateMaterialDialog
                                            workspaceId={id}
                                            onSuccess={fetchData}
                                            trigger={
                                                <Button variant="outline" className="w-full justify-start">
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    New Material
                                                </Button>
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="classwork" className="mt-6 space-y-6">
                        <div className="flex justify-end gap-2">
                            <CreateMaterialDialog workspaceId={id} onSuccess={fetchData} />
                            <CreateAssignmentDialog workspaceId={id} onSuccess={fetchData} />
                        </div>

                        {assignments.length === 0 && materials.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center text-muted-foreground">
                                    <BookOpen className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                    <h3 className="text-lg font-medium text-[#1a3d32] mb-2">Classwork</h3>
                                    <p>Create assignments and materials to get started</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
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
                                            <div className="flex items-center gap-2">
                                                <CreateAssignmentDialog
                                                    workspaceId={id}
                                                    assignment={assignment}
                                                    onSuccess={fetchData}
                                                    trigger={
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assignment.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {materials.map((material) => (
                                    <Card key={material.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-[#1a3d32]">{material.title}</h4>
                                                <p className="text-xs text-muted-foreground">Material</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CreateMaterialDialog
                                                    workspaceId={id}
                                                    material={material}
                                                    onSuccess={fetchData}
                                                    trigger={
                                                        <Button variant="ghost" size="icon">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(material.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="people" className="mt-6">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-[#3e6253]">Teachers</CardTitle>
                                        <Users className="h-5 w-5 text-[#3e6253]" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {workspace.teacherIds?.length > 0 ? (
                                            workspace.teacherIds.map((id) => (
                                                <div key={id} className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-[#3e6253]/10 flex items-center justify-center text-[#3e6253]">
                                                        {id.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span>{id}</span>
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
                                        <CardTitle className="text-[#3e6253]">Students</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">{workspace.studentIds?.length || 0} students</span>
                                            <Users className="h-5 w-5 text-[#3e6253]" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {workspace.studentIds?.length > 0 ? (
                                            workspace.studentIds.map((id) => (
                                                <div key={id} className="flex items-center gap-3 border-b pb-2 last:border-0">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                        {id.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span>{id}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No students enrolled</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-6">
                        <AttendanceView courseId={workspace.courseId} batchId={workspace.batchId} />
                    </TabsContent>

                    <TabsContent value="assessments" className="mt-6">
                        <AssessmentView courseId={workspace.courseId} batchId={workspace.batchId} />
                    </TabsContent>

                    <TabsContent value="grades" className="mt-6">
                        <Tabs defaultValue="assignments" className="w-full">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="assignments">Assignment Grading</TabsTrigger>
                                <TabsTrigger value="course-grades">Final Course Grades</TabsTrigger>
                            </TabsList>

                            <TabsContent value="assignments" className="mt-6">
                                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                                    <Card className="h-fit">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Assignments</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="flex flex-col">
                                                {assignments.map((assignment) => (
                                                    <button
                                                        key={assignment.id}
                                                        onClick={() => setSelectedAssignmentId(assignment.id)}
                                                        className={`text-left px-6 py-3 text-sm hover:bg-gray-50 transition-colors ${selectedAssignmentId === assignment.id
                                                            ? "bg-[#3e6253]/10 text-[#3e6253] font-medium border-l-4 border-[#3e6253]"
                                                            : "text-gray-600 border-l-4 border-transparent"
                                                            }`}
                                                    >
                                                        {assignment.title}
                                                    </button>
                                                ))}
                                                {assignments.length === 0 && (
                                                    <div className="p-6 text-center text-muted-foreground text-sm">
                                                        No assignments created yet
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-6">
                                        {selectedAssignmentId ? (
                                            <GradingView assignmentId={selectedAssignmentId} />
                                        ) : (
                                            <Card>
                                                <CardContent className="p-12 text-center text-muted-foreground">
                                                    <FileText className="mx-auto h-12 w-12 opacity-20 mb-4" />
                                                    <h3 className="text-lg font-medium text-[#1a3d32] mb-2">Select an Assignment</h3>
                                                    <p>Choose an assignment from the list to view submissions and grades</p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="course-grades" className="mt-6">
                                <CourseGradeView
                                    courseId={workspace.courseId}
                                    batchId={workspace.batchId}
                                    semester={1} // TODO: Fetch semester from batch or workspace
                                />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}

