"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InstructorAssignmentForm } from "@/components/enrollment/InstructorAssignmentForm";
import { ArrowLeft, UserCog, Cpu, Satellite, Zap, ShieldCheck } from "lucide-react";

interface InstructorEditClientProps {
    id: string;
}

export default function InstructorEditClient({ id }: InstructorEditClientProps) {
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
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Update Assignment</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <Card className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                            <Cpu className="w-40 h-40 text-slate-900" />
                        </div>
                        <CardHeader className="p-10 pb-0 relative z-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
                                    <UserCog className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">System Override</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold tracking-tight">Modify faculty allocation parameters for this assignment</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 relative z-10">
                            <InstructorAssignmentForm assignmentId={id} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-10">
                    <Card className="bg-white/70 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/40 overflow-hidden sticky top-10">
                        <CardHeader className="p-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-xl font-black text-slate-800 tracking-tight leading-none">Edit Guidelines</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Restricted Mode</p>
                                <p className="text-sm font-bold text-slate-700">Batch & Course Locked</p>
                                <p className="text-[10px] text-slate-400 mt-1">The batch and course cannot be changed. Only instructor and status are editable.</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Available Actions</p>
                                <ul className="text-[10px] text-slate-500 space-y-2 mt-2">
                                    <li className="flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        Change assigned instructor
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-amber-500" />
                                        Update assignment status
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-8 p-6 bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-xl shadow-slate-900/10">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Satellite className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm leading-none">Configuration Mode</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Single Assignment Edit</p>
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
