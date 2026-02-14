"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, Users, FileText, Activity } from "lucide-react";
import DepartmentResultsFragment from "./DepartmentResultsFragment";
import DepartmentBatchesFragment from "./DepartmentBatchesFragment";
import DepartmentStudentsFragment from "./DepartmentStudentsFragment";
import { ResultWorkflow } from "@/services/enrollment/courseGrade.service";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion } from "framer-motion";

interface DepartmentClientProps {
    workflows: ResultWorkflow[];
    batches: any[];
    students: any[];
}

export default function DepartmentClient({ workflows, batches, students }: DepartmentClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Default to 'batches' since it's the first tab in the list
    const activeTab = searchParams.get("tab") || "batches";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-8 pb-12 w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header / Hero */}
            <GlassCard className="relative overflow-hidden p-8 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/20">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-[#2dd4bf]/10 blur-[100px] opacity-60 dark:opacity-20" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] ring-1 ring-[#2dd4bf]/20">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d9488] dark:text-[#2dd4bf]">
                                Department Administration
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                            Department <span className="text-[#2dd4bf]">Hub</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg max-w-xl">
                            Manage academic batches and students.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="hidden md:flex flex-col items-center justify-center px-8 py-3 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-lg">
                            <span className="text-3xl font-black text-[#0d9488] dark:text-[#2dd4bf]">{batches.length}</span>
                            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">Batches</span>
                        </div>
                        <div className="hidden md:flex flex-col items-center justify-center px-8 py-3 bg-slate-950 dark:bg-slate-900/60 rounded-2xl border border-slate-800 dark:border-slate-800/80 shadow-lg">
                            <span className="text-3xl font-black text-white">{students.length}</span>
                            <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-600 tracking-[0.2em]">Students</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
                <div className="flex justify-center">
                    <div className="bg-white/50 dark:bg-slate-800/40 backdrop-blur-md p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-200/10 dark:shadow-slate-900/20 flex w-fit">
                        <TabsList className="bg-transparent h-12 gap-1 p-0">
                            <TabsTrigger
                                value="batches"
                                className="h-10 px-8 rounded-full font-black text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-[#0d9488] dark:data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white dark:data-[state=active]:text-slate-900 text-slate-500 dark:text-slate-400 transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Academic Batches</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="students"
                                className="h-10 px-8 rounded-full font-black text-[10px] uppercase tracking-[0.15em] data-[state=active]:bg-[#0d9488] dark:data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white dark:data-[state=active]:text-slate-900 text-slate-500 dark:text-slate-400 transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>Students List</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="min-h-[500px]">
                    <TabsContent value="batches" className="mt-0 focus-visible:ring-0">
                        <div className="mb-8 px-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Academic Batches</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm italic">Structured oversight of all enrolled year-groups and shifts.</p>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <DepartmentBatchesFragment batches={batches} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="students" className="mt-0 focus-visible:ring-0">
                        <div className="mb-8 px-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Student Biometric Directory</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm italic">Global search and detailed profiles of all department residents.</p>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <DepartmentStudentsFragment students={students} batches={batches} />
                        </motion.div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
