"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CourseSyllabus, academicService } from "@/services/academic.service";
import { notifyError } from "@/components/toast";
import { ArrowLeft, BookOpenCheck, FileText, ListChecks, ShieldCheck, GitMerge } from "lucide-react";
import { motion } from "framer-motion";

interface SyllabusDetailClientProps {
    id: string;
}

export default function SyllabusDetailClient({ id }: SyllabusDetailClientProps) {
    const router = useRouter();
    const [syllabus, setSyllabus] = useState<CourseSyllabus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSyllabus();
        }
    }, [id]);

    const fetchSyllabus = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getSyllabusById(id);
            setSyllabus(data);
        } catch (error: any) {
            notifyError(error?.message || "Failed to load syllabus details");
            router.push("/dashboard/admin/academic/syllabus");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!syllabus) return null;

    const getCourseName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'object' && item.courseId) {
            if (typeof item.courseId === 'object' && item.courseId.name) return item.courseId.name;
        }
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Syllabus Details</h1>
                    <p className="text-slate-500 font-medium">
                        {getCourseName(syllabus.sessionCourseId)} — <span className="text-amber-600 font-bold">Version {syllabus.version}</span>
                    </p>
                </div>
            </div>

            {/* Content grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Overview Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:col-span-2 lg:col-span-3 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                            <BookOpenCheck className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Course Overview</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{syllabus.overview || "No overview provided."}</p>
                </motion.div>

                {/* Objectives */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <ListChecks className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Objectives</h2>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{syllabus.objectives || "No objectives listed."}</p>
                </motion.div>

                {/* Prerequisites */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <GitMerge className="h-5 w-5 text-slate-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Prerequisites</h2>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{syllabus.prerequisites || "No prerequisites listed."}</p>
                </motion.div>

                {/* Grading */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Grading Policy</h2>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{syllabus.gradingPolicy || "No policy defined."}</p>
                </motion.div>

                {/* Policies */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Course Policies</h2>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{syllabus.policies || "No policies listed."}</p>
                </motion.div>

                {/* Status card - Full Width */}
                <motion.div
                    variants={itemVariants}
                    className="bg-slate-900 rounded-2xl p-6 md:col-span-2 lg:col-span-3 text-white overflow-hidden relative group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="h-32 w-32" />
                    </div>

                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-amber-400" />
                        Administration & Status
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Status</label>
                            <div className="mt-2 text-lg font-bold">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${syllabus.status === 'Published'
                                        ? 'bg-amber-500/20 text-amber-400 ring-amber-500/30'
                                        : 'bg-slate-700 text-slate-300 ring-slate-600'
                                    }`}>
                                    {syllabus.status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Version Tag</label>
                            <p className="text-lg font-bold text-white mt-1">v{syllabus.version}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Approved At</label>
                            <p className="text-lg font-bold text-white mt-1">
                                {syllabus.approvedAt ? new Date(syllabus.approvedAt).toLocaleDateString() : "Pending"}
                            </p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Published At</label>
                            <p className="text-lg font-bold text-white mt-1">
                                {syllabus.publishedAt ? new Date(syllabus.publishedAt).toLocaleDateString() : "Not Published"}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
