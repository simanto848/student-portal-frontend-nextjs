"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { academicService, Course, AcademicApiError } from "@/services/academic.service";
import { notifyError } from "@/components/toast";
import { ArrowLeft, BookOpen, FileText, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CourseDetailClientProps {
    id: string;
}

export default function CourseDetailClient({ id }: CourseDetailClientProps) {
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getCourseById(id);
            setCourse(data);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load course details";
            notifyError(message);
            router.push("/dashboard/admin/academic/course");
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

    if (!course) return null;

    const getDepartmentName = (course: Course): string => {
        if (typeof course.departmentId === 'object' && course.departmentId?.name) return course.departmentId.name;
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{course.name}</h1>
                        <p className="text-slate-500 font-medium">
                            {course.code} <span className="mx-2">•</span> {getDepartmentName(course)}
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
                                <BookOpen className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Course Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Code</label>
                                    <p className="text-base font-semibold text-slate-900 mt-1">{course.code}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Credits</label>
                                    <p className="text-base font-bold text-amber-600 mt-1">{course.credit} CR</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</label>
                                    <p className="text-base font-semibold text-slate-900 mt-1 capitalize">{course.courseType}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Elective</label>
                                    <div className="mt-1">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${course.isElective
                                                ? "bg-blue-50 text-blue-700 ring-blue-200"
                                                : "bg-slate-50 text-slate-600 ring-slate-200"
                                            }`}>
                                            {course.isElective ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</label>
                                <div className="mt-2 flex items-center gap-3">
                                    {course.status ? (
                                        <div className="p-1.5 bg-green-100 rounded-full">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                    ) : (
                                        <div className="p-1.5 bg-red-100 rounded-full">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        </div>
                                    )}
                                    <span className={`text-lg font-bold ${course.status ? 'text-green-700' : 'text-red-700'}`}>
                                        {course.status ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Description Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow h-full"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-50 rounded-xl">
                                <FileText className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">Course Description</h2>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 min-h-[160px]">
                            <p className="text-base text-slate-600 leading-relaxed font-medium">
                                {course.description || "No description available for this course."}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
