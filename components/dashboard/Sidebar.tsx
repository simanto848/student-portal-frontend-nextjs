"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LogOut,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import {
  getNavigationForUser,
  getDashboardTitle,
  isPathActive,
  isChildActive,
  NavItem,
  NavChildItem,
} from "@/config/navigation";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
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

  // Get navigation items for the current user
  const navigationItems = useMemo(() => {
    return user ? getNavigationForUser(user) : [];
  }, [user]);

  // Get dashboard title based on user role
  const dashboardTitle = useMemo(() => {
    return user ? getDashboardTitle(user.role) : "Dashboard";
  }, [user]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const renderNavItem = (item: NavItem) => {
    if (item.children) {
      const sectionId = item.label.toLowerCase().replace(/\s+/g, "-");
      const isExpanded =
        expandedSections.includes(sectionId) ||
        isChildActive(pathname, item.children);

      return (
        <div key={item.label} className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => {
              if (isCollapsed && toggleCollapse) {
                toggleCollapse();
                if (!expandedSections.includes(sectionId)) {
                  toggleSection(sectionId);
                }
              } else {
                toggleSection(sectionId);
              }
            }}
            className={cn(
              "w-full justify-between gap-3 hover:bg-[#588157]/30 hover:text-white text-gray-200 h-11",
              isChildActive(pathname, item.children) &&
                "bg-[#588157]/20 text-white",
              isCollapsed && "justify-center px-2",
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <span
              className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center",
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
              {item.children.map((child: NavChildItem) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={handleLinkClick}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm h-10 hover:bg-[#588157]/30 hover:text-white",
                      isPathActive(pathname, child.href)
                        ? "bg-[#588157] text-white font-medium"
                        : "text-gray-300",
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

    return (
      <Link key={item.href} href={item.href!} onClick={handleLinkClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 hover:bg-[#588157]/30 hover:text-white h-11",
            isPathActive(pathname, item.href!)
              ? "bg-[#588157] text-white font-medium"
              : "text-gray-200",
            isCollapsed && "justify-center px-2",
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
      {/* Header */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center w-full",
            )}
          >
            <div className="h-10 w-10 rounded-full bg-[#588157]/30 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-[#a3b18a]" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  {dashboardTitle}
                </h2>
                <p className="text-xs text-[#a3b18a]">University Name</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-300 hover:bg-[#588157]/30 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div
          className={cn(
            "hidden lg:flex mt-2",
            isCollapsed ? "justify-center w-full" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hover:bg-[#588157]/30 text-gray-300 transition-all duration-200",
              isCollapsed ? "h-10 w-10 rounded-full p-0" : "h-6 w-6 p-0",
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

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-2">
          {navigationItems.map(renderNavItem)}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="space-y-1">
          <Link href="/dashboard/settings" onClick={handleLinkClick}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-gray-200 hover:bg-[#588157]/30 hover:text-white h-11",
                isCollapsed && "justify-center px-2",
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
              isCollapsed && "justify-center px-2",
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
