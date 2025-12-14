"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workspaceService } from "@/services/classroom/workspace.service";
import { Workspace } from "@/services/classroom/types";
import { toast } from "sonner";
import { Loader2, BookOpen, ArrowRight, GraduationCap, Users, Calendar, Code } from "lucide-react";
import Link from "next/link";

export default function StudentClassroomPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const data = await workspaceService.listMine();
            setWorkspaces(data);
        } catch (error) {
            toast.error("Failed to load classrooms");
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">My Classrooms</h1>
                        <p className="text-muted-foreground">Access your courses, materials, and assignments.</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {workspaces.length} {workspaces.length === 1 ? "Course" : "Courses"}
                    </Badge>
                </div>

                {/* Classroom Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((ws: any) => (
                        <Card
                            key={ws.id || ws._id}
                            className="border-none shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
                        >
                            {/* Colored Header Bar */}
                            <div className="h-2 bg-gradient-to-r from-[#588157] to-[#3a5a40]" />

                            <CardHeader className="pb-3">
                                {/* Course Code Badge */}
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className="bg-[#588157]/10 text-[#344e41] hover:bg-[#588157]/20 font-mono">
                                        <Code className="h-3 w-3 mr-1" />
                                        {ws.courseCode || "N/A"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        Batch {ws.batchName || "N/A"}
                                    </Badge>
                                </div>

                                {/* Course Name */}
                                <CardTitle className="text-lg font-bold text-[#1a3d32] group-hover:text-[#588157] transition-colors line-clamp-2">
                                    {ws.courseName || ws.title || "Untitled Course"}
                                </CardTitle>

                                {/* Program Info */}
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    <span className="line-clamp-1">
                                        {ws.programId?.shortName || ws.programId?.name || "Unknown Program"}
                                    </span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pb-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {/* Total Students */}
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="h-4 w-4 text-[#588157]" />
                                        <span>{ws.totalBatchStudents || 0} Students</span>
                                    </div>

                                    {/* Semester Info */}
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="h-4 w-4 text-[#588157]" />
                                        <span>Semester {ws.semester || "1"}</span>
                                    </div>
                                </div>

                                {/* Quick Access Links */}
                                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>Materials, Quizzes & Assignments</span>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-0">
                                <Link
                                    href={`/dashboard/student/classroom/${ws.id || ws._id}`}
                                    className="w-full"
                                >
                                    <Button className="w-full bg-[#588157] text-white hover:bg-[#3a5a40] group-hover:shadow-md transition-all">
                                        Enter Classroom
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {workspaces.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700">No Classrooms Available</h3>
                            <p className="text-sm text-center max-w-md mt-1">
                                You are not enrolled in any classrooms yet. Classrooms will appear here once your teachers set them up.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
