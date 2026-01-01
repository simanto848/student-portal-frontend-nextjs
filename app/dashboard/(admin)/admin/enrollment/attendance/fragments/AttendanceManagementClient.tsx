"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Attendance } from "@/services/enrollment/attendance.service";
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
    Sparkles
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { deleteAttendanceAction } from "../actions";

interface AttendanceManagementClientProps {
    initialAttendance: Attendance[];
    courses: any[];
    batches: any[];
}

export function AttendanceManagementClient({
    initialAttendance,
    courses,
    batches
}: AttendanceManagementClientProps) {
    const router = useRouter();
    const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter Logic is still client-side for immediate responsiveness, 
    // but data is initially server-fetched.
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this intelligence record?")) return;
        setIsDeleting(id);
        try {
            const result = await deleteAttendanceAction(id);
            if (result.success) {
                notifySuccess("Attendance record purged successfully");
                setAttendance(prev => prev.filter(a => a.id !== id));
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
        setSelectedCourse("");
        setSelectedBatch("");
        setSelectedDate("");
        setSelectedStatus("");
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Filtered internal list
    const filteredAttendance = attendance.filter(record => {
        if (selectedCourse && record.courseId !== selectedCourse) return false;
        if (selectedBatch && record.batchId !== selectedBatch) return false;
        if (selectedStatus && record.status !== selectedStatus) return false;
        if (selectedDate) {
            const d1 = new Date(record.date).toISOString().split('T')[0];
            const d2 = selectedDate;
            if (d1 !== d2) return false;
        }
        return true;
    });

    const statusColors = {
        present: "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100",
        absent: "bg-rose-100 text-rose-700 border-rose-200",
        late: "bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-100",
        excused: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Attendance Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Presence Analysis</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className={`h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw className="w-6 h-6" />
                    </button>
                    <Link href="/dashboard/admin/enrollment/attendance/create">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white shadow-2xl shadow-slate-900/20 font-black tracking-tight flex items-center gap-3 active:scale-95 transition-all group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            Record Presence
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
                        {(selectedCourse || selectedBatch || selectedDate || selectedStatus) && (
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
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Analytical Course</label>
                            <SearchableSelect
                                options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="All Streams"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Specific Batch</label>
                            <SearchableSelect
                                options={batches.map(b => ({ label: b.name, value: b.id }))}
                                value={selectedBatch}
                                onChange={setSelectedBatch}
                                placeholder="All Cohorts"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Temporal Window</label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-12 border-2 border-slate-100 rounded-xl focus:border-amber-500/50 focus:ring-amber-500/10 font-bold transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Presence Status</label>
                            <SearchableSelect
                                options={[
                                    { label: "Present ✅", value: "present" },
                                    { label: "Absent ❌", value: "absent" },
                                    { label: "Late ⏰", value: "late" },
                                    { label: "Excused 📄", value: "excused" }
                                ]}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                placeholder="All Statuses"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance List */}
            <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden group/table">
                <Table>
                    <TableHeader className="bg-slate-50 border-b-2 border-slate-100">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="py-8 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject / Student</TableHead>
                            <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Environment</TableHead>
                            <TableHead className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Temporal Stamp</TableHead>
                            <TableHead className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="py-8 text-right px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {filteredAttendance.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700">
                                            <Calendar className="w-20 h-20 text-slate-900 group-hover:scale-110 transition-transform duration-700" />
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-500 italic">No attendance signatures detected in this frequency</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttendance.map((record) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={record.id}
                                        className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors group/row active:bg-slate-100/30"
                                    >
                                        <TableCell className="py-8 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-slate-900/10 group-hover/row:scale-110 group-hover/row:rotate-3 transition-all duration-500">
                                                    {record.student?.fullName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 leading-none mb-1.5 group-hover/row:text-amber-600 transition-colors">
                                                        {record.student?.fullName || "Anonymous Intel"}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                        {record.student?.studentId || "UNREGISTERED"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8">
                                            <div className="flex flex-col gap-1 text-[11px] font-bold relative group/info">
                                                <div className="flex items-center gap-2 text-slate-800">
                                                    <BookOpen className="w-3 h-3 text-amber-500" />
                                                    {record.course?.name || "Global Stream"}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Users className="w-3 h-3 text-slate-300" />
                                                    {record.batch?.name || "Ungrouped Cohort"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 shadow-inner group-hover/row:bg-white group-hover/row:border-amber-200/50 transition-colors">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                <p className="text-xs font-black text-slate-700 tracking-tight">
                                                    {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-8 text-center">
                                            <Badge className={`${statusColors[record.status]} border-none px-4 py-1 rounded-full flex mx-auto w-fit items-center gap-2 font-black text-[10px] uppercase tracking-widest`}>
                                                {(record.status === 'present' || record.status === 'late') && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse outline outline-2 outline-offset-2 outline-white/50" />}
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-8 px-10 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
                                                <Link href={`/dashboard/admin/enrollment/attendance/${record.id}/edit`}>
                                                    <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-500/30 flex items-center justify-center transition-all hover:bg-amber-50 hover:shadow-lg shadow-slate-200/50 active:scale-90">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    disabled={isDeleting === record.id}
                                                    onClick={() => handleDelete(record.id)}
                                                    className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-500/30 flex items-center justify-center transition-all hover:bg-rose-50 hover:shadow-lg shadow-slate-200/50 active:scale-90"
                                                >
                                                    {isDeleting === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {isDeleting === record.id && <div className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">Purging...</div>}
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </Card>

            {/* Quick Stats Overlay (Optional Aesthetic Touch) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10">
                <StatCard icon={Users} label="Daily Coverage" value={`${Math.round((filteredAttendance.filter(a => a.status === 'present').length / (filteredAttendance.length || 1)) * 100)}%`} color="amber" />
                <StatCard icon={Calendar} label="Active Frequency" value={new Set(filteredAttendance.map(a => a.date)).size} color="indigo" />
                <StatCard icon={Sparkles} label="Integrity Score" value="98.2" color="emerald" />
                <StatCard icon={ChevronRight} label="Total Records" value={filteredAttendance.length} color="slate" />
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
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
