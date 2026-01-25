"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Search, GraduationCap, X, User, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Student {
    id: string;
    fullName: string;
    registrationNumber: string;
    email: string;
    batch?: {
        id: string;
        name: string;
        shift?: string;
        counselor?: {
            fullName: string;
        };
    };
    currentSemester: number;
    enrollmentStatus: string;
}

interface Batch {
    id: string;
    name: string;
    shift?: string;
}

interface DepartmentStudentsFragmentProps {
    students: Student[];
    batches: Batch[];
}

export default function DepartmentStudentsFragment({ students, batches }: DepartmentStudentsFragmentProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState<string>("all");

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase();
        const fullName = student.fullName || "";
        const regNum = student.registrationNumber || "";
        const email = student.email || "";

        const matchesSearch =
            fullName.toLowerCase().includes(query) ||
            regNum.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query);

        const matchesBatch = selectedBatchId === "all" || student.batch?.id === selectedBatchId;

        return matchesSearch && matchesBatch;
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'enrolled': return "success";
            case 'graduated': return "default";
            case 'dropped_out': return "destructive";
            case 'suspended': return "destructive";
            default: return "secondary";
        }
    };

    // Custom Badge style wrapper since variant names might not perfectly match standard UI kit
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            enrolled: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            graduated: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            dropped_out: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
            suspended: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
            default: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
        };

        const style = styles[status] || styles.default;

        return (
            <Badge className={cn("capitalize border-2 font-black text-[9px] tracking-wider py-1 px-3 rounded-xl", style)}>
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group transition-all duration-300 focus-within:ring-2 focus-within:ring-[#2dd4bf]/20 rounded-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-[#2dd4bf] transition-colors z-10" />
                    <Input
                        placeholder="Identify students by name, signature ID, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 pl-14 pr-6 rounded-full border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md shadow-xl shadow-slate-200/10 dark:shadow-slate-900/20 focus-visible:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 w-full"
                    />
                </div>

                <div className="w-full md:w-80">
                    <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                        <SelectTrigger className="h-14 rounded-[1.5rem] bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-200/10 dark:shadow-slate-900/20 font-black text-[10px] uppercase tracking-widest text-[#0d9488] dark:text-[#2dd4bf] px-6">
                            <SelectValue placeholder="All Active Batches" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                            <SelectItem value="all" className="font-black text-[10px] uppercase tracking-widest">Global Directory</SelectItem>
                            {batches.map(batch => (
                                <SelectItem key={batch.id} value={batch.id} className="font-bold text-xs">
                                    {batch.shift === 'evening' ? 'E' : 'D'}-{batch.name} • {batch.shift?.toUpperCase() || 'N/A'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <GlassCard className="border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/30 overflow-hidden relative group p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="hover:bg-transparent border-slate-200/60 dark:border-slate-800/50">
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Student Identity</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Reference ID</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Batch Assignment</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-center">Current Phase</TableHead>
                                <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right pr-10">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center shadow-inner ring-1 ring-slate-100 dark:ring-slate-700">
                                                    <User className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                                                </div>
                                                <p className="text-slate-400 dark:text-slate-500 font-black tracking-tight">Zero residents found in this search node.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student, index) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="hover:bg-slate-50/50 dark:hover:bg-[#2dd4bf]/5 transition-colors cursor-pointer group border-b border-slate-100 dark:border-slate-800/50"
                                            onClick={() => router.push(`/dashboard/teacher/department/student/${student.id}`)}
                                        >
                                            <TableCell className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center text-lg font-black shadow-inner ring-1 ring-[#2dd4bf]/20">
                                                        {student.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 dark:text-white group-hover:text-[#2dd4bf] transition-colors leading-tight">{student.fullName}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1">{student.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6 text-center font-black text-slate-600 dark:text-slate-400 text-xs tracking-tight">
                                                {student.registrationNumber}
                                            </TableCell>
                                            <TableCell className="p-6 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <Badge className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black text-[9px] px-3 py-1 rounded-xl shadow-sm">
                                                        {student.batch?.name ? (
                                                            <>{student.batch.shift === 'evening' ? 'E' : 'D'}-{student.batch.name}</>
                                                        ) : "GLOBAL"}
                                                    </Badge>
                                                    {student.batch?.counselor && (
                                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                                                            Advised by {student.batch.counselor.fullName.split(' ')[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">Level {student.currentSemester}</span>
                                                    <div className="h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#2dd4bf] transition-all duration-1000"
                                                            style={{ width: `${(student.currentSemester / 8) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6 text-right pr-10">
                                                <div className="flex items-center justify-end gap-3">
                                                    <StatusBadge status={student.enrollmentStatus} />
                                                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>

            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-slate-400 dark:text-slate-600">
                Synchronized {filteredStudents.length} / {students.length} Academic Nodes
            </div>
        </div>
    );
}
