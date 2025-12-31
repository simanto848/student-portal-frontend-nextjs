"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { academicService, Classroom, AcademicApiError } from "@/services/academic.service";
import { notifyError } from "@/components/toast";
import { ArrowLeft, Building2, Users, Wrench, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ClassroomDetailClientProps {
    id: string;
}

export default function ClassroomDetailClient({ id }: ClassroomDetailClientProps) {
    const router = useRouter();

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
            notifyError(message);
            router.push("/dashboard/admin/academic/classroom");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!classroom) return null;

    const getName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item.name) return item.name;
        return "N/A";
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <DashboardLayout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Classroom Details</h1>
                        <p className="text-slate-500 font-medium">
                            {classroom.roomNumber} <span className="mx-2">•</span> {classroom.buildingName}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                <Building2 className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Room Number</label>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{classroom.roomNumber}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Building</label>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{classroom.buildingName}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Floor</label>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{classroom.floor || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</label>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{classroom.roomType}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Department</label>
                                <p className="text-base font-semibold text-slate-900 mt-1">{getName(classroom.departmentId)}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Capacity & Facilities Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                <Users className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Capacity & Facilities</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Capacity</label>
                                <p className="text-base font-bold text-amber-600 mt-1">{classroom.capacity} Students</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Facilities</label>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {classroom.facilities.length > 0 ? (
                                        classroom.facilities.map((facility, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold ring-1 ring-inset ring-amber-200"
                                            >
                                                {facility}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400 bg-slate-50 px-3 py-2 rounded-lg italic font-medium">No facilities listed</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status & Maintenance Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow md:col-span-2"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                <Wrench className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Status & Maintenance</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status</label>
                                    <div className="flex items-center gap-3 mt-3">
                                        {classroom.isActive ? (
                                            <div className="p-1.5 bg-green-100 rounded-full">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        ) : (
                                            <div className="p-1.5 bg-red-100 rounded-full">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            </div>
                                        )}
                                        <span className={`text-lg font-bold ${classroom.isActive ? 'text-green-700' : 'text-red-700'}`}>
                                            {classroom.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance State</label>
                                    <div className="flex items-center gap-3 mt-3">
                                        {classroom.isUnderMaintenance ? (
                                            <div className="p-1.5 bg-orange-100 rounded-full animate-pulse">
                                                <Wrench className="h-4 w-4 text-orange-600" />
                                            </div>
                                        ) : (
                                            <div className="p-1.5 bg-green-100 rounded-full">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                        )}
                                        <span className={`text-lg font-bold ${classroom.isUnderMaintenance ? 'text-orange-700' : 'text-green-700'}`}>
                                            {classroom.isUnderMaintenance ? 'Under Maintenance' : 'Operational'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {classroom.maintenanceNotes && (
                                <div className="animate-in fade-in duration-500">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance Notes</label>
                                    <p className="text-sm text-slate-600 mt-3 p-4 bg-orange-50/50 border border-orange-100 rounded-xl leading-relaxed font-medium">
                                        {classroom.maintenanceNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
