"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";
import {
    Loader2,
    Save,
    ArrowLeft,
    CheckSquare,
    Square,
    Sparkles,
    Users,
    Calendar,
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    FileText
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import { markBulkAttendanceAction } from "../actions";

interface AttendanceCreateClientProps {
    courses: any[];
    batches: any[];
}

export function AttendanceCreateClient({ courses, batches }: AttendanceCreateClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingStudents, setIsFetchingStudents] = useState(false);

    // Form Data
    const [courseId, setCourseId] = useState("");
    const [batchId, setBatchId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendances, setAttendances] = useState<any[]>([]);

    useEffect(() => {
        if (courseId && batchId) {
            fetchEnrolledStudents();
        } else {
            setAttendances([]);
        }
    }, [courseId, batchId]);

    const fetchEnrolledStudents = async () => {
        setIsFetchingStudents(true);
        try {
            const data = await enrollmentService.listEnrollments({ courseId, batchId, status: 'active' });
            const enrollments = Array.isArray(data) ? data : (data as any).enrollments || [];

            const initialAttendances = enrollments.map((enrollment: any) => ({
                studentId: enrollment.studentId,
                studentName: enrollment.student?.fullName || "Unknown Student",
                registrationNumber: enrollment.student?.studentId || "-",
                status: 'present',
                remarks: ""
            }));

            setAttendances(initialAttendances);
        } catch (error) {
            notifyError("Failed to synchronize student frequency");
            setAttendances([]);
        } finally {
            setIsFetchingStudents(false);
        }
    };

    const handleStatusChange = (index: number, status: string) => {
        const newAttendances = [...attendances];
        newAttendances[index].status = status;
        setAttendances(newAttendances);
    };

    const handleRemarksChange = (index: number, remarks: string) => {
        const newAttendances = [...attendances];
        newAttendances[index].remarks = remarks;
        setAttendances(newAttendances);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !batchId || !date) {
            notifyError("Session parameters incomplete");
            return;
        }
        if (attendances.length === 0) {
            notifyError("No presence signatures to record");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                courseId,
                batchId,
                date: new Date(date).toISOString(),
                attendances: attendances.map(a => ({
                    studentId: a.studentId,
                    status: a.status as any,
                    remarks: a.remarks
                }))
            };

            const result = await markBulkAttendanceAction(payload);
            if (result.success) {
                notifySuccess("Intelligence recorded successfully");
                router.push("/dashboard/admin/enrollment/attendance");
            } else {
                notifyError(result.message || "Recording failed");
            }
        } catch (error: any) {
            notifyError("Critical system failure during recording");
        } finally {
            setIsLoading(false);
        }
    };

    const markAll = (status: string) => {
        const newAttendances = attendances.map(a => ({ ...a, status }));
        setAttendances(newAttendances);
    };

    const statusConfig: Record<string, { icon: any, color: string, activeClass: string }> = {
        present: { icon: CheckCircle2, color: "text-emerald-500", activeClass: "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100" },
        absent: { icon: XCircle, color: "text-rose-500", activeClass: "bg-rose-100 text-rose-700 border-rose-200 shadow-sm shadow-rose-100" },
        late: { icon: Clock, color: "text-amber-500", activeClass: "bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-100" },
        excused: { icon: FileText, color: "text-blue-500", activeClass: "bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-100" },
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Capture</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Record Presence</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Session Details Panel */}
                <div className="lg:col-span-1 border-r border-slate-100 pr-10">
                    <Card className="bg-white/50 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 p-8 space-y-8 sticky top-10">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                    <BookOpen className="w-3 h-3 text-amber-500" /> Analytical Course
                                </Label>
                                <SearchableSelect
                                    options={courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.id }))}
                                    value={courseId}
                                    onChange={setCourseId}
                                    placeholder="Select Environment"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                    <Users className="w-3 h-3 text-amber-500" /> Target Batch
                                </Label>
                                <SearchableSelect
                                    options={batches.map(b => ({ label: b.name, value: b.id }))}
                                    value={batchId}
                                    onChange={setBatchId}
                                    placeholder="Select Cohort"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                    <Calendar className="w-3 h-3 text-amber-500" /> Temporal Stamp
                                </Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-12 border-2 border-slate-100 rounded-xl focus:border-amber-500/50 font-bold"
                                />
                            </div>
                        </div>

                        {attendances.length > 0 && (
                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Batch Operations</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-2 border-slate-100 font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all text-[11px]"
                                        onClick={() => markAll('present')}
                                    >
                                        Mass Present
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl border-2 border-slate-100 font-bold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all text-[11px]"
                                        onClick={() => markAll('absent')}
                                    >
                                        Mass Absent
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Students List Area */}
                <div className="lg:col-span-2">
                    {isFetchingStudents ? (
                        <div className="py-32 flex flex-col items-center gap-6">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="h-16 w-16 border-4 border-slate-100 border-t-amber-500 rounded-full"
                            />
                            <p className="text-sm font-black uppercase tracking-widest text-slate-400 animate-pulse">Synchronizing Intelligence...</p>
                        </div>
                    ) : attendances.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden"
                        >
                            <Table>
                                <TableHeader className="bg-slate-50 border-b-2 border-slate-100 text-center">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Profile</TableHead>
                                        <TableHead className="py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status Calibration</TableHead>
                                        <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendances.map((item, index) => (
                                        <TableRow key={item.studentId} className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors group">
                                            <TableCell className="py-6 px-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 border-2 border-slate-100 rounded-xl flex items-center justify-center font-black text-slate-800 text-xs">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 leading-tight mb-0.5">{item.studentName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-wider">#{item.registrationNumber}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {Object.entries(statusConfig).map(([s, config]) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => handleStatusChange(index, s)}
                                                            className={`h-10 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 group/btn ${item.status === s
                                                                ? config.activeClass
                                                                : 'bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:bg-amber-50'
                                                                }`}
                                                            title={s.charAt(0).toUpperCase() + s.slice(1)}
                                                        >
                                                            <config.icon className={`h-4 w-4 ${item.status === s ? '' : 'opacity-40 group-hover/btn:opacity-100 transition-opacity'}`} />
                                                            {item.status === s && <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{s}</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 px-10">
                                                <Input
                                                    value={item.remarks}
                                                    onChange={(e) => handleRemarksChange(index, e.target.value)}
                                                    placeholder="Observation details..."
                                                    className="h-10 border-2 border-transparent bg-slate-50 rounded-xl focus:bg-white focus:border-amber-500/50 transition-all text-xs font-bold"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{attendances.length} Profiles Ready</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all text-[10px]"
                                        onClick={() => router.back()}
                                    >
                                        Abort
                                    </Button>
                                    <Button
                                        disabled={isLoading}
                                        className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 active:scale-95 transition-all text-[10px] flex items-center gap-3"
                                        onClick={handleSubmit}
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Finalize Record
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-40 flex flex-col items-center gap-10 grayscale opacity-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <Users className="w-32 h-32 text-slate-900" />
                            </motion.div>
                            <div className="text-center space-y-2">
                                <p className="text-xl font-black tracking-tight text-slate-800">Frequency Empty</p>
                                <p className="text-sm font-bold text-slate-500 max-w-[300px] leading-relaxed">
                                    Select an analytical environment and cohort to synchronize student intel.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
