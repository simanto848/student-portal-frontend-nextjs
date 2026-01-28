export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  STAFF = "staff",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  MODERATOR = "moderator",
  PROGRAM_CONTROLLER = "program_controller",
  ADMISSION = "admission",
  EXAM = "exam",
  FINANCE = "finance",
  LIBRARY = "library",
  TRANSPORT = "transport",
  HR = "hr",
  IT = "it",
  HOSTEL = "hostel",
  HOSTEL_WARDEN = "hostel_warden",
  HOSTEL_SUPERVISOR = "hostel_supervisor",
  MAINTENANCE = "maintenance",
  DEPARTMENT_HEAD = "department_head",
  DEAN = "dean",
  EXAM_CONTROLLER = "exam_controller",
}

export const ADMIN_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.MODERATOR,
  UserRole.ADMIN,
];

export const STAFF_ROLE_ROUTES: Record<string, string> = {
  program_controller: "/dashboard/staff/program-controller",
  admission: "/dashboard/staff/admission",
  exam: "/dashboard/staff/exam",
  exam_controller: "/dashboard/staff/exam-controller",
  finance: "/dashboard/staff/finance",
  library: "/dashboard/staff/library",
  transport: "/dashboard/staff/transport",
  hr: "/dashboard/staff/hr",
  it: "/dashboard/staff/it",
  hostel: "/dashboard/staff/hostel",
  hostel_warden: "/dashboard/staff/hostel-warden",
  hostel_supervisor: "/dashboard/staff/hostel-supervisor",
  maintenance: "/dashboard/staff/maintenance",
};

// Base user interface with common fields
export interface BaseUser {
  id: string;
  _id?: string;
  email: string;
  role: UserRole;
  fullName: string;
  profileImage?: string;
  phone?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  emailUpdatesEnabled?: boolean;
  notificationPreferences?: {
    email?: {
      gradeUpdates?: boolean;
      newAssignments?: boolean;
      deadlineReminders?: boolean;
      announcements?: boolean;
      directMessages?: boolean;
    };
    push?: {
      messages?: boolean;
      classReminders?: boolean;
      libraryAlerts?: boolean;
    };
  };
}

// Student-specific user interface
export interface StudentUser extends BaseUser {
  role: UserRole.STUDENT;
  registrationNumber: string;
  batchId: string;
  programId: string;
  departmentId: string;
  currentSemester: number;
  admissionDate?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  address?: {
    present?: string;
    permanent?: string;
  };
}

// Teacher-specific user interface
export interface TeacherUser extends BaseUser {
  role: UserRole.TEACHER;
  registrationNumber: string;
  departmentId: string;
  designation: string;
  isDepartmentHead: boolean;
  isDean?: boolean;
  facultyId?: string;
  specialization?: string;
  joiningDate?: string;
  qualifications?: string[];
  publications?: number;
  isExamCommitteeMember?: boolean;
}

// Staff-specific user interface
export interface StaffUser extends BaseUser {
  role: Exclude<
    UserRole,
    | UserRole.STUDENT
    | UserRole.TEACHER
    | UserRole.ADMIN
    | UserRole.SUPER_ADMIN
    | UserRole.MODERATOR
  >;
  employeeId: string;
  departmentId?: string;
  designation?: string;
  joiningDate?: string;
}

// Admin-specific user interface
export interface AdminUser extends BaseUser {
  role: UserRole.ADMIN | UserRole.SUPER_ADMIN | UserRole.MODERATOR;
  permissions?: string[];
  adminLevel?: number;
}

// Union type for all user types
export type User = StudentUser | TeacherUser | StaffUser | AdminUser | BaseUser;

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Login response interface
export interface LoginResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  twoFactorRequired?: boolean;
  tempToken?: string;
  message?: string;
}

// Password reset interfaces
export interface ForgotPasswordRequest {
  email: string;
  role: UserRole;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  role: UserRole;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  role: UserRole;
}

// Type guards for user types
export const isStudentUser = (user: User): user is StudentUser => {
  return user.role === UserRole.STUDENT;
};

export const isTeacherUser = (user: User): user is TeacherUser => {
  return user.role === UserRole.TEACHER;
};

export const isAdminUser = (user: User): user is AdminUser => {
  return ADMIN_ROLES.includes(user.role);
};

export const isStaffUser = (user: User): user is StaffUser => {
  return ![
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.MODERATOR,
  ].includes(user.role);
};

// Helper to get normalized role for navigation
export const getNormalizedRole = (role: UserRole): string => {
  if (ADMIN_ROLES.includes(role)) return "admin";
  if (STAFF_ROLE_ROUTES[role]) return role;
  return role;
};

// Helper to get dashboard path for a role
export const getDashboardPath = (role: UserRole): string => {
  if (role === UserRole.ADMIN) return "/dashboard/admin";
  if (role === UserRole.SUPER_ADMIN) return "/dashboard/super-admin";
  if (role === UserRole.MODERATOR) return "/dashboard/moderator";
  if (STAFF_ROLE_ROUTES[role]) return STAFF_ROLE_ROUTES[role];
  return `/dashboard/${role}`;
};
