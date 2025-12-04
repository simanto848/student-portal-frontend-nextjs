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
import { Loader2, MessageSquare, FileText, BookOpen, Users, ArrowLeft, Link as LinkIcon, File } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

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

    // Submission View State
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
                            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">{workspace.title}</h1>
                            <p className="text-muted-foreground">
                                {workspace.courseId} • {workspace.batchId}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="stream" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="stream">Stream</TabsTrigger>
                        <TabsTrigger value="classwork">Classwork</TabsTrigger>
                        <TabsTrigger value="people">People</TabsTrigger>
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
                                                        {(material.type === 'link' || material.type === 'file') && (
                                                            <a href={material.content} target="_blank" rel="noopener noreferrer" className="text-[#3e6253] hover:underline text-sm font-medium block mt-1">
                                                                {material.content}
                                                            </a>
                                                        )}
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
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
