"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { academicService, Batch, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { ArrowLeft, Users, GraduationCap, Building2, Calendar, UserCheck, User } from "lucide-react";

export default function BatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [batch, setBatch] = useState<Batch | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchBatch();
        }
    }, [id]);

    const fetchBatch = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getBatchById(id);
            setBatch(data);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load batch details";
            toast.error(message);
            router.push("/dashboard/admin/academic/batch");
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

    if (!batch) {
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
                        <h1 className="text-2xl font-bold text-[#344e41]">Batch Details</h1>
                        <p className="text-[#344e41]/70">{batch.name}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Users className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Basic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Batch Name</label>
                                    <p className="text-base font-medium text-[#344e41]">{batch.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Year</label>
                                    <p className="text-base font-medium text-[#344e41]">{batch.year}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Current Semester</label>
                                    <p className="text-base font-medium text-[#344e41]">{batch.currentSemester}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Status</label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {batch.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Session</label>
                                <p className="text-base font-medium text-[#344e41]">{getName(batch.sessionId)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Academic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <GraduationCap className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Academic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Program</label>
                                <p className="text-base font-medium text-[#344e41]">{getName(batch.programId)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Department</label>
                                <p className="text-base font-medium text-[#344e41]">{getName(batch.departmentId)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Max Students</label>
                                    <p className="text-base font-medium text-[#344e41]">{batch.maxStudents}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Current Students</label>
                                    <p className="text-base font-medium text-[#344e41]">{batch.currentStudents}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leadership Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <UserCheck className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Leadership</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Counselor</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4 text-[#344e41]/50" />
                                    <p className="text-base font-medium text-[#344e41]">
                                        {batch.counselor?.fullName || "Not Assigned"}
                                    </p>
                                </div>
                                {batch.counselor?.email && (
                                    <p className="text-sm text-[#344e41]/70 ml-6">{batch.counselor.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Class Representative</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4 text-[#344e41]/50" />
                                    <p className="text-base font-medium text-[#344e41]">
                                        {batch.classRepresentative?.fullName || "Not Assigned"}
                                    </p>
                                </div>
                                {batch.classRepresentative?.registrationNumber && (
                                    <p className="text-sm text-[#344e41]/70 ml-6">Reg: {batch.classRepresentative.registrationNumber}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Duration Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Duration</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Start Date</label>
                                <p className="text-base font-medium text-[#344e41]">
                                    {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">End Date</label>
                                <p className="text-base font-medium text-[#344e41]">
                                    {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
