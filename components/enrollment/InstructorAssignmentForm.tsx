"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService } from "@/services/teacher.service";
import { batchService } from "@/services/academic/batch.service";
import { departmentService } from "@/services/academic/department.service";
import { sessionCourseService } from "@/services/academic/session-course.service";
import { Loader2, Copy, BookOpen, Users, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { cn } from "@/lib/utils";

interface InstructorAssignmentFormProps {
    assignmentId?: string;
}

interface CourseAssignment {
    courseId: string;
    courseName: string;
    courseCode: string;
    instructorId: string;
    status: "active" | "completed" | "reassigned";
}

export function InstructorAssignmentForm({ assignmentId }: InstructorAssignmentFormProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Selection State
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

    // Data Lists
    const [teachers, setTeachers] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    // Assignment State
    const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
    const [globalInstructorId, setGlobalInstructorId] = useState<string>("");

    const isEditing = !!assignmentId;

    useEffect(() => {
        fetchInitialData();
    }, [assignmentId]);

    useEffect(() => {
        if (selectedBatchId && !isEditing) {
            fetchBatchCourses(selectedBatchId);
        }
    }, [selectedBatchId]);

    const fetchInitialData = async () => {
        setIsFetching(true);
        try {
            const [teachersData, batchesData, departmentsData] = await Promise.all([
                teacherService.getAllTeachers(),
                batchService.getAllBatches(),
                departmentService.getAllDepartments()
            ]);
            setTeachers(teachersData || []);
            setBatches(batchesData || []);
            setDepartments(departmentsData || []);

            if (assignmentId) {
                const existing = await batchCourseInstructorService.getAssignment(assignmentId);
                setSelectedBatchId(existing.batchId);
                const courseId = existing.courseId;

                // For editing, we only show that specific assignment
                setAssignments([{
                    courseId: courseId,
                    courseName: existing.course?.name || "Unknown Course",
                    courseCode: existing.course?.code || "N/A",
                    instructorId: existing.instructorId,
                    status: existing.status
                }]);
            }
        } catch (error) {
            toast.error("Failed to load form data");
        } finally {
            setIsFetching(false);
        }
    };

    const fetchBatchCourses = async (batchId: string) => {
        try {
            const [courses, existingAssignments] = await Promise.all([
                sessionCourseService.getBatchSessionCourses(batchId),
                batchCourseInstructorService.listAssignments({ batchId, status: 'active' })
            ]);

            const assignmentsList: BatchCourseInstructor[] = Array.isArray(existingAssignments)
                ? (existingAssignments as any)
                : (existingAssignments as any)?.assignments || [];

            const assignmentMap = new Map<string, BatchCourseInstructor>(
                assignmentsList.map((a) => [a.courseId, a])
            );

            const initialAssignments: CourseAssignment[] = courses.map((sc: any) => {
                const courseId = sc.courseId.id || sc.courseId._id;
                const existing = assignmentMap.get(courseId);

                return {
                    courseId: courseId,
                    courseName: sc.courseId.name,
                    courseCode: sc.courseId.code,
                    instructorId: existing ? existing.instructorId : "",
                    status: existing ? (existing.status as "active" | "completed" | "reassigned") : "active" as const
                };
            });
            setAssignments(initialAssignments);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load batch courses");
        }
    };

    const getDepartmentId = (item: any) => {
        if (!item.departmentId) return null;
        return typeof item.departmentId === 'object' ? item.departmentId.id || item.departmentId._id : item.departmentId;
    };

    const filteredBatches = batches.filter(b => !selectedDepartmentId || getDepartmentId(b) === selectedDepartmentId);

    const handleAssignmentChange = (courseId: string, field: keyof CourseAssignment, value: any) => {
        setAssignments(prev => prev.map(a =>
            a.courseId === courseId ? { ...a, [field]: value } : a
        ));
    };

    const applyGlobalInstructor = () => {
        if (!globalInstructorId) return;
        setAssignments(prev => prev.map(a => ({ ...a, instructorId: globalInstructorId })));
        toast.success("Applied instructor to all courses");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBatchId) {
            toast.error("Please select a batch");
            return;
        }

        const validAssignments = assignments.filter(a => a.instructorId);
        if (validAssignments.length === 0) {
            toast.error("Please assign an instructor to at least one course");
            return;
        }

        const selectedBatch = batches.find(b => b.id === selectedBatchId);
        const sessionId = typeof selectedBatch?.sessionId === 'object'
            ? (selectedBatch.sessionId.id || selectedBatch.sessionId._id)
            : selectedBatch?.sessionId;

        const semester = selectedBatch?.currentSemester || 1;

        setIsLoading(true);
        try {
            if (isEditing && assignmentId) {
                // Single update
                const assignment = validAssignments[0];
                await batchCourseInstructorService.updateAssignment(assignmentId, {
                    instructorId: assignment.instructorId,
                    status: assignment.status
                });
                toast.success("Assignment updated successfully");
            } else {
                // Bulk create
                const payload = validAssignments.map(a => ({
                    batchId: selectedBatchId,
                    courseId: a.courseId,
                    instructorId: a.instructorId,
                    sessionId: sessionId || "",
                    semester: semester,
                    status: a.status
                }));
                await batchCourseInstructorService.bulkAssign(payload);
                toast.success(`Successfully processed ${payload.length} assignments`);
            }
            router.push("/dashboard/admin/enrollment/instructors");
        } catch (error: any) {
            toast.error(error.message || "Failed to save assignments");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className={cn("h-10 w-10 animate-spin", theme.colors.accent.primary)} />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">Initializing Interface...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <GlassCard className="p-8 border-amber-100/50" delay={0.1}>
                <div className="flex items-center gap-3 mb-8">
                    <div className={cn("p-2.5 rounded-xl ring-1 shadow-sm", theme.colors.sidebar.active.replace('bg-', 'bg-') + '/10 ring-' + theme.colors.sidebar.active.replace('bg-', '') + '/20')}>
                        <Building2 className={cn("h-5 w-5", theme.colors.accent.primary)} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Scope Selection</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Select target academic unit and batch</p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Filter (Optional)</Label>
                        <SearchableSelect
                            options={[
                                { label: "All Departments", value: "" },
                                ...departments.map(d => ({ label: d.name, value: d.id }))
                            ]}
                            value={selectedDepartmentId}
                            onChange={(val) => {
                                setSelectedDepartmentId(val);
                                if (!isEditing) setSelectedBatchId("");
                            }}
                            placeholder="Filter by Department..."
                            disabled={isEditing}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Batch <span className="text-rose-500">*</span></Label>
                        <SearchableSelect
                            options={filteredBatches.map(b => ({
                                label: b.code || b.name,
                                value: b.id
                            }))}
                            value={selectedBatchId}
                            onChange={setSelectedBatchId}
                            placeholder="Select Batch..."
                            disabled={isEditing}
                        />
                    </div>
                </div>
            </GlassCard>

            {selectedBatchId && (
                <div className="space-y-6">
                    {!isEditing && (
                        <GlassCard className="p-6 border-indigo-100/50" delay={0.2}>
                            <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-indigo-50 ring-1 ring-indigo-100 shadow-sm">
                                        <Users className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-slate-800 tracking-tight">Bulk Assignment Helper</h2>
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Apply one instructor to all courses below</p>
                                    </div>
                                </div>
                                <div className="flex flex-1 items-center gap-3 w-full sm:max-w-md">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            options={teachers.map(t => ({
                                                label: `${t.fullName} (${t.email})`,
                                                value: t.id
                                            }))}
                                            value={globalInstructorId}
                                            onChange={setGlobalInstructorId}
                                            placeholder="Select global instructor..."
                                        />
                                    </div>
                                    <Button
                                        onClick={applyGlobalInstructor}
                                        variant="outline"
                                        className="h-10 px-4 rounded-xl border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm transition-all active:scale-95"
                                    >
                                        <Copy className="h-3.5 w-3.5" /> Apply
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    <GlassCard className="overflow-hidden border-slate-200/60 p-0 shadow-xl" delay={0.3}>
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm">
                                    <BookOpen className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800 tracking-tight">Course Allocations</h2>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Running courses for selected batch</p>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-white border-slate-200 py-1 shadow-sm">
                                    Total: {assignments.length} Course{assignments.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow className="hover:bg-transparent border-slate-200">
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px]">Code</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Course Name</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[320px]">Instructor Assignment</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[140px] text-right pr-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <AlertCircle className="h-8 w-8 text-slate-300" />
                                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No matching courses found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        assignments.map((assignment) => (
                                            <TableRow key={assignment.courseId} className="group hover:bg-slate-50/50 transition-colors border-slate-100">
                                                <TableCell>
                                                    <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                        {assignment.courseCode}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-black text-slate-700">{assignment.courseName}</TableCell>
                                                <TableCell>
                                                    <SearchableSelect
                                                        options={teachers.map(t => ({
                                                            label: t.fullName,
                                                            value: t.id
                                                        }))}
                                                        value={assignment.instructorId}
                                                        onChange={(val) => handleAssignmentChange(assignment.courseId, "instructorId", val)}
                                                        placeholder="Select Instructor"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <select
                                                        className="text-[11px] font-black text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer capitalize shadow-sm"
                                                        value={assignment.status}
                                                        onChange={(e) => handleAssignmentChange(assignment.courseId, "status", e.target.value)}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="reassigned">Reassigned</option>
                                                    </select>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </GlassCard>

                    <div className="flex items-center justify-between pt-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-12 px-6 rounded-2xl text-slate-500 font-black tracking-tight hover:bg-slate-100 transition-all"
                        >
                            Discard Changes
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || assignments.length === 0}
                            className={cn(
                                "h-12 px-10 rounded-2xl font-black tracking-tight gap-2 shadow-lg transition-all active:scale-95 text-white",
                                theme.colors.sidebar.active,
                                theme.colors.sidebar.active.replace('bg-', 'shadow-').replace('600', '200') + '/50'
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                            {isEditing ? "Update Assignment" : "Confirm Allocations"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
