"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MultiSearchableSelect } from "@/components/ui/multi-searchable-select";
import { workspaceService } from "@/services/classroom/workspace.service";
import { teacherService } from "@/services/teacher.service";

import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditWorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [allowLateSubmission, setAllowLateSubmission] = useState(false);
    const [lateGraceMinutes, setLateGraceMinutes] = useState(0);
    const [maxAttachmentSizeMB, setMaxAttachmentSizeMB] = useState(10);

    // Teacher Management
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [workspaceData, teachersData] = await Promise.all([
                workspaceService.getById(id),
                teacherService.getAllTeachers()
            ]);

            // Set Workspace Data
            setTitle(workspaceData.title || "");
            if (workspaceData.settings) {
                setAllowLateSubmission(workspaceData.settings.allowLateSubmission ?? false);
                setLateGraceMinutes(workspaceData.settings.lateGraceMinutes ?? 0);
                setMaxAttachmentSizeMB(workspaceData.settings.maxAttachmentSizeMB ?? 10);
            }
            setSelectedTeachers(workspaceData.teacherIds || []);

            // Set Teachers Data
            setTeachers(teachersData);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load workspace data");
            router.push(`/dashboard/admin/classroom/${id}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await workspaceService.update(id, {
                title,
                settings: {
                    allowLateSubmission,
                    lateGraceMinutes,
                    maxAttachmentSizeMB
                },
                teacherIds: selectedTeachers
            });
            toast.success("Workspace updated successfully");
            router.push(`/dashboard/admin/classroom/${id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update workspace");
        } finally {
            setIsSaving(false);
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
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/admin/classroom/${id}`)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Edit Workspace</h1>
                        <p className="text-muted-foreground">Update workspace settings and details.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Basic details about the workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Workspace Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Introduction to Computer Science"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Teachers</CardTitle>
                        <CardDescription>Manage teachers assigned to this workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Assigned Teachers</Label>
                            <MultiSearchableSelect
                                options={teachers.map((t: any) => ({
                                    label: `${t.fullName} (${t.email})`,
                                    value: t.id
                                }))}
                                value={selectedTeachers}
                                onChange={setSelectedTeachers}
                                placeholder="Select teachers..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Teachers have full access to manage the workspace, assignments, and grades.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Submission Settings</CardTitle>
                        <CardDescription>Configure how students can submit assignments.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Allow Late Submissions</Label>
                                <p className="text-sm text-muted-foreground">
                                    Students can submit work after the due date.
                                </p>
                            </div>
                            <Switch
                                checked={allowLateSubmission}
                                onCheckedChange={setAllowLateSubmission}
                            />
                        </div>

                        {allowLateSubmission && (
                            <div className="space-y-2">
                                <Label htmlFor="gracePeriod">Grace Period (minutes)</Label>
                                <Input
                                    id="gracePeriod"
                                    type="number"
                                    min="0"
                                    value={lateGraceMinutes}
                                    onChange={(e) => setLateGraceMinutes(parseInt(e.target.value) || 0)}
                                />
                                <p className="text-xs text-muted-foreground">Time before a submission is marked as late.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="maxSize">Max Attachment Size (MB)</Label>
                            <Input
                                id="maxSize"
                                type="number"
                                min="1"
                                max="100"
                                value={maxAttachmentSizeMB}
                                onChange={(e) => setMaxAttachmentSizeMB(parseInt(e.target.value) || 10)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-6">
                        <Button variant="outline" onClick={() => router.push(`/dashboard/admin/classroom/${id}`)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]"
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
}
