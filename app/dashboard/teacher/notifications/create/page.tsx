"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  ArrowLeft,
  Send,
  Clock,
  Bell,
  Mail,
  Users,
  Loader2,
  AlertCircle,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Megaphone,
  Sparkles,
  Calendar,
  FileText,
  Target,
  Zap,
  AlertTriangle,
  Info,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  notificationService,
  CreateNotificationData,
} from "@/services/notification/notification.service";
import {
  batchCourseInstructorService,
  BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import { cn } from "@/lib/utils";
import { notifySuccess, notifyError, notifyWarning } from "@/components/toast";
import toast from "react-hot-toast";

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

interface AudienceFilters {
  students: boolean;
  teachers: boolean;
  staff: boolean;
}

interface FormErrors {
  target?: string;
  title?: string;
  content?: string;
  schedule?: string;
}

const priorityConfig = {
  low: {
    label: "Low",
    color: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
    activeColor: "bg-slate-600 text-white hover:bg-slate-700",
    icon: Info,
    description: "General information",
  },
  medium: {
    label: "Medium",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    activeColor: "bg-blue-600 text-white hover:bg-blue-700",
    icon: Bell,
    description: "Standard notifications",
  },
  high: {
    label: "High",
    color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    activeColor: "bg-orange-500 text-white hover:bg-orange-600",
    icon: AlertTriangle,
    description: "Important updates",
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    activeColor: "bg-red-600 text-white hover:bg-red-700",
    icon: Zap,
    description: "Requires immediate attention",
  },
} as const;

// Inline error component
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-sm text-red-600 mt-1.5 animate-in slide-in-from-top-1">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export default function CreateNotificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Instructor assignments
  const [assignments, setAssignments] = useState<BatchCourseInstructor[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedOption, setSelectedOption] = useState<CourseOption | null>(
    null,
  );
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [sendEmail, setSendEmail] = useState(false);
  const [audienceFilters, setAudienceFilters] = useState<AudienceFilters>({
    students: true,
    teachers: true,
    staff: true,
  });
  const [scheduleNotification, setScheduleNotification] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fetchInstructorCourses = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      // Fetch instructor's course assignments
      const instructorAssignments =
        await batchCourseInstructorService.getInstructorCourses(user.id);

      if (!instructorAssignments || instructorAssignments.length === 0) {
        setAssignments([]);
        setCourseOptions([]);
        setLoadError(
          "You are not assigned to any courses. Please contact your administrator.",
        );
        notifyWarning("No courses assigned to your account");
        return;
      }

      setAssignments(instructorAssignments);

      // Build course options from assignments
      const options: CourseOption[] = [];
      const addedBatches = new Set<string>();

      instructorAssignments.forEach((assignment) => {
        const courseName =
          assignment.course?.name ||
          (assignment.courseId
            ? `Course ${assignment.courseId.slice(0, 8)}...`
            : "Unknown Course");
        const batchCode =
          assignment.batch?.code ||
          assignment.batch?.name ||
          (assignment.batchId
            ? `Batch ${assignment.batchId.slice(0, 8)}...`
            : "Unknown Batch");

        // Add course-specific option
        if (assignment.courseId && assignment.batchId) {
          options.push({
            id: `${assignment.courseId}-${assignment.batchId}`,
            type: "course",
            courseId: assignment.courseId,
            batchId: assignment.batchId,
            courseName,
            batchCode,
            semester: assignment.semester || 1,
            label: `${courseName} - ${batchCode}`,
          });
        }

        // Add batch option
        if (assignment.batchId && !addedBatches.has(assignment.batchId)) {
          addedBatches.add(assignment.batchId);
          options.push({
            id: `batch-${assignment.batchId}`,
            type: "batch",
            batchId: assignment.batchId,
            courseName: "",
            batchCode,
            semester: assignment.semester || 1,
            label: `All students in ${batchCode}`,
          });
        }
      });

      setCourseOptions(options);

      if (options.length === 0) {
        setLoadError(
          "Could not build course options. Please contact your administrator.",
        );
        notifyError("Failed to load course options");
      }
    } catch (err) {
      console.error("Failed to fetch instructor courses:", err);
      setLoadError(
        "Failed to load your course assignments. Please try refreshing the page.",
      );
      notifyError("Failed to load your course assignments");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchTargetOptions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      const [instructorAssignments, scope] = await Promise.all([
        batchCourseInstructorService.getInstructorCourses(user.id),
        notificationService.getMyScope().catch(() => null),
      ]);

      const options: CourseOption[] = [];
      const addedIds = new Set<string>();

      // 1. Add Department Options (from scope)
      if (scope?.options) {
        scope.options.forEach((opt) => {
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

      // 2. Add Course/Batch Options (from assignments)
      if (instructorAssignments) {
        setAssignments(instructorAssignments);
        const addedBatches = new Set<string>();

        instructorAssignments.forEach((assignment) => {
          // Add course-specific option
          if (assignment.courseId && assignment.batchId) {
            const courseName = assignment.course?.name || "Unknown Course";
            const batchCode = assignment.batch?.code || "Unknown Batch";

            options.push({
              id: `${assignment.courseId}-${assignment.batchId}`,
              type: "course",
              courseId: assignment.courseId,
              batchId: assignment.batchId,
              courseName,
              batchCode,
              semester: assignment.semester || 1,
              label: `${courseName} - ${batchCode}`,
            });
          }

          // Add batch option
          if (assignment.batchId && !addedBatches.has(assignment.batchId)) {
            addedBatches.add(assignment.batchId);
            const batchCode = assignment.batch?.code || assignment.batch?.name || "Unknown Batch";

            options.push({
              id: `batch-${assignment.batchId}`,
              type: "batch",
              batchId: assignment.batchId,
              batchCode,
              label: `All students in ${batchCode}`,
            });
          }
        });
      }

      setCourseOptions(options);

      if (options.length === 0) {
        setLoadError(
          "No courses or departments found to create notifications for.",
        );
      }
    } catch (err) {
      console.error("Failed to fetch target options:", err);
      setLoadError("Failed to load targeting options.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTargetOptions();
  }, [fetchTargetOptions]);

  // Validate a single field
  const validateField = (field: string, value: unknown): string | undefined => {
    switch (field) {
      case "target":
        if (!value) return "Please select a course or batch";
        break;
      case "title":
        if (!value || (typeof value === "string" && !value.trim())) {
          return "Title is required";
        }
        if (typeof value === "string" && value.trim().length < 3) {
          return "Title must be at least 3 characters";
        }
        break;
      case "content":
        if (!value || (typeof value === "string" && !value.trim())) {
          return "Content is required";
        }
        if (typeof value === "string" && value.trim().length < 10) {
          return "Content must be at least 10 characters";
        }
        break;
      case "schedule":
        if (scheduleNotification && (!scheduleDate || !scheduleTime)) {
          return "Please select both date and time";
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      target: validateField("target", selectedOption),
      title: validateField("title", title),
      content: validateField("content", content),
      schedule: validateField("schedule", { scheduleDate, scheduleTime }),
    };

    setErrors(newErrors);

    // Mark all fields as touched
    setTouched({
      target: true,
      title: true,
      content: true,
      schedule: true,
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (hasErrors) {
      const errorCount = Object.values(newErrors).filter((e) => e).length;
      notifyError(
        `Please fix ${errorCount} validation error${errorCount > 1 ? "s" : ""} before submitting`,
      );
    }

    return !hasErrors;
  };

  // Handle field blur for real-time validation
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let value: unknown;
    switch (field) {
      case "target":
        value = selectedOption;
        break;
      case "title":
        value = title;
        break;
      case "content":
        value = content;
        break;
      case "schedule":
        value = { scheduleDate, scheduleTime };
        break;
    }

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFieldChange = (field: string) => {
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = toast.loading(
      publishImmediately
        ? "Sending notification..."
        : scheduleNotification
          ? "Scheduling notification..."
          : "Saving draft...",
    );

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

        const targetRoles: string[] = [];
        if (audienceFilters.students) targetRoles.push("student");
        if (audienceFilters.teachers) targetRoles.push("teacher");
        if (audienceFilters.staff) targetRoles.push("staff");
        (data as any).targetRoles = targetRoles;
      } else if (selectedOption?.type === "batch") {
        data.targetType = "batch";
        data.targetBatchIds = [selectedOption.batchId!];
      } else if (selectedOption?.type === "course") {
        data.targetType = "batch";
        data.targetBatchIds = [selectedOption.batchId!];
      }

      const notification = await notificationService.create(data);
      if (scheduleNotification && scheduleDate && scheduleTime) {
        const scheduleAt = new Date(
          `${scheduleDate}T${scheduleTime}`,
        ).toISOString();
        await notificationService.schedule(notification.id, scheduleAt);
        toast.dismiss(loadingToastId);
        notifySuccess("Notification scheduled successfully!");
      } else if (publishImmediately) {
        // Publish immediately
        await notificationService.publish(notification.id);
        toast.dismiss(loadingToastId);
        notifySuccess(
          "Notification sent! Your students will receive it shortly.",
        );
      } else {
        toast.dismiss(loadingToastId);
        notifySuccess("Notification saved as draft.");
      }

      setTimeout(() => {
        router.push("/dashboard/teacher/notifications");
      }, 1500);
    } catch (err) {
      toast.dismiss(loadingToastId);
      notifyError(
        err instanceof Error
          ? err.message
          : "Failed to send notification. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSummary("");
    setSelectedOption(null);
    setPriority("medium");
    setSendEmail(false);
    setScheduleNotification(false);
    setScheduleDate("");
    setScheduleTime("");
    setErrors({});
    setTouched({});
    notifySuccess("Form has been reset");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-dashboard-600/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-dashboard-600 to-dashboard-800 p-4 rounded-full">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-medium text-dashboard-900">
              Loading your courses...
            </p>
            <p className="text-sm text-muted-foreground">
              Fetching your assigned courses and batches
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link href="/dashboard/teacher/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10 rounded-full hover:bg-dashboard-600/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-2 bg-gradient-to-br from-dashboard-600 to-dashboard-800 rounded-lg">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dashboard-900 truncate">
                  Create Notification
                </h1>
                <p className="text-sm text-muted-foreground">
                  Send updates to your students
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Load Error */}
        {loadError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full shrink-0 self-start sm:self-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-red-800">
                    Could not load courses
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{loadError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchInstructorCourses}
                  className="border-red-300 text-red-700 hover:bg-red-100 shrink-0"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Your Courses Summary - Only show if we have assignments */}
        {assignments.length > 0 && (
          <Card className="overflow-hidden border-0 shadow-md pt-0">
            <div className="bg-gradient-to-r from-dashboard-600 to-dashboard-800 p-4 sm:p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Your Assigned Courses</h3>
                  <p className="text-sm text-white/80">
                    {assignments.length} course
                    {assignments.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-4 sm:p-6 bg-gradient-to-b from-dashboard-600/5 to-transparent">
              <div className="flex flex-wrap gap-2">
                {assignments.map((a) => (
                  <Badge
                    key={a.id}
                    variant="secondary"
                    className="bg-white border border-dashboard-600/20 text-dashboard-900 px-3 py-1.5 text-sm font-medium shadow-sm"
                  >
                    <BookOpen className="h-3 w-3 mr-1.5 text-dashboard-600" />
                    {a.course?.name || `Course ${a.courseId?.slice(0, 8)}`}
                    <span className="mx-1.5 text-muted-foreground">•</span>
                    <GraduationCap className="h-3 w-3 mr-1 text-dashboard-700" />
                    {a.batch?.code || a.batch?.name || a.batchId?.slice(0, 8)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Form - Only show if we have course options */}
        {courseOptions.length > 0 && (
          <Card className="shadow-lg border-0 overflow-hidden pt-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-dashboard-600/10 rounded-lg">
                  <FileText className="h-5 w-5 text-dashboard-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Notification Details
                  </CardTitle>
                  <CardDescription>
                    Fill in the information below to create your notification
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Target Audience */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Target className="h-4 w-4 text-dashboard-600" />
                  Send To <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedOption?.id || ""}
                  onValueChange={(value) => {
                    const option = courseOptions.find((o) => o.id === value);
                    setSelectedOption(option || null);
                    handleFieldChange("target");
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-12 text-base",
                      touched.target && errors.target
                        ? "border-red-500 focus:ring-red-500"
                        : "",
                    )}
                    onBlur={() => handleBlur("target")}
                  >
                    <SelectValue placeholder="Choose a course or batch..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2 text-dashboard-600">
                        <BookOpen className="h-4 w-4" />
                        By Course
                      </SelectLabel>
                      {courseOptions
                        .filter((o) => o.type === "course")
                        .map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.id}
                            className="py-3"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-dashboard-600" />
                              <span className="font-medium">
                                {option.courseName}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-muted-foreground">
                                {option.batchCode}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <Separator className="my-2" />
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2 text-dashboard-700">
                        <GraduationCap className="h-4 w-4" />
                        By Batch (All Students)
                      </SelectLabel>
                      {courseOptions
                        .filter((o) => o.type === "batch")
                        .map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.id}
                            className="py-3"
                          >
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-dashboard-700" />
                              <span>All students in</span>
                              <span className="font-medium">
                                {option.batchCode}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <Separator className="my-2" />
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2 text-dashboard-800">
                        <Building2 className="h-4 w-4" />
                        By Department
                      </SelectLabel>
                      {courseOptions
                        .filter((o) => o.type === "department")
                        .map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.id}
                            className="py-3"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-dashboard-800" />
                              <span className="font-medium">
                                {option.departmentName}
                              </span>
                              <Badge key="head" variant="secondary" className="ml-2 text-[10px] h-5">Head</Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError
                  message={touched.target ? errors.target : undefined}
                />

                {selectedOption && (
                  <div className="flex items-center gap-2 p-3 bg-dashboard-600/5 rounded-lg border border-dashboard-600/20 animate-in slide-in-from-top">
                    <Users className="h-4 w-4 text-dashboard-600" />
                    <span className="text-sm font-medium text-dashboard-800">
                      {selectedOption.type === "course"
                        ? `Students enrolled in ${selectedOption.courseName}`
                        : `All students in ${selectedOption.batchCode}`}
                    </span>
                  </div>
                )}

                {/* Audience Filters for Department */}
                {selectedOption?.type === "department" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-sm font-medium mb-3 block text-gray-700">
                      Select Audience within Department
                    </Label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={audienceFilters.students}
                            onChange={(e) => setAudienceFilters(prev => ({ ...prev, students: e.target.checked }))}
                            className="peer h-4 w-4 rounded border-gray-300 text-dashboard-600 focus:ring-dashboard-600 cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-dashboard-700 transition-colors">Students</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={audienceFilters.teachers}
                            onChange={(e) => setAudienceFilters(prev => ({ ...prev, teachers: e.target.checked }))}
                            className="peer h-4 w-4 rounded border-gray-300 text-dashboard-600 focus:ring-dashboard-600 cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-dashboard-700 transition-colors">Teachers</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={audienceFilters.staff}
                            onChange={(e) => setAudienceFilters(prev => ({ ...prev, staff: e.target.checked }))}
                            className="peer h-4 w-4 rounded border-gray-300 text-dashboard-600 focus:ring-dashboard-600 cursor-pointer transition-colors"
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-dashboard-700 transition-colors">Staff</span>
                      </label>
                    </div>
                    {!audienceFilters.students && !audienceFilters.teachers && !audienceFilters.staff && (
                      <p className="text-xs text-red-500 mt-2">Please select at least one audience group.</p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Assignment Deadline Reminder"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    handleFieldChange("title");
                  }}
                  onBlur={() => handleBlur("title")}
                  maxLength={100}
                  className={cn(
                    "h-12 text-base",
                    touched.title && errors.title
                      ? "border-red-500 focus:ring-red-500"
                      : "",
                  )}
                />
                <div className="flex items-center justify-between">
                  <FieldError
                    message={touched.title ? errors.title : undefined}
                  />
                  <p className="text-xs text-muted-foreground ml-auto">
                    {title.length}/100
                  </p>
                </div>
              </div>

              {/* Summary (optional) */}
              <div className="space-y-2">
                <Label htmlFor="summary" className="text-base font-medium">
                  Summary{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="summary"
                  placeholder="Brief preview text for notification cards"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  maxLength={200}
                  className="h-12 text-base"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {summary.length}/200
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Write your notification message here. Be clear and concise..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    handleFieldChange("content");
                  }}
                  onBlur={() => handleBlur("content")}
                  rows={6}
                  className={cn(
                    "text-base resize-none min-h-[150px]",
                    touched.content && errors.content
                      ? "border-red-500 focus:ring-red-500"
                      : "",
                  )}
                />
                <div className="flex items-center justify-between">
                  <FieldError
                    message={touched.content ? errors.content : undefined}
                  />
                  <p className="text-xs text-muted-foreground ml-auto">
                    {content.length} characters
                  </p>
                </div>
              </div>

              <Separator />

              {/* Priority */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-dashboard-600" />
                  Priority Level
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {(
                    Object.keys(priorityConfig) as Array<
                      keyof typeof priorityConfig
                    >
                  ).map((p) => {
                    const config = priorityConfig[p];
                    const Icon = config.icon;
                    const isActive = priority === p;

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
                          isActive
                            ? `${config.activeColor} border-transparent shadow-lg scale-[1.02]`
                            : `${config.color} hover:scale-[1.01]`,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium text-sm">
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground">
                  {priorityConfig[priority].description}
                </p>
              </div>

              <Separator />

              {/* Delivery Options */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Delivery Options
                </Label>

                {/* Email Toggle */}
                <div
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                    sendEmail
                      ? "border-dashboard-600 bg-dashboard-600/5"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                  onClick={() => setSendEmail(!sendEmail)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        sendEmail
                          ? "bg-dashboard-600 text-white"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email Notification</p>
                      <p className="text-sm text-muted-foreground">
                        Also send via email to ensure delivery
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={sendEmail}
                    className="data-[state=checked]:bg-dashboard-600 pointer-events-none"
                  />
                </div>

                {/* Schedule Toggle */}
                <div
                  className={cn(
                    "rounded-xl border-2 transition-all overflow-hidden",
                    scheduleNotification
                      ? "border-dashboard-600 bg-dashboard-600/5"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          scheduleNotification
                            ? "bg-dashboard-600 text-white"
                            : "bg-gray-100 text-gray-500",
                        )}
                      >
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Schedule for Later</p>
                        <p className="text-sm text-muted-foreground">
                          Set a specific date and time to publish
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={scheduleNotification}
                      onCheckedChange={(checked) => {
                        setScheduleNotification(checked);
                        if (!checked) {
                          setScheduleDate("");
                          setScheduleTime("");
                          setErrors((prev) => ({
                            ...prev,
                            schedule: undefined,
                          }));
                        }
                      }}
                      className="data-[state=checked]:bg-dashboard-600"
                    />
                  </div>

                  {scheduleNotification && (
                    <div className="p-4 pt-0 animate-in slide-in-from-top">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                        <div className="space-y-2">
                          <Label
                            htmlFor="scheduleDate"
                            className="text-sm font-medium"
                          >
                            Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="scheduleDate"
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => {
                              setScheduleDate(e.target.value);
                              handleFieldChange("schedule");
                            }}
                            onBlur={() => handleBlur("schedule")}
                            min={new Date().toISOString().split("T")[0]}
                            className={cn(
                              "h-11",
                              touched.schedule &&
                                errors.schedule &&
                                !scheduleDate
                                ? "border-red-500"
                                : "",
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="scheduleTime"
                            className="text-sm font-medium"
                          >
                            Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="scheduleTime"
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => {
                              setScheduleTime(e.target.value);
                              handleFieldChange("schedule");
                            }}
                            onBlur={() => handleBlur("schedule")}
                            className={cn(
                              "h-11",
                              touched.schedule &&
                                errors.schedule &&
                                !scheduleTime
                                ? "border-red-500"
                                : "",
                            )}
                          />
                        </div>
                      </div>
                      <FieldError
                        message={touched.schedule ? errors.schedule : undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 bg-gray-50 border-t">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-3 sm:order-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Form
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-3 bg-gradient-to-r from-dashboard-600 to-dashboard-700 hover:from-dashboard-700 hover:to-dashboard-800 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : scheduleNotification ? (
                  <Clock className="h-4 w-4 mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {scheduleNotification ? "Schedule Notification" : "Send Now"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Show a helpful message if no courses but no error either (edge case) */}
        {!loadError && courseOptions.length === 0 && !isLoading && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Courses Assigned
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You don&apos;t have any courses assigned to you yet. Please
                contact your administrator to get assigned to courses before you
                can send notifications.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={fetchInstructorCourses}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Link href="/dashboard/teacher/notifications">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Notifications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
