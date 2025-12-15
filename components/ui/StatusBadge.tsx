import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Status type definitions
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type WorkflowStatus = "approved" | "submitted" | "returned" | "draft" | "pending";
export type NotificationStatus = "sent" | "read" | "scheduled" | "draft";
export type EnrollmentStatus = "active" | "enrolled" | "completed" | "dropped" | "failed";
export type GradeStatus = "pending" | "calculated" | "finalized" | "published";
export type BorrowingStatus = "borrowed" | "returned" | "overdue" | "lost";
export type GeneralStatus = "success" | "warning" | "error" | "info" | "neutral";

export type StatusType =
  | AttendanceStatus
  | WorkflowStatus
  | NotificationStatus
  | EnrollmentStatus
  | GradeStatus
  | BorrowingStatus
  | GeneralStatus;

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
}

// Comprehensive status configuration
const statusConfig: Record<string, StatusConfig> = {
  // Attendance statuses
  present: { bg: "bg-green-100", text: "text-green-700", label: "Present" },
  absent: { bg: "bg-red-100", text: "text-red-700", label: "Absent" },
  late: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Late" },
  excused: { bg: "bg-blue-100", text: "text-blue-700", label: "Excused" },

  // Workflow statuses
  approved: { bg: "bg-green-500", text: "text-white", label: "Approved" },
  submitted: { bg: "bg-blue-500", text: "text-white", label: "Submitted" },
  returned: { bg: "bg-red-500", text: "text-white", label: "Returned" },
  draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
  return_requested: { bg: "bg-orange-100", text: "text-orange-700", label: "Return Requested" },
  return_approved: { bg: "bg-purple-100", text: "text-purple-700", label: "Return Approved" },

  // Notification statuses
  sent: { bg: "bg-blue-500", text: "text-white", label: "Sent" },
  read: { bg: "bg-green-500", text: "text-white", label: "Read" },
  scheduled: { bg: "bg-amber-500", text: "text-white", label: "Scheduled" },

  // Enrollment statuses
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  enrolled: { bg: "bg-blue-100", text: "text-blue-700", label: "Enrolled" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
  dropped: { bg: "bg-red-100", text: "text-red-700", label: "Dropped" },
  failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },

  // Grade statuses
  calculated: { bg: "bg-blue-100", text: "text-blue-700", label: "Calculated" },
  finalized: { bg: "bg-purple-100", text: "text-purple-700", label: "Finalized" },
  published: { bg: "bg-green-100", text: "text-green-700", label: "Published" },

  // Borrowing statuses
  borrowed: { bg: "bg-blue-100", text: "text-blue-700", label: "Borrowed" },
  overdue: { bg: "bg-red-100", text: "text-red-700", label: "Overdue" },
  lost: { bg: "bg-red-500", text: "text-white", label: "Lost" },

  // General statuses
  success: { bg: "bg-green-100", text: "text-green-700", label: "Success" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Warning" },
  error: { bg: "bg-red-100", text: "text-red-700", label: "Error" },
  info: { bg: "bg-blue-100", text: "text-blue-700", label: "Info" },
  neutral: { bg: "bg-gray-100", text: "text-gray-600", label: "Neutral" },
};

// Default configuration for unknown statuses
const defaultConfig: StatusConfig = {
  bg: "bg-gray-100",
  text: "text-gray-600",
  label: "Unknown",
};

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  /** The status value to display */
  status: string;
  /** Optional custom label to override the default */
  label?: string;
  /** Optional size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show as pill (more rounded) */
  pill?: boolean;
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export function StatusBadge({
  status,
  label,
  size = "md",
  pill = true,
  className,
  ...props
}: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "_");
  const config = statusConfig[normalizedStatus] || defaultConfig;
  const displayLabel = label || config.label || status;

  return (
    <Badge
      className={cn(
        config.bg,
        config.text,
        sizeClasses[size],
        pill ? "rounded-full" : "rounded-md",
        "font-semibold border-none hover:opacity-90",
        className
      )}
      {...props}
    >
      {displayLabel}
    </Badge>
  );
}

// Utility function to get status config (useful for custom implementations)
export function getStatusConfig(status: string): StatusConfig {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "_");
  return statusConfig[normalizedStatus] || defaultConfig;
}

// Utility function to get status color classes
export function getStatusClasses(status: string): string {
  const config = getStatusConfig(status);
  return `${config.bg} ${config.text}`;
}

export default StatusBadge;
