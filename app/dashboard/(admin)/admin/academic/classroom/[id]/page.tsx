"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { academicService, Classroom, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { ArrowLeft, Building2, Users, Wrench, CheckCircle, XCircle } from "lucide-react";

export default function ClassroomDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchClassroom();
        }
    }, [id]);

    const fetchClassroom = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getClassroomById(id);
            setClassroom(data);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load classroom details";
            toast.error(message);
            router.push("/dashboard/admin/academic/classroom");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#588157]"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!classroom) {
        return null;
    }

    const getName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item.name) return item.name;
        return "N/A";
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#344e41]">Classroom Details</h1>
                        <p className="text-[#344e41]/70">{classroom.roomNumber} - {classroom.buildingName}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Building2 className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Basic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Room Number</label>
                                    <p className="text-base font-medium text-[#344e41]">{classroom.roomNumber}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Building</label>
                                    <p className="text-base font-medium text-[#344e41]">{classroom.buildingName}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Floor</label>
                                    <p className="text-base font-medium text-[#344e41]">{classroom.floor || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Type</label>
                                    <p className="text-base font-medium text-[#344e41]">{classroom.roomType}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Department</label>
                                <p className="text-base font-medium text-[#344e41]">{getName(classroom.departmentId)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Capacity & Facilities Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Users className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Capacity & Facilities</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Capacity</label>
                                <p className="text-base font-medium text-[#344e41]">{classroom.capacity} Students</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Facilities</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {classroom.facilities.length > 0 ? (
                                        classroom.facilities.map((facility, index) => (
                                            <span key={index} className="px-2 py-1 bg-[#a3b18a]/20 text-[#344e41] rounded-md text-sm">
                                                {facility}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#344e41]/50">No facilities listed</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status & Maintenance Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Wrench className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Status & Maintenance</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {classroom.isActive ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className={`text-base font-medium ${classroom.isActive ? 'text-green-700' : 'text-red-700'}`}>
                                            {classroom.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Maintenance</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {classroom.isUnderMaintenance ? (
                                            <Wrench className="h-4 w-4 text-orange-600" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                        <span className={`text-base font-medium ${classroom.isUnderMaintenance ? 'text-orange-700' : 'text-green-700'}`}>
                                            {classroom.isUnderMaintenance ? 'Under Maintenance' : 'Operational'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {classroom.maintenanceNotes && (
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Maintenance Notes</label>
                                    <p className="text-sm text-[#344e41] mt-1 p-3 bg-[#a3b18a]/10 rounded-md">
                                        {classroom.maintenanceNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
