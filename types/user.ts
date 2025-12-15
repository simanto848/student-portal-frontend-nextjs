export type UserRole =
  | "student"
  | "teacher"
  | "staff"
  | "admin"
  | "super_admin"
  | "moderator"
  | "program_controller"
  | "admission"
  | "exam"
  | "finance"
  | "library"
  | "transport"
  | "hr"
  | "it"
  | "hostel"
  | "hostel_warden"
  | "hostel_supervisor"
  | "maintenance";

export const ADMIN_ROLES: UserRole[] = ["super_admin", "moderator", "admin"];

export const STAFF_ROLE_ROUTES: Record<string, string> = {
  program_controller: "/dashboard/staff/program-controller",
  admission: "/dashboard/staff/admission",
  exam: "/dashboard/staff/exam",
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
}

// Student-specific user interface
export interface StudentUser extends BaseUser {
  role: "student";
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
  role: "teacher";
  registrationNumber: string;
  departmentId: string;
  designation: string;
  isDepartmentHead: boolean;
  specialization?: string;
  joiningDate?: string;
  qualifications?: string[];
  publications?: number;
}

// Staff-specific user interface
export interface StaffUser extends BaseUser {
  role: Exclude<
    UserRole,
    "student" | "teacher" | "admin" | "super_admin" | "moderator"
  >;
  employeeId: string;
  departmentId?: string;
  designation?: string;
  joiningDate?: string;
}

// Admin-specific user interface
export interface AdminUser extends BaseUser {
  role: "admin" | "super_admin" | "moderator";
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
  user: User;
  accessToken: string;
  refreshToken: string;
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
  return user.role === "student";
};

export const isTeacherUser = (user: User): user is TeacherUser => {
  return user.role === "teacher";
};

export const isAdminUser = (user: User): user is AdminUser => {
  return ADMIN_ROLES.includes(user.role);
};

export const isStaffUser = (user: User): user is StaffUser => {
  return !["student", "teacher", "admin", "super_admin", "moderator"].includes(
    user.role,
  );
};

// Helper to get normalized role for navigation
export const getNormalizedRole = (role: UserRole): string => {
  if (ADMIN_ROLES.includes(role)) return "admin";
  if (STAFF_ROLE_ROUTES[role]) return role;
  return role;
};

// Helper to get dashboard path for a role
export const getDashboardPath = (role: UserRole): string => {
  if (ADMIN_ROLES.includes(role)) return "/dashboard/admin";
  if (STAFF_ROLE_ROUTES[role]) return STAFF_ROLE_ROUTES[role];
  return `/dashboard/${role}`;
};
