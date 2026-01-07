"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, Users, FileText, Activity } from "lucide-react";
import DepartmentResultsFragment from "./DepartmentResultsFragment";
import DepartmentBatchesFragment from "./DepartmentBatchesFragment";
import DepartmentStudentsFragment from "./DepartmentStudentsFragment";
import { ResultWorkflow } from "@/services/enrollment/courseGrade.service";

interface DepartmentClientProps {
    workflows: ResultWorkflow[];
    batches: any[];
    students: any[];
}

export default function DepartmentClient({ workflows, batches, students }: DepartmentClientProps) {
    const [activeTab, setActiveTab] = useState("results");

    return (
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-2xl shadow-indigo-500/5">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl opacity-50" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                                Department Head
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Department <span className="text-indigo-600">Administration</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg">
                            Manage department results, batches, and student information.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="hidden md:flex flex-col items-center justify-center px-6 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <span className="text-2xl font-black text-indigo-600">{batches.length}</span>
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Batches</span>
                        </div>
                        <div className="hidden md:flex flex-col items-center justify-center px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-2xl font-black text-slate-700">{students.length}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="flex justify-center">
                    <TabsList className="h-14 p-1 rounded-full bg-slate-100/80 backdrop-blur-sm border border-slate-200">
                        <TabsTrigger
                            value="results"
                            className="h-12 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <Activity className="h-4 w-4" />
                                <span>Results</span>
                                {workflows.length > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-600 ml-1">
                                        {workflows.length}
                                    </span>
                                )}
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="batches"
                            className="h-12 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <Calendar className="h-4 w-4" /> Batches
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="students"
                            className="h-12 px-8 rounded-full data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-2 font-bold">
                                <Users className="h-4 w-4" /> Students
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="min-h-[500px]">
                    <TabsContent value="results" className="mt-0 focus-visible:ring-0">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Result Management</h2>
                            <p className="text-slate-500 text-sm">Review submitted results, publish to students, or return to committee.</p>
                        </div>
                        <DepartmentResultsFragment workflows={workflows} />
                    </TabsContent>

                    <TabsContent value="batches" className="mt-0 focus-visible:ring-0">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Batches</h2>
                            <p className="text-slate-500 text-sm">View and manage all active batches in the department.</p>
                        </div>
                        <DepartmentBatchesFragment batches={batches} />
                    </TabsContent>

                    <TabsContent value="students" className="mt-0 focus-visible:ring-0">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Student Directory</h2>
                            <p className="text-slate-500 text-sm">Search and view student details, enrollment status, and batch assignments.</p>
                        </div>
                        <DepartmentStudentsFragment students={students} batches={batches} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
