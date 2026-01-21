"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    BookOpen,
    GraduationCap,
    Users,
    Calendar,
    Search,
    AlertCircle,
    RefreshCw,
    LayoutGrid,
    Rocket,
    Brain,
    Shield,
    Code
} from "lucide-react";
import Link from "next/link";
import { useStudentClassrooms } from "@/hooks/queries/useClassroomQueries";
import StudentLoading from "@/components/StudentLoading";
import { batchService, departmentService } from "@/services/academic";
import { notifyError } from "@/components/toast";

export default function ClassroomManagementClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const { workspaces, isLoading, isError, error, refetch } = useStudentClassrooms();
    const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
    const [batchMap, setBatchMap] = useState<Record<string, { name: string; shift: string }>>({});

    useEffect(() => {
        const fetchDetails = async () => {
            if (workspaces.length === 0) return;
            try {
                const depts = await departmentService.getAllDepartments();
                const dMap: Record<string, string> = {};
                depts.forEach(d => {
                    dMap[d.id] = d.shortName;
                });
                setDepartmentMap(prev => ({ ...prev, ...dMap }));
            } catch (err) {
                notifyError("Failed to fetch department details")
            }

            const batchIds = Array.from(new Set(workspaces.map(ws => ws.batchId).filter(id => id && !batchMap[id])));
            if (batchIds.length === 0) return;

            await Promise.all(batchIds.map(async (id) => {
                try {
                    const batch = await batchService.getBatchById(id);
                    setBatchMap(prev => ({
                        ...prev,
                        [id]: { name: batch.name, shift: batch.shift || 'day' }
                    }));
                } catch (err) {
                    notifyError("Failed to fetch batch details")
                }
            }));
        };

        fetchDetails();
    }, [workspaces]);

    const enrichedWorkspaces = useMemo(() => {
        return workspaces.map(ws => {
            const batchInfo = batchMap[ws.batchId];
            const deptShortName = departmentMap[ws.departmentId];

            let displayBatchName = ws.batchName || "N/A";
            if (batchInfo) {
                const prefix = batchInfo.shift === 'evening' ? 'E' : 'D';
                displayBatchName = `${prefix}-${batchInfo.name}`;
            }

            return {
                ...ws,
                displayBatchName,
                displayDeptName: deptShortName || "SEC-CORE"
            };
        });
    }, [workspaces, batchMap, departmentMap]);

    const filteredWorkspaces = useMemo(() => {
        if (!searchQuery) return enrichedWorkspaces;
        const query = searchQuery.toLowerCase();
        return enrichedWorkspaces.filter(
            (ws: any) =>
                ws.courseName?.toLowerCase().includes(query) ||
                ws.courseCode?.toLowerCase().includes(query) ||
                ws.title?.toLowerCase().includes(query) ||
                ws.displayBatchName?.toLowerCase().includes(query),
        );
    }, [enrichedWorkspaces, searchQuery]);

    if (isLoading) {
        return <StudentLoading />;
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 relative">
            {/* Background Aesthetic Blurs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0088A9]/10 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none z-0" />

            {/* Premium Header */}
            <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 py-10 px-10 glass-panel rounded-[3rem] border border-white/50 shadow-2xl">
                <div className="space-y-3">
                    <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-white shadow-xl ring-4 ring-[#0088A9]/5">
                            <LayoutGrid className="h-8 w-8 text-[#0088A9]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-none">Classroom <span className="text-[#0088A9]">Hub</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-[#0088A9] font-black uppercase tracking-[0.3em] text-[11px] bg-[#0088A9]/5 px-4 py-1.5 rounded-full border border-[#0088A9]/10">
                            Your Classrooms
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => refetch()}
                        className="h-16 rounded-[2rem] border border-gray-100 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-gray-500 hover:text-[#0088A9] hover:bg-white/80 font-black uppercase tracking-[0.25em] text-[10px] px-10 shadow-sm transition-all hover:scale-[1.05]"
                    >
                        <RefreshCw className="mr-3 h-4 w-4" />
                        Refresh
                    </Button>
                    <div className="h-16 px-10 rounded-[2rem] bg-slate-900 text-white flex items-center gap-4 font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-slate-200">
                        <BookOpen className="h-5 w-5 text-[#0088A9]" />
                        {workspaces.length} Classrooms
                    </div>
                </div>
            </header>

            {isError && (
                <Alert className="rounded-[2.5rem] border-red-100 bg-red-50/50 backdrop-blur-md p-6 animate-in slide-in-from-top-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertDescription className="font-black text-[11px] uppercase tracking-widest text-red-600 ml-4">
                        {error instanceof Error ? error.message : "Neural link failure: Could not primary sectors."}
                    </AlertDescription>
                </Alert>
            )}

            {/* Tactical Search Bar */}
            <div className="relative z-10 max-w-4xl mx-auto w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0088A9]/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative glass-panel rounded-[2.5rem] p-3 flex items-center bg-white border border-white shadow-2xl transition-all group-hover:shadow-[0_40px_80px_-20px_rgba(0,136,169,0.2)]">
                    <div className="p-4 rounded-2xl bg-gray-50 text-[#0088A9] flex items-center justify-center border border-gray-100 shadow-inner">
                        <Search className="h-5 w-5" />
                    </div>
                    <Input
                        placeholder="Search within your neural workspace matrix..."
                        className="border-none bg-transparent h-16 text-lg font-bold placeholder:text-gray-300 placeholder:font-bold focus-visible:ring-0 focus-visible:ring-offset-0 px-8 flex-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Neural Hub Grid */}
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 relative z-10">
                <AnimatePresence mode="popLayout">
                    {filteredWorkspaces.map((ws: any, idx: number) => (
                        <motion.div
                            key={ws.id}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                        >
                            <Link href={`/dashboard/student/classroom/${ws.id}`} className="block group">
                                <div className="glass-panel overflow-hidden h-full rounded-[3.5rem] bg-white border border-white shadow-xl hover:shadow-[0_50px_100px_-30px_rgba(0,136,169,0.25)] hover:border-[#0088A9]/30 transition-all duration-700 relative flex flex-col hover:-translate-y-3">
                                    {/* Premium Card Header */}
                                    <div className="h-32 bg-slate-900 relative p-8 flex flex-col justify-end overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-1000 group-hover:scale-125">
                                            <Brain className="h-40 w-40 text-[#0088A9]" />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-[#0088A9]/20" />
                                        <div className="relative z-10 flex justify-between items-center">
                                            <Badge className="bg-[#0088A9] text-white border-none font-black px-4 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-[#0088A9]/30">
                                                {ws.courseCode || "CORE-MOD"}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-white/50">
                                                <Calendar className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">SEMESTER {ws.semester || "01"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-10 flex flex-col flex-1">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-[#0088A9] transition-colors uppercase tracking-tight line-clamp-2">
                                            {ws.courseName || ws.title || "Untitled Matrix"}
                                        </h3>

                                        <div className="flex items-center gap-3 text-gray-400 mb-8">
                                            <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                                <GraduationCap className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                                                {ws.departmentId ? `Department: ${ws.displayDeptName}` : "Advanced Classroom"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50 mb-8">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Total Student</span>
                                                </div>
                                                <span className="text-xl font-black text-gray-900 tracking-tighter">
                                                    {ws.totalBatchStudents || ws.studentCount || 0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 items-end text-right">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Batch</span>
                                                    <Code className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-xl font-black text-gray-900 tracking-tighter">
                                                    {ws.displayBatchName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="w-full h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-between px-8 text-gray-400 group-hover:bg-[#0088A9] group-hover:text-white group-hover:border-none group-hover:shadow-[0_20px_40px_-10px_rgba(0,136,169,0.3)] transition-all duration-500 font-black uppercase tracking-[0.3em] text-[10px]">
                                                Enter Classroom
                                                <Rocket className="h-5 w-5 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2 duration-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredWorkspaces.length === 0 && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center glass-panel rounded-[5rem] border-dashed border-gray-300 bg-gray-50/20">
                        <div className="p-10 rounded-[3rem] bg-white shadow-xl mb-10 border border-gray-50 scale-125">
                            <Shield className="h-16 w-16 text-gray-100" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">No Sector Detected</h3>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] max-w-sm text-center leading-loose opacity-70">
                            {searchQuery ? "Your tactical scan yielded no results in the current matrix." : "You haven't been synchronized with any neural learning hubs yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
