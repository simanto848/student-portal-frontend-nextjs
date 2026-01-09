"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    BarChart3,
    Award,
    FileText,
    Sparkles,
    AlertCircle,
    TrendingUp,
    GraduationCap,
    Download,
    Share2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    useStudentGrades,
    useCGPA,
} from "@/hooks/queries/useEnrollmentQueries";
import { CourseGrade } from "@/services/enrollment/courseGrade.service";

export default function GradeManagementClient() {
    const { user } = useAuth();
    const studentId = user?.id || user?._id || "";

    const {
        data: grades = [],
        isLoading: gradesLoading,
        error: gradesError,
    } = useStudentGrades(studentId);

    const { data: cgpa = 0, isLoading: cgpaLoading } = useCGPA(studentId);

    const isLoading = gradesLoading || cgpaLoading;
    const error = gradesError ? "Failed to synchronize academic records." : null;

    const totalCredits = useMemo(() =>
        grades.reduce((acc, g) => acc + ((g.course as any)?.credit || 0), 0),
        [grades]
    );

    const achievements = useMemo(() => {
        const list = [];
        if (cgpa >= 3.75) {
            list.push({ id: "a1", title: "Dean's List", detail: "GPA Above 3.75 threshold", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50" });
        }
        if (grades.some((g) => g.gradePoint === 4.0)) {
            list.push({ id: "a2", title: "Perfect Vector", detail: "Achieved 4.0 in a course", icon: Sparkles, color: "text-cyan-500", bg: "bg-cyan-50" });
        }
        return list;
    }, [cgpa, grades]);

    const maxSemester = useMemo(() =>
        grades.length > 0 ? Math.max(...grades.map((g) => g.semester)) : 1,
        [grades]
    );

    const timelineColumns: Column<CourseGrade>[] = [
        {
            header: "Course",
            accessorKey: "course" as any,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{(item.course as any)?.name || "Unknown"}</span>
                    <span className="text-[10px] uppercase tracking-widest text-cyan-600 font-black">{(item.course as any)?.code || "N/A"}</span>
                </div>
            )
        },
        {
            header: "Semester",
            accessorKey: "semester" as any,
            cell: (item) => (
                <Badge variant="outline" className="border-cyan-100 text-cyan-600 font-black text-[10px] px-3 py-1 rounded-full">
                    SEM {item.semester}
                </Badge>
            )
        },
        {
            header: "Grade Point",
            accessorKey: "gradePoint" as any,
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800">{item.gradePoint?.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-slate-400">/ 4.00</span>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "grade" as any,
            cell: (item) => {
                const gp = item.gradePoint ?? 0;
                return (
                    <div className={`text-sm font-black uppercase tracking-tighter ${gp >= 3.0 ? "text-emerald-500" : gp >= 2.0 ? "text-amber-500" : "text-rose-500"}`}>
                        {item.grade || "Processing"}
                    </div>
                );
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-6 flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                <p className="text-slate-500 font-bold animate-pulse">Scanning academic ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Scholastic Analytics"
                subtitle="Performance tracking and gradebook synthesis."
                icon={BarChart3}
                extraActions={
                    <div className="flex gap-3">
                        <Button size="sm" variant="ghost" className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-bold uppercase tracking-widest text-[10px]">
                            <Download className="mr-2 h-3.5 w-3.5" />
                            Transcript
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-bold uppercase tracking-widest text-[10px]">
                            <Share2 className="mr-2 h-3.5 w-3.5" />
                            Share
                        </Button>
                    </div>
                }
            />

            {error && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-700 shadow-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GlassCard className="p-8 md:col-span-1">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-4 rounded-[1.5rem] bg-slate-900 shadow-xl shadow-slate-200">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="bg-cyan-50 text-cyan-600 border-cyan-100 font-black uppercase tracking-widest text-[10px] px-3 py-1">Cumulative</Badge>
                    </div>
                    <h3 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{cgpa.toFixed(2)}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Scholastic Index</p>

                    <div className="space-y-2">
                        <Progress value={(cgpa / 4.0) * 100} className="h-2.5 bg-slate-100" />
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Performance baseline</span>
                            <span>Max 4.00</span>
                        </div>
                    </div>
                </GlassCard>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-cyan-600 shadow-lg shadow-cyan-200">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Academic Bulk</p>
                                <p className="text-2xl font-black text-slate-800 leading-none">{totalCredits} Credits</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                                Total workload accumulated across {grades.length} distinct processing nodes (courses) since registration.
                            </p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-amber-500 shadow-lg shadow-amber-200">
                                <Award className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Honor Registry</p>
                                <p className="text-2xl font-black text-slate-800 leading-none">{achievements.length} Badges</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {achievements.map((ach) => (
                                <div key={ach.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-50 shadow-sm">
                                    <ach.icon className={`h-4 w-4 ${ach.color}`} />
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{ach.title}</span>
                                </div>
                            ))}
                            {achievements.length === 0 && (
                                <p className="text-xs font-bold text-slate-400 italic py-2 text-center">No honors detected in current cycle.</p>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Grade Ledger */}
            <GlassCard className="p-0 border-none shadow-2xl">
                <div className="p-8 border-b border-cyan-50/50 flex items-center justify-between bg-gradient-to-r from-cyan-50/20 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Grade Ledger</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Timeline Feed</p>
                        </div>
                    </div>
                    <Badge className="bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-3 py-1">Active Cycle: SEM {maxSemester}</Badge>
                </div>
                <div className="p-6">
                    <DataTable
                        data={grades}
                        columns={timelineColumns}
                        searchKey="course"
                        searchPlaceholder="Search in scholastic timeline..."
                    />
                </div>
            </GlassCard>
        </div>
    );
}
