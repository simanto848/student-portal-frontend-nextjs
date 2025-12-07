"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Settings,
  FileText,
  LogOut,
  GraduationCap,
  Building2,
  Library,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  ClipboardList,
  MessageSquare,
  CheckSquare,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string }[];
}

export function Sidebar({
  className,
  onClose,
  isCollapsed,
  toggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  let role = user?.role || "student";

  // Normalize admin roles
  if (["super_admin", "moderator"].includes(role)) {
    role = "admin";
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const adminLinks: NavItem[] = [
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
        {
          href: "/dashboard/admin/academic/prerequisite",
          label: "Prerequisite",
        },
        {
          href: "/dashboard/admin/academic/ip-management",
          label: "IP Management",
        },
      ],
    },
    {
      label: "Enrollment Management",
      icon: ClipboardList,
      children: [
        { href: "/dashboard/admin/enrollment", label: "Overview" },
        {
          href: "/dashboard/admin/enrollment/enrollments",
          label: "Enrollments",
        },
        {
          href: "/dashboard/admin/enrollment/instructors",
          label: "Instructors",
        },
        {
          href: "/dashboard/admin/enrollment/assessments",
          label: "Assessments",
        },
        {
          href: "/dashboard/admin/enrollment/grades/workflow",
          label: "Grade Workflow",
        },
        {
          href: "/dashboard/admin/enrollment/attendance",
          label: "Attendance",
        },
      ],
    },
    {
      label: "Workspaces Management",
      icon: Building2,
      children: [
        { href: "/dashboard/admin/classroom", label: "Classrooms" },
        {
          href: "/dashboard/admin/classroom/assignments",
          label: "Assignments",
        },
        { href: "/dashboard/admin/classroom/materials", label: "Materials" },
        {
          href: "/dashboard/admin/classroom/submissions",
          label: "Submissions",
        },
        { href: "/dashboard/admin/classroom/rubrics", label: "Rubrics" },
      ],
    },
    {
      label: "User Management",
      icon: Users,
      children: [
        { href: "/dashboard/admin/users/admins", label: "Admins" },
        { href: "/dashboard/admin/users/staff", label: "Staff" },
        { href: "/dashboard/admin/users/faculty", label: "Faculty" },
        { href: "/dashboard/admin/users/students", label: "Students" },
      ],
    },
    ...(user?.role !== "moderator"
      ? [
          {
            label: "Library Management",
            icon: BookOpen,
            children: [
              { href: "/dashboard/admin/library", label: "Overview" },
              {
                href: "/dashboard/admin/library/libraries",
                label: "Libraries",
              },
              { href: "/dashboard/admin/library/books", label: "Books" },
              { href: "/dashboard/admin/library/copies", label: "Book Copies" },
              {
                href: "/dashboard/admin/library/borrowings",
                label: "Borrowings",
              },
              {
                href: "/dashboard/admin/library/reservations",
                label: "Reservations",
              },
            ],
          },
        ]
      : []),
    {
      href: "/dashboard/admin/reports",
      label: "System Reports",
      icon: FileText,
    },
  ];

  const teacherLinks: NavItem[] = [
    { href: "/dashboard/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/teacher/courses", label: "My Courses", icon: BookOpen },
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
    { href: "/dashboard/teacher/schedule", label: "Schedule", icon: Calendar },
    ...(user?.isDepartmentHead
      ? [
          {
            href: "/dashboard/teacher/exam-committee",
            label: "Exam Committee",
            icon: Users,
          },
        ]
      : []),
  ];

  const studentLinks: NavItem[] = [
    { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/student/classes", label: "My Classes", icon: BookOpen },
    { href: "/dashboard/student/grades", label: "Grades", icon: FileText },
    { href: "/dashboard/student/library", label: "Library", icon: Library },
    { href: "/dashboard/student/payments", label: "Payments", icon: Building2 },
  ];

  // Program Controller staff role
  const programControllerLinks: NavItem[] = [
    {
      href: "/dashboard/staff/program-controller",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Academic Management",
      icon: GraduationCap,
      children: [
        {
          href: "/dashboard/staff/program-controller/courses",
          label: "Courses",
        },
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

  // Librarian staff role
  const librarianLinks: NavItem[] = [
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
        {
          href: "/dashboard/staff/library/reservations",
          label: "Reservations",
        },
      ],
    },
  ];

  const roleLinks = {
    admin: adminLinks,
    teacher: teacherLinks,
    student: studentLinks,
    program_controller: programControllerLinks,
    library: librarianLinks, // Add this
    staff: [],
  };

  const links = roleLinks[role as keyof typeof roleLinks] || [];

  const isActive = (href: string) => pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href) || false;

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose) onClose();
  };

  const renderNavItem = (item: NavItem) => {
    // If item has children, render as expandable section
    if (item.children) {
      const sectionId = item.label.toLowerCase().replace(/\s+/g, "-");
      const isExpanded =
        expandedSections.includes(sectionId) || isChildActive(item.children);

      return (
        <div key={item.label} className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => {
              if (isCollapsed && toggleCollapse) {
                toggleCollapse();
                // Optionally expand this section when uncollapsing
                if (!expandedSections.includes(sectionId)) {
                  toggleSection(sectionId);
                }
              } else {
                toggleSection(sectionId);
              }
            }}
            className={cn(
              "w-full justify-between gap-3 hover:bg-[#588157]/30 hover:text-white text-gray-200 h-11",
              isChildActive(item.children) && "bg-[#588157]/20 text-white",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <span
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </span>
            {!isCollapsed &&
              (isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              ))}
          </Button>

          {!isCollapsed && isExpanded && (
            <div className="ml-4 pl-4 border-l-2 border-[#588157]/30 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={handleLinkClick}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm h-10 hover:bg-[#588157]/30 hover:text-white",
                      isActive(child.href)
                        ? "bg-[#588157] text-white font-medium"
                        : "text-gray-300"
                    )}
                  >
                    {child.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular nav item
    return (
      <Link key={item.href} href={item.href!} onClick={handleLinkClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 hover:bg-[#588157]/30 hover:text-white h-11",
            isActive(item.href!)
              ? "bg-[#588157] text-white font-medium"
              : "text-gray-200",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <item.icon className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">{item.label}</span>}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn("h-full bg-[#344e41] text-white flex flex-col", className)}
    >
      {/* Logo and Title with close button for mobile */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center w-full"
            )}
          >
            <div className="h-10 w-10 rounded-full bg-[#588157]/30 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-[#a3b18a]" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Admin Portal
                </h2>
                <p className="text-xs text-[#a3b18a]">University Name</p>
              </div>
            )}
          </div>
          {/* Close button - only visible on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-300 hover:bg-[#588157]/30 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Desktop Collapse Toggle */}
        <div
          className={cn(
            "hidden lg:flex mt-2",
            isCollapsed ? "justify-center w-full" : "justify-end"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hover:bg-[#588157]/30 text-gray-300 transition-all duration-200",
              isCollapsed ? "h-10 w-10 rounded-full p-0" : "h-6 w-6 p-0"
            )}
            onClick={toggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-2">{links.map(renderNavItem)}</div>
      </div>

      {/* Settings and Logout at bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="space-y-1">
          <Link href="/dashboard/settings" onClick={handleLinkClick}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-gray-200 hover:bg-[#588157]/30 hover:text-white h-11",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? "Settings" : undefined}
            >
              <Settings className="h-5 w-5" />
              {!isCollapsed && <span className="font-medium">Settings</span>}
            </Button>
          </Link>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-gray-200 hover:bg-red-500/20 hover:text-red-300 h-11",
              isCollapsed && "justify-center px-2"
            )}
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
