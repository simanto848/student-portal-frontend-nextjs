"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { academicService, CoursePrerequisite, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { ArrowLeft, GitMerge, BookOpen } from "lucide-react";

export default function PrerequisiteDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

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
            const message = error instanceof AcademicApiError
                ? error.message
                : "Failed to load prerequisite details";
            toast.error(message);
            router.push("/dashboard/admin/academic/prerequisite");
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

    if (!prerequisite) {
        return null;
    }

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
                        <h1 className="text-2xl font-bold text-[#344e41]">Prerequisite Details</h1>
                        <p className="text-[#344e41]/70">Course Dependency Information</p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Main Course Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <BookOpen className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Target Course</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Course Name</label>
                                <p className="text-lg font-medium text-[#344e41]">{getName(prerequisite.courseId)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Course Code</label>
                                    <p className="text-base font-medium text-[#344e41]">{getCode(prerequisite.courseId)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Credits</label>
                                    <p className="text-base font-medium text-[#344e41]">{getCredit(prerequisite.courseId)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prerequisite Course Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <GitMerge className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Prerequisite Requirement</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[#344e41]/70">Prerequisite Course Name</label>
                                <p className="text-lg font-medium text-[#344e41]">{getName(prerequisite.prerequisiteId)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Prerequisite Course Code</label>
                                    <p className="text-base font-medium text-[#344e41]">{getCode(prerequisite.prerequisiteId)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Credits</label>
                                    <p className="text-base font-medium text-[#344e41]">{getCredit(prerequisite.prerequisiteId)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
