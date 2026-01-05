"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Enrollment } from "@/services/enrollment/enrollment.service";
import {
    Loader2,
    Filter,
    X,
    Plus,
    Pencil,
    Trash2,
    Calendar,
    Users,
    BookOpen,
    RefreshCcw,
    Search,
    ChevronRight,
    Sparkles,
    GraduationCap,
    University,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { deleteEnrollmentAction } from "../actions";
import { format } from "date-fns";

interface EnrollmentManagementClientProps {
    initialEnrollments: Enrollment[];
    courses: any[];
    batches: any[];
    students: any[];
}

interface StudentEnrollmentGroup {
    studentId: string;
    student: any;
    batch: any;
    session: any;
    semester: number;
    enrollments: Enrollment[];
    totalCourses: number;
    activeCount: number;
    completedCount: number;
}

export function EnrollmentManagementClient({
    initialEnrollments,
    courses,
    batches,
    students
}: EnrollmentManagementClientProps) {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this enrollment record?")) return;
        setIsDeleting(id);
        try {
            const result = await deleteEnrollmentAction(id);
            if (result.success) {
                notifySuccess("Enrollment record purged successfully");
                setEnrollments(prev => prev.filter(e => e.id !== id));
                router.refresh();
            } else {
                notifyError(result.message || "Operation failed");
            }
        } catch (error) {
            notifyError("A system error occurred during deletion");
        } finally {
            setIsDeleting(null);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCourse("");
        setSelectedBatch("");
        setSelectedStatus("");
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Grouping Logic
    const groupedEnrollments: StudentEnrollmentGroup[] = enrollments.reduce(
        (acc, enrollment) => {
            const existing = acc.find((g) => g.studentId === enrollment.studentId);

            if (existing) {
                existing.enrollments.push(enrollment);
                existing.totalCourses++;
                if (
                    (enrollment.status === "active" || enrollment.status === "enrolled") &&
                    enrollment.semester === existing.semester
                ) {
                    existing.activeCount++;
                }
                if (enrollment.status === "completed") existing.completedCount++;
            } else {
                acc.push({
                    studentId: enrollment.studentId,
                    student: enrollment.student,
                    batch: enrollment.batch,
                    session: enrollment.session,
                    semester: enrollment.semester,
                    enrollments: [enrollment],
                    totalCourses: 1,
                    activeCount:
                        (enrollment.status === "active" || enrollment.status === "enrolled")
                            ? 1
                            : 0,
                    completedCount: enrollment.status === "completed" ? 1 : 0,
                });
            }

            return acc;
        },
        [] as StudentEnrollmentGroup[]
    );

    // Filter Logic
    const filteredGroups = groupedEnrollments.filter((group) => {
        const searchLower = search.toLowerCase();
        const matchesSearch = !search ||
            group.student?.fullName?.toLowerCase().includes(searchLower) ||
            group.student?.registrationNumber?.toLowerCase().includes(searchLower);

        const matchesCourse = !selectedCourse || group.enrollments.some(e => e.courseId === selectedCourse);
        const matchesBatch = !selectedBatch || group.enrollments.some(e => e.batchId === selectedBatch);
        const matchesStatus = !selectedStatus || group.enrollments.some(e => e.status === selectedStatus);

        return matchesSearch && matchesCourse && matchesBatch && matchesStatus;
    });

    const statusColors = {
        active: "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100",
        enrolled: "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100",
        completed: "bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-100",
        dropped: "bg-amber-100 text-amber-700 border-amber-200",
        failed: "bg-rose-100 text-rose-700 border-rose-200",
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Enrollment Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Presence Lifecycle</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className={`h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw className="w-6 h-6" />
                    </button>
                    <Link href="/dashboard/admin/enrollment/enrollments/create">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            Enroll Student
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Section - Glassmorphism */}
            <Card className="bg-white/70 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 rotate-12">
                    <Filter className="w-32 h-32 text-slate-900" />
                </div>
                <CardHeader className="pb-4 pt-8 px-10 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
                                <Search className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xl font-black text-slate-800 tracking-tight underline decoration-amber-500/30 decoration-4 underline-offset-4">Intelligence Filters</CardTitle>
                        </div>
                        {(search || selectedCourse || selectedBatch || selectedStatus) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                            >
                                <X className="w-4 h-4" /> Purge Filters
                            </motion.button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-10 pt-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Search Identity</label>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name or registration..."
                                className="h-12 border-2 border-slate-100 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/10 font-bold transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Target Course</label>
                            <SearchableSelect
                                options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="All Courses"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Target Cohort</label>
                            <SearchableSelect
                                options={batches.map(b => ({ label: b.name, value: b.id }))}
                                value={selectedBatch}
                                onChange={setSelectedBatch}
                                placeholder="All Batches"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Current Frequency</label>
                            <SearchableSelect
                                options={[
                                    { label: "Active ✅", value: "active" },
                                    { label: "Enrolled 📚", value: "enrolled" },
                                    { label: "Completed ✨", value: "completed" },
                                    { label: "Dropped ⚠️", value: "dropped" },
                                    { label: "Failed ❌", value: "failed" }
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                placeholder="All Statuses"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overall Metrics Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10">
                <MetricCard icon={Users} label="Total Managed" value={groupedEnrollments.length} color="amber" />
                <MetricCard icon={BookOpen} label="Intel Frequency" value={enrollments.length} color="indigo" />
                <MetricCard icon={Sparkles} label="Success Ratio" value="94.8%" color="emerald" />
                <MetricCard icon={University} label="Active Streams" value={new Set(enrollments.map(e => e.courseId)).size} color="slate" />
            </div>

            {/* Groups Grid */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filteredGroups.length === 0 ? (
                        <Card key="empty-state" className="py-32 text-center bg-white border-2 border-slate-100 rounded-[3rem]">
                            <div className="flex flex-col items-center gap-6 grayscale opacity-20">
                                <GraduationCap className="w-20 h-20 text-slate-900" />
                                <p className="text-sm font-black uppercase tracking-widest text-slate-500 italic">No student intel detected in this frequency</p>
                            </div>
                        </Card>
                    ) : (
                        filteredGroups.map((group) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={group.studentId}
                                className="group/card"
                            >
                                <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden hover:border-amber-500/20 transition-all">
                                    <div className="p-8 md:p-10">
                                        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-slate-900/20 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500">
                                                    {group.student?.fullName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 group-hover/card:text-amber-600 transition-colors">
                                                        {group.student?.fullName || "Anonymous Intel"}
                                                    </h2>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                        #{group.student?.registrationNumber || group.studentId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 md:px-10">
                                                <Stat icon={University} label="Department" value={group.batch?.department?.shortName || "STEM"} />
                                                <Stat icon={Users} label="Cohort" value={group.batch?.name || "Global"} />
                                                <Stat icon={Calendar} label="Session" value={group.session?.name || "Open"} />
                                                <Stat icon={GraduationCap} label="Semester" value={`Phase ${group.semester}`} />
                                            </div>

                                            <div className="flex flex-col items-end gap-3 self-center md:self-start">
                                                <div className="flex gap-2">
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                                                        {group.activeCount} Active
                                                    </Badge>
                                                    {group.completedCount > 0 && (
                                                        <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                                                            {group.completedCount} Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setExpandedStudent(expandedStudent === group.studentId ? null : group.studentId)}
                                                    className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-amber-600 hover:bg-amber-50 gap-2 transition-all"
                                                >
                                                    {expandedStudent === group.studentId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    {expandedStudent === group.studentId ? "Conceal Details" : "Show Details"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Section */}
                                    <AnimatePresence>
                                        {expandedStudent === group.studentId && (
                                            <motion.div
                                                key={`expanded-${group.studentId}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t-2 border-slate-50 bg-slate-50/30"
                                            >
                                                <div className="p-8 md:p-10 space-y-4">
                                                    {group.enrollments.map((enrollment, idx) => (
                                                        <div
                                                            key={`${enrollment.id}-${idx}`}
                                                            className="flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-amber-500/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all group/row"
                                                        >
                                                            <div className="flex items-center gap-6">
                                                                <div className="h-10 w-10 border-2 border-slate-100 rounded-xl flex items-center justify-center font-black text-slate-800 text-xs group-hover/row:bg-slate-900 group-hover/row:text-white group-hover/row:border-slate-900 transition-all">
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-slate-900 leading-tight mb-1 group-hover/row:text-amber-600 transition-colors">
                                                                        {enrollment.course?.name || "Global Stream"}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                        <span className="text-amber-500">{enrollment.course?.code || "UNKN"}</span>
                                                                        <span>•</span>
                                                                        <span>Instructor: {enrollment.instructor?.fullName || "Unassigned"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <Badge className={`${statusColors[enrollment.status as keyof typeof statusColors]} border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest`}>
                                                                    {enrollment.status}
                                                                </Badge>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                    {format(new Date(enrollment.enrollmentDate), "MMM d, yyyy")}
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <Link href={`/dashboard/admin/enrollment/enrollments/${enrollment.id}`}>
                                                                        <button className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-amber-200 flex items-center justify-center transition-all">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </button>
                                                                    </Link>
                                                                    <button
                                                                        disabled={isDeleting === enrollment.id}
                                                                        onClick={() => handleDelete(enrollment.id)}
                                                                        className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-200 flex items-center justify-center transition-all"
                                                                    >
                                                                        {isDeleting === enrollment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Stat({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Icon className="w-3 h-3" />
                {label}
            </div>
            <p className="text-sm font-bold text-slate-700">{value}</p>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    const colors = {
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };

    return (
        <Card className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/30 group hover:border-amber-500/20 transition-all active:scale-95 cursor-default">
            <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl ${colors[color as keyof typeof colors]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                </div>
            </div>
        </Card>
    );
}
