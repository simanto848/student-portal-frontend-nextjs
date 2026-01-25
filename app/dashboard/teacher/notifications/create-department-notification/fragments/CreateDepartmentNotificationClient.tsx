"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Send,
    Loader2,
    AlertCircle,
    FileText,
    Target,
    Zap,
    Megaphone,
    Sparkles,
    Building2,
    Users,
    GraduationCap,
    Info,
    Mail,
    Smartphone,
    Check,
    Globe,
    Shield,
    UserCheck,
    Briefcase,
    Calendar,
    Clock,
    Layout,
    Eye
} from "lucide-react";
import Link from "next/link";
import { notifySuccess, notifyError, notifyLoading, dismissToast } from "@/components/toast";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";

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

import { notificationService, CreateNotificationData, TargetOption } from "@/services/notification/notification.service";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { searchUsers, UserOption } from "../actions";
import { AsyncMultiSearchableSelect, Option } from "@/components/ui/async-multi-searchable-select";

interface TargetOptionExtended extends TargetOption {
    icon?: React.ComponentType<{ className?: string }>;
    description?: string;
    badge?: string;
}

interface CreateDepartmentNotificationClientProps {
    initialTargetOptions: {
        options: TargetOption[];
        canSend: boolean;
        userDepartmentId?: string;
    };
}

const PRIORITIES = [
    { value: 'low', label: 'General', icon: Info, color: 'text-[#2dd4bf]', bg: 'bg-[#2dd4bf]/10', active: 'bg-[#0d9488] text-white' },
    { value: 'medium', label: 'Standard', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10', active: 'bg-blue-600 text-white' },
    { value: 'high', label: 'Important', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', active: 'bg-amber-600 text-white' },
    { value: 'urgent', label: 'Emergency', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', active: 'bg-rose-600 text-white' },
] as const;

export default function CreateDepartmentNotificationClient({ initialTargetOptions }: CreateDepartmentNotificationClientProps) {
    const router = useRouter();
    const theme = useDashboardTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [summary, setSummary] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [sendEmail, setSendEmail] = useState(false);
    const [scheduleNotification, setScheduleNotification] = useState(false);
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
    const [scheduleTime, setScheduleTime] = useState("12:00");
    const [schedulePeriod, setSchedulePeriod] = useState<"AM" | "PM">("PM");

    // Custom user targeting
    const [targetUserIds, setTargetUserIds] = useState<string[]>([]);
    const [userOptions, setUserOptions] = useState<Option[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    const handleSearchUsers = async (query: string) => {
        if (!query || query.length < 2) return;
        setIsSearchingUsers(true);
        try {
            const results = await searchUsers(query);
            setUserOptions(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearchingUsers(false);
        }
    };

    const accentPrimary = theme.colors.accent.primary;
    const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/10';


    const enhancedOptions: TargetOptionExtended[] = useMemo(() => {
        const optionMap: Record<string, TargetOptionExtended> = {};
        const options = initialTargetOptions?.options || [];

        options.forEach((opt: TargetOption) => {
            const base: TargetOptionExtended = { ...opt };

            switch (opt.type) {
                case 'all':
                    base.icon = Globe;
                    base.description = "All users in institution";
                    base.badge = "System-wide";
                    break;
                case 'students':
                    base.icon = GraduationCap;
                    base.description = "All students across departments";
                    base.badge = "Institution";
                    break;
                case 'teachers':
                    base.icon = UserCheck;
                    base.description = "All teachers across departments";
                    base.badge = "Institution";
                    break;
                case 'staff':
                    base.icon = Briefcase;
                    base.description = "All staff members";
                    base.badge = "Institution";
                    break;
                case 'department':
                    base.icon = Building2;
                    base.description = "All members of this department";
                    base.badge = "Your Dept";
                    break;
                case 'department_students':
                    base.icon = GraduationCap;
                    base.description = "Students in your department";
                    base.badge = "Your Dept";
                    break;
                case 'department_teachers':
                    base.icon = UserCheck;
                    base.description = "Teachers in your department";
                    base.badge = "Your Dept";
                    break;
                case 'department_staff':
                    base.icon = Briefcase;
                    base.description = "Staff in your department";
                    base.badge = "Your Dept";
                    break;
                case 'faculty':
                case 'faculty_students':
                case 'faculty_teachers':
                case 'faculty_staff':
                    base.icon = Shield;
                    base.description = "Faculty-level broadcasting";
                    base.badge = "Faculty";
                    break;
                case 'batch':
                    base.icon = Users;
                    base.description = "Specific batch of students";
                    base.badge = "Batch";
                    break;
                case 'custom':
                    base.icon = Target;
                    base.description = "Select specific users";
                    base.badge = "Custom";
                    break;
                default:
                    base.icon = Megaphone;
            }

            const key = `${opt.type}-${opt.id || 'global'}`;
            optionMap[key] = base;
        });

        return Object.values(optionMap);
    }, [initialTargetOptions]);

    const selectedOption = enhancedOptions.find((o: TargetOptionExtended) => `${o.type}-${o.id || 'global'}` === selectedId);

    const handleSubmit = async (publishImmediately: boolean) => {
        if (!title || !content || !selectedId) {
            notifyError("Missing required fields", {
                duration: 4000
            });
            return;
        }

        setIsSubmitting(true);
        const toastId = notifyLoading(publishImmediately ? "Sending notification..." : "Saving as draft...");

        try {
            const data: CreateNotificationData = {
                title: title.trim(),
                content: content.trim(),
                summary: summary.trim() || undefined,
                targetType: selectedOption?.type || "custom",
                priority,
                sendEmail,
                deliveryChannels: sendEmail ? ["socket", "email"] : ["socket"],
            };

            if (selectedOption?.type === 'department' ||
                selectedOption?.type === 'department_students' ||
                selectedOption?.type === 'department_teachers' ||
                selectedOption?.type === 'department_staff') {
                data.targetDepartmentIds = [selectedOption.id!];
            }

            if (selectedOption?.type === 'faculty' ||
                selectedOption?.type === 'faculty_students' ||
                selectedOption?.type === 'faculty_teachers' ||
                selectedOption?.type === 'faculty_staff') {
                data.targetFacultyIds = [selectedOption.id!];
            }

            if (selectedOption?.type === 'batch') {
                data.targetBatchIds = [selectedOption.id!];
            }

            if (selectedOption?.type === 'custom') {
                if (targetUserIds.length === 0) {
                    notifyError("Please select at least one user");
                    setIsSubmitting(false);
                    return;
                }
                data.targetUserIds = targetUserIds;
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
                notifySuccess("Notification scheduled successfully");
            } else if (publishImmediately) {
                await notificationService.publish(notification.id);
                dismissToast(toastId);
                notifySuccess("Notification sent successfully");
            } else {
                dismissToast(toastId);
                notifySuccess("Draft saved successfully");
            }

            setTimeout(() => router.push("/dashboard/teacher/notifications"), 1000);
        } catch (error: unknown) {
            dismissToast(toastId);
            const errorMessage = error instanceof Error ? error.message : "Failed to send notification";
            notifyError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!initialTargetOptions?.canSend) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4">
                <Card className="rounded-3xl border-rose-200 bg-rose-50">
                    <CardContent className="p-8 flex items-center gap-4">
                        <div className="p-3 bg-rose-100 rounded-2xl">
                            <AlertCircle className="h-6 w-6 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-rose-900">Access Restricted</h3>
                            <p className="text-rose-700">You do not have permission to send notifications.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/teacher/notifications">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm active:scale-95 transition-all">
                            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Broadcast <span className="text-[#2dd4bf]">Center</span>
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Create and dispatch department-wide notifications
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="h-12 border-slate-200 dark:border-slate-700 rounded-2xl px-6 font-bold text-xs uppercase tracking-widest bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
                    </Button>
                    <Button
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                        className="h-12 bg-[#0d9488] hover:bg-[#0f766e] dark:bg-[#2dd4bf] dark:hover:bg-[#14b8a6] text-white dark:text-slate-900 shadow-xl shadow-teal-500/20 rounded-2xl px-8 font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {scheduleNotification ? "Schedule" : "Send Now"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="overflow-hidden p-0 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/20">
                        <div className="bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/50 p-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 ring-1 ring-[#2dd4bf]/20 text-[#2dd4bf]">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1">Compose Message</h3>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Craft a clear and impactful notification.</p>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-1 flex items-center gap-2">
                                    <Target className="h-3 w-3" />
                                    Target Audience
                                </Label>
                                <Select value={selectedId} onValueChange={setSelectedId}>
                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 rounded-2xl px-6 font-bold text-slate-900 dark:text-white focus:ring-[#2dd4bf]/20">
                                        <SelectValue placeholder="Select target audience..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <SelectGroup>
                                            <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 p-3">Department Scope</SelectLabel>
                                            {enhancedOptions.filter((o: TargetOptionExtended) =>
                                                ['department', 'department_students', 'department_teachers', 'department_staff'].includes(o.type)
                                            ).map((opt: TargetOptionExtended) => {
                                                const Icon = opt.icon || Megaphone;
                                                return (
                                                    <SelectItem key={`${opt.type}-${opt.id || 'global'}`} value={`${opt.type}-${opt.id || 'global'}`} className="rounded-xl p-3 focus:bg-[#2dd4bf]/10 focus:text-[#0d9488]">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 rounded-lg bg-[#2dd4bf]/10 text-[#2dd4bf]">
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-900 dark:text-slate-200">{opt.label}</span>
                                                                    {opt.badge && (
                                                                        <Badge className="text-[8px] font-black uppercase tracking-widest bg-[#2dd4bf]/20 text-[#0d9488] dark:bg-[#2dd4bf]/30 dark:text-[#2dd4bf] border-0">{opt.badge}</Badge>
                                                                    )}
                                                                </div>
                                                                {opt.description && (
                                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{opt.description}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                        {enhancedOptions.some((o: TargetOptionExtended) => ['faculty', 'faculty_students', 'faculty_teachers', 'faculty_staff'].includes(o.type)) && (
                                            <>
                                                <Separator className="my-2 dark:bg-slate-800" />
                                                <SelectGroup>
                                                    <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 p-3">Faculty Scope</SelectLabel>
                                                    {enhancedOptions.filter((o: TargetOptionExtended) =>
                                                        ['faculty', 'faculty_students', 'faculty_teachers', 'faculty_staff'].includes(o.type)
                                                    ).map((opt: TargetOptionExtended) => {
                                                        const Icon = opt.icon || Megaphone;
                                                        return (
                                                            <SelectItem key={`${opt.type}-${opt.id || 'global'}`} value={`${opt.type}-${opt.id || 'global'}`} className="rounded-xl p-3 focus:bg-purple-50 dark:focus:bg-purple-900/20">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                                                        <Icon className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-slate-900 dark:text-slate-200">{opt.label}</span>
                                                                            <Badge className="text-[8px] font-black uppercase tracking-widest bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-0">{opt.badge}</Badge>
                                                                        </div>
                                                                        {opt.description && (
                                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{opt.description}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectGroup>
                                            </>
                                        )}
                                        {enhancedOptions.some((o: TargetOptionExtended) => ['batch'].includes(o.type)) && (
                                            <>
                                                <Separator className="my-2 dark:bg-slate-800" />
                                                <SelectGroup>
                                                    <SelectLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 p-3">Batch Scope</SelectLabel>
                                                    {enhancedOptions.filter((o: TargetOptionExtended) => o.type === 'batch').map((opt: TargetOptionExtended) => {
                                                        const Icon = opt.icon || Megaphone;
                                                        return (
                                                            <SelectItem key={`${opt.type}-${opt.id || 'global'}`} value={`${opt.type}-${opt.id || 'global'}`} className="rounded-xl p-3 focus:bg-blue-50 dark:focus:bg-blue-900/20">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                                        <Icon className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-slate-900 dark:text-slate-200">{opt.label}</span>
                                                                            <Badge className="text-[8px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0">{opt.badge}</Badge>
                                                                        </div>
                                                                        {opt.description && (
                                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{opt.description}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectGroup>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedOption?.type === 'custom' && (
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1 flex items-center gap-2">
                                        <Users className="h-3 w-3" />
                                        Select Users
                                    </Label>
                                    <AsyncMultiSearchableSelect
                                        options={userOptions}
                                        value={targetUserIds}
                                        onChange={setTargetUserIds}
                                        onSearch={handleSearchUsers}
                                        placeholder="Search by name, email or ID..."
                                        isLoading={isSearchingUsers}
                                    />
                                    <p className="text-[10px] text-slate-400 pl-1">
                                        Search and select specific teachers, students, or staff members.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-1">
                                    Message Subject
                                </Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Department Meeting Announcement"
                                    className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl px-6 font-bold text-slate-900 dark:text-white text-lg placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-[#2dd4bf]/20"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-1">
                                    Summary (Optional)
                                </Label>
                                <Input
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Brief summary for notification preview"
                                    className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl px-6 font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-[#2dd4bf]/20"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pl-1">
                                    Detailed Content
                                </Label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="min-h-[250px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-[2rem] p-8 font-medium text-slate-700 dark:text-slate-300 leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-[#2dd4bf]/20 resize-none"
                                />
                            </div>
                        </CardContent>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard className="border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-indigo-500/5 dark:shadow-slate-900/20 overflow-hidden">
                        <div className="bg-white dark:bg-slate-800/40 border-b border-slate-50 dark:border-slate-700/50 p-6">
                            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase">Notification Config</h3>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1">Priority Level</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PRIORITIES.map((p) => {
                                        const Icon = p.icon;
                                        const isActive = priority === p.value;
                                        return (
                                            <button
                                                key={p.value}
                                                onClick={() => setPriority(p.value as "low" | "medium" | "high" | "urgent")}
                                                className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 active:scale-95 ${isActive ? 'border-[#2dd4bf] bg-[#2dd4bf] text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/40' : 'border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{p.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator className="bg-slate-50" />

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1">Delivery Channels</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#2dd4bf]/10 text-[#2dd4bf] rounded-lg">
                                                <Smartphone className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">In-App Notification</span>
                                        </div>
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${sendEmail ? 'bg-[#2dd4bf]/5 border-[#2dd4bf]/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 grayscale opacity-60'}`} onClick={() => setSendEmail(!sendEmail)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${sendEmail ? 'bg-[#2dd4bf] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <span className={`text-xs font-bold ${sendEmail ? 'text-[#0d9488]' : 'text-slate-400'}`}>Email Broadcast</span>
                                        </div>
                                        <Switch checked={sendEmail} onCheckedChange={setSendEmail} className="data-[state=checked]:bg-[#2dd4bf]" />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-50" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Scheduling</Label>
                                    <Switch checked={scheduleNotification} onCheckedChange={setScheduleNotification} className="data-[state=checked]:bg-[#2dd4bf]" />
                                </div>

                                {scheduleNotification && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1">Target Release Date</Label>
                                            <DatePicker
                                                date={scheduleDate}
                                                onChange={setScheduleDate}
                                                placeholder="Select release date"
                                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl h-14"
                                            />
                                        </div>

                                        <div className="space-y-3 pt-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1">Target Release Time</Label>
                                            <div className="flex gap-2">
                                                <Select
                                                    value={scheduleTime.split(':')[0]}
                                                    onValueChange={(h) => setScheduleTime(`${h}:${scheduleTime.split(':')[1]}`)}
                                                >
                                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl px-4 font-bold text-slate-900 dark:text-white flex-1 hover:bg-white dark:hover:bg-slate-700 hover:border-[#2dd4bf]/30 transition-all">
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl dark:bg-slate-900 dark:border-slate-800">
                                                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(hour => (
                                                            <SelectItem key={hour} value={hour} className="font-bold focus:bg-[#2dd4bf]/10 focus:text-[#0d9488] cursor-pointer dark:text-slate-200">{hour}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={scheduleTime.split(':')[1]}
                                                    onValueChange={(m) => setScheduleTime(`${scheduleTime.split(':')[0]}:${m}`)}
                                                >
                                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl px-4 font-bold text-slate-900 dark:text-white flex-1 hover:bg-white dark:hover:bg-slate-700 hover:border-[#2dd4bf]/30 transition-all">
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl dark:bg-slate-900 dark:border-slate-800">
                                                        {['00', '15', '30', '45'].map(min => (
                                                            <SelectItem key={min} value={min} className="font-bold focus:bg-[#2dd4bf]/10 focus:text-[#0d9488] cursor-pointer dark:text-slate-200">{min}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={schedulePeriod}
                                                    onValueChange={(p: "AM" | "PM") => setSchedulePeriod(p)}
                                                >
                                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl px-4 font-black text-slate-900 dark:text-white flex-1 hover:bg-white dark:hover:bg-slate-700 hover:border-[#2dd4bf]/30 transition-all">
                                                        <SelectValue placeholder="AM/PM" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl dark:bg-slate-900 dark:border-slate-800">
                                                        <SelectItem value="AM" className="font-black focus:bg-[#2dd4bf]/10 focus:text-[#0d9488] cursor-pointer dark:text-slate-200">AM</SelectItem>
                                                        <SelectItem value="PM" className="font-black focus:bg-[#2dd4bf]/10 focus:text-[#0d9488] cursor-pointer dark:text-slate-200">PM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-2 mt-3">
                                            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 leading-normal">
                                                Notification will be stored and automatically released at specified time.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </CardContent>
                    </GlassCard>

                    <div className={`rounded-[2.5rem] border-0 bg-gradient-to-br from-[#0d9488] to-[#115e59] dark:from-[#2dd4bf] dark:to-[#0d9488] p-8 text-white dark:text-slate-900 shadow-xl shadow-teal-600/30 overflow-hidden relative transition-all duration-500 ${!title && 'opacity-50 grayscale'}`}>
                        <div className="absolute -bottom-12 -right-12 h-40 w-40 bg-white/10 dark:bg-black/10 rounded-full blur-2xl" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 opacity-80">
                            <Eye className="h-4 w-4" />
                            Live Preview
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <h4 className="text-xl font-black tracking-tight leading-tight line-clamp-2">
                                {title || "Drafting Notification..."}
                            </h4>
                            {summary && (
                                <p className="text-sm font-medium opacity-90 line-clamp-1 leading-relaxed border-l-2 border-white/30 dark:border-black/20 pl-3">
                                    {summary}
                                </p>
                            )}
                            <p className="text-sm font-medium opacity-70 line-clamp-3 leading-relaxed">
                                {content || "Your message content will be displayed here as you type..."}
                            </p>
                            <div className="flex items-center gap-2 pt-4">
                                <Badge className="bg-white/20 dark:bg-black/10 text-white dark:text-slate-900 font-black uppercase text-[8px] tracking-widest border-0">
                                    {selectedOption?.label || "Target Pending"}
                                </Badge>
                                {priority && (
                                    <Badge className="bg-white/10 dark:bg-black/5 text-white dark:text-slate-900 font-black uppercase text-[8px] tracking-widest border-0 italic">
                                        {priority} priority
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
