"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { workspaceService } from "@/services/classroom/workspace.service";
import { Workspace } from "@/services/classroom/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BookOpen, Users } from "lucide-react";

export default function ClassroomsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchWorkspaces();
        }
    }, [user?.id]);

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const data = await workspaceService.listMine();
            setWorkspaces(data);
        } catch (error) {
            console.error("Fetch workspaces error:", error);
            toast.error("Failed to load classrooms");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">My Classrooms</h1>
                    <p className="text-muted-foreground">Access your active course workspaces</p>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading classrooms...</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {workspaces.length > 0 ? (
                            workspaces.map((workspace) => (
                                <Card key={workspace.id} className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-[#f8f9fa] border-b pb-4">
                                        <CardTitle className="text-xl font-bold text-[#1a3d32] line-clamp-2">
                                            {workspace.title}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">{workspace.description}</p>
                                    </CardHeader>
                                    <CardContent className="pt-6 flex-1 space-y-4">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <BookOpen className="h-4 w-4" />
                                            <span>Assignments: {workspace.stats?.assignmentsCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Users className="h-4 w-4" />
                                            <span>Students: {workspace.stats?.studentsCount || 0}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t bg-gray-50/50">
                                        <Button
                                            className="w-full bg-[#1a3d32] hover:bg-[#142e26] text-white"
                                            onClick={() => router.push(`/dashboard/teacher/classroom/${workspace.id}`)} // Updated link
                                        >
                                            Enter Classroom
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No active classrooms found. Classrooms are created automatically for your courses.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
