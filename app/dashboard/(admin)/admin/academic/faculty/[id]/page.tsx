"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { academicService, Faculty, Department, AcademicApiError } from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/teacher.service";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Mail, Phone, User, ArrowLeft } from "lucide-react";

export default function FacultyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

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
            toast.error(message);
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
            cell: (item) => item.departmentHead?.fullName || <span className="text-gray-400 italic">Not Assigned</span>
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

    if (!faculty) {
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
                        title={faculty.name}
                        subtitle="Faculty Details and Departments"
                        icon={Building2}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Faculty Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Contact Information</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{faculty.email}</span>
                            </div>
                            {faculty.phone && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{faculty.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${faculty.status
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}>
                                    {faculty.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dean Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Dean Information</h3>

                        {dean ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-800 font-medium">
                                    <User className="w-4 h-4" />
                                    <span>{dean.fullName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{dean.email}</span>
                                </div>
                                {dean.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{dean.phone}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-400 italic flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>No Dean Assigned</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-semibold text-[#344e41] border-b pb-2">Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#588157]/10 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-[#344e41]">{departments.length}</p>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Departments</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-[#344e41] mb-4">Departments</h3>
                    <DataTable
                        data={departments}
                        columns={departmentColumns}
                        searchKey="name"
                        searchPlaceholder="Search departments..."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
