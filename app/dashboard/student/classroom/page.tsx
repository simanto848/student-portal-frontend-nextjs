"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { workspaceService } from "@/services/classroom/workspace.service";
import { Workspace } from "@/services/classroom/types";
import { toast } from "sonner";
import { Loader2, BookOpen, ArrowRight } from "lucide-react";

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
            toast.error("Failed to load workspaces");
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">My Classrooms</h1>
                        <p className="text-muted-foreground">Access your courses and assignments.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((ws) => (
                        <Card key={ws.id} className="border-none shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => window.location.href = `/dashboard/student/classroom/${ws.id}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-[#1a3d32] group-hover:text-[#3e6253] transition-colors">
                                    {ws.title || "Untitled Workspace"}
                                </CardTitle>
                                <CardDescription>
                                    {ws.courseId} • {ws.batchId}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>View Course Materials</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button className="w-full bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
                                    Enter Classroom
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {workspaces.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            You are not enrolled in any classrooms yet.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
