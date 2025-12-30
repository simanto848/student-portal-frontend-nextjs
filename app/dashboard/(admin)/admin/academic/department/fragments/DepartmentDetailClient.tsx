"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { academicService, Department, Program, AcademicApiError } from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/teacher.service";
import { Badge } from "@/components/ui/badge";
import { notifyError } from "@/components/toast";
import { Building, Mail, Phone, User, ArrowLeft } from "lucide-react";

interface DepartmentDetailClientProps {
    id: string;
}

export default function DepartmentDetailClient({ id }: DepartmentDetailClientProps) {
    const router = useRouter();

    const [department, setDepartment] = useState<Department | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [head, setHead] = useState<Teacher | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const departmentData = await academicService.getDepartmentById(id);
            setDepartment(departmentData);

            if (departmentData.departmentHeadId) {
                try {
                    const teacherData = await teacherService.getTeacherById(departmentData.departmentHeadId);
                    setHead(teacherData);
                } catch (error) {
                    console.error("Failed to fetch department head details", error);
                }
            }

            const programsData = await academicService.getProgramsByDepartment(id);
            setPrograms(Array.isArray(programsData) ? programsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load department details";
            notifyError(message);
            router.push("/dashboard/admin/academic/department");
        } finally {
            setIsLoading(false);
        }
    };

    const programColumns: Column<Program>[] = [
        { header: "Program Name", accessorKey: "name" },
        { header: "Short Name", accessorKey: "shortName" },
        {
            header: "Duration",
            accessorKey: "duration",
            cell: (item) => `${item.duration} Year${item.duration > 1 ? 's' : ''}`
        },
        {
            header: "Credits",
            accessorKey: "totalCredits",
            cell: (item) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                    {item.totalCredits}
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
            <DashboardLayout>
                <div className="flex items-center justify-center h-full py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!department) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100 shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <PageHeader
                        title={department.name}
                        subtitle="Department Details and Programs"
                        icon={Building}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Department Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                                <Mail className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Contact Information</h3>
                        </div>

                        <div className="space-y-4 pt-1">
                            <div className="flex items-center gap-3 text-slate-700 font-medium">
                                <span className="text-slate-900">{department.email}</span>
                            </div>
                            {department.phone && (
                                <div className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-900">{department.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 pt-1">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${department.status
                                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                                    : "bg-slate-50 text-slate-600 ring-slate-200"
                                    }`}>
                                    {department.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Head Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                                <User className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Department Head</h3>
                        </div>

                        {head ? (
                            <div className="space-y-4 pt-1">
                                <div className="px-3 py-2 rounded-xl bg-slate-50/50 border border-slate-100">
                                    <p className="text-sm font-bold text-slate-900">
                                        {head.fullName}
                                        {department.isActingHead && (
                                            <span className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">Acting</span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                        <Mail className="w-3 h-3" />
                                        <span>{head.email}</span>
                                    </div>
                                    {head.phone && (
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                            <Phone className="w-3 h-3" />
                                            <span>{head.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="pt-2">
                                <span className="text-slate-400 italic text-sm font-medium">No Head Assigned</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                                <Building className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Overview</h3>
                        </div>
                        <div className="pt-1">
                            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-center">
                                <p className="text-3xl font-black text-amber-700">{programs.length}</p>
                                <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-widest mt-1">Total Programs</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                            Programs in this Department
                        </h3>
                        <DataTable
                            data={programs}
                            columns={programColumns}
                            searchKey="name"
                            searchPlaceholder="Search programs..."
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
