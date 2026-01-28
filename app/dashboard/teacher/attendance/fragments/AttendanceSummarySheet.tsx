"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { studentService } from "@/services/user/student.service";
import { Loader2, Search, Download, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceSummarySheetProps {
    courseId: string;
    batchId: string;
    isOpen: boolean;
    onClose: () => void;
    courseCode?: string;
    batchName?: string;
}

interface StudentSummary {
    studentId: string;
    studentName?: string;
    registrationNumber?: string;
    stats: {
        total: number;
        present: number;
        absent: number;
        late: number;
        excused: number;
        attendancePercentage: string;
    };
}

export function AttendanceSummarySheet({
    courseId,
    batchId,
    isOpen,
    onClose,
    courseCode,
    batchName,
}: AttendanceSummarySheetProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<StudentSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (isOpen && courseId && batchId) {
            fetchSummary();
        }
    }, [isOpen, courseId, batchId]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const report = await attendanceService.getCourseReport(courseId, batchId);

            // Enrich with student details (simulating or fetching if not in report)
            // Ideally backend sends populated data, but let's check
            const enrichedData = await Promise.all(
                report.map(async (row: any) => {
                    // Caching should be handled by service or query client, 
                    // for now simple fetch if name missing
                    if (!row.studentName) {
                        try {
                            const student = await studentService.getById(row.studentId);
                            return {
                                ...row,
                                studentName: student.fullName,
                                registrationNumber: student.registrationNumber,
                            };
                        } catch (e) {
                            return { ...row, studentName: "Unknown", registrationNumber: "N/A" };
                        }
                    }
                    return row;
                })
            );

            setData(enrichedData);
        } catch (error) {
            console.error("Failed to fetch summary", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lower = searchQuery.toLowerCase();
        return data.filter(
            (item) =>
                item.studentName?.toLowerCase().includes(lower) ||
                item.registrationNumber?.toLowerCase().includes(lower)
        );
    }, [data, searchQuery]);

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 75) return "bg-emerald-500";
        if (percentage >= 60) return "bg-yellow-500";
        return "bg-rose-500";
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[600px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <SheetTitle className="text-xl font-black flex flex-col gap-1 text-slate-900 dark:text-slate-100">
                        <span>Attendance Summary</span>
                        {(courseCode || batchName) && (
                            <span className="text-sm font-bold uppercase tracking-widest text-[#2dd4bf]">
                                {courseCode} • {batchName}
                            </span>
                        )}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Detailed attendance statistics for all students in this course
                    </SheetDescription>

                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search student..."
                            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-xl text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Loader2 className="h-10 w-10 animate-spin mb-3 text-[#2dd4bf]" />
                            <p className="text-base font-medium">Calculating stats...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center px-6">
                            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <p className="text-base font-medium text-slate-600 dark:text-slate-300">No attendance data found</p>
                            <p className="text-sm mt-1">Try marking attendance for this course first.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                                <TableRow className="border-b border-slate-200 dark:border-slate-800">
                                    <TableHead className="w-[180px] pl-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">Student</TableHead>
                                    <TableHead className="text-center w-14 font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">Total</TableHead>
                                    <TableHead className="text-center w-14 font-bold text-emerald-600 dark:text-emerald-400 uppercase text-xs tracking-widest">Pres</TableHead>
                                    <TableHead className="text-center w-14 font-bold text-rose-500 dark:text-rose-400 uppercase text-xs tracking-widest">Abs</TableHead>
                                    <TableHead className="text-center w-14 font-bold text-amber-500 dark:text-amber-400 uppercase text-xs tracking-widest">Late</TableHead>
                                    <TableHead className="text-center w-14 font-bold text-blue-500 dark:text-blue-400 uppercase text-xs tracking-widest">Exc</TableHead>
                                    <TableHead className="text-right pr-6 font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">Progress</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((student, i) => {
                                    const percentage = parseFloat(student.stats.attendancePercentage);
                                    return (
                                        <TableRow key={student.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm",
                                                        i % 3 === 0 ? "bg-violet-100 text-violet-600" :
                                                            i % 3 === 1 ? "bg-teal-100 text-teal-600" : "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {student.studentName?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                                                            {student.studentName}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                                                            {student.registrationNumber}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-sm text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-sm mx-1">
                                                {student.stats.total}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-sm mx-1">
                                                {student.stats.present}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-sm text-rose-500 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10 rounded-sm mx-1">
                                                {student.stats.absent}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-sm text-amber-500 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 rounded-sm mx-1">
                                                {student.stats.late}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-sm text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 rounded-sm mx-1">
                                                {student.stats.excused}
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-xs uppercase font-black px-1.5 py-0.5 rounded",
                                                            percentage >= 75 ? "bg-emerald-100 text-emerald-700" :
                                                                percentage >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-rose-100 text-rose-700"
                                                        )}>
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={percentage}
                                                        className="h-2 w-24 bg-slate-100 dark:bg-slate-800"
                                                        indicatorClassName={getPercentageColor(percentage)}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <Button variant="outline" className="w-full h-11 gap-2 font-bold text-sm">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
