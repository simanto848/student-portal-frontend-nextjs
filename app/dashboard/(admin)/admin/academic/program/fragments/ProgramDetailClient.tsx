"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { academicService, Program, Batch, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { notifyError } from "@/components/toast";
import { GraduationCap, Clock, BookOpen, ArrowLeft } from "lucide-react";

interface ProgramDetailClientProps {
    id: string;
}

export default function ProgramDetailClient({ id }: ProgramDetailClientProps) {
    const router = useRouter();

    const [program, setProgram] = useState<Program | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const programData = await academicService.getProgramById(id);
            setProgram(programData);

            const batchesData = await academicService.getBatchesByProgram(id);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load program details";
            notifyError(message);
            router.push("/dashboard/admin/academic/program");
        } finally {
            setIsLoading(false);
        }
    };

    const batchColumns: Column<Batch>[] = [
        { header: "Batch Name", accessorKey: "name" },
        { header: "Year", accessorKey: "year" },
        {
            header: "Current Semester",
            accessorKey: "currentSemester",
            cell: (item) => `Semester ${item.currentSemester}`
        },
        {
            header: "Students",
            accessorKey: "currentStudents",
            cell: (item) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                    {item.currentStudents}/{item.maxStudents}
                </span>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${item.status
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-slate-50 text-slate-600 ring-slate-200"
                        }`}
                >
                    {item.status ? "Active" : "Inactive"}
                </span>
            ),
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!program) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100 shadow-sm hover:shadow-md"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <PageHeader
                    title={program.name}
                    subtitle="Program Details and Batches"
                    icon={GraduationCap}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Program Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/60 space-y-4 col-span-2 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
                        <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                            <GraduationCap className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Program Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-1">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Short Name</p>
                            <p className="text-base font-bold text-slate-900">{program.shortName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</p>
                            <p className="text-base font-bold text-slate-900">
                                {typeof program.departmentId === 'object' ? program.departmentId.name : 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</p>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span className="text-base font-bold text-slate-900">{program.duration} Years</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Credits</p>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-amber-500" />
                                <span className="text-base font-bold text-slate-900">{program.totalCredits} Credits</span>
                            </div>
                        </div>
                    </div>

                    {program.description && (
                        <div className="mt-4 pt-4 border-t border-amber-50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Description</p>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-amber-100 italic">{program.description}</p>
                        </div>
                    )}
                </div>

                {/* Stats Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/60 space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
                        <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Overview</h3>
                    </div>

                    <div className="pt-1">
                        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-center mb-3">
                            <p className="text-3xl font-black text-amber-700">{batches.length}</p>
                            <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-widest">Active Batches</p>
                        </div>

                        <div className={`p-4 rounded-xl text-center border ring-1 ring-inset ${program.status
                            ? 'bg-emerald-50 border-emerald-100 ring-emerald-200 text-emerald-700'
                            : 'bg-slate-50 border-slate-100 ring-slate-200 text-slate-700'}`}>
                            <p className="text-lg font-black uppercase tracking-wider">{program.status ? 'Active' : 'Inactive'}</p>
                            <p className="text-[10px] font-bold opacity-70">Program Status</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-amber-100/60 p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                        Batches in this Program
                    </h3>
                    <DataTable
                        data={batches}
                        columns={batchColumns}
                        searchKey="name"
                        searchPlaceholder="Search batches..."
                    />
                </div>
            </div>
        </div>
    );
}
