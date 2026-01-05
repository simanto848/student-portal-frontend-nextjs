"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { academicService, Session, AcademicApiError } from "@/services/academic.service";
import { notifyError } from "@/components/toast";
import { ArrowLeft, CalendarRange, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface SessionDetailClientProps {
    id: string;
}

export default function SessionDetailClient({ id }: SessionDetailClientProps) {
    const router = useRouter();

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
            notifyError(message);
            router.push("/dashboard/admin/academic/session");
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

    if (!session) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{session.name}</h1>
                            <p className="text-sm font-medium text-slate-500">Academic Session Details</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
                                <div className="p-2.5 bg-amber-50 rounded-xl ring-1 ring-amber-100">
                                    <CalendarRange className="h-5 w-5 text-amber-600" />
                                </div>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Session Information</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Session Name</label>
                                    <p className="text-base font-bold text-slate-900 mt-1">{session.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Year</label>
                                    <p className="text-base font-bold text-slate-900 mt-1">{session.year}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Status</span>
                            <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ring-inset ${session.status
                                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                                    : "bg-slate-50 text-slate-600 ring-slate-200"
                                    }`}
                            >
                                {session.status ? "Active Session" : "Inactive Session"}
                            </span>
                        </div>
                    </div>

                    {/* Duration Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
                            <div className="p-2.5 bg-amber-50 rounded-xl ring-1 ring-amber-100">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Duration</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start Date</label>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <Calendar className="h-4 w-4 text-amber-500" />
                                    <p className="text-base font-bold text-slate-900">
                                        {format(new Date(session.startDate), "MMMM dd, yyyy")}
                                    </p>
                                </div>
                            </div>

                            <div className="px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">End Date</label>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <Calendar className="h-4 w-4 text-amber-500" />
                                    <p className="text-base font-bold text-slate-900">
                                        {format(new Date(session.endDate), "MMMM dd, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
