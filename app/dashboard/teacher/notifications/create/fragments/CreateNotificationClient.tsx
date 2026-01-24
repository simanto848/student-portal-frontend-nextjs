"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Send,
    Clock,
    Plus,
    Loader2,
    AlertCircle,
    BookOpen,
    GraduationCap,
    Megaphone,
    Sparkles,
    Calendar,
    FileText,
    Target,
    Zap,
    Building2,
    ChevronRight,
    Info,
    Mail,
    Smartphone,
    Check
} from "lucide-react";
import Link from "next/link";
import { notifySuccess, notifyError, notifyLoading, dismissToast } from "@/components/toast";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { notificationService, CreateNotificationData } from "@/services/notification/notification.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface CourseOption {
    id: string;
    type: "course" | "batch" | "department";
    courseId?: string;
    batchId?: string;
    departmentId?: string;
    courseName?: string;
    batchCode?: string;
    departmentName?: string;
    semester?: number;
    label: string;
}

interface CreateNotificationClientProps {
    initialTargetOptions: {
        assignments: any[];
        scope: any;
    };
}

const PRIORITIES = [
    { value: 'low', label: 'General', icon: Info, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', active: 'bg-emerald-600 text-white' },
    { value: 'medium', label: 'Standard', icon: Zap, color: 'bg-[#2dd4bf]/10 text-[#2dd4bf] border-[#2dd4bf]/20', active: 'bg-[#2dd4bf] text-white' },
    { value: 'high', label: 'Important', icon: Sparkles, color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', active: 'bg-amber-600 text-white' },
    { value: 'urgent', label: 'Emergency', icon: AlertCircle, color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800', active: 'bg-rose-600 text-white' },
];

export default function CreateNotificationClient({ initialTargetOptions }: CreateNotificationClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [summary, setSummary] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const [priority, setPriority] = useState<any>("medium");
    const [sendEmail, setSendEmail] = useState(false);
    const [scheduleNotification, setScheduleNotification] = useState(false);
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
    const [scheduleTime, setScheduleTime] = useState("12:00");
    const [schedulePeriod, setSchedulePeriod] = useState<"AM" | "PM">("PM");

    const accentPrimary = theme.colors.accent.primary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/10';

    const courseOptions = useMemo(() => {
        const options: CourseOption[] = [];
        const addedIds = new Set<string>();

        // Department Options (for department heads)
        if (initialTargetOptions.scope?.options && initialTargetOptions.scope.canSend) {
            initialTargetOptions.scope.options.forEach((opt: any) => {
                if (opt.type === "department" && opt.id && !addedIds.has(opt.id)) {
                    addedIds.add(opt.id);
                    options.push({
                        id: `dept-${opt.id}`,
                        type: "department",
                        departmentId: opt.id,
                        departmentName: opt.label,
                        label: opt.label,
                    });
                }
            });
        }

        // Assignments
        const addedBatches = new Set<string>();
        initialTargetOptions.assignments.forEach((assignment) => {
            if (assignment.courseId && assignment.batchId) {
                options.push({
                    id: `${assignment.courseId}-${assignment.batchId}`,
                    type: "course",
                    courseId: assignment.courseId,
                    batchId: assignment.batchId,
                    courseName: assignment.course?.name || "Unknown Course",
                    batchCode: assignment.batch?.code || assignment.batch?.name || "Unknown Batch",
                    label: `${assignment.course?.name || 'Course'} - ${assignment.batch?.code || 'Batch'}`,
                });
            }
            if (assignment.batchId && !addedBatches.has(assignment.batchId)) {
                addedBatches.add(assignment.batchId);
                options.push({
                    id: `batch-${assignment.batchId}`,
                    type: "batch",
                    batchId: assignment.batchId,
                    batchCode: assignment.batch?.code || assignment.batch?.name || "Unknown Batch",
                    label: `Batch ${assignment.batch?.code || assignment.batch?.name || 'Students'}`,
                });
            }
        });

        return options;
    }, [initialTargetOptions]);

    const selectedOption = courseOptions.find((o: any) => o.id === selectedId);

    const handleSubmit = async (publishImmediately: boolean) => {
        if (!title || !content || !selectedId) {
            notifyError("Missing required fields", {
                duration: 4000
            });
            return;
        }

        setIsSubmitting(true);
        const toastId = notifyLoading(publishImmediately ? "Broadcasting signal..." : "Saving as draft...");

        try {
            const data: CreateNotificationData = {
                title: title.trim(),
                content: content.trim(),
                summary: summary.trim() || undefined,
                targetType: "batch",
                targetBatchIds: selectedOption?.batchId ? [selectedOption.batchId] : [],
                priority,
                sendEmail,
                deliveryChannels: sendEmail ? ["socket", "email"] : ["socket"],
            };

            if (selectedOption?.type === "department") {
                data.targetType = "department";
                data.targetDepartmentIds = [selectedOption.departmentId!];
            }

            const notification = await notificationService.create(data);

            if (scheduleNotification && scheduleDate && scheduleTime) {
                const [hours, minutes] = scheduleTime.split(":").map(Number);
                let finalHours = hours;
                if (schedulePeriod === "PM" && hours < 12) finalHours += 12;
                if (schedulePeriod === "AM" && hours === 12) finalHours = 0;

                const scheduledAt = new Date(scheduleDate);
                scheduledAt.setHours(finalHours, minutes, 0, 0);

                await notificationService.schedule(notification.id, scheduledAt.toISOString());
                dismissToast(toastId);
                notifySuccess("Broadcast scheduled successfully");
            } else if (publishImmediately) {
                await notificationService.publish(notification.id);
                dismissToast(toastId);
                notifySuccess("Broadcast signals sent successfully");
            } else {
                dismissToast(toastId);
                notifySuccess("Draft saved successfully");
            }

            setTimeout(() => router.push("/dashboard/teacher/notifications"), 1000);
        } catch (error: any) {
            dismissToast(toastId);
            notifyError(error.message || "Failed to finalize broadcast");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header Section - Updated to match teacher dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/teacher/notifications">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm active:scale-95 transition-all">
                            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            New <span className="text-[#2dd4bf]">Broadcast</span>
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Reach your students instantly with critical updates.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="h-12 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 rounded-xl px-6 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
                    </Button>
                    <Button
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                        className="h-12 bg-[#2dd4bf] hover:bg-[#26b3a2] text-white shadow-lg shadow-teal-500/20 rounded-xl px-8 font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {scheduleNotification ? "Schedule" : "Send Now"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass-panel rounded-3xl border-slate-200/50 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 overflow-hidden p-0">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 p-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#2dd4bf]/10 text-[#2dd4bf]">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none mb-1">Compose Message</CardTitle>
                                    <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">Craft a clear and impactful notification.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {/* Audience Segment */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1 flex items-center gap-2">
                                    <Target className="h-3 w-3" />
                                    Target Audience
                                </Label>
                                <Select value={selectedId} onValueChange={setSelectedId}>
                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-6 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20">
                                        <SelectValue placeholder="Select target group..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                                        <SelectGroup>
                                            <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 p-3">Your Assignments</SelectLabel>
                                            {courseOptions.filter((o: any) => o.type !== 'department').map((opt: any) => (
                                                <SelectItem key={opt.id} value={opt.id} className="rounded-xl p-3 focus:bg-[#2dd4bf]/10 hover:bg-[#2dd4bf]/5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white">{opt.label}</span>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">{opt.type} Access</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                        {initialTargetOptions.scope?.canSend && courseOptions.some((o: any) => o.type === 'department') && (
                                            <>
                                                <Separator className="my-2 bg-slate-200 dark:bg-slate-700" />
                                                <SelectGroup>
                                                    <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 p-3">Admin Scopes</SelectLabel>
                                                    {courseOptions.filter((o: any) => o.type === 'department').map((opt: any) => (
                                                        <SelectItem key={opt.id} value={opt.id} className="rounded-xl p-3 focus:bg-[#2dd4bf]/10 hover:bg-[#2dd4bf]/5">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 dark:text-white">{opt.label}</span>
                                                                <span className="text-[10px] text-[#2dd4bf] uppercase tracking-widest font-black">Department Head</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Title */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">
                                    Message Subject
                                </Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Mid-Term Exam Rescheduled"
                                    className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-6 font-bold text-slate-900 dark:text-white text-lg placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:ring-[#2dd4bf]/20"
                                />
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">
                                    Detailed Content
                                </Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="min-h-[250px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl p-6 font-medium text-slate-700 dark:text-slate-300 leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:ring-[#2dd4bf]/20 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <Card className="glass-panel rounded-3xl border-slate-200/50 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 overflow-hidden">
                        <CardHeader className="bg-white/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 p-6">
                            <CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">Signal Config</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Priority */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Priority Level</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PRIORITIES.map((p: any) => {
                                        const Icon = p.icon;
                                        const isActive = priority === p.value;
                                        return (
                                            <button
                                                key={p.value}
                                                onClick={() => setPriority(p.value)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 active:scale-95 ${isActive ? 'border-[#2dd4bf] bg-[#2dd4bf] text-white shadow-lg shadow-teal-200 dark:shadow-teal-600/20' : 'border-slate-100 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:border-slate-200'}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{p.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator className="bg-slate-50" />

                            {/* Delivery Channels */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Delivery Channels</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#2dd4bf]/10 text-[#2dd4bf] rounded-lg">
                                                <Smartphone className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">In-App Notification</span>
                                        </div>
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${sendEmail ? 'bg-[#2dd4bf]/10 border-[#2dd4bf]/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 grayscale opacity-60'}`} onClick={() => setSendEmail(!sendEmail)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${sendEmail ? 'bg-[#2dd4bf] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <span className={`text-xs font-bold ${sendEmail ? 'text-[#2dd4bf]' : 'text-slate-400 dark:text-slate-500'}`}>Email Broadcast</span>
                                        </div>
                                        <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-50" />

                            {/* Scheduling */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scheduling</Label>
                                    <Switch checked={scheduleNotification} onCheckedChange={setScheduleNotification} />
                                </div>

                                {scheduleNotification && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Target Release Date</Label>
                                            <DatePicker
                                                date={scheduleDate}
                                                onChange={setScheduleDate}
                                                placeholder="Select release date"
                                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl h-14"
                                            />
                                        </div>

                                        <div className="space-y-3 pt-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Target Release Time</Label>
                                            <div className="flex gap-2">
                                                <Select
                                                    value={scheduleTime.split(':')[0]}
                                                    onValueChange={(h) => setScheduleTime(`${h}:${scheduleTime.split(':')[1]}`)}
                                                >
                                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 font-bold text-slate-900 dark:text-white flex-1 hover:bg-white/80 dark:hover:bg-slate-700 hover:border-[#2dd4bf]/30 transition-all">
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                                                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(hour => (
                                                            <SelectItem key={hour} value={hour} className="font-bold focus:bg-[#2dd4bf]/10 focus:text-[#2dd4bf] cursor-pointer">{hour}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={scheduleTime.split(':')[1]}
                                                    onValueChange={(m) => setScheduleTime(`${scheduleTime.split(':')[0]}:${m}`)}
                                                >
                                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 font-bold text-slate-900 dark:text-white flex-1 hover:bg-white/80 dark:hover:bg-slate-700 hover:border-[#2dd4bf]/30 transition-all">
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                                                        {['00', '15', '30', '45'].map(min => (
                                                            <SelectItem key={min} value={min} className="font-bold focus:bg-[#2dd4bf]/10 focus:text-[#2dd4bf] cursor-pointer">{min}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={schedulePeriod}
                                                    onValueChange={(p: any) => setSchedulePeriod(p)}
                                                >
                                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl px-4 font-black text-slate-900 dark:text-white flex-1 hover:bg-white/80 dark:hover:bg-slate-700 hover:border-[#2dd4bf]/30 transition-all">
                                                        <SelectValue placeholder="AM/PM" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur">
                                                        <SelectItem value="AM" className="font-black focus:bg-[#2dd4bf]/10 focus:text-[#2dd4bf] cursor-pointer">AM</SelectItem>
                                                        <SelectItem value="PM" className="font-black focus:bg-[#2dd4bf]/10 focus:text-[#2dd4bf] cursor-pointer">PM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 flex gap-2">
                                            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200 leading-normal">
                                                Signal will be stored and automatically released at specified time.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Preview */}
                    <Card className={`rounded-3xl border-0 bg-gradient-to-br from-[#2dd4bf] to-[#26b3a2] p-8 text-white shadow-xl shadow-teal-500/30 overflow-hidden relative ${!title && 'opacity-50 grayscale'}`}>
                        <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-white/10 rounded-full blur-2xl" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Preview
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <h4 className="text-xl font-black tracking-tight leading-tight line-clamp-2">
                                {title || "Signal Title Pending"}
                            </h4>
                            <p className="text-sm font-medium text-white/80 line-clamp-3 leading-relaxed">
                                {content || "The signal content will appear here once you start typing..."}
                            </p>
                            <div className="flex items-center gap-2 pt-4">
                                <Badge className="bg-white/20 text-white font-black uppercase text-[8px] tracking-widest border-0">
                                    {selectedOption?.label || "Segment Pending"}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
