"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { notifySuccess, notifyError } from "@/components/toast";
import { Loader2, ArrowLeft, Save, Sparkles, Filter, Database } from "lucide-react";
import { createWorkspaceAction } from "../actions";
import { motion } from "framer-motion";

interface CreateWorkspaceClientProps {
    courses: any[];
    batches: any[];
    departments: any[];
    programs: any[];
    sessions: any[];
}

export function CreateWorkspaceClient({
    courses,
    batches,
    departments,
    programs,
    sessions
}: CreateWorkspaceClientProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");

    // Filters
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedProgram, setSelectedProgram] = useState("all");
    const [selectedSession, setSelectedSession] = useState("all");
    const [selectedSemester, setSelectedSemester] = useState("all");

    const handleCreate = async () => {
        if (!selectedCourse || !selectedBatch) {
            notifyError("Please select both course and batch");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("courseId", selectedCourse);
            formData.append("batchId", selectedBatch);

            const result = await createWorkspaceAction(null, formData);
            if (result.success) {
                notifySuccess("Workspace forged successfully");
                router.push("/dashboard/admin/classroom");
            } else {
                notifyError(result.message || "Failed to forge workspace");
            }
        } catch (error: any) {
            notifyError("A catastrophic failure occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8 pb-12"
        >
            <div className="flex items-center gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/admin/classroom")}
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                </Button>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        Forge Workspace
                        <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Initialize a divine academic environment for your students.</p>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />
                <CardHeader className="p-10 pb-6 bg-slate-50/50">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Database className="w-6 h-6 text-amber-600" />
                        Infrastructure Parameters
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-base">Select the core nexus of this academic workspace.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-4 space-y-10">
                    <div className="space-y-3">
                        <Label className="text-lg font-bold text-slate-700 ml-1">Target Course</Label>
                        <SearchableSelect
                            options={courses.map((c: any) => ({
                                label: `${c.name} (${c.code})`,
                                value: c.id
                            }))}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            placeholder="Identify the course..."
                        />
                    </div>

                    <div className="space-y-6 p-8 rounded-[2rem] bg-amber-50/50 border border-amber-100/50 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-5">
                            <Filter className="w-24 h-24" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <Label className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Roster Refinement
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 rounded-xl text-amber-700 hover:bg-amber-100/50 font-bold transition-all"
                                onClick={() => {
                                    setSelectedDepartment("all");
                                    setSelectedProgram("all");
                                    setSelectedSession("all");
                                    setSelectedSemester("all");
                                }}
                            >
                                Clear Optimization
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-600 ml-1">Department</Label>
                                <SearchableSelect
                                    options={[
                                        { label: "Universal Departments", value: "all" },
                                        ...departments.map((d: any) => ({ label: d.shortName, value: d.id }))
                                    ]}
                                    value={selectedDepartment}
                                    onChange={setSelectedDepartment}
                                    placeholder="Select scope..."
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-600 ml-1">Program</Label>
                                <SearchableSelect
                                    options={[
                                        { label: "Universal Programs", value: "all" },
                                        ...programs
                                            .filter((p: any) => selectedDepartment === "all" || (typeof p.departmentId === 'string' ? p.departmentId === selectedDepartment : p.departmentId.id === selectedDepartment))
                                            .map((p: any) => ({ label: p.shortName, value: p.id }))
                                    ]}
                                    value={selectedProgram}
                                    onChange={setSelectedProgram}
                                    placeholder="Select discipline..."
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-600 ml-1">Session</Label>
                                <SearchableSelect
                                    options={[
                                        { label: "Universal Sessions", value: "all" },
                                        ...sessions.map((s: any) => ({ label: s.name, value: s.id }))
                                    ]}
                                    value={selectedSession}
                                    onChange={setSelectedSession}
                                    placeholder="Select timeline..."
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-600 ml-1">Current Semester</Label>
                                <SearchableSelect
                                    options={[
                                        { label: "Universal Semesters", value: "all" },
                                        ...[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ label: `Semester ${s}`, value: s.toString() }))
                                    ]}
                                    value={selectedSemester}
                                    onChange={setSelectedSemester}
                                    placeholder="Select stage..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-lg font-bold text-slate-700 ml-1 text-emerald-700">Student Batch</Label>
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
                            placeholder="Designate the batch..."
                        />
                    </div>
                </CardContent>
                <CardFooter className="p-10 pt-6 bg-slate-50/50 flex justify-end gap-4 border-t border-slate-200/60">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/dashboard/admin/classroom")}
                        className="h-14 px-8 rounded-[1.25rem] text-slate-600 font-bold hover:bg-white transition-all"
                    >
                        Abort
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        className="h-14 px-10 bg-amber-600 hover:bg-amber-700 text-white rounded-[1.25rem] shadow-xl shadow-amber-500/30 font-extrabold transition-all active:scale-95 flex items-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Forge Now
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
