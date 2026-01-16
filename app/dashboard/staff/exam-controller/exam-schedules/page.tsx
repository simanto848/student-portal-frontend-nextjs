"use client";

import React, { useState, useEffect } from "react";
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
import { Calendar as CalendarIcon, Clock, Plus, Search, Filter, MoreHorizontal, MapPin, Loader2 } from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash, RefreshCw } from "lucide-react";

import { academicService } from "@/services/academic.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service";

export default function ExamSchedulesPage() {
    const theme = useDashboardTheme();
    const { user } = useAuth();

    // Data State
    const [schedules, setSchedules] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [allSessionCourses, setAllSessionCourses] = useState<any[]>([]);
    const [allCourses, setAllCourses] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Action States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isChangeRoomOpen, setIsChangeRoomOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        batchId: "",
        semester: "",
        courseId: "",
        date: undefined as Date | undefined,
        startTime: "",
        endTime: "",
        roomNo: "", // Room Number string, not ID, based on backend model usually, but logically we select ID -> get Room No
        type: "MIDTERM",
    });

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [batchesData, classroomsData, schedulesData, allSessionCoursesData, allCoursesData] = await Promise.all([
                    academicService.getAllBatches(),
                    academicService.getAllClassrooms(),
                    enrollmentService.getExamSchedules(),
                    academicService.getAllSessionCourses(),
                    academicService.getAllCourses()
                ]);
                setBatches(batchesData || []);
                setClassrooms(classroomsData || []);
                setSchedules(schedulesData || []);
                setAllSessionCourses(allSessionCoursesData || []);
                setAllCourses(allCoursesData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                notifyError("Failed to load initial data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Effect: Fetch Courses when Batch or Semester changes (FOR FORM ONLY)
    useEffect(() => {
        const fetchCourses = async () => {
            if (!formData.batchId) {
                setCourses([]);
                return;
            }

            try {
                // Determine courses for the dropdown based on selected batch
                // We can filter from allSessionCourses if available to save a call, 
                // but getBatchSessionCourses might be Safer if paginated or scoped differently.
                // Keeping original call for freshness/specific logic.
                const sessionCourses = await academicService.getBatchSessionCourses(formData.batchId);

                // Filter by semester if provided
                let filteredCourses = sessionCourses;
                if (formData.semester) {
                    const sem = parseInt(formData.semester);
                    if (!isNaN(sem)) {
                        filteredCourses = sessionCourses.filter((sc: any) => sc.semester === sem);
                    }
                }
                setCourses(filteredCourses);
            } catch (error) {
                console.error("Error fetching courses:", error);
                notifyError("Failed to load courses for selected batch");
            }
        };

        fetchCourses();
    }, [formData.batchId, formData.semester]); // Re-run when batch or semester changes

    const handleCreate = async () => {
        if (!formData.batchId || !formData.courseId || !formData.date || !formData.startTime || !formData.endTime || !formData.roomNo || !formData.type) {
            notifyError("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            // Find selected objects for display or extra data if needed
            const selectedBatch = batches.find(b => b.id === formData.batchId);
            const selectedCourseLink = courses.find(c => c.courseId === formData.courseId);

            // Construct payload
            const payload = {
                batchId: formData.batchId,
                courseId: formData.courseId,
                semester: parseInt(formData.semester),
                examType: formData.type,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                roomNo: formData.roomNo,
                invigilators: [], // Add invigilator selection later if needed
            };

            await enrollmentService.createExamSchedule(payload);
            notifySuccess("Exam schedule created successfully");
            setIsCreateOpen(false);

            // Refresh schedules
            const updatedSchedules = await enrollmentService.getExamSchedules();
            setSchedules(updatedSchedules || []);

            // Reset form
            setFormData({
                batchId: "",
                semester: "",
                courseId: "",
                date: undefined,
                startTime: "",
                endTime: "",
                roomNo: "",
                type: "MIDTERM",
            });

        } catch (error) {
            console.error("Create error:", error);
            notifyError("Failed to create exam schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Actions Handlers ---

    const handleEditClick = (schedule: any) => {
        setSelectedSchedule(schedule);
        setFormData({
            batchId: schedule.batchId,
            semester: String(schedule.semester),
            courseId: schedule.courseId,
            date: schedule.date ? new Date(schedule.date) : undefined,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            roomNo: schedule.roomNo,
            type: schedule.examType
        });
        setIsEditOpen(true);
    };

    const handleChangeRoomClick = (schedule: any) => {
        setSelectedSchedule(schedule);
        setFormData({
            batchId: schedule.batchId,
            courseId: schedule.courseId,
            semester: String(schedule.semester),
            type: schedule.examType,
            date: schedule.date ? new Date(schedule.date) : undefined,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            roomNo: schedule.roomNo
        });
        setIsChangeRoomOpen(true);
    };

    const handleDeleteClick = (schedule: any) => {
        setSelectedSchedule(schedule);
        setIsDeleteOpen(true);
    };

    const handleUpdateSchedule = async () => {
        if (!formData.batchId || !formData.courseId || !formData.date || !formData.startTime || !formData.endTime || !formData.roomNo || !formData.type) {
            notifyError("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                batchId: formData.batchId,
                courseId: formData.courseId,
                semester: parseInt(formData.semester),
                examType: formData.type,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                roomNo: formData.roomNo,
                invigilators: [],
            };

            await enrollmentService.updateExamSchedule(selectedSchedule.id || selectedSchedule._id, payload);
            notifySuccess("Exam schedule updated successfully");
            setIsEditOpen(false);

            // Refresh
            const updatedSchedules = await enrollmentService.getExamSchedules();
            setSchedules(updatedSchedules || []);
        } catch (error) {
            console.error("Update error:", error);
            notifyError("Failed to update exam schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRoom = async () => {
        if (!formData.roomNo) {
            notifyError("Please select a room");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                batchId: selectedSchedule.batchId,
                courseId: selectedSchedule.courseId,
                semester: selectedSchedule.semester,
                examType: selectedSchedule.examType,
                date: selectedSchedule.date,
                startTime: selectedSchedule.startTime,
                endTime: selectedSchedule.endTime,
                invigilators: selectedSchedule.invigilators || [],
                roomNo: formData.roomNo,
            };

            await enrollmentService.updateExamSchedule(selectedSchedule.id || selectedSchedule._id, payload);
            notifySuccess("Room updated successfully");
            setIsChangeRoomOpen(false);

            // Refresh
            const updatedSchedules = await enrollmentService.getExamSchedules();
            setSchedules(updatedSchedules || []);
        } catch (error) {
            console.error("Room update error:", error);
            notifyError("Failed to update room");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedSchedule) return;

        setIsSubmitting(true);
        try {
            await enrollmentService.deleteExamSchedule(selectedSchedule.id || selectedSchedule._id);
            notifySuccess("Exam schedule cancelled successfully");
            setIsDeleteOpen(false);
            // Refresh
            const updatedSchedules = await enrollmentService.getExamSchedules();
            setSchedules(updatedSchedules || []);
        } catch (error) {
            console.error("Delete error:", error);
            notifyError("Failed to cancel exam schedule");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCourseDetails = (courseId: string) => {
        // 1. Try finding in All Courses (direct Course ID match)
        const course = allCourses.find(c => c._id === courseId || c.id === courseId);
        if (course) {
            return { code: course.code, title: course.title || course.name };
        }

        // 2. Fallback: Try finding as session course ID
        const sessionCourse = allSessionCourses.find(sc => sc._id === courseId || sc.id === courseId);
        if (sessionCourse?.courseId) {
            // If populated
            if (typeof sessionCourse.courseId === 'object') {
                return { code: sessionCourse.courseId.code, title: sessionCourse.courseId.title || sessionCourse.courseId.name };
            }
        }

        return { code: "Unknown", title: "Course not found" };
    };

    const getBatchDetails = (batchId: string) => {
        const batch = batches.find(b => b.id === batchId || b._id === batchId);
        return batch ? { name: batch.name, code: batch.code } : { name: "Unknown Batch", code: "N/A" };
    };

    const filteredSchedules = schedules.filter((s: any) => {
        const course = getCourseDetails(s.courseId);
        const batch = getBatchDetails(s.batchId);
        return (course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            batch.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });

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
            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-violet-600" /></div>
            ) : (
                <div className="grid gap-4">
                    {filteredSchedules.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No exam schedules found. Create one to get started.</div>
                    ) : (
                        filteredSchedules.map((schedule: any) => {
                            const courseReq = getCourseDetails(schedule.courseId);
                            const batchReq = getBatchDetails(schedule.batchId);

                            return (
                                <GlassCard key={schedule.id || schedule._id} className="p-0 overflow-hidden transition-all hover:shadow-md group">
                                    <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                        {/* Date Badge */}
                                        <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${theme.colors.sidebar.iconBg} min-w-[80px]`}>
                                            <span className={`text-xs font-bold uppercase ${theme.colors.accent.primary}`}>
                                                {schedule.date ? format(new Date(schedule.date), "MMM") : "N/A"}
                                            </span>
                                            <span className={`text-2xl font-bold ${theme.colors.header.text}`}>
                                                {schedule.date ? format(new Date(schedule.date), "dd") : "--"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {schedule.date ? format(new Date(schedule.date), "EEE") : ""}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">
                                                    {courseReq.code} - {courseReq.title}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${schedule.examType === "MIDTERM" ? "bg-amber-100 text-amber-700" :
                                                    schedule.examType === "FINAL" ? "bg-purple-100 text-purple-700" :
                                                        "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {schedule.examType}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    {schedule.startTime} - {schedule.endTime}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    Room {schedule.roomNo}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-slate-700">Batch:</span> {batchReq.name} ({batchReq.code})
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-slate-700">Sem:</span> {schedule.semester}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="ml-auto">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditClick(schedule)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleChangeRoomClick(schedule)}>
                                                        <RefreshCw className="mr-2 h-4 w-4" /> Change Room
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteClick(schedule)}>
                                                        <Trash className="mr-2 h-4 w-4" /> Cancel Exam
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })
                    )}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Exam Schedule</DialogTitle>
                        <DialogDescription>
                            Set up a new exam slot. Select Batch first, then define Semester to see available courses.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Batch</Label>
                                <Select
                                    value={formData.batchId}
                                    onValueChange={(val) => {
                                        const selectedBatch = batches.find(b => b.id === val);
                                        setFormData({
                                            ...formData,
                                            batchId: val,
                                            semester: selectedBatch?.currentSemester ? String(selectedBatch.currentSemester) : "",
                                            courseId: ""
                                        });
                                    }}
                                >
                                    <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                        <SelectValue placeholder="Select Batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.code} ({b.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value, courseId: "" })} // Reset course on sem change
                                    className="hover:border-violet-400 transition-colors bg-slate-50/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select
                                value={formData.courseId}
                                onValueChange={(val) => setFormData({ ...formData, courseId: val })}
                                disabled={!formData.batchId || courses.length === 0}
                            >
                                <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                    <SelectValue placeholder={!formData.batchId ? "Select Batch First" : courses.length === 0 ? "No courses found" : "Select Course"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c.courseId?._id || c.courseId?.id} value={c.courseId?._id || c.courseId?.id}>
                                            {c.courseId?.code} - {c.courseId?.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    placeholder="Start Time"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <TimePicker
                                    value={formData.endTime}
                                    onChange={(val) => setFormData({ ...formData, endTime: val })}
                                    placeholder="End Time"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room Number</Label>
                                <Select
                                    value={formData.roomNo}
                                    onValueChange={(val) => setFormData({ ...formData, roomNo: val })}
                                >
                                    <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                        <SelectValue placeholder="Select Room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map(room => (
                                            <SelectItem key={room.id} value={room.roomNumber}>
                                                {room.roomNumber} ({room.buildingName}) - Cap: {room.capacity}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Exam Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MIDTERM">Midterm</SelectItem>
                                        <SelectItem value="FINAL">Final</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleCreate} className={`${theme.colors.accent.secondary}`} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Schedule Exam
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Exam Schedule</DialogTitle>
                        <DialogDescription>
                            Update exam details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Batch</Label>
                                <Select
                                    value={formData.batchId}
                                    onValueChange={(val) => {
                                        const selectedBatch = batches.find(b => b.id === val);
                                        setFormData({
                                            ...formData,
                                            batchId: val,
                                            semester: selectedBatch?.currentSemester ? String(selectedBatch.currentSemester) : "",
                                            courseId: ""
                                        });
                                    }}
                                    disabled // Prevent changing batch/course usually implies deleting and creating new, but allowing small fixes is okay. Disabling for now to simplify logic as courses depend on it.
                                >
                                    <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                        <SelectValue placeholder="Select Batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.code} ({b.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    className="hover:border-violet-400 transition-colors bg-slate-50/50"
                                    disabled // Keep disabled to match batch logic
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select
                                value={formData.courseId}
                                onValueChange={(val) => setFormData({ ...formData, courseId: val })}
                                disabled // Keep disabled
                            >
                                <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* We need all courses here or fetch them again. 
                                        Since we disabled editing course, we can just show the current one or map from allCourses 
                                        if available. For simplicity, just use allCourses.
                                    */}
                                    {allCourses.map(c => (
                                        <SelectItem key={c._id || c.id} value={c._id || c.id}>
                                            {c.code} - {c.title || c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    placeholder="Start Time"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <TimePicker
                                    value={formData.endTime}
                                    onChange={(val) => setFormData({ ...formData, endTime: val })}
                                    placeholder="End Time"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room Number</Label>
                                <Select
                                    value={formData.roomNo}
                                    onValueChange={(val) => setFormData({ ...formData, roomNo: val })}
                                >
                                    <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                        <SelectValue placeholder="Select Room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map(room => (
                                            <SelectItem key={room.id} value={room.roomNumber}>
                                                {room.roomNumber} ({room.buildingName}) - Cap: {room.capacity}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Exam Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MIDTERM">Midterm</SelectItem>
                                        <SelectItem value="FINAL">Final</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleUpdateSchedule} className={`${theme.colors.accent.secondary}`} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Update Schedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Room Dialog */}
            <Dialog open={isChangeRoomOpen} onOpenChange={setIsChangeRoomOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Change Room</DialogTitle>
                        <DialogDescription>
                            Quickly assign a different room for this exam.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>New Room Number</Label>
                            <Select
                                value={formData.roomNo}
                                onValueChange={(val) => setFormData({ ...formData, roomNo: val })}
                            >
                                <SelectTrigger className="hover:border-violet-400 transition-colors bg-slate-50/50">
                                    <SelectValue placeholder="Select Room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classrooms.map(room => (
                                        <SelectItem key={room.id} value={room.roomNumber}>
                                            {room.roomNumber} ({room.buildingName}) - Cap: {room.capacity}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsChangeRoomOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleUpdateRoom} className={`${theme.colors.accent.secondary}`} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Change Room
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the exam schedule from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Confirm Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
