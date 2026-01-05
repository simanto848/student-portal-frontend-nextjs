"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { enrollmentService, BatchSemesterCourse } from "@/services/enrollment/enrollment.service";
import {
    ArrowLeft,
    Loader2,
    BookOpen,
    User,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Filter,
    GraduationCap,
    Sparkles,
    ChevronRight,
    Search,
    Satellite,
    Cpu,
    Zap
} from "lucide-react";
import { notifySuccess, notifyError, notifyInfo, notifyWarning } from "@/components/toast";
import { createEnrollmentAction } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

interface EnrollmentCreateClientProps {
    students: any[];
    batches: any[];
    departments: any[];
}

export function EnrollmentCreateClient({
    students,
    batches,
    departments
}: EnrollmentCreateClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCourses, setIsFetchingCourses] = useState(false);

    // Form State
    const [studentId, setStudentId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [semester, setSemester] = useState<number | "">("");
    const [sessionId, setSessionId] = useState("");
    const [sessionName, setSessionName] = useState("");

    // Filter State
    const [departmentFilter, setDepartmentFilter] = useState("");

    // Data Lists
    const [enrichedCourses, setEnrichedCourses] = useState<any[]>([]);

    // Computed filtered lists
    const filteredStudents = departmentFilter
        ? students.filter(s => s.departmentId === departmentFilter)
        : students;

    const filteredBatches = departmentFilter
        ? batches.filter(b => b.departmentId?.id === departmentFilter)
        : batches;

    // Auto-fill when student is selected
    useEffect(() => {
        if (studentId && !batchId) {
            const selectedStudent = students.find(s => s.id === studentId);
            if (selectedStudent?.batchId) {
                setBatchId(selectedStudent.batchId);
                if (!departmentFilter && selectedStudent.departmentId) {
                    setDepartmentFilter(selectedStudent.departmentId);
                }
            }
        }
    }, [studentId, students]);

    // Auto-fill semester and sessionId when batch is selected
    useEffect(() => {
        if (batchId) {
            const selectedBatch = batches.find(b => b.id === batchId);
            if (selectedBatch) {
                setSemester(selectedBatch.currentSemester);
                if (typeof selectedBatch.sessionId === 'object' && selectedBatch.sessionId !== null) {
                    setSessionId(selectedBatch.sessionId.id);
                    setSessionName(selectedBatch.sessionId.name || `${selectedBatch.sessionId.year}`);
                } else {
                    setSessionId(selectedBatch.sessionId);
                    setSessionName(selectedBatch.sessionId);
                }
                fetchBatchSemesterCourses(batchId, selectedBatch.currentSemester);
                if (!departmentFilter && selectedBatch.departmentId?.id) {
                    setDepartmentFilter(selectedBatch.departmentId.id);
                }
            }
        } else {
            setEnrichedCourses([]);
            setSemester("");
            setSessionId("");
            setSessionName("");
        }
    }, [batchId, batches]);

    const fetchBatchSemesterCourses = async (batchId: string, semester: number) => {
        setIsFetchingCourses(true);
        try {
            const coursesData = await enrollmentService.getBatchSemesterCourses(batchId, semester);
            setEnrichedCourses(coursesData);
        } catch (error: any) {
            notifyError("Failed to fetch stream data");
            setEnrichedCourses([]);
        } finally {
            setIsFetchingCourses(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || !batchId || !semester || !sessionId) {
            notifyWarning("Mandatory protocols missing. Please verify all fields.");
            return;
        }

        if (enrichedCourses.length === 0) {
            notifyError("No streams available for this frequency.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createEnrollmentAction({
                studentId,
                batchId,
                sessionId,
                semester: Number(semester)
            });

            if (result.success) {
                notifySuccess("Presence lifecycle initiated successfully");
                router.push("/dashboard/admin/enrollment/enrollments");
                router.refresh();
            } else {
                notifyError(result.message || "Induction failure");
            }
        } catch (error: any) {
            notifyError("A system error occurred during induction");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intel Induction</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Enroll Student</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Primary Config */}
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                            <Cpu className="w-40 h-40 text-slate-900" />
                        </div>
                        <CardHeader className="p-10 pb-0 relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
                                    <Satellite className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Core Configuration</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold tracking-tight">Define the target student and cohort parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8 relative z-10">
                            {/* Department Filter */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                                    Filter by Department
                                </label>
                                <SearchableSelect
                                    options={[
                                        { label: "Synchronize All", value: "" },
                                        ...departments.map(d => ({
                                            label: `${d.name} (${d.shortName})`,
                                            value: d.id
                                        }))
                                    ]}
                                    value={departmentFilter}
                                    onChange={setDepartmentFilter}
                                    placeholder="Select Department"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-10 border-t-2 border-slate-50">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-500" />
                                        Student
                                    </label>
                                    <SearchableSelect
                                        options={filteredStudents.map(s => ({
                                            label: `${s.fullName} (${s.registrationNumber})`,
                                            value: s.id
                                        }))}
                                        value={studentId}
                                        onChange={setStudentId}
                                        placeholder="Select Student"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-500" />
                                        Batch
                                    </label>
                                    <SearchableSelect
                                        options={filteredBatches.map(b => ({
                                            label: b.name,
                                            value: b.id
                                        }))}
                                        value={batchId}
                                        onChange={setBatchId}
                                        placeholder="Select Batch"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Current Semester</label>
                                    <Input
                                        value={semester ? `Semester ${semester}` : ""}
                                        readOnly
                                        className="h-14 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-slate-400 tracking-tight"
                                        placeholder="Waiting for cohort..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Session</label>
                                    <Input
                                        value={sessionName}
                                        readOnly
                                        className="h-14 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-slate-400 tracking-tight"
                                        placeholder="Waiting for cohort..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between p-10 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 border-2 border-slate-800">
                        <div className="hidden md:block">
                            <p className="text-white font-black text-xl tracking-tighter">Ready for Enrollment?</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Verify and synchronize student intel</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto hover:scale-95 transition-all">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="h-14 px-8 rounded-2xl text-slate-400 hover:text-white font-black tracking-tight hover:cursor-pointer"
                            >
                                Abort
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !studentId || !batchId || enrichedCourses.length === 0}
                                className="h-14 px-10 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black tracking-tight flex items-center gap-3 shadow-xl active:scale-95 transition-all w-full md:w-auto hover:cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                Begin Enrollment
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stream Preview Side Panel */}
                <div className="space-y-10">
                    <Card className="bg-white/70 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden sticky top-10">
                        <CardHeader className="p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight leading-none">Induced Streams</CardTitle>
                                </div>
                                {isFetchingCourses && <Loader2 className="w-5 h-5 animate-spin text-amber-500" />}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <AnimatePresence mode="wait">
                                {!batchId ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-20 text-center space-y-4 grayscale opacity-20"
                                    >
                                        <Satellite className="w-12 h-12 mx-auto text-slate-900" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-relaxed max-w-[140px] mx-auto">Select a cohort to scan available streams</p>
                                    </motion.div>
                                ) : enrichedCourses.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-20 text-center space-y-4"
                                    >
                                        <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-2">
                                            <AlertCircle className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-black text-slate-800">No Streams Detected</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[180px] mx-auto leading-relaxed">System scan returned null for this phase and frequency</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        {enrichedCourses.map((course, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={course.courseId}
                                                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-slate-800 tracking-tight leading-tight group-hover:text-amber-600 transition-colors">{course.course?.name || "Global Stream"}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mt-1">{course.course?.code || "UNKN"}</p>
                                                    </div>
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${course.instructorAssigned ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} shadow-sm`}>
                                                        {course.instructorAssigned ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                                {course.instructor && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                                        <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[7px] font-black text-slate-600">
                                                            PI
                                                        </div>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{course.instructor.fullName}</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                        <div className="mt-8 p-6 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-xl shadow-slate-900/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-lg leading-none">{enrichedCourses.length}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Streams</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
