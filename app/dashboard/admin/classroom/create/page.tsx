"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { workspaceService } from "@/services/classroom/workspace.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { sessionService } from "@/services/academic/session.service";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";

export default function CreateWorkspacePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Form State
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");

    // Filters
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedProgram, setSelectedProgram] = useState("all");
    const [selectedSession, setSelectedSession] = useState("all");
    const [selectedSemester, setSelectedSemester] = useState("all");

    useEffect(() => {
        fetchFormData();
    }, []);

    const fetchFormData = async () => {
        try {
            const [coursesRes, batchesRes, departmentsRes, programsRes, sessionsRes] = await Promise.all([
                courseService.getAllCourses(),
                batchService.getAllBatches(),
                departmentService.getAllDepartments(),
                programService.getAllPrograms(),
                sessionService.getAllSessions()
            ]);

            setCourses(coursesRes);
            setBatches(batchesRes);
            setDepartments(departmentsRes);
            setPrograms(programsRes);
            setSessions(sessionsRes);
        } catch (error) {
            console.error("Failed to load form data", error);
            toast.error("Failed to load form data");
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedCourse || !selectedBatch) {
            toast.error("Please select both course and batch");
            return;
        }

        setIsSubmitting(true);
        try {
            await workspaceService.create({
                courseId: selectedCourse,
                batchId: selectedBatch
            });
            toast.success("Workspace created successfully");
            router.push("/dashboard/admin/classroom");
        } catch (error: any) {
            toast.error(error.message || "Failed to create workspace");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
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
                    <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/admin/classroom")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Create Workspace</h1>
                        <p className="text-muted-foreground">Set up a new classroom workspace for a course.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Workspace Details</CardTitle>
                        <CardDescription>Select the course and batch to create a workspace for.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <SearchableSelect
                                options={courses.map((c: any) => ({
                                    label: `${c.name} (${c.code})`,
                                    value: c.id
                                }))}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="Select course..."
                            />
                            <p className="text-xs text-muted-foreground">The academic course this workspace belongs to.</p>
                        </div>

                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Filter Batches</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                        setSelectedDepartment("all");
                                        setSelectedProgram("all");
                                        setSelectedSession("all");
                                        setSelectedSemester("all");
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Department</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "All Departments", value: "all" },
                                            ...departments.map((d: any) => ({ label: d.shortName, value: d.id }))
                                        ]}
                                        value={selectedDepartment}
                                        onChange={setSelectedDepartment}
                                        placeholder="Select department..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Program</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "All Programs", value: "all" },
                                            ...programs
                                                .filter((p: any) => selectedDepartment === "all" || (typeof p.departmentId === 'string' ? p.departmentId === selectedDepartment : p.departmentId.id === selectedDepartment))
                                                .map((p: any) => ({ label: p.shortName, value: p.id }))
                                        ]}
                                        value={selectedProgram}
                                        onChange={setSelectedProgram}
                                        placeholder="Select program..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Session</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "All Sessions", value: "all" },
                                            ...sessions.map((s: any) => ({ label: s.name, value: s.id }))
                                        ]}
                                        value={selectedSession}
                                        onChange={setSelectedSession}
                                        placeholder="Select session..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Semester</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "All Semesters", value: "all" },
                                            ...[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ label: `Semester ${s}`, value: s.toString() }))
                                        ]}
                                        value={selectedSemester}
                                        onChange={setSelectedSemester}
                                        placeholder="Select semester..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Batch</Label>
                            <SearchableSelect
                                options={batches
                                    .filter((b: any) => {
                                        if (selectedDepartment !== "all" && (typeof b.departmentId === 'string' ? b.departmentId !== selectedDepartment : b.departmentId.id !== selectedDepartment)) return false;
                                        if (selectedProgram !== "all" && (typeof b.programId === 'string' ? b.programId !== selectedProgram : b.programId.id !== selectedProgram)) return false;
                                        if (selectedSession !== "all" && (typeof b.sessionId === 'string' ? b.sessionId !== selectedSession : b.sessionId.id !== selectedSession)) return false;
                                        if (selectedSemester !== "all" && b.currentSemester.toString() !== selectedSemester) return false;
                                        return true;
                                    })
                                    .map((b: any) => ({
                                        label: `${b.name} - ${b.programId?.shortName || 'N/A'} - ${b.sessionId?.name || 'N/A'} (Sem ${b.currentSemester})`,
                                        value: b.id
                                    }))}
                                value={selectedBatch}
                                onChange={setSelectedBatch}
                                placeholder="Select batch..."
                            />
                            <p className="text-xs text-muted-foreground">The specific batch of students.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-6">
                        <Button variant="outline" onClick={() => router.push("/dashboard/admin/classroom")}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isSubmitting}
                            className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]"
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Create Workspace
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
}
