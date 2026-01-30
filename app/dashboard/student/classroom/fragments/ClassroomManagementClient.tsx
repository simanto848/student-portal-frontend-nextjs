/* eslint-disable @typescript-eslint/no-explicit-any */
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
    Calendar,
    Search,
    AlertCircle,
    RefreshCw,
    Sparkles,
    ArrowRight,
    Target,
    Layers
} from "lucide-react";
import Link from "next/link";
import { useStudentClassrooms } from "@/hooks/queries/useClassroomQueries";
import StudentLoading from "@/components/StudentLoading";
import { batchService, departmentService } from "@/services/academic";
import { notifyError } from "@/components/toast";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
} as const;

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
};

const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -8,
        transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    }
};

export default function ClassroomManagementClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
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

    // Get color theme for each card based on index
    const getCardTheme = (index: number) => {
        const themes = [
            { gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500", light: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-500" },
            { gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-500", light: "bg-cyan-50 dark:bg-cyan-500/10", text: "text-cyan-500" },
            { gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-500" },
            { gradient: "from-orange-500 to-red-500", bg: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-500" },
            { gradient: "from-pink-500 to-rose-600", bg: "bg-pink-500", light: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-500" },
            { gradient: "from-indigo-500 to-blue-600", bg: "bg-indigo-500", light: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-500" },
        ];
        return themes[index % themes.length];
    };

    if (isLoading) {
        return <StudentLoading />;
    }

    return (
        <motion.div
            className="space-y-10 relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 right-20 w-72 h-72 bg-linear-to-br from-primary-nexus/20 to-cyan-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-40 left-10 w-96 h-96 bg-linear-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Premium Header */}
            <motion.header variants={itemVariants} className="relative z-10">
                <div className="glass-panel rounded-3xl p-8 border border-white/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-primary-nexus/10 to-transparent rounded-bl-full" />
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-linear-to-tr from-violet-500/10 to-transparent rounded-tr-full" />

                    <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="p-4 rounded-2xl bg-linear-to-br from-primary-nexus to-cyan-500 shadow-lg shadow-primary-nexus/25"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Layers className="h-7 w-7 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                        My Classrooms
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                                        Access your enrolled courses and learning materials
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <motion.div
                                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-primary-nexus/5 dark:bg-primary-nexus/10 border border-primary-nexus/20"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="p-2 rounded-xl bg-primary-nexus/10">
                                    <BookOpen className="h-4 w-4 text-primary-nexus" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-primary-nexus">{workspaces.length}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Courses</p>
                                </div>
                            </motion.div>

                            <Button
                                variant="outline"
                                onClick={() => refetch()}
                                className="h-14 px-6 rounded-2xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm gap-2 transition-all hover:scale-105 active:scale-95"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {isError && (
                <motion.div variants={itemVariants}>
                    <Alert className="rounded-2xl border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <AlertDescription className="font-medium text-red-700 dark:text-red-400 ml-2">
                            {error instanceof Error ? error.message : "Failed to load classrooms. Please try again."}
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}

            {/* Search Bar */}
            <motion.div variants={itemVariants} className="relative z-10 max-w-2xl mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                        placeholder="Search classrooms by name, code, or batch..."
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-100 dark:shadow-none text-base font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary-nexus/30 focus-visible:border-primary-nexus transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => setSearchQuery("")}
                        >
                            <span className="text-slate-400 text-sm font-bold">✕</span>
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Classrooms Grid */}
            <motion.div
                className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 relative z-10"
                variants={containerVariants}
            >
                <AnimatePresence mode="popLayout">
                    {filteredWorkspaces.map((ws: any, idx: number) => {
                        const theme = getCardTheme(idx);
                        const isHovered = hoveredCard === ws.id;

                        return (
                            <motion.div
                                key={ws.id}
                                variants={itemVariants}
                                initial="rest"
                                whileHover="hover"
                                animate="rest"
                                onHoverStart={() => setHoveredCard(ws.id)}
                                onHoverEnd={() => setHoveredCard(null)}
                                layout
                            >
                                <Link href={`/dashboard/student/classroom/${ws.id}`} className="block h-full">
                                    <motion.div
                                        className="h-full rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-shadow duration-500 overflow-hidden group"
                                        variants={cardHoverVariants}
                                    >
                                        {/* Card Header with Gradient */}
                                        <div className={`relative h-28 bg-linear-to-br ${theme.gradient} p-6 overflow-hidden`}>
                                            {/* Animated Pattern */}
                                            <div className="absolute inset-0 opacity-20">
                                                <div className="absolute top-2 right-2 w-20 h-20 border-4 border-white/30 rounded-full" />
                                                <div className="absolute bottom-2 left-2 w-12 h-12 border-4 border-white/20 rounded-full" />
                                                <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                                            </div>

                                            {/* Sparkle Animation on Hover */}
                                            <motion.div
                                                className="absolute top-4 right-4"
                                                animate={isHovered ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
                                                transition={{ duration: 0.6 }}
                                            >
                                                <Sparkles className="h-6 w-6 text-white/60" />
                                            </motion.div>

                                            <div className="relative flex items-center justify-between">
                                                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-bold px-3 py-1.5 rounded-xl text-xs">
                                                    {ws.courseCode || "COURSE"}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-white/80">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-bold">Sem {ws.semester || "1"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 flex flex-col h-[calc(100%-7rem)]">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-primary-nexus transition-colors">
                                                {ws.courseName || ws.title || "Untitled Course"}
                                            </h3>

                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-5">
                                                <GraduationCap className="h-4 w-4" />
                                                <span className="text-xs font-semibold">
                                                    {ws.displayDeptName}
                                                </span>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="grid grid-cols-2 gap-3 mb-5">
                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Target className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Batch</span>
                                                    </div>
                                                    <p className="text-lg font-black text-slate-800 dark:text-white truncate">
                                                        {ws.displayBatchName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Enter Button */}
                                            <div className="mt-auto">
                                                <motion.div
                                                    className={`w-full py-4 px-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 flex items-center justify-between group-hover:bg-linear-to-r group-hover:${theme.gradient} group-hover:border-transparent transition-all duration-300`}
                                                >
                                                    <span className="font-bold text-sm text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors">
                                                        Enter Classroom
                                                    </span>
                                                    <motion.div
                                                        animate={isHovered ? { x: [0, 5, 0] } : {}}
                                                        transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
                                                    >
                                                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                                                    </motion.div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredWorkspaces.length === 0 && (
                <motion.div
                    variants={itemVariants}
                    className="py-20 flex flex-col items-center justify-center"
                >
                    <div className="glass-panel rounded-3xl p-12 text-center max-w-md border border-slate-200 dark:border-slate-700/50">
                        <motion.div
                            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center"
                            animate={{
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <BookOpen className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                            {searchQuery ? "No Results Found" : "No Classrooms Yet"}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            {searchQuery
                                ? "Try adjusting your search terms to find what you're looking for."
                                : "You haven't been enrolled in any classrooms yet. Check back later or contact your instructor."
                            }
                        </p>
                        {searchQuery && (
                            <Button
                                variant="outline"
                                onClick={() => setSearchQuery("")}
                                className="mt-6 rounded-xl"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
