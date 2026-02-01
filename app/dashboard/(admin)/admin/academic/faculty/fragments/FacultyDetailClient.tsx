"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { academicService, Faculty, Department, AcademicApiError } from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/teacher.service";
import { Badge } from "@/components/ui/badge";
import { notifyError } from "@/components/toast";
import { Building2, Mail, Phone, User, ArrowLeft } from "lucide-react";

interface FacultyDetailClientProps {
    id: string;
}

export default function FacultyDetailClient({ id }: FacultyDetailClientProps) {
    const router = useRouter();

    const [faculty, setFaculty] = useState<Faculty | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [dean, setDean] = useState<Teacher | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const facultyData = await academicService.getFacultyById(id);
            setFaculty(facultyData);
            if (facultyData.deanId) {
                try {
                    const teacherData = await teacherService.getTeacherById(facultyData.deanId);
                    setDean(teacherData);
                } catch (error) {
                    console.error("Failed to fetch dean details", error);
                }
            }

            const departmentsData = await academicService.getDepartmentsByFaculty(id);
            setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load faculty details";
            notifyError(message);
            router.push("/dashboard/admin/academic/faculty");
        } finally {
            setIsLoading(false);
        }
    };

    const departmentColumns: Column<Department>[] = [
        { header: "Department Name", accessorKey: "name" },
        { header: "Short Name", accessorKey: "shortName" },
        { header: "Email", accessorKey: "email" },
        {
            header: "Head",
            accessorKey: "departmentHeadId",
            cell: (item) => item.departmentHead?.fullName || <span className="text-slate-400 italic">Not Assigned</span>
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

    if (!faculty) {
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
                    title={faculty.name}
                    subtitle="Faculty Details and Departments"
                    icon={Building2}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Faculty Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/60 space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
                        <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                            <Mail className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Contact Information</h3>
                    </div>

                    <div className="space-y-4 pt-1">
                        <div className="flex items-center gap-3 text-slate-700 font-medium">
                            <span className="text-slate-900 font-bold">{faculty.email}</span>
                        </div>
                        {faculty.phone && (
                            <div className="flex items-center gap-3 text-slate-700 font-medium">
                                <Phone className="w-4 h-4 text-amber-400" />
                                <span className="text-slate-900">{faculty.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 pt-1">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${faculty.status
                                ? "bg-amber-50 text-amber-700 ring-amber-200"
                                : "bg-slate-50 text-slate-600 ring-slate-200"
                                }`}>
                                {faculty.status ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dean Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/60 space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
                        <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                            <User className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Dean Information</h3>
                    </div>

                    {dean ? (
                        <div className="space-y-4 pt-1">
                            <div className="px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-100">
                                <p className="text-sm font-bold text-slate-900">
                                    {dean.fullName}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                    <Mail className="w-3 h-3" />
                                    <span>{dean.email}</span>
                                </div>
                                {dean.phone && (
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                        <Phone className="w-3 h-3" />
                                        <span>{dean.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="pt-2">
                            <span className="text-slate-400 italic text-sm font-medium">No Dean Assigned</span>
                        </div>
                    )}
                </div>

                {/* Stats Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100/60 space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
                        <div className="p-2 bg-amber-50 rounded-lg ring-1 ring-amber-100">
                            <Building2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Overview</h3>
                    </div>
                    <div className="pt-1">
                        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-center">
                            <p className="text-3xl font-black text-amber-700">{departments.length}</p>
                            <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-widest mt-1">Total Departments</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-amber-100/60 p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                        Departments in this Faculty
                    </h3>
                    <DataTable
                        data={departments}
                        columns={departmentColumns}
                        searchKey="name"
                        searchPlaceholder="Search departments..."
                    />
                </div>
            </div>
        </div>
    );
}
