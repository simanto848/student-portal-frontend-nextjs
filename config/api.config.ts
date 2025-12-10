/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  CLASSROOM_URL: process.env.NEXT_PUBLIC_CLASSROOM_API_URL || 'http://localhost:8000/api/classroom',
  TIMEOUT: 30000,
  WITH_CREDENTIALS: true,
} as const;

/**
 * API Endpoints
 * Centralized endpoint definitions following RESTful conventions
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: (role: string) => `/user/auth/${role}s/login`,
    LOGOUT: '/user/auth/logout',
    REFRESH: '/user/auth/refresh-token',
    ME: '/user/auth/me',
    FORGOT_PASSWORD: '/user/auth/forgot-password',
    VERIFY_OTP: '/user/auth/verify-reset-otp',
    RESET_PASSWORD: '/user/auth/reset-password',
  },

  // User endpoints
  USERS: {
    STUDENTS: '/user/students',
    TEACHERS: '/user/teachers',
    STAFF: '/user/staffs',
    ADMINS: '/user/admins',
  },

  // Academic endpoints
  ACADEMIC: {
    COURSES: '/academic/courses',
    DEPARTMENTS: '/academic/departments',
    FACULTIES: '/academic/faculties',
    PROGRAMS: '/academic/programs',
    SESSIONS: '/academic/sessions',
    SESSION_COURSES: '/academic/session-courses',
    BATCHES: '/academic/batches',
    CLASSROOMS: '/academic/classrooms',
    SCHEDULES: '/academic/schedules',
    PREREQUISITES: '/academic/prerequisites',
    SYLLABI: '/academic/syllabi',
    EXAM_COMMITTEES: '/academic/exam-committees',
  },

  // Enrollment endpoints
  ENROLLMENT: {
    ENROLLMENTS: '/enrollment/enrollments',
    ASSESSMENTS: '/enrollment/assessments',
    ATTENDANCE: '/enrollment/attendance',
    GRADES: '/enrollment/course-grades',
    INSTRUCTORS: '/enrollment/batch-course-instructors',
  },

  // Classroom endpoints
  CLASSROOM: {
    WORKSPACES: '/workspace',
    TOPICS: '/topics',
    MATERIALS: '/materials',
    ASSIGNMENTS: '/assignments',
    SUBMISSIONS: '/submissions',
    RUBRICS: '/rubrics',
    STREAM: '/stream',
  },

  // Library endpoints
  LIBRARY: {
    BOOKS: '/library/books',
    BOOK_COPIES: '/library/book-copies',
    BORROWINGS: '/library/borrowings',
    RESERVATIONS: '/library/reservations',
    LIBRARIES: '/library/libraries',
  },

  // Notification endpoints
  NOTIFICATION: {
    NOTIFICATIONS: '/notification/notifications',
  },

  // Communication endpoints
  COMMUNICATION: {
    CHAT: '/communication/chat',
  },
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator',
} as const;

/**
 * Staff Roles
 */
export const STAFF_ROLES = {
  PROGRAM_CONTROLLER: 'program_controller',
  ADMISSION: 'admission',
  EXAM: 'exam',
  FINANCE: 'finance',
  LIBRARY: 'library',
  TRANSPORT: 'transport',
  HR: 'hr',
  IT: 'it',
  HOSTEL: 'hostel',
  HOSTEL_WARDEN: 'hostel_warden',
  HOSTEL_SUPERVISOR: 'hostel_supervisor',
  MAINTENANCE: 'maintenance',
} as const;

/**
 * App Routes
 */
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  OTP_VERIFICATION: '/otp-verification',
  PASSWORD_CHANGE: '/password-change',
  DASHBOARD: {
    STUDENT: '/dashboard/student',
    TEACHER: '/dashboard/teacher',
    STAFF: '/dashboard/staff',
    ADMIN: '/dashboard/admin',
  },
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

/**
 * JWT Configuration
 */
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'mysupersecrectkey',
} as const;
