"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { academicService, CoursePrerequisite, AcademicApiError } from "@/services/academic.service";
import { notifyError } from "@/components/toast";
import { ArrowLeft, GitMerge, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface PrerequisiteDetailClientProps {
    id: string;
}

export default function PrerequisiteDetailClient({ id }: PrerequisiteDetailClientProps) {
    const router = useRouter();

    const [prerequisite, setPrerequisite] = useState<CoursePrerequisite | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchPrerequisite();
        }
    }, [id]);

    const fetchPrerequisite = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getPrerequisiteById(id);
            setPrerequisite(data);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load prerequisite details";
            notifyError(message);
            router.push("/dashboard/admin/academic/prerequisite");
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

    if (!prerequisite) return null;

    // Helper to get name from object or string
    const getName = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item.name) return item.name;
        return "N/A";
    };

    // Helper to get code from object or string
    const getCode = (item: any): string => {
        if (!item) return "";
        if (typeof item === 'string') return "";
        if (typeof item === 'object' && item.code) return item.code;
        return "";
    };

    // Helper to get credit from object or string
    const getCredit = (item: any): string => {
        if (!item) return "N/A";
        if (typeof item === 'string') return "N/A";
        if (typeof item === 'object' && item.credit) return item.credit.toString();
        return "N/A";
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prerequisite Details</h1>
                    <p className="text-slate-500 font-medium">Course Dependency Information</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-8 md:grid-cols-2">
                {/* Main Course Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BookOpen className="h-24 w-24 text-slate-900" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-slate-900 rounded-2xl">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Target Course</h2>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Course Name</label>
                            <p className="text-xl font-bold text-slate-900 mt-2 leading-tight">{getName(prerequisite.courseId)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Course Code</label>
                                <p className="text-lg font-bold text-slate-700 mt-2">{getCode(prerequisite.courseId)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Credits</label>
                                <p className="text-lg font-bold text-amber-600 mt-2">{getCredit(prerequisite.courseId)} CR</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Prerequisite Course Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <GitMerge className="h-24 w-24 text-amber-600" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                            <GitMerge className="h-6 w-6 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Prerequisite Requirement</h2>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Prerequisite Course Name</label>
                            <p className="text-xl font-bold text-amber-700 mt-2 leading-tight">{getName(prerequisite.prerequisiteId)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Prerequisite Code</label>
                                <p className="text-lg font-bold text-slate-700 mt-2">{getCode(prerequisite.prerequisiteId)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Credits</label>
                                <p className="text-lg font-bold text-amber-600 mt-2">{getCredit(prerequisite.prerequisiteId)} CR</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Connection Arrow (Visual Decor) */}
            <div className="hidden md:flex justify-center -my-3 relative z-10">
                <div className="bg-amber-50 p-2 rounded-full border border-amber-100 shadow-sm">
                    <GitMerge className="h-5 w-5 text-amber-600 rotate-90" />
                </div>
            </div>
        </motion.div>
    );
}
