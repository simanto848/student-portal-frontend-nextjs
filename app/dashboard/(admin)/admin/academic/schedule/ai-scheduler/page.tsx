"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Loader2,
    Sparkles,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Layers,
    ArrowRight,
    Zap,
    Sun,
    Moon,
    Building2,
    Users,
    GraduationCap,
    AlertTriangle,
    Trash2,
    Info,
    CheckCircle2,
    XCircle,
    BookOpen,
    Settings,
    ChevronDown
} from "lucide-react";
import { notifySuccess, notifyError, notifyWarning } from "@/components/toast";
import { sessionService } from "@/services/academic/session.service";
import { scheduleService, ScheduleGenerationOptions, ScheduleValidationResult } from "@/services/academic/schedule.service";
import { departmentService } from "@/services/academic/department.service";
import { batchService } from "@/services/academic/batch.service";
import { Session, ScheduleProposal, Department, Batch } from "@/services/academic/types";
import Link from "next/link";

type SelectionMode = 'all' | 'department' | 'multi_batch' | 'single_batch';

interface UnassignedCourse {
    batchId: string;
    batchName: string;
    courseId: string;
    courseCode: string;
    courseName: string;
    semester: number;
}

export default function AISchedulerPage() {
    // State for data
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [proposals, setProposals] = useState<ScheduleProposal[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);

    // Selection state
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('all');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
    const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

    // Class duration settings (in minutes)
    const [classDurationMinutes, setClassDurationMinutes] = useState<number>(75); // 1h 15m default
    const [labDurationMinutes, setLabDurationMinutes] = useState<number>(150); // 1h 40m default
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    // Working days settings (default: Saturday, Sunday, Wednesday, Thursday are working days)
    const allDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
    const [offDays, setOffDays] = useState<string[]>(['Monday', 'Tuesday', 'Friday']);

    // Custom time settings
    const [dayStartTime, setDayStartTime] = useState<string>("08:00");
    const [dayEndTime, setDayEndTime] = useState<string>("15:00");
    const [eveningStartTime, setEveningStartTime] = useState<string>("15:30");
    const [eveningEndTime, setEveningEndTime] = useState<string>("21:00");

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // Validation state
    const [validationResult, setValidationResult] = useState<ScheduleValidationResult | null>(null);
    const [showValidation, setShowValidation] = useState(false);

    // Load initial data
    useEffect(() => {
        loadSessions();
        loadDepartments();
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            loadProposals(selectedSessionId);
            loadBatches();
        }
    }, [selectedSessionId]);

    // Filter batches when department changes
    const filteredBatches = selectedDepartmentId
        ? batches.filter(b => {
            const deptId = typeof b.departmentId === 'object' ? b.departmentId.id : b.departmentId;
            return deptId === selectedDepartmentId;
        })
        : batches;

    const loadDepartments = async () => {
        try {
            const data = await departmentService.getAllDepartments();
            setDepartments(data);
        } catch (error) {
            notifyError("Failed to load departments");
        }
    };

    const loadBatches = async () => {
        try {
            const data = await batchService.getAllBatches({ status: true });
            setBatches(data);
        } catch (error) {
            notifyError("Failed to load batches");
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

    // Build generation options based on selection mode
    const buildGenerationOptions = useCallback((): ScheduleGenerationOptions => {
        const options: ScheduleGenerationOptions = {
            sessionId: selectedSessionId,
            selectionMode,
            classDurationMinutes,
            classDurations: {
                theory: classDurationMinutes,
                lab: labDurationMinutes,
                project: labDurationMinutes
            },
            offDays: offDays as ScheduleGenerationOptions['offDays'],
            customTimeSlots: {
                day: {
                    startTime: dayStartTime,
                    endTime: dayEndTime,
                    breakStart: "12:00",
                    breakEnd: "13:00"
                },
                evening: {
                    startTime: eveningStartTime,
                    endTime: eveningEndTime
                }
            }
        };

        switch (selectionMode) {
            case 'department':
                if (selectedDepartmentId) {
                    options.departmentId = selectedDepartmentId;
                }
                break;
            case 'single_batch':
            case 'multi_batch':
                if (selectedBatchIds.length > 0) {
                    options.batchIds = selectedBatchIds;
                }
                break;
        }

        return options;
    }, [selectedSessionId, selectionMode, selectedDepartmentId, selectedBatchIds, classDurationMinutes, labDurationMinutes, offDays, dayStartTime, dayEndTime, eveningStartTime, eveningEndTime]);

    // Validate prerequisites
    const handleValidate = async () => {
        if (!selectedSessionId) return;

        setIsValidating(true);
        setShowValidation(true);
        try {
            const options = buildGenerationOptions();
            const result = await scheduleService.validateSchedulePrerequisites(options);
            setValidationResult(result);

            if (result.valid) {
                notifySuccess("Validation passed! Ready to generate schedule.");
            } else {
                notifyWarning("Validation failed. Please fix the issues before generating.");
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            notifyError(err?.message || "Validation failed");
            setValidationResult(null);
        } finally {
            setIsValidating(false);
        }
    };

    // Generate schedule
    const handleGenerate = async () => {
        if (!selectedSessionId) return;

        // Validate selection
        if (selectionMode === 'department' && !selectedDepartmentId) {
            notifyError("Please select a department");
            return;
        }
        if ((selectionMode === 'single_batch' || selectionMode === 'multi_batch') && selectedBatchIds.length === 0) {
            notifyError("Please select at least one batch");
            return;
        }

        setIsGenerating(true);
        try {
            const options = buildGenerationOptions();
            const result = await scheduleService.generateSchedule(options);

            const stats = result.stats;
            if (stats.unscheduled > 0) {
                notifyWarning(`Schedule generated with ${stats.scheduled} classes. ${stats.unscheduled} could not be scheduled.`);
            } else {
                notifySuccess(`Schedule generated successfully! ${stats.scheduled} classes scheduled.`);
            }

            loadProposals(selectedSessionId);
            setShowValidation(false);
            setValidationResult(null);
        } catch (error: unknown) {
            const err = error as { message?: string; unassignedCourses?: UnassignedCourse[]; errors?: string[] };
            if (err.unassignedCourses) {
                setValidationResult({
                    valid: false,
                    errors: err.errors || [],
                    warnings: [],
                    unassignedCourses: err.unassignedCourses
                });
                setShowValidation(true);
                notifyError("Cannot generate schedule. Some courses don't have teachers assigned.");
            } else {
                notifyError(err?.message || "Failed to generate schedule");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = async (proposalId: string) => {
        try {
            await scheduleService.applyProposal(proposalId);
            notifySuccess("Schedule applied successfully!");
            loadProposals(selectedSessionId);
        } catch (error) {
            notifyError("Failed to apply proposal");
        }
    };

    const handleDeleteProposal = async (proposalId: string) => {
        if (!confirm("Are you sure you want to delete this proposal?")) return;

        try {
            await scheduleService.deleteProposal(proposalId);
            notifySuccess("Proposal deleted");
            loadProposals(selectedSessionId);
        } catch (error) {
            notifyError("Failed to delete proposal");
        }
    };

    const handleBatchToggle = (batchId: string) => {
        if (selectionMode === 'single_batch') {
            setSelectedBatchIds([batchId]);
        } else {
            setSelectedBatchIds(prev =>
                prev.includes(batchId)
                    ? prev.filter(id => id !== batchId)
                    : [...prev, batchId]
            );
        }
    };

    const handleSelectAllBatches = () => {
        if (selectedBatchIds.length === filteredBatches.length) {
            setSelectedBatchIds([]);
        } else {
            setSelectedBatchIds(filteredBatches.map(b => b.id));
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    text: 'text-emerald-600',
                    icon: CheckCircle,
                    label: 'APPLIED'
                };
            case 'rejected':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    text: 'text-red-600',
                    icon: AlertCircle,
                    label: 'REJECTED'
                };
            default:
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    text: 'text-amber-600',
                    icon: Clock,
                    label: 'PENDING'
                };
        }
    };

    const getSelectionSummary = () => {
        switch (selectionMode) {
            case 'all':
                return `All batches (${batches.length})`;
            case 'department':
                const dept = departments.find(d => d.id === selectedDepartmentId);
                return dept ? `${dept.shortName} - ${filteredBatches.length} batches` : 'Select department';
            case 'single_batch':
            case 'multi_batch':
                return selectedBatchIds.length > 0
                    ? `${selectedBatchIds.length} batch${selectedBatchIds.length > 1 ? 'es' : ''} selected`
                    : 'Select batches';
            default:
                return '';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-purple-300/20 blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Automatic Schedule Generator</h1>
                                <p className="text-white/70 mt-1">
                                    Generate optimized class schedules without conflicts automatically
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Sun className="w-4 h-4 text-amber-300" />
                                <span className="text-sm font-medium">Day: 08:00 - 15:00</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Moon className="w-4 h-4 text-blue-300" />
                                <span className="text-sm font-medium">Evening: 15:30 - 21:00</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <Zap className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-medium">No Third-Party AI</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                <span className="text-sm font-medium">Conflict-Free Scheduling</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Card */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden p-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-xl">
                                <Calendar className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Generate New Schedule</h3>
                                <p className="text-sm text-slate-500">Select session and choose how to group batches for scheduling</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Session Selection */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    Academic Session
                                </label>
                                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                        <SelectValue placeholder="Select session..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {sessions.map((session) => (
                                            <SelectItem key={session.id} value={session.id}>
                                                {session.name} ({session.year})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Selection Mode Tabs */}
                        <Tabs value={selectionMode} onValueChange={(v) => {
                            setSelectionMode(v as SelectionMode);
                            setSelectedBatchIds([]);
                            setValidationResult(null);
                            setShowValidation(false);
                        }}>
                            <TabsList className="grid grid-cols-4 h-12 p-1 bg-slate-100 rounded-xl">
                                <TabsTrigger
                                    value="all"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Layers className="w-4 h-4 mr-2" />
                                    All Batches
                                </TabsTrigger>
                                <TabsTrigger
                                    value="department"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Building2 className="w-4 h-4 mr-2" />
                                    By Department
                                </TabsTrigger>
                                <TabsTrigger
                                    value="multi_batch"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Multiple Batches
                                </TabsTrigger>
                                <TabsTrigger
                                    value="single_batch"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    Single Batch
                                </TabsTrigger>
                            </TabsList>

                            {/* All Batches */}
                            <TabsContent value="all" className="mt-4">
                                <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                                    <div className="flex items-center gap-3">
                                        <Layers className="w-5 h-5 text-violet-600" />
                                        <div>
                                            <p className="font-medium text-violet-900">All Active Batches</p>
                                            <p className="text-sm text-violet-600">
                                                Schedule will be generated for all {batches.length} active batches
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* By Department */}
                            <TabsContent value="department" className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        Select Department
                                    </label>
                                    <Select value={selectedDepartmentId} onValueChange={(v) => {
                                        setSelectedDepartmentId(v);
                                        setSelectedBatchIds([]);
                                    }}>
                                        <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                            <SelectValue placeholder="Select department..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl max-h-[300px]">
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.shortName} - {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedDepartmentId && (
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-sm text-blue-700">
                                            <strong>{filteredBatches.length}</strong> batches will be scheduled for this department
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Multiple Batches */}
                            <TabsContent value="multi_batch" className="mt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Select Batches ({selectedBatchIds.length} selected)
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSelectAllBatches}
                                        className="text-violet-600 hover:text-violet-700"
                                    >
                                        {selectedBatchIds.length === filteredBatches.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>

                                {/* Department Filter */}
                                <Select value={selectedDepartmentId || "all"} onValueChange={(v) => {
                                    setSelectedDepartmentId(v === "all" ? "" : v);
                                    setSelectedBatchIds([]);
                                }}>
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-10 w-64">
                                        <SelectValue placeholder="Filter by department..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.shortName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                                    {filteredBatches.map((batch) => {
                                        const isSelected = selectedBatchIds.includes(batch.id);
                                        return (
                                            <div
                                                key={batch.id}
                                                onClick={() => handleBatchToggle(batch.id)}
                                                className={`
                                                    cursor-pointer p-3 rounded-xl border-2 transition-all
                                                    ${isSelected 
                                                        ? 'border-violet-500 bg-violet-50' 
                                                        : 'border-slate-200 bg-white hover:border-slate-300'}
                                                `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        className="data-[state=checked]:bg-violet-600"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-800">
                                                            {batch.code || batch.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Sem {batch.currentSemester} • {batch.currentStudents} students
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            {/* Single Batch */}
                            <TabsContent value="single_batch" className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-slate-400" />
                                        Select Batch
                                    </label>
                                    <Select
                                        value={selectedBatchIds[0] || ""}
                                        onValueChange={(v) => setSelectedBatchIds([v])}
                                    >
                                        <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-12">
                                            <SelectValue placeholder="Select a batch..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl max-h-[300px]">
                                            {batches.map((batch) => (
                                                <SelectItem key={batch.id} value={batch.id}>
                                                    {batch.code || batch.name} - Semester {batch.currentSemester} ({batch.currentStudents} students)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Class Duration Settings */}
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Class Duration Settings
                                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
                            </button>

                            {showAdvancedSettings && (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                    <p className="text-sm text-slate-500">
                                        Set the duration for each class type. Default is 1 hour 15 minutes for theory classes.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Theory/Default Duration */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-slate-400" />
                                                Theory Class Duration
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={classDurationMinutes.toString()}
                                                    onValueChange={(v) => setClassDurationMinutes(parseInt(v))}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="45">45 minutes</SelectItem>
                                                        <SelectItem value="50">50 minutes</SelectItem>
                                                        <SelectItem value="55">55 minutes</SelectItem>
                                                        <SelectItem value="60">1 hour</SelectItem>
                                                        <SelectItem value="75">1 hour 15 minutes</SelectItem>
                                                        <SelectItem value="90">1 hour 30 minutes</SelectItem>
                                                        <SelectItem value="120">2 hours</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Lab Duration */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-slate-400" />
                                                Lab/Project Duration
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={labDurationMinutes.toString()}
                                                    onValueChange={(v) => setLabDurationMinutes(parseInt(v))}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-violet-500 h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="90">1 hour 30 minutes</SelectItem>
                                                        <SelectItem value="120">2 hours</SelectItem>
                                                        <SelectItem value="150">2 hours 30 minutes</SelectItem>
                                                        <SelectItem value="180">3 hours</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Off Days Selection */}
                                    <div className="space-y-3 pt-4 border-t border-slate-200">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            Off Days (No Classes)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {allDays.map((day) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        if (offDays.includes(day)) {
                                                            setOffDays(offDays.filter(d => d !== day));
                                                        } else {
                                                            setOffDays([...offDays, day]);
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                        offDays.includes(day)
                                                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                                            : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                                                    }`}
                                                >
                                                    {day}
                                                    <span className="ml-1 text-xs">
                                                        {offDays.includes(day) ? '(Off)' : '(Working)'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Working days: {allDays.filter(d => !offDays.includes(d)).join(', ') || 'None'}
                                        </p>
                                    </div>

                                    {/* Custom Time Settings */}
                                    <div className="space-y-3 pt-4 border-t border-slate-200">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            Custom Time Slots
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Day Shift Times */}
                                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sun className="w-4 h-4 text-amber-600" />
                                                    <span className="text-sm font-semibold text-amber-800">Day Shift</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs text-slate-500">Start</label>
                                                        <input
                                                            type="time"
                                                            value={dayStartTime}
                                                            onChange={(e) => setDayStartTime(e.target.value)}
                                                            className="w-full px-2 py-1 border rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500">End</label>
                                                        <input
                                                            type="time"
                                                            value={dayEndTime}
                                                            onChange={(e) => setDayEndTime(e.target.value)}
                                                            className="w-full px-2 py-1 border rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Evening Shift Times */}
                                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Moon className="w-4 h-4 text-indigo-600" />
                                                    <span className="text-sm font-semibold text-indigo-800">Evening Shift</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs text-slate-500">Start</label>
                                                        <input
                                                            type="time"
                                                            value={eveningStartTime}
                                                            onChange={(e) => setEveningStartTime(e.target.value)}
                                                            className="w-full px-2 py-1 border rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500">End</label>
                                                        <input
                                                            type="time"
                                                            value={eveningEndTime}
                                                            onChange={(e) => setEveningEndTime(e.target.value)}
                                                            className="w-full px-2 py-1 border rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                                        <Info className="w-3 h-3" />
                                        <span>Theory = {Math.floor(classDurationMinutes / 60)}h {classDurationMinutes % 60}m, Lab = {Math.floor(labDurationMinutes / 60)}h {labDurationMinutes % 60}m</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selection Summary & Actions */}
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Info className="w-4 h-4" />
                                <span className="text-sm">{getSelectionSummary()}</span>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleValidate}
                                    disabled={!selectedSessionId || isValidating}
                                    variant="outline"
                                    className="h-12 px-6 rounded-xl font-semibold border-violet-200 text-violet-600 hover:bg-violet-50"
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Validating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Validate First
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={!selectedSessionId || isGenerating}
                                    className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-violet-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            Generate Schedule
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Validation Results */}
                {showValidation && validationResult && (
                    <Card className={`border-2 rounded-2xl overflow-hidden p-0 ${
                        validationResult.valid 
                            ? 'border-emerald-200 bg-emerald-50/50' 
                            : 'border-red-200 bg-red-50/50'
                    }`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                {validationResult.valid ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                                <div>
                                    <h3 className={`font-bold ${validationResult.valid ? 'text-emerald-800' : 'text-red-800'}`}>
                                        {validationResult.valid ? 'Validation Passed!' : 'Validation Failed'}
                                    </h3>
                                    <p className={`text-sm ${validationResult.valid ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {validationResult.valid
                                            ? 'All prerequisites met. You can generate the schedule.'
                                            : 'Please fix the following issues before generating.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        {!validationResult.valid && validationResult.unassignedCourses && validationResult.unassignedCourses.length > 0 && (
                            <CardContent>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-red-800 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Courses Without Teachers Assigned ({validationResult.unassignedCourses.length})
                                    </h4>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                                        {validationResult.unassignedCourses.map((course: UnassignedCourse, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {course.courseCode} - {course.courseName}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        Batch: {course.batchName} • Semester {course.semester}
                                                    </p>
                                                </div>
                                                <Badge variant="destructive" className="text-xs">
                                                    No Teacher
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <Alert className="bg-amber-50 border-amber-200">
                                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                                        <AlertTitle className="text-amber-800">Action Required</AlertTitle>
                                        <AlertDescription className="text-amber-700">
                                            Please assign teachers to all courses before generating the schedule.
                                            Go to <Link href="/dashboard/admin/enrollment/instructor-assignment" className="underline font-medium">
                                                Instructor Assignment
                                            </Link> to assign teachers.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}

                {/* Proposals Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <Layers className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Generated Proposals</h2>
                                <p className="text-sm text-slate-500">Review and apply generated schedules</p>
                            </div>
                        </div>
                        {proposals.length > 0 && (
                            <Badge className="bg-slate-100 text-slate-600 border-0 font-bold px-3 py-1">
                                {proposals.length} Proposal{proposals.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative p-6 bg-white rounded-full shadow-xl">
                                    <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                                </div>
                            </div>
                            <p className="mt-4 text-slate-500 font-medium">Loading proposals...</p>
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-100 rounded-2xl mb-4">
                                <Sparkles className="w-10 h-10 text-violet-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">No Proposals Yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Generate your first schedule by selecting batches above and clicking &quot;Generate Schedule&quot;
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {proposals.map((proposal) => {
                                const statusConfig = getStatusConfig(proposal.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <Card
                                        key={proposal.id}
                                        className="group relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 bg-white rounded-2xl p-0"
                                    >
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                            proposal.status === 'approved' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                                            proposal.status === 'rejected' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                                            'bg-gradient-to-b from-amber-400 to-amber-600'
                                        }`} />

                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/dashboard/admin/academic/schedule/ai-scheduler/proposals/${proposal.id}`}
                                                        className="font-bold text-lg text-slate-800 hover:text-violet-600 transition-colors block truncate"
                                                    >
                                                        Proposal #{proposal.id.substring(0, 8)}
                                                    </Link>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        {new Date(proposal.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-bold text-[10px] px-2 py-1`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {proposal.metadata?.itemCount || 0} Classes
                                                    </span>
                                                </div>
                                                {proposal.metadata?.unscheduledCount > 0 && (
                                                    <div className="flex items-center gap-1 text-amber-600">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span className="text-xs font-medium">
                                                            {proposal.metadata.unscheduledCount} failed
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {proposal.status === 'pending' && (
                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/dashboard/admin/academic/schedule/ai-scheduler/proposals/${proposal.id}`}
                                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-center text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={() => handleApply(proposal.id)}
                                                        className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                                                    >
                                                        Apply
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {proposal.status === 'approved' && (
                                                <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-semibold">
                                                    <CheckCircle className="w-5 h-5" />
                                                    Active Schedule
                                                </div>
                                            )}

                                            {proposal.status === 'pending' && (
                                                <button
                                                    onClick={() => handleDeleteProposal(proposal.id)}
                                                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Proposal
                                                </button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
