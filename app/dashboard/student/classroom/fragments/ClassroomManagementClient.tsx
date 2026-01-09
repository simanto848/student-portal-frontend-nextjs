"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    BookOpen,
    ArrowRight,
    GraduationCap,
    Users,
    Calendar,
    Code,
    Search,
    AlertCircle,
    RefreshCw,
    LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useStudentClassrooms } from "@/hooks/queries/useClassroomQueries";
import { Workspace } from "@/services/classroom/types";

export default function ClassroomManagementClient() {
    const [searchQuery, setSearchQuery] = useState("");

    const { workspaces, isLoading, isError, error, refetch } = useStudentClassrooms();

    const filteredWorkspaces = useMemo(() => {
        if (!searchQuery) return workspaces;
        const query = searchQuery.toLowerCase();
        return workspaces.filter(
            (ws: Workspace) =>
                ws.courseName?.toLowerCase().includes(query) ||
                ws.courseCode?.toLowerCase().includes(query) ||
                ws.title?.toLowerCase().includes(query) ||
                ws.batchName?.toLowerCase().includes(query),
        );
    }, [workspaces, searchQuery]);

    if (isLoading) {
        return (
            <div className="space-y-6 flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                <p className="text-slate-500 font-bold animate-pulse">Initializing Virtual Environments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Classroom Hub"
                subtitle="Your digital learning ecosystem."
                icon={LayoutGrid}
                extraActions={
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-bold"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync
                    </Button>
                }
            />

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-700 shadow-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">
                        {error instanceof Error ? error.message : "Neural link failure: Could not load classrooms."}
                    </AlertDescription>
                </Alert>
            )}

            {/* Global Search & Stats Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="h-4 w-4 text-cyan-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Search within your neural workspace..."
                        className="pl-11 bg-white/40 backdrop-blur-sm border-cyan-100 rounded-2xl h-12 focus:ring-cyan-500/20 active:scale-[0.99] transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <GlassCard className="px-6 py-3 flex items-center gap-4 border-cyan-100/50">
                    <div className="p-2 rounded-xl bg-cyan-600 shadow-lg shadow-cyan-200">
                        <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Enrolled</p>
                        <p className="text-xl font-black text-slate-900 leading-none">{workspaces.length}</p>
                    </div>
                </GlassCard>
            </div>

            {/* Classroom Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {filteredWorkspaces.map((ws: Workspace, idx: number) => (
                        <motion.div
                            key={ws.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <GlassCard
                                className="group p-0 border-2 border-transparent hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500"
                            >
                                {/* Visual Header */}
                                <div className="h-24 bg-gradient-to-br from-slate-900 via-sky-950 to-cyan-900 relative p-6 flex flex-col justify-end">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white font-mono text-[10px] uppercase tracking-tighter">
                                            {ws.courseCode || "N/A"}
                                        </Badge>
                                    </div>
                                    <Badge variant="outline" className="w-fit border-cyan-400/30 text-cyan-300 text-[9px] uppercase font-black tracking-widest bg-cyan-950/20">
                                        Semester {ws.semester || "1"}
                                    </Badge>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-black text-slate-800 leading-tight line-clamp-2 mb-2 group-hover:text-cyan-600 transition-colors">
                                        {ws.courseName || ws.title || "Untitled Intelligence"}
                                    </h3>

                                    <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {ws.departmentId ? `Dept: ${ws.departmentId}` : "Advanced Course"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-4 border-y border-cyan-50/50 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-cyan-500" />
                                            <span className="text-xs font-black text-slate-600">
                                                {ws.totalBatchStudents || ws.studentCount || 0} Peers
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-cyan-500" />
                                            <span className="text-xs font-black text-slate-600">
                                                Batch {ws.batchName || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href={`/dashboard/student/classroom/${ws.id}`}>
                                        <Button className="w-full h-12 rounded-[1.2rem] bg-slate-900 text-white hover:bg-cyan-600 shadow-xl shadow-slate-200 hover:shadow-cyan-200 transition-all duration-300 font-bold uppercase tracking-widest text-[11px]">
                                            Enter Workspace
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredWorkspaces.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-cyan-100 rounded-[3rem] bg-cyan-50/10">
                        <BookOpen className="h-16 w-16 text-cyan-200 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter mb-2">No Workspace Detected</h3>
                        <p className="text-sm text-slate-400/70 font-bold max-w-sm mx-auto">
                            {searchQuery ? "Your query didn't match any of your intelligence hubs." : "You haven't been synchronized with any workspaces yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
