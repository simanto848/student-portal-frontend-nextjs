"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { academicService, Department, Program, AcademicApiError } from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/teacher.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building, Mail, Phone, User, ArrowLeft } from "lucide-react";

export default function DepartmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

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
            toast.error(message);
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#a3b18a]/30 text-[#344e41]">
                    {item.totalCredits}
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

    if (!department) {
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
                        title={department.name}
                        subtitle="Department Details and Programs"
                        icon={Building}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Department Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Contact Information</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{department.email}</span>
                            </div>
                            {department.phone && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{department.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${department.status
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}>
                                    {department.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Head Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Department Head</h3>

                        {head ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-800 font-medium">
                                    <User className="w-4 h-4" />
                                    <span>
                                        {head.fullName}
                                        {department.isActingHead && (
                                            <span className="ml-2 text-xs text-[#588157] font-normal">(Acting)</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{head.email}</span>
                                </div>
                                {head.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{head.phone}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-400 italic flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>No Head Assigned</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#588157]/10 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-[#344e41]">{programs.length}</p>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Programs</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-[#344e41] mb-4">Programs</h3>
                    <DataTable
                        data={programs}
                        columns={programColumns}
                        searchKey="name"
                        searchPlaceholder="Search programs..."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
