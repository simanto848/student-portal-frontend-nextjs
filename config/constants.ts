export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000,
  RETRY_MAX_DELAY: 30000,
} as const;

export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: "accessToken",
  REFRESH_TOKEN_KEY: "refreshToken",
  USER_STORAGE_KEY: "user",
  TOKEN_COOKIE_NAME: "accessToken",
  TOKEN_EXPIRY_DAYS: 7,
  SESSION_WARNING_MINUTES: 5,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

export const DATA_TABLE = {
  ITEMS_PER_PAGE: 10,
  SEARCH_DEBOUNCE: 300,
  MAX_VISIBLE_PAGES: 5,
} as const;

// =====================
// Form Configuration
// =====================

export const FORM_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  OTP_LENGTH: 6,
  DEBOUNCE_DELAY: 300,
  AUTO_SAVE_DELAY: 2000,
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_DATETIME: "MMM dd, yyyy hh:mm a",
  INPUT: "yyyy-MM-dd",
  TIME: "HH:mm",
  FULL: "EEEE, MMMM dd, yyyy",
  RELATIVE_TIME_THRESHOLD: 24,
} as const;

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const,
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ] as const,
  MAX_IMAGE_DIMENSION: 4096,
  PROFILE_IMAGE_SIZE: 256,
} as const;

export const TOAST_CONFIG = {
  DURATION: 5000,
  ERROR_DURATION: 7000,
  SUCCESS_DURATION: 3000,
  MAX_VISIBLE: 3,
  POSITION: "top-right" as const,
} as const;

export const CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,
  GC_TIME: 30 * 60 * 1000,
  REFETCH_INTERVAL: 30 * 1000,
} as const;

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  ANIMATION_DURATION: 300,
} as const;

export const THEME_COLORS = {
  primary: {
    DEFAULT: "#588157",
    dark: "#3a5a40",
    light: "#a3b18a",
  },
  secondary: {
    DEFAULT: "#344e41",
    light: "#dad7cd",
  },
  surface: {
    DEFAULT: "#dad7cd",
    muted: "#a3b18a",
  },
  status: {
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
} as const;

export const ACADEMIC = {
  MAX_SEMESTERS: 12,
  MIN_CREDITS: 1,
  MAX_COURSE_CREDITS: 12,
  MAX_PROGRAM_CREDITS: 300,
  MIN_GPA: 0.0,
  MAX_GPA: 4.0,
  GRADE_POINTS: {
    "A+": 4.0,
    A: 3.75,
    "A-": 3.5,
    "B+": 3.25,
    B: 3.0,
    "B-": 2.75,
    "C+": 2.5,
    C: 2.25,
    D: 2.0,
    F: 0.0,
  } as const,
  DAYS_OF_WEEK: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const,
  CLASS_TYPES: [
    "Lecture",
    "Tutorial",
    "Lab",
    "Seminar",
    "Workshop",
    "Other",
  ] as const,
  COURSE_TYPES: ["theory", "lab", "project"] as const,
  ROOM_TYPES: [
    "Lecture Hall",
    "Laboratory",
    "Seminar Room",
    "Computer Lab",
    "Conference Room",
    "Virtual",
    "Other",
  ] as const,
  SHIFTS: ["day", "evening"] as const,
} as const;

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
] as const;

export const BOOLEAN_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
] as const;

export const SYLLABUS_STATUS = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Published",
  "Archived",
] as const;

export const STORAGE_KEYS = {
  THEME: "theme",
  SIDEBAR_COLLAPSED: "sidebarCollapsed",
  LANGUAGE: "language",
  LAST_VISITED: "lastVisited",
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your internet connection.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred.",
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  SAVED: "Changes saved successfully",
  SUBMITTED: "Submitted successfully",
  LOGIN: "Logged in successfully",
  LOGOUT: "Logged out successfully",
  PASSWORD_RESET: "Password reset successfully",
  PASSWORD_CHANGED: "Password changed successfully",
} as const;
