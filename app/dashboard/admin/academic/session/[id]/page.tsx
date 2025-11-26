"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { academicService, Session, AcademicApiError } from "@/services/academic.service";
import { toast } from "sonner";
import { ArrowLeft, CalendarRange, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export default function SessionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSession();
        }
    }, [id]);

    const fetchSession = async () => {
        setIsLoading(true);
        try {
            const data = await academicService.getSessionById(id);
            setSession(data);
        } catch (error) {
            const message = error instanceof AcademicApiError ? error.message : "Failed to load session details";
            toast.error(message);
            router.push("/dashboard/admin/academic/session");
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

    if (!session) {
        return null;
    }

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
                        <h1 className="text-2xl font-bold text-[#344e41]">{session.name}</h1>
                        <p className="text-[#344e41]/70">Session Details</p>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <CalendarRange className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Session Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Session Name</label>
                                    <p className="text-base font-medium text-[#344e41]">{session.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Year</label>
                                    <p className="text-base font-medium text-[#344e41]">{session.year}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Status</label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={session.status ? "default" : "destructive"}
                                            className={session.status
                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                            }
                                        >
                                            {session.status ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Duration Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-[#588157]/10 rounded-lg">
                                <Clock className="h-5 w-5 text-[#588157]" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#344e41]">Duration</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">Start Date</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-4 w-4 text-[#344e41]/50" />
                                        <p className="text-base font-medium text-[#344e41]">
                                            {format(new Date(session.startDate), "MMMM dd, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#344e41]/70">End Date</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-4 w-4 text-[#344e41]/50" />
                                        <p className="text-base font-medium text-[#344e41]">
                                            {format(new Date(session.endDate), "MMMM dd, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
