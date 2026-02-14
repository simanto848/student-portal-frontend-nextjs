"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, Calendar, Users, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion } from "framer-motion";

interface Batch {
    id: string;
    name: string;
    session?: {
        name: string;
    };
    program?: {
        shortName: string;
    };
    counselor?: {
        fullName: string;
    };
    studentCount?: number;
    currentSemester: number;
    shift: string;
}

interface DepartmentBatchesFragmentProps {
    batches: Batch[];
}

export default function DepartmentBatchesFragment({ batches }: DepartmentBatchesFragmentProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBatches = batches.filter(batch => {
        const batchName = batch.name || "";
        const sessionName = batch.session?.name || "";
        const query = searchQuery.toLowerCase();

        return batchName.toLowerCase().includes(query) ||
            sessionName.toLowerCase().includes(query);
    });

    return (
        <div className="space-y-8">
            <div className="relative w-full md:w-96 group transition-all duration-300 focus-within:ring-2 focus-within:ring-[#2dd4bf]/20 rounded-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-[#2dd4bf] transition-colors z-10" />
                <Input
                    placeholder="Search specific batch nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-14 pr-6 rounded-full border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md shadow-xl shadow-slate-200/10 dark:shadow-slate-900/20 focus-visible:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 w-full"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.length === 0 ? (
                    <div className="col-span-full py-24 text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl ring-1 ring-slate-100 dark:ring-slate-700">
                            <Layers className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 font-bold tracking-tight">No batch signatures matching your query.</p>
                    </div>
                ) : (
                    filteredBatches.map((batch, index) => (
                        <motion.div
                            key={batch.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard
                                onClick={() => router.push(`/dashboard/teacher/department/batch/${batch.id}`)}
                                className="rounded-[2.5rem] hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 border-slate-200/60 dark:border-slate-700/50 group cursor-pointer overflow-hidden p-8"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                                    <Layers className="w-40 h-40 text-slate-900 dark:text-white" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-14 w-14 bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] rounded-2xl flex items-center justify-center group-hover:bg-[#2dd4bf] group-hover:text-white transition-all duration-500 ring-1 ring-[#2dd4bf]/20">
                                            <Layers className="h-7 w-7" />
                                        </div>
                                        <Badge className="uppercase tracking-[0.15em] text-[9px] font-black bg-slate-950 dark:bg-[#2dd4bf]/10 text-white dark:text-[#2dd4bf] border-none px-3 py-1 rounded-lg">
                                            {batch.program?.shortName || "CORE"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 mb-8">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                            {batch.shift === 'evening' ? 'E-' : 'D-'}{batch.name}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2dd4bf] flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            Session: {batch.session?.name || "Global"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                                            <span className="block text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Semester</span>
                                            <span className="block text-xs font-black text-slate-700 dark:text-slate-300">Level-Term {batch.currentSemester}</span>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                                            <span className="block text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Shift</span>
                                            <span className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{batch.shift}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 dark:text-slate-600 ring-1 ring-slate-200 dark:ring-slate-700">
                                                {batch.counselor?.fullName.charAt(0) || <Users className="h-3 w-3" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">Advisor</span>
                                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                                    {batch.counselor?.fullName || "Unassigned"}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-700 group-hover:translate-x-1 group-hover:text-[#2dd4bf] transition-all" />
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
