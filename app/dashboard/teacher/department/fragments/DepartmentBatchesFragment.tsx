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
import { Search, Layers, Calendar, Users } from "lucide-react";

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
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm w-full md:w-96">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search batches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 pl-12 border-none bg-transparent focus-visible:ring-0 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        No batches found matching your search.
                    </div>
                ) : (
                    filteredBatches.map((batch) => (
                        <Card
                            key={batch.id}
                            onClick={() => router.push(`/dashboard/teacher/department/batch/${batch.id}`)}
                            className="rounded-[2rem] hover:shadow-lg transition-all duration-300 border-slate-200 group bg-white cursor-pointer"
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <Badge variant="outline" className="uppercase tracking-wider text-[10px] font-bold bg-slate-50 text-slate-500 border-slate-200">
                                        {batch.program?.shortName || "PROGRAM"}
                                    </Badge>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-1">
                                    {batch.shift === 'evening' ? 'E-' : 'D-'}{batch.name}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Session: {batch.session?.name || "N/A"}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Semester</span>
                                        <span className="font-bold text-slate-700">Level-Term {batch.currentSemester}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Shift</span>
                                        <Badge variant="secondary" className="capitalize text-xs font-bold bg-slate-100 text-slate-600">
                                            {batch.shift}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Counselor</span>
                                        <div className="flex items-center gap-2">
                                            {batch.counselor ? (
                                                <span className="font-bold text-indigo-600 text-xs">
                                                    {batch.counselor.fullName}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unassigned</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
