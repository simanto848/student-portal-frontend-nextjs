"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorAssignmentForm } from "@/components/enrollment/InstructorAssignmentForm";
import { ArrowLeft, UserPlus, Zap } from "lucide-react";

export default function InstructorCreateClient() {
    const router = useRouter();

    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Faculty Operations</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Assign Faculty</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                        <InstructorAssignmentForm />
                    </div>
                </div>

                <div className="space-y-10">
                    <Card className="bg-white/70 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden sticky top-10">
                        <CardHeader className="p-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-xl font-black text-slate-800 tracking-tight leading-none">Quick Guide</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Step 1</p>
                                <p className="text-sm font-bold text-slate-700">Select Department & Batch</p>
                                <p className="text-[10px] text-slate-400 mt-1">Filter by department to narrow down batches, then select your target cohort.</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Step 2</p>
                                <p className="text-sm font-bold text-slate-700">Assign Instructors</p>
                                <p className="text-[10px] text-slate-400 mt-1">Use bulk assignment or individually assign instructors to each course.</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Step 3</p>
                                <p className="text-sm font-bold text-slate-700">Confirm Allocations</p>
                                <p className="text-[10px] text-slate-400 mt-1">Review and submit your faculty assignments to complete the process.</p>
                            </div>
                            <div className="mt-8 p-6 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-xl shadow-slate-900/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm leading-none">Faculty Allocation</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stream Assignment System</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
