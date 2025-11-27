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
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { href: string; label: string }[];
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "academic-management",
  ]);

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
    { href: "/dashboard/admin/users", label: "User Management", icon: Users },
    {
      href: "/dashboard/admin/reports",
      label: "System Reports",
      icon: FileText,
    },
  ];

  const teacherLinks: NavItem[] = [
    { href: "/dashboard/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/teacher/courses", label: "My Courses", icon: BookOpen },
    { href: "/dashboard/teacher/schedule", label: "Schedule", icon: Calendar },
    { href: "/dashboard/teacher/grading", label: "Grading", icon: FileText },
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

  const roleLinks = {
    admin: adminLinks,
    teacher: teacherLinks,
    student: studentLinks,
    program_controller: programControllerLinks,
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
            onClick={() => toggleSection(sectionId)}
            className={cn(
              "w-full justify-between gap-3 hover:bg-[#588157]/30 hover:text-white text-gray-200 h-11",
              isChildActive(item.children) && "bg-[#588157]/20 text-white"
            )}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {isExpanded && (
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
              : "text-gray-200"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#588157]/30 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-[#a3b18a]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Admin Portal</h2>
              <p className="text-xs text-[#a3b18a]">University Name</p>
            </div>
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
              className="w-full justify-start gap-3 text-gray-200 hover:bg-[#588157]/30 hover:text-white h-11"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-200 hover:bg-red-500/20 hover:text-red-300 h-11"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
