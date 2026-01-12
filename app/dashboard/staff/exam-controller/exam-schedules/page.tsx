"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { notifyError, notifySuccess } from "@/components/toast";
import { Calendar as CalendarIcon, Clock, Plus, Search, Filter, MoreHorizontal, MapPin } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
const MOCK_SCHEDULES = [
    { id: 1, courseCode: "CSE101", courseName: "Introduction to Computer Science", batch: "BATCH-23", date: new Date("2024-05-15"), startTime: "10:00", endTime: "13:00", room: "302", type: "MIDTERM" },
    { id: 2, courseCode: "ENG102", courseName: "English Composition", batch: "BATCH-23", date: new Date("2024-05-17"), startTime: "14:00", endTime: "17:00", room: "405", type: "MIDTERM" },
    { id: 3, courseCode: "MAT201", courseName: "Calculus II", batch: "BATCH-22", date: new Date("2024-05-20"), startTime: "10:00", endTime: "13:00", room: "302", type: "MIDTERM" },
];

export default function ExamSchedulesPage() {
    const theme = useDashboardTheme();
    const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        courseCode: "",
        batch: "",
        date: undefined as Date | undefined,
        startTime: "",
        endTime: "",
        room: "",
        type: "MIDTERM",
    });

    const handleCreate = () => {
        if (!formData.courseCode || !formData.date || !formData.startTime) {
            notifyError("Please fill in all required fields");
            return;
        }

        const newSchedule = {
            id: schedules.length + 1,
            courseCode: formData.courseCode,
            courseName: "New Course", // Mock
            batch: formData.batch,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: formData.room,
            type: formData.type,
        };

        setSchedules([newSchedule, ...schedules]);
        notifySuccess("Exam schedule created successfully");
        setIsCreateOpen(false);
    };

    const filteredSchedules = schedules.filter(s =>
        s.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batch.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container px-6 py-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Exam Schedules"
                subtitle="Create and manage exam routines and room allocations."
                icon={CalendarIcon}
                actionLabel="Create Schedule"
                onAction={() => setIsCreateOpen(true)}
            />

            {/* Filters and Search */}
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by course or batch..."
                        className="pl-9 bg-white/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto">
                        Export Routine
                    </Button>
                </div>
            </GlassCard>

            {/* Schedules List */}
            <div className="grid gap-4">
                {filteredSchedules.map((schedule) => (
                    <GlassCard key={schedule.id} className={`p-0 overflow-hidden transition-all hover:shadow-md group ${theme.colors.sidebar.hover}`}>
                        <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Date Badge */}
                            <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${theme.colors.sidebar.iconBg} min-w-[80px]`}>
                                <span className={`text-xs font-bold uppercase ${theme.colors.accent.primary}`}>
                                    {format(schedule.date, "MMM")}
                                </span>
                                <span className={`text-2xl font-bold ${theme.colors.header.text}`}>
                                    {format(schedule.date, "dd")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {format(schedule.date, "EEE")}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">{schedule.courseCode} - {schedule.courseName}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${schedule.type === "MIDTERM" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                                        }`}>
                                        {schedule.type}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        {schedule.startTime} - {schedule.endTime}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        Room {schedule.room}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-slate-700">Batch:</span> {schedule.batch}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="ml-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                        <DropdownMenuItem>Change Room</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">Cancel Exam</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Exam Schedule</DialogTitle>
                        <DialogDescription>
                            Set up a new exam slot for a specific batch and course.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Course Code</Label>
                                <Input
                                    placeholder="e.g. CSE101"
                                    value={formData.courseCode}
                                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Batch ID</Label>
                                <Input
                                    placeholder="e.g. BATCH-23"
                                    value={formData.batch}
                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Exam Date</Label>
                            <DatePicker
                                date={formData.date}
                                onChange={(date) => setFormData({ ...formData, date })}
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <TimePicker
                                    value={formData.startTime}
                                    onChange={(val) => setFormData({ ...formData, startTime: val })}
                                    placeholder="Start time"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <TimePicker
                                    value={formData.endTime}
                                    onChange={(val) => setFormData({ ...formData, endTime: val })}
                                    placeholder="End time"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room Number</Label>
                                <Input
                                    placeholder="e.g. 302"
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Exam Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MIDTERM">Midterm</SelectItem>
                                        <SelectItem value="FINAL">Final</SelectItem>
                                        <SelectItem value="QUIZ">Quiz</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} className={`${theme.colors.accent.secondary}`}>Schedule Exam</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
