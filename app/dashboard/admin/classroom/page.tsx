"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { workspaceService } from "@/services/classroom/workspace.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { departmentService } from "@/services/academic/department.service";
import { Workspace } from "@/services/classroom/types";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, BookOpen, Users, GraduationCap, Calendar, Building2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EnrichedWorkspace extends Workspace {
    courseName?: string;
    courseCode?: string;
    batchName?: string;
    departmentName?: string;
    departmentShortName?: string;
}

export default function AdminClassroomPage() {
    const [workspaces, setWorkspaces] = useState<EnrichedWorkspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [workspacesData, coursesData, batchesData, departmentsData] = await Promise.all([
                workspaceService.listMine(),
                courseService.getAllCourses(),
                batchService.getAllBatches(),
                departmentService.getAllDepartments()
            ]);

            const enrichedWorkspaces = workspacesData.map(ws => {
                const course = coursesData.find((c: any) => c.id === ws.courseId);
                const batch = batchesData.find((b: any) => b.id === ws.batchId);
                const department = departmentsData.find((d: any) => d.id === ws.departmentId);

                return {
                    ...ws,
                    courseName: course?.name || "Unknown Course",
                    courseCode: course?.code || "N/A",
                    batchName: batch?.name || "Unknown Batch",
                    departmentName: department?.name || "Unknown Department",
                    departmentShortName: department?.shortName || "N/A"
                };
            });

            setWorkspaces(enrichedWorkspaces);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load workspaces");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this workspace?")) return;

        try {
            await workspaceService.delete(id);
            toast.success("Workspace deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete workspace");
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

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Classroom Management</h1>
                        <p className="text-muted-foreground mt-1">Manage course workspaces, assignments, and grades.</p>
                    </div>
                    <Button
                        className="bg-[#3e6253] text-white hover:bg-[#2c4a3e] shadow-md hover:shadow-lg transition-all"
                        onClick={() => window.location.href = "/dashboard/admin/classroom/create"}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Workspace
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {workspaces.map((ws) => (
                        <Card key={ws.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/50 backdrop-blur-sm hover:bg-white">
                            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="bg-white text-[#3e6253] border-[#3e6253]/20">
                                            {ws.courseCode}
                                        </Badge>
                                        <CardTitle className="text-lg font-bold text-[#1a3d32] line-clamp-1 group-hover:text-[#3e6253] transition-colors">
                                            {ws.courseName}
                                        </CardTitle>
                                    </div>
                                </div>
                                <CardDescription className="flex items-center gap-2 text-xs font-medium pt-1">
                                    <Building2 className="h-3 w-3" />
                                    {ws.departmentName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">{ws.batchName}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Students</span>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-gray-500" />
                                            <span className="font-semibold text-gray-700">{ws.studentIds?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">Teachers</span>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-gray-500" />
                                            <span className="font-semibold text-gray-700">{ws.teacherIds?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-2 pb-4 px-4 bg-gray-50/50 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-105 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(ws.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:scale-105 transition-transform"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/dashboard/admin/classroom/${ws.id}/edit`;
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-[#3e6253] text-white hover:bg-[#2c4a3e] shadow-sm hover:shadow hover:scale-105 transition-all"
                                    onClick={() => window.location.href = `/dashboard/admin/classroom/${ws.id}`}
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Enter Classroom
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {workspaces.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                            <div className="p-4 rounded-full bg-white shadow-sm mb-4">
                                <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No workspaces found</h3>
                            <p className="text-sm text-gray-500 max-w-sm mt-2 mb-6">
                                Get started by creating a new workspace for a course batch.
                            </p>
                            <Button
                                onClick={() => window.location.href = "/dashboard/admin/classroom/create"}
                                className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Workspace
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
