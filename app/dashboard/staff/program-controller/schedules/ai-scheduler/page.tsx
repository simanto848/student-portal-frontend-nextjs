"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { notifySuccess, notifyError } from "@/components/toast";
import { sessionService } from "@/services/academic/session.service";
import { scheduleService } from "@/services/academic/schedule.service";
import { departmentService } from "@/services/academic/department.service";
import { Session, ScheduleProposal, Department } from "@/services/academic/types";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function AISchedulerPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [proposals, setProposals] = useState<ScheduleProposal[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadSessions();
        loadDepartments();
    }, []);

    useEffect(() => {
        if (user && 'departmentId' in user && user.departmentId) {
            setSelectedDepartmentId(user.departmentId);
        }
    }, [user]);

    useEffect(() => {
        if (selectedSessionId) {
            loadProposals(selectedSessionId);
        }
    }, [selectedSessionId]);

    const loadDepartments = async () => {
        try {
            const data = await departmentService.getAllDepartments();
            setDepartments(data);
        } catch (error) {
            notifyError("Failed to load departments");
        }
    };

    const loadSessions = async () => {
        try {
            const data = await sessionService.getAllSessions();
            setSessions(data);
            if (data.length > 0) {
                const active = data.find(s => s.status) || data[0];
                setSelectedSessionId(active.id);
            }
        } catch (error) {
            notifyError("Failed to load sessions");
        }
    };

    const loadProposals = async (sessionId: string) => {
        setIsLoading(true);
        try {
            const data = await scheduleService.getProposals(sessionId);
            setProposals(data);
        } catch (error) {
            notifyError("Failed to load proposals");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedSessionId) return;
        setIsGenerating(true);
        try {
            const deptId = selectedDepartmentId === "all" ? undefined : selectedDepartmentId;
            await scheduleService.generateSchedule(selectedSessionId, deptId);
            notifySuccess("Schedule generated successfully!");
            loadProposals(selectedSessionId);
        } catch (error) {
            notifyError("Failed to generate schedule. Ensure data exists.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = async (proposalId: string) => {
        try {
            await scheduleService.applyProposal(proposalId);
            notifySuccess("Schedule applied/published successfully!");
            loadProposals(selectedSessionId);
        } catch (error) {
            notifyError("Failed to apply proposal");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                            AI Class Routine Generator
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Automatically generate optimized class schedules using Gemini AI.
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <Card className="border-indigo-100 bg-indigo-50/50">
                    <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3 space-y-2">
                            <label className="text-sm font-medium">Select Academic Session</label>
                            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select session..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.map((session) => (
                                        <SelectItem key={session.id} value={session.id}>
                                            {session.name} ({session.year})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full md:w-1/3 space-y-2">
                            <label className="text-sm font-medium">Department (Optional)</label>
                            <Select
                                value={selectedDepartmentId}
                                onValueChange={setSelectedDepartmentId}
                                disabled={!!(user && 'departmentId' in user && user.departmentId)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.shortName} - {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={!selectedSessionId || isGenerating}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[200px]"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate New Schedule
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Proposals List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Generated Proposals</h2>

                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="text-center p-12 bg-slate-50 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No proposals generated for this session yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {proposals.map((proposal) => (
                                <Card key={proposal.id} className="relative overflow-hidden transition-all hover:shadow-md">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${proposal.status === 'approved' ? 'bg-green-500' :
                                        proposal.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                                        }`} />
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-lg text-indigo-600 hover:text-indigo-800">
                                                    <a href={`/dashboard/staff/program-controller/schedules/ai-scheduler/proposals/${proposal.id}`}>
                                                        Proposal #{proposal.id.substring(0, 8)}
                                                    </a>
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Generated {new Date(proposal.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${proposal.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {proposal.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4 mt-2">
                                            <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                                                Generated by AI based on current constraints.
                                            </div>

                                            {proposal.status === 'pending' && (
                                                <div className="mt-4 flex space-x-3">
                                                    <a
                                                        href={`/dashboard/staff/program-controller/schedules/ai-scheduler/proposals/${proposal.id}`}
                                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                                                    >
                                                        View Details
                                                    </a>
                                                    <button
                                                        onClick={() => handleApply(proposal.id)}
                                                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            )}

                                            {proposal.status === 'approved' && (
                                                <div className="flex items-center justify-center text-green-600 font-medium py-2">
                                                    <CheckCircle className="mr-2 h-5 w-5" />
                                                    Active Schedule
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
