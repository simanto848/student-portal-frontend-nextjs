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
  HeadphonesIcon,
  Shield,
  UserCog,
  Database
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
}

export interface NavChildItem {
  href: string;
  label: string;
  roles?: UserRole[];
  condition?: (user: User) => boolean;
}

// ===================== Admin Navigation =====================
export const adminNavigation: NavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Academic Management",
    icon: GraduationCap,
    roles: ["admin", "super_admin"], // Not available for moderator
    children: [
      { href: "/dashboard/admin/academic/faculty", label: "Faculty" },
      { href: "/dashboard/admin/academic/department", label: "Department" },
      { href: "/dashboard/admin/academic/program", label: "Program" },
      { href: "/dashboard/admin/academic/session", label: "Session" },
      { href: "/dashboard/admin/academic/course", label: "Course" },
      { href: "/dashboard/admin/academic/batch", label: "Batch" },
      {
        href: "/dashboard/admin/academic/session-course",
        label: "Session Course",
      },
      { href: "/dashboard/admin/academic/classroom", label: "Classroom" },
      { href: "/dashboard/admin/academic/schedule", label: "Schedule" },
      { href: "/dashboard/admin/academic/syllabus", label: "Syllabus" },
      {
        href: "/dashboard/admin/academic/exam-committee",
        label: "Exam Committee",
      },
      { href: "/dashboard/admin/academic/prerequisite", label: "Prerequisite" },
    ],
  },
  {
    label: "Enrollment Management",
    icon: ClipboardList,
    roles: ["admin", "super_admin"], // Not available for moderator
    children: [
      { href: "/dashboard/admin/enrollment", label: "Overview" },
      { href: "/dashboard/admin/enrollment/enrollments", label: "Enrollments" },
      { href: "/dashboard/admin/enrollment/instructors", label: "Instructors" },
      { href: "/dashboard/admin/enrollment/assessments", label: "Assessments" },
      {
        href: "/dashboard/admin/enrollment/grades/workflow",
        label: "Grade Workflow",
      },
      { href: "/dashboard/admin/enrollment/attendance", label: "Attendance" },
    ],
  },
  {
    label: "Workspaces Management",
    icon: Building2,
    roles: ["admin", "super_admin"], // Not available for moderator
    children: [
      { href: "/dashboard/admin/classroom", label: "Classrooms" },
      { href: "/dashboard/admin/classroom/assignments", label: "Assignments" },
      { href: "/dashboard/admin/classroom/materials", label: "Materials" },
      { href: "/dashboard/admin/classroom/submissions", label: "Submissions" },
      { href: "/dashboard/admin/classroom/rubrics", label: "Rubrics" },
    ],
  },
  {
    label: "User Management",
    icon: Users,
    children: [
      { href: "/dashboard/admin/users/admins", label: "Admins", roles: ["admin", "super_admin"] },
      { href: "/dashboard/admin/users/staff", label: "Staff", roles: ["admin", "super_admin", "moderator"] },
      { href: "/dashboard/admin/users/faculty", label: "Faculty", roles: ["admin", "super_admin", "moderator"] },
      { href: "/dashboard/admin/users/students", label: "Students" },
      { href: "/dashboard/admin/users/all", label: "All Users", roles: ["super_admin"] },
      { href: "/dashboard/admin/users/blocked", label: "Blocked Users", roles: ["super_admin"] },
    ],
  },
  {
    label: "Library Management",
    icon: BookOpen,
    roles: ["admin", "super_admin"], // Not available for moderator
    children: [
      { href: "/dashboard/admin/library", label: "Overview" },
      { href: "/dashboard/admin/library/libraries", label: "Libraries" },
      { href: "/dashboard/admin/library/books", label: "Books" },
      { href: "/dashboard/admin/library/copies", label: "Book Copies" },
      { href: "/dashboard/admin/library/borrowings", label: "Borrowings" },
      { href: "/dashboard/admin/library/reservations", label: "Reservations" },
    ],
  },
  {
    href: "/dashboard/admin/support",
    label: "Support Tickets",
    icon: HeadphonesIcon,
  },
  {
    href: "/dashboard/admin/reports",
    label: "System Reports",
    icon: FileText,
    roles: ["admin", "super_admin"], // Not available for moderator
  },
  {
    href: "/dashboard/admin/monitoring",
    label: "System Monitoring",
    icon: Activity,
    roles: ["admin", "super_admin"], // Not available for moderator
  },
  {
    href: "/dashboard/admin/settings",
    label: "System Settings",
    icon: Shield,
    roles: ["super_admin"], // Super admin only
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
    href: "/dashboard/teacher/schedule",
    label: "Schedule",
    icon: Calendar,
  },
  {
    href: "/dashboard/teacher/exam-committee",
    label: "Exam Committee",
    icon: Users,
    condition: (user) => isTeacherUser(user) && user.isDepartmentHead,
  },
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

// ===================== Teacher Navigation Configurations =====================

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
      {
        href: "/dashboard/staff/program-controller/classrooms",
        label: "Classrooms",
      },
      {
        href: "/dashboard/staff/program-controller/schedules",
        label: "Schedules",
      },
      {
        href: "/dashboard/staff/program-controller/syllabus",
        label: "Syllabus",
      },
      {
        href: "/dashboard/staff/program-controller/prerequisites",
        label: "Prerequisites",
      },
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
      { href: "/dashboard/staff/library/copies", label: "Book Copies" },
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

// Common staff navigation (fallback for staff without specific navigation)
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
  admin: adminNavigation,
  super_admin: adminNavigation,
  moderator: adminNavigation,
  teacher: teacherNavigation,
  student: studentNavigation,
  program_controller: programControllerNavigation,
  library: librarianNavigation,
  staff: defaultStaffNavigation,
};

// ===================== Helper Functions =====================

export function getNavigationForUser(user: User | null): NavItem[] {
  if (!user) return [];

  // Normalize admin roles
  let role = user.role;
  if (["super_admin", "moderator"].includes(role)) {
    role = "admin" as UserRole;
  }

  const baseNavigation =
    navigationConfig[user.role] || navigationConfig[role] || [];

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
    admin: "Admin Portal",
    super_admin: "Admin Portal",
    moderator: "Moderator Panel",
    teacher: "Teacher Panel",
    student: "Student Dashboard",
    program_controller: "Program Controller",
    library: "Library Panel",
    staff: "Staff Panel",
  };

  return titles[role] || "Dashboard";
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<string, string> = {
    admin: "Administrator",
    super_admin: "Super Administrator",
    moderator: "Moderator",
    teacher: "Teacher",
    student: "Student",
    program_controller: "Program Controller",
    library: "Librarian",
    staff: "Staff",
    admission: "Admission Officer",
    exam: "Exam Controller",
    finance: "Finance Officer",
    hr: "HR Manager",
    it: "IT Administrator",
  };

  return (
    names[role] ||
    role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")
  );
}
