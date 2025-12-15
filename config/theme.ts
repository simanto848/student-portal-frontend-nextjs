export const dashboardColors = {
  primary: {
    950: "#0b3b2a", // Darkest - hero section start
    900: "#1a3d32", // Card titles, text emphasis
    800: "#2d5246", // Slightly lighter dark
    700: "#1f5a44", // Hero section middle
    600: "#3e6253", // Hero section end
    500: "#344e41", // Primary dark text
    400: "#3a5a40", // Accent color
    300: "#588157", // Primary green (success, buttons)
    200: "#7ca38b", // Lighter green
    100: "#a3b18a", // Secondary/olive
    50: "#dad7cd", // Lightest background
  },

  // Semantic colors
  success: "#588157",
  warning: "#FFC107",
  error: "#DC3545",
  info: "#3B82F6",

  // Background colors
  background: {
    light: "#dad7cd",
    dark: "#344e41",
    card: "#ffffff",
    cardDark: "#3a5a40",
    altLight: "#F8F7F5",
    altDark: "#1E2A20",
  },

  // Text colors
  text: {
    light: "#344e41",
    dark: "#dad7cd",
    muted: "#588157",
    mutedDark: "#a3b18a",
  },

  // Border colors
  border: {
    light: "#a3b18a",
    dark: "#588157",
  },
} as const;

// ==================================== Tailwind Class Utilities ========================================
export const dashboardStyles = {
  // Hero section gradient (the main dashboard hero)
  heroGradient: "bg-gradient-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253]",

  // Hero overlay pattern
  heroOverlay:
    "bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]",

  // Card styles
  card: {
    base: "border-none shadow-sm transition-all duration-300 hover:shadow-lg",
    elevated:
      "border-none shadow-md transition-all duration-300 hover:shadow-xl",
    interactive:
      "border-none shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer",
  },

  // Title text colors
  titleText: "text-[#1a3d32]",
  accentText: "text-[#3e6253]",
  mutedText: "text-muted-foreground",

  // Button variants
  button: {
    primary: "bg-[#588157] hover:bg-[#3a5a40] text-white shadow-sm",
    secondary: "bg-white text-[#1a3d32] hover:bg-white/90 shadow-md",
    outline: "border-white/40 text-white hover:bg-white/10",
    ghost: "text-[#3e6253] hover:bg-gray-100",
  },

  // Badge colors by status
  badge: {
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-yellow-100 text-yellow-800",
    excused: "bg-blue-100 text-blue-700",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  },

  // Stats card in hero
  statsCard:
    "rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[220px] shadow-lg",

  // Progress bar in hero
  progressHero: "bg-white/20",

  // Icon container
  iconContainer:
    "h-12 w-12 flex items-center justify-center rounded-lg bg-[#588157]/20",
  iconColor: "text-[#344e41]",
} as const;

// ===================================== Status Color Maps =======================================
export const statusColors = {
  // Attendance statuses
  attendance: {
    present: { bg: "bg-green-100", text: "text-green-700" },
    absent: { bg: "bg-red-100", text: "text-red-700" },
    late: { bg: "bg-yellow-100", text: "text-yellow-800" },
    excused: { bg: "bg-blue-100", text: "text-blue-700" },
  },

  // Workflow statuses
  workflow: {
    approved: { bg: "bg-green-500", text: "text-white" },
    submitted: { bg: "bg-blue-500", text: "text-white" },
    returned: { bg: "bg-red-500", text: "text-white" },
    draft: { bg: "bg-gray-100", text: "text-gray-600" },
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
  },

  // Notification statuses
  notification: {
    sent: { bg: "bg-blue-500", text: "text-white" },
    read: { bg: "bg-green-500", text: "text-white" },
    scheduled: { bg: "bg-amber-500", text: "text-white" },
    draft: { bg: "bg-gray-100", text: "text-gray-600" },
  },

  // Enrollment statuses
  enrollment: {
    active: { bg: "bg-green-100", text: "text-green-700" },
    enrolled: { bg: "bg-blue-100", text: "text-blue-700" },
    completed: { bg: "bg-emerald-100", text: "text-emerald-700" },
    dropped: { bg: "bg-red-100", text: "text-red-700" },
    failed: { bg: "bg-red-100", text: "text-red-700" },
  },

  // Grade statuses
  grade: {
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
    calculated: { bg: "bg-blue-100", text: "text-blue-700" },
    finalized: { bg: "bg-purple-100", text: "text-purple-700" },
    published: { bg: "bg-green-100", text: "text-green-700" },
  },

  // Borrowing statuses
  borrowing: {
    borrowed: { bg: "bg-blue-100", text: "text-blue-700" },
    returned: { bg: "bg-green-100", text: "text-green-700" },
    overdue: { bg: "bg-red-100", text: "text-red-700" },
    lost: { bg: "bg-red-500", text: "text-white" },
  },
} as const;

// ==================================== Spacing & Sizing ========================================

export const spacing = {
  /** Standard page padding */
  page: "p-6 md:p-8",

  /** Standard card padding */
  card: "p-4 md:p-6",

  /** Gap between sections */
  sectionGap: "space-y-6",

  /** Gap between cards in grid */
  cardGap: "gap-6",

  /** Standard border radius for cards */
  cardRadius: "rounded-xl",

  /** Hero section border radius */
  heroRadius: "rounded-3xl",
} as const;

// ===================================== Animation & Transition =======================================

export const transitions = {
  /** Standard hover transition */
  default: "transition-all duration-300",

  /** Fast transition for buttons */
  fast: "transition-all duration-150",

  /** Slow transition for page elements */
  slow: "transition-all duration-500",
} as const;

// ===================================== Helper Functions =======================================

export function getStatusColorClasses(
  type: keyof typeof statusColors,
  status: string,
): { bg: string; text: string } {
  const typeColors = statusColors[type];
  if (typeColors && status in typeColors) {
    return typeColors[status as keyof typeof typeColors];
  }
  return { bg: "bg-gray-100", text: "text-gray-600" };
}

export function getAttendancePercentageColor(percent: number): string {
  if (percent >= 85) return "bg-green-100 text-green-700";
  if (percent >= 75) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export function getGradeColor(gradePoint: number): string {
  if (gradePoint >= 3.5) return dashboardColors.success;
  if (gradePoint >= 2.5) return dashboardColors.warning;
  return dashboardColors.error;
}

const theme = {
  colors: dashboardColors,
  styles: dashboardStyles,
  statusColors,
  spacing,
  transitions,
  getStatusColorClasses,
  getAttendancePercentageColor,
  getGradeColor,
};

export default theme;
