"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
    batchCourseInstructorService,
    BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { notifySuccess, notifyError } from "@/components/toast";
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
    UserCog,
    ShieldCheck,
    Satellite,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { InstructorDeleteModal } from "./InstructorDeleteModal";
import { deleteInstructorAssignmentAction } from "../actions";
import { format } from "date-fns";

const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.name) return item.name;
    if (typeof item === "object" && item.fullName) return item.fullName;
    return "N/A";
};

interface AssignmentWithDetails extends BatchCourseInstructor {
    instructorName: string;
    instructorEmail: string;
    courseName: string;
    courseCode: string;
    batchName: string;
    displayDate: string;
}

export default function InstructorManagementClient() {
    const [assignments, setAssignments] = useState<BatchCourseInstructor[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [search, setSearch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [assignmentsRes, teachersRes, coursesRes, batchesRes] = await Promise.all([
                batchCourseInstructorService.listAssignments(),
                teacherService.getAll({ limit: 1000 }),
                courseService.getAllCourses(),
                batchService.getAllBatches()
            ]);

            setAssignments(assignmentsRes?.assignments || []);
            setTeachers(teachersRes?.teachers || []);
            setCourses(Array.isArray(coursesRes) ? coursesRes : []);
            setBatches(Array.isArray(batchesRes) ? batchesRes : []);
        } catch (error) {
            notifyError("Failed to load assignments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleDeleteClick = (assignment: AssignmentWithDetails) => {
        setSelectedAssignment(assignment);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAssignment) return;
        setIsDeleting(true);
        try {
            const formData = new FormData();
            const result = await deleteInstructorAssignmentAction(selectedAssignment.id, null, formData);
            if (result.success) {
                notifySuccess("Assignment purged successfully");
                fetchData();
                setIsDeleteModalOpen(false);
            } else {
                notifyError(result.message || "Operation failed");
            }
        } catch (error: any) {
            notifyError(error?.message || "System error during deletion");
        } finally {
            setIsDeleting(false);
            setSelectedAssignment(null);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCourse("");
        setSelectedBatch("");
        setSelectedStatus("");
    };

    const enrichedAssignments = useMemo(() => {
        return assignments.map((a) => {
            const teacher = teachers.find(t => t.id === a.instructorId);
            const course = courses.find(c => (c.id === a.courseId || c._id === a.courseId));
            const batch = batches.find(b => (b.id === a.batchId || b._id === a.batchId));

            const batchObj = a.batch || batch;
            const batchBaseName = getName(batchObj);
            const shiftPrefix = batchObj?.shift === "day" ? "D-" : batchObj?.shift === "evening" ? "E-" : "";

            return {
                ...a,
                instructorName: teacher?.fullName || "Unknown Instructor",
                instructorEmail: teacher?.email || "",
                courseName: getName(a.course) !== "N/A" ? getName(a.course) : getName(course),
                courseCode: a.course?.code || course?.code || "UNKN",
                batchName: batchBaseName !== "N/A" ? `${shiftPrefix}${batchBaseName}` : "N/A",
                displayDate: a.assignedDate ? format(new Date(a.assignedDate), "MMM d, yyyy") : "N/A"
            };
        });
    }, [assignments, teachers, courses, batches]);

    const filteredAssignments = enrichedAssignments.filter((a) => {
        const searchLower = search.toLowerCase();
        const matchesSearch = !search ||
            a.instructorName?.toLowerCase().includes(searchLower) ||
            a.courseName?.toLowerCase().includes(searchLower) ||
            a.batchName?.toLowerCase().includes(searchLower);

        const matchesCourse = !selectedCourse || a.courseId === selectedCourse;
        const matchesBatch = !selectedBatch || a.batchId === selectedBatch;
        const matchesStatus = !selectedStatus || a.status === selectedStatus;

        return matchesSearch && matchesCourse && matchesBatch && matchesStatus;
    });

    const statusColors = {
        active: "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100",
        completed: "bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-100",
        inactive: "bg-amber-100 text-amber-700 border-amber-200",
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center animate-pulse shadow-2xl shadow-slate-900/20">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Initializing Faculty Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Faculty Operations</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Course Instructor Management</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className={`h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw className="w-6 h-6" />
                    </button>
                    <Link href="/dashboard/admin/enrollment/instructors/create">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            Assign Faculty
                        </Button>
                    </Link>
                </div>
            </div>

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
                            <CardTitle className="text-xl font-black text-slate-800 tracking-tight underline decoration-amber-500/30 decoration-4 underline-offset-4">Advance Filters</CardTitle>
                        </div>
                        {(search || selectedCourse || selectedBatch || selectedStatus) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                            >
                                <X className="w-4 h-4" /> Clear Filters
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
                                placeholder="Instructor, course, batch..."
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
                                    { label: "Completed ✨", value: "completed" },
                                    { label: "Inactive ⏸️", value: "inactive" }
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                placeholder="All Statuses"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                <MetricCard icon={UserCog} label="Instructors" value={enrichedAssignments.length} color="amber" />
                <MetricCard icon={BookOpen} label="Courses" value={new Set(enrichedAssignments.map(a => a.courseId)).size} color="indigo" />
                <MetricCard icon={Users} label="Batches" value={new Set(enrichedAssignments.map(a => a.batchId)).size} color="emerald" />
            </div>

            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filteredAssignments.length === 0 ? (
                        <Card className="py-32 text-center bg-white border-2 border-slate-100 rounded-[3rem]">
                            <div className="flex flex-col items-center gap-6 grayscale opacity-20">
                                <ShieldCheck className="w-20 h-20 text-slate-900" />
                                <p className="text-sm font-black uppercase tracking-widest text-slate-500 italic">No faculty assignments detected in this frequency</p>
                            </div>
                        </Card>
                    ) : (
                        filteredAssignments.map((assignment) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={assignment.id}
                                className="group/card"
                            >
                                <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden hover:border-amber-500/20 transition-all">
                                    <div className="p-8 md:p-10">
                                        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-slate-900/20 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-500">
                                                    {assignment.instructorName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 group-hover/card:text-amber-600 transition-colors">
                                                        {assignment.instructorName}
                                                    </h2>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                        {assignment.instructorEmail}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 md:px-10">
                                                <Stat icon={BookOpen} label="Course" value={assignment.courseName} subValue={assignment.courseCode} />
                                                <Stat icon={Users} label="Cohort" value={assignment.batchName} />
                                                <Stat icon={Calendar} label="Phase" value={`Semester ${assignment.semester}`} />
                                                <Stat icon={Satellite} label="Assigned" value={assignment.displayDate} />
                                            </div>

                                            <div className="flex flex-col items-end gap-3 self-center md:self-start">
                                                <Badge className={`${statusColors[assignment.status as keyof typeof statusColors]} border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest`}>
                                                    {assignment.status}
                                                </Badge>
                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/admin/enrollment/instructors/${assignment.id}`}>
                                                        <button className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-amber-200 flex items-center justify-center transition-all">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </button>
                                                    </Link>
                                                    <Link href={`/dashboard/admin/enrollment/instructors/${assignment.id}/edit`}>
                                                        <button className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-amber-200 flex items-center justify-center transition-all">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        disabled={isDeleting && selectedAssignment?.id === assignment.id}
                                                        onClick={() => handleDeleteClick(assignment)}
                                                        className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-200 flex items-center justify-center transition-all"
                                                    >
                                                        {isDeleting && selectedAssignment?.id === assignment.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <InstructorDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}

function Stat({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue?: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Icon className="w-3 h-3" />
                {label}
            </div>
            <p className="text-sm font-bold text-slate-700 leading-tight">{value}</p>
            {subValue && (
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{subValue}</p>
            )}
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
