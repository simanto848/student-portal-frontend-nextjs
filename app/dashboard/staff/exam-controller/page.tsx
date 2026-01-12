"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { notifyError, notifySuccess } from "@/components/toast";
import { CalendarIcon, FileText, CheckCircle, RotateCcw, LayoutDashboard, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatCard } from "@/components/dashboard/widgets/StatCard";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/ui/time-picker";

export default function ExamControllerDashboard() {
    const { user } = useAuth();
    const theme = useDashboardTheme();
    const [activeTab, setActiveTab] = useState("schedule");
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Schedule Form State
    const [scheduleForm, setScheduleForm] = useState({
        batchId: "",
        courseId: "",
        semester: "",
        examType: "MIDTERM",
        startTime: "",
        endTime: "",
        roomNo: "",
    });

    // Mock functions for now
    const handleCreateSchedule = async () => {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            notifySuccess("Exam schedule created successfully!");
            setScheduleForm({
                batchId: "",
                courseId: "",
                semester: "",
                examType: "MIDTERM",
                startTime: "",
                endTime: "",
                roomNo: "",
            });
        } catch (error: any) {
            notifyError("Failed to create schedule");
        }
    };

    return (
        <div className="container px-6 py-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Exam Controller Dashboard"
                subtitle="Manage schedules, results, and exam operations."
                icon={LayoutDashboard}
            />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Exams"
                    value="12"
                    change={{ value: "+2 today", trend: "up" }}
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                />
                <StatCard
                    title="Results Pending"
                    value="45"
                    change={{ value: "High volume", trend: "down" }}
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                />
                <StatCard
                    title="Upcoming Schedules"
                    value="8"
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                />
                <StatCard
                    title="Issues Reported"
                    value="3"
                    change={{ value: "Low priority", trend: "neutral" }}
                    className="border-none shadow-md bg-white/80 backdrop-blur"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="schedule">Exam Scheduling</TabsTrigger>
                            <TabsTrigger value="results">Result Publication</TabsTrigger>
                        </TabsList>

                        <TabsContent value="schedule">
                            <GlassCard className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className={`text-lg font-semibold ${theme.colors.accent.primary}`}>Create New Schedule</h3>
                                        <p className="text-sm text-muted-foreground">Set up a new exam slot for a batch.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Batch ID</Label>
                                            <Input
                                                placeholder="e.g. BATCH-2024-01"
                                                value={scheduleForm.batchId}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, batchId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Course ID</Label>
                                            <Input
                                                placeholder="e.g. CSE101"
                                                value={scheduleForm.courseId}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, courseId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Semester</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 1"
                                                value={scheduleForm.semester}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, semester: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Exam Type</Label>
                                            <Select
                                                value={scheduleForm.examType}
                                                onValueChange={(val) => setScheduleForm({ ...scheduleForm, examType: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MIDTERM">Midterm</SelectItem>
                                                    <SelectItem value="FINAL">Final</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={setDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label>Start Time</Label>
                                                    <TimePicker
                                                        value={scheduleForm.startTime}
                                                        onChange={(val) => setScheduleForm({ ...scheduleForm, startTime: val })}
                                                        placeholder="Start"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>End Time</Label>
                                                    <TimePicker
                                                        value={scheduleForm.endTime}
                                                        onChange={(val) => setScheduleForm({ ...scheduleForm, endTime: val })}
                                                        placeholder="End"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Room No</Label>
                                            <Input
                                                placeholder="e.g. 302"
                                                value={scheduleForm.roomNo}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, roomNo: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={handleCreateSchedule}
                                            className={`w-full ${theme.colors.accent.secondary} hover:opacity-90`}
                                        >
                                            Create Schedule
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        </TabsContent>

                        <TabsContent value="results">
                            <GlassCard className="p-6">
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                    <div className={`h-16 w-16 rounded-full ${theme.colors.sidebar.iconBg} flex items-center justify-center`}>
                                        <FileText className={`h-8 w-8 ${theme.colors.accent.primary}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">No Pending Results</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            There are currently no results pending for publication.
                                            Check back later when teachers submit grades.
                                        </p>
                                    </div>
                                    <Button variant="outline">Refresh List</Button>
                                </div>
                            </GlassCard>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar - Recent Activity / Quick Actions */}
                <div className="space-y-6">
                    <GlassCard className="p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-violet-500" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-start pb-3 border-b last:border-0 border-slate-100">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-violet-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Exam Schedule Created</p>
                                        <p className="text-xs text-muted-foreground">For CSE Batch 22 - Midterm</p>
                                        <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-white/90" />
                                Important Notice
                            </h3>
                            <p className="text-sm text-white/90">
                                Final exam routine publication deadline is approaching. Please ensure all drafts are finalized by Friday.
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
