import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Settings,
  FileText,
  GraduationCap,
  Building2,
  Library,
  ClipboardList,
  MessageSquare,
  CheckSquare,
  Bell,
  Activity,
  Database,
  Flag,
  FileWarning,
  Eye,
  AlertTriangle,
  CheckCircle,
  Globe,
  Server,
  FileCheck,
  Megaphone,
  Shield,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { User, UserRole, isTeacherUser } from "@/types/user";

export interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  children?: NavChildItem[];
  roles?: UserRole[];
  condition?: (user: User) => boolean;
  badge?: number;
  group?: string;
}

export interface NavChildItem {
  href: string;
  label: string;
  roles?: UserRole[];
  condition?: (user: User) => boolean;
}

// ===================== Super Admin Navigation (System Level) =====================
export const superAdminNavigation: NavItem[] = [
  // Overview
  {
    href: "/dashboard/super-admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    href: "/dashboard/super-admin/alerts",
    label: "Alerts",
    icon: Bell,
    badge: 5,
    group: "Overview",
  },
  // User Management
  {
    href: "/dashboard/super-admin/users/admins",
    label: "Admins",
    icon: Shield,
    group: "User Management",
  },
  {
    href: "/dashboard/super-admin/users/faculty",
    label: "Teachers",
    icon: GraduationCap,
    group: "User Management",
  },
  {
    href: "/dashboard/super-admin/users/students",
    label: "Students",
    icon: Users,
    group: "User Management",
  },
  {
    href: "/dashboard/super-admin/users/staff",
    label: "Staff",
    icon: Users,
    group: "User Management",
  },
  // System
  {
    href: "/dashboard/super-admin/health",
    label: "System Health",
    icon: Server,
    group: "System",
  },
  {
    href: "/dashboard/super-admin/database",
    label: "Database",
    icon: Database,
    group: "System",
  },
  {
    href: "/dashboard/super-admin/logs",
    label: "Logs",
    icon: Activity,
    group: "System",
  },
  // Monitoring
  {
    href: "/dashboard/super-admin/api",
    label: "API",
    icon: Globe,
    group: "Monitoring",
  },
  {
    href: "/dashboard/super-admin/monitoring",
    label: "Monitoring",
    icon: Activity,
    group: "Monitoring",
  },
  // Reports
  {
    href: "/dashboard/super-admin/reports",
    label: "Reports",
    icon: FileText,
    group: "Reports",
  },
];

// ===================== Admin Navigation (Institution Level) =====================
export const adminNavigation: NavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Academic Management",
    icon: GraduationCap,
    children: [
      { href: "/dashboard/admin/academic/faculty", label: "Faculty" },
      { href: "/dashboard/admin/academic/department", label: "Department" },
      { href: "/dashboard/admin/academic/program", label: "Program" },
      { href: "/dashboard/admin/academic/session", label: "Session" },
      { href: "/dashboard/admin/academic/course", label: "Course" },
      { href: "/dashboard/admin/academic/batch", label: "Batch" },
      { href: "/dashboard/admin/academic/session-course", label: "Session Course" },
      { href: "/dashboard/admin/academic/classroom", label: "Classroom" },
      { href: "/dashboard/admin/academic/schedule", label: "Schedule" },
      { href: "/dashboard/admin/academic/syllabus", label: "Syllabus" },
      { href: "/dashboard/admin/academic/exam-committee", label: "Exam Committee" },
      { href: "/dashboard/admin/academic/prerequisite", label: "Prerequisite" },
    ],
  },
  {
    label: "Enrollment Management",
    icon: ClipboardList,
    children: [
      { href: "/dashboard/admin/enrollment/enrollments", label: "Enrollments" },
      { href: "/dashboard/admin/enrollment/instructors", label: "Instructors" }
    ],
  },
  {
    label: "User Management",
    icon: Users,
    children: [
      { href: "/dashboard/admin/users/staff", label: "Staff" },
      { href: "/dashboard/admin/users/faculty", label: "Faculty" },
      { href: "/dashboard/admin/users/students", label: "Students" },
    ],
  },
  {
    href: "/dashboard/admin/reports",
    label: "Reports",
    icon: FileText,
  }
];

// ===================== Moderator Navigation (Support/Content) =====================
export const moderatorNavigation: NavItem[] = [
  {
    href: "/dashboard/moderator",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/moderator/reported",
    label: "Reported Content",
    icon: Flag,
    badge: 15,
  },
  {
    href: "/dashboard/moderator/users",
    label: "User Reports",
    icon: Users,
    badge: 7,
  },
  {
    href: "/dashboard/moderator/queue",
    label: "Content Queue",
    icon: FileWarning,
  },
  {
    href: "/dashboard/moderator/support",
    label: "Support Tickets",
    icon: MessageSquare,
    badge: 4,
  },
  // User Management
  {
    label: "User Management",
    icon: Users,
    children: [
      { href: "/dashboard/moderator/users/staff", label: "Staff" },
      { href: "/dashboard/moderator/users/faculty", label: "Faculty" },
      { href: "/dashboard/moderator/users/students", label: "Students" },
    ],
  },
  // Tools Section
  {
    href: "/dashboard/moderator/activity",
    label: "Activity Monitor",
    icon: Eye,
  },
  {
    href: "/dashboard/moderator/warnings",
    label: "Warnings Issued",
    icon: AlertTriangle,
  },
  {
    href: "/dashboard/moderator/resolved",
    label: "Resolved Cases",
    icon: CheckCircle,
  },
  {
    href: "/dashboard/moderator/settings",
    label: "Settings",
    icon: Settings,
  },
];

// ===================== Teacher Navigation =====================
export const teacherNavigation: NavItem[] = [
  {
    href: "/dashboard/teacher",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/teacher/courses",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/dashboard/teacher/classroom",
    label: "Classroom",
    icon: Building2,
  },
  {
    href: "/dashboard/teacher/attendance",
    label: "Attendance",
    icon: CheckSquare,
  },
  {
    href: "/dashboard/teacher/grading",
    label: "Grading",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/teacher/communication",
    label: "Communication",
    icon: MessageSquare,
  },
  {
    href: "/dashboard/teacher/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/dashboard/teacher/notifications/create-department-notification",
    label: "Create Broadcast",
    icon: Megaphone,
    condition: (user) => (isTeacherUser(user) && user.isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD,
  },
  {
    href: "/dashboard/teacher/schedule",
    label: "Schedule",
    icon: Calendar,
  },
  {
    href: "/dashboard/teacher/library",
    label: "Library",
    icon: BookOpen,
  },
  {
    href: "/dashboard/teacher/exam-committee",
    label: "Exam Committee",
    icon: Users,
    condition: (user) => (isTeacherUser(user) && user.isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD,
  },
  {
    href: "/dashboard/teacher/faculties",
    label: "Manage Faculty",
    icon: GraduationCap,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    condition: (user) => (isTeacherUser(user) && user.isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD || user.role === UserRole.DEAN || (user as any).isDean,
  },
  {
    href: "/dashboard/teacher/department",
    label: "Department",
    icon: Building2,
    condition: (user) => (isTeacherUser(user) && user.isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD,
  }
];

// ===================== Student Navigation =====================
export const studentNavigation: NavItem[] = [
  {
    href: "/dashboard/student",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/student/classes",
    label: "My Classes",
    icon: BookOpen,
  },
  {
    href: "/dashboard/student/attendances",
    label: "Attendances",
    icon: CheckSquare,
  },
  {
    href: "/dashboard/student/grades",
    label: "Grades",
    icon: FileText,
  },
  {
    href: "/dashboard/student/classroom",
    label: "Classroom",
    icon: Building2,
  },
  {
    href: "/dashboard/student/communication",
    label: "Communication",
    icon: MessageSquare,
  },
  {
    href: "/dashboard/student/library",
    label: "Library",
    icon: Library,
  },
  {
    href: "/dashboard/student/payments",
    label: "Payments",
    icon: Building2,
  },
];

// ===================== Other Staff Navigation =====================
export const programControllerNavigation: NavItem[] = [
  {
    href: "/dashboard/staff/program-controller",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Academic Management",
    icon: GraduationCap,
    children: [
      { href: "/dashboard/staff/program-controller/courses", label: "Courses" },
      { href: "/dashboard/staff/program-controller/classrooms", label: "Classrooms" },
      { href: "/dashboard/staff/program-controller/schedules", label: "Schedules" },
      { href: "/dashboard/staff/program-controller/syllabus", label: "Syllabus" },
      { href: "/dashboard/staff/program-controller/prerequisites", label: "Prerequisites" },
    ],
  },
];

export const librarianNavigation: NavItem[] = [
  {
    href: "/dashboard/staff/library",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Library Catalog",
    icon: BookOpen,
    children: [
      { href: "/dashboard/staff/library/libraries", label: "Libraries" },
      { href: "/dashboard/staff/library/books", label: "Books" },
    ],
  },
  {
    label: "Transactions",
    icon: Users,
    children: [
      { href: "/dashboard/staff/library/borrowings", label: "Borrowings" },
      { href: "/dashboard/staff/library/reservations", label: "Reservations" },
    ],
  },
];

export const examControllerNavigation: NavItem[] = [
  {
    href: "/dashboard/staff/exam-controller",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/staff/exam-controller/exam-schedules",
    label: "Exam Schedules",
    icon: Calendar,
  },
  {
    href: "/dashboard/staff/exam-controller/results",
    label: "Results",
    icon: FileText,
  },
  {
    href: "/dashboard/staff/exam-controller/settings",
    label: "Settings",
    icon: Settings,
  },
];

export const defaultStaffNavigation: NavItem[] = [
  {
    href: "/dashboard/staff",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
];

// ===================== Common Navigation Items =====================
export const commonNavigation: NavItem[] = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

// ===================== Navigation Configuration Map =====================
export const navigationConfig: Record<string, NavItem[]> = {
  [UserRole.ADMIN]: adminNavigation,
  [UserRole.SUPER_ADMIN]: superAdminNavigation,
  [UserRole.MODERATOR]: moderatorNavigation,
  [UserRole.TEACHER]: teacherNavigation,
  [UserRole.STUDENT]: studentNavigation,
  [UserRole.PROGRAM_CONTROLLER]: programControllerNavigation,
  [UserRole.LIBRARY]: librarianNavigation,
  [UserRole.STAFF]: defaultStaffNavigation,
  [UserRole.DEPARTMENT_HEAD]: teacherNavigation,
  [UserRole.EXAM_CONTROLLER]: examControllerNavigation,
};

// ===================== Helper Functions =====================
export function getNavigationForUser(user: User | null): NavItem[] {
  if (!user) return [];
  // ...
  if (!user) return [];
  const normalizedRole = user.role.toLowerCase() as UserRole;
  const baseNavigation = navigationConfig[normalizedRole] || [];
  return filterNavItems(baseNavigation, user);
}

function filterNavItems(items: NavItem[], user: User): NavItem[] {
  return items
    .filter((item) => {
      if (item.roles && !item.roles.includes(user.role)) {
        return false;
      }
      if (item.condition && !item.condition(user)) {
        return false;
      }
      return true;
    })
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) => {
          if (child.roles && !child.roles.includes(user.role)) {
            return false;
          }
          if (child.condition && !child.condition(user)) {
            return false;
          }
          return true;
        });

        if (filteredChildren.length === 0 && !item.href) {
          return null;
        }

        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter((item): item is NavItem => item !== null);
}

export function isPathActive(currentPath: string, itemPath: string): boolean {
  return currentPath === itemPath;
}

export function isChildActive(
  currentPath: string,
  children?: NavChildItem[],
): boolean {
  if (!children) return false;
  return children.some((child) => currentPath === child.href);
}

export function getDashboardTitle(role: UserRole): string {
  const titles: Record<string, string> = {
    [UserRole.ADMIN]: "Institution Admin",
    [UserRole.SUPER_ADMIN]: "Super Admin System",
    [UserRole.MODERATOR]: "Moderator Panel",
    [UserRole.TEACHER]: "Teacher Panel",
    [UserRole.STUDENT]: "Student Dashboard",
    [UserRole.PROGRAM_CONTROLLER]: "Program Controller",
    [UserRole.LIBRARY]: "Library Panel",
    [UserRole.STAFF]: "Staff Panel",
    [UserRole.EXAM_CONTROLLER]: "Exam Controller",
  };

  return titles[role] || "Dashboard";
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<string, string> = {
    [UserRole.ADMIN]: "Administrator",
    [UserRole.SUPER_ADMIN]: "Super Administrator",
    [UserRole.MODERATOR]: "Moderator",
    [UserRole.TEACHER]: "Teacher",
    [UserRole.STUDENT]: "Student",
    [UserRole.PROGRAM_CONTROLLER]: "Program Controller",
    [UserRole.LIBRARY]: "Librarian",
    [UserRole.STAFF]: "Staff",
    [UserRole.EXAM_CONTROLLER]: "Exam Controller",
  };

  return (
    names[role] ||
    role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")
  );
}
