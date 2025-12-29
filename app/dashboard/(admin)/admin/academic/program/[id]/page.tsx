"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { academicService, Program, Batch, AcademicApiError } from "@/services/academic.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GraduationCap, Clock, BookOpen, ArrowLeft } from "lucide-react";

export default function ProgramDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [program, setProgram] = useState<Program | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const programData = await academicService.getProgramById(id);
            setProgram(programData);

            const batchesData = await academicService.getBatchesByProgram(id);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load program details";
            toast.error(message);
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#588157]/20 text-[#344e41]">
                    {item.currentStudents}/{item.maxStudents}
                </span>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge
                    variant={item.status ? "default" : "destructive"}
                    className={item.status
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                >
                    {item.status ? "Active" : "Inactive"}
                </Badge>
            ),
        }
    ];

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!program) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <PageHeader
                        title={program.name}
                        subtitle="Program Details and Batches"
                        icon={GraduationCap}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Program Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4 col-span-2">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Program Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Short Name</p>
                                <p className="font-medium text-gray-900">{program.shortName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Department</p>
                                <p className="font-medium text-gray-900">
                                    {typeof program.departmentId === 'object' ? program.departmentId.name : 'Unknown'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Duration</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{program.duration} Years</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">Total Credits</p>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{program.totalCredits} Credits</span>
                                </div>
                            </div>
                        </div>

                        {program.description && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-500 mb-1">Description</p>
                                <p className="text-gray-700">{program.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Overview</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-[#588157]/10 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-[#344e41]">{batches.length}</p>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Batches</p>
                            </div>
                            <div className="bg-[#a3b18a]/10 p-4 rounded-lg text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className={`w-2 h-2 rounded-full ${program.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <p className="text-lg font-bold text-[#344e41]">{program.status ? 'Active' : 'Inactive'}</p>
                                </div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Status</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-[#344e41] mb-4">Batches</h3>
                    <DataTable
                        data={batches}
                        columns={batchColumns}
                        searchKey="name"
                        searchPlaceholder="Search batches..."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
