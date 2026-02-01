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
  Shield,
  Activity,
  AlertTriangle,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/contexts/AlertsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import {
  getNavigationForUser,
  getDashboardTitle,
  isPathActive,
  isChildActive,
  NavItem,
  NavChildItem,
} from "@/config/navigation";
import { DashboardTheme } from "@/config/themes";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  theme: DashboardTheme;
}

export function Sidebar({
  className,
  onClose,
  isCollapsed,
  toggleCollapse,
  theme,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const c = theme.colors.sidebar; // Shorthand for colors

  // Get navigation items for the current user
  const navigationItems = useMemo(() => {
    return user ? getNavigationForUser(user) : [];
  }, [user]);

  // Get dashboard title based on user role
  const dashboardTitle = useMemo(() => {
    return user ? getDashboardTitle(user.role) : "Dashboard";
  }, [user]);

  const { unreadCount } = useAlerts();

  // Inject badge into navigation items
  const displayItems = useMemo(() => {
    return navigationItems.map(item => {
      if (item.href === '/dashboard/super-admin/alerts') {
        return { ...item, badge: unreadCount > 0 ? unreadCount : undefined };
      }
      // Also check children if any
      if (item.children) {
        const newChildren = item.children.map(child => {
          if (child.href === '/dashboard/super-admin/alerts') {
            return { ...child, badge: unreadCount > 0 ? unreadCount : undefined };
          }
          return child;
        });
        return { ...item, children: newChildren };
      }
      return item;
    });
  }, [navigationItems, unreadCount]);

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
      const isActiveChild = isChildActive(pathname, item.children);

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
              "w-full justify-between gap-3 h-11",
              c.text,
              c.hover,
              isActiveChild && `${c.activeBgSubtle} ${c.activeText}`,
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
            <div className={`ml-4 pl-4 border-l-2 ${c.borderSubtle} space-y-1`}>
              {item.children.map((child: NavChildItem) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={handleLinkClick}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm h-10",
                      c.hover,
                      isPathActive(pathname, child.href)
                        ? `${c.activeBgSubtle} ${c.activeText} font-medium`
                        : c.text,
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

    const isActive = isPathActive(pathname, item.href!);

    return (
      <Link key={item.href} href={item.href!} onClick={handleLinkClick}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-11 relative",
            c.hover,
            isActive
              ? `${c.active} ${c.activeText} font-medium`
              : c.text,
            isCollapsed && "justify-center px-2",
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="font-medium truncate">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-auto h-5 px-1.5 text-[10px] font-bold",
                    isActive
                      ? "bg-white/20 text-current"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
          {isCollapsed && item.badge && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn("h-full flex flex-col border-r shadow-xl z-20", c.bg, c.border, className)}
    >
      {/* Header */}
      <div className={`px-4 py-6 border-b ${c.border}`}>
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center w-full",
            )}
          >
            <div className={`h-10 w-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105`}>
              <GraduationCap className={cn("h-6 w-6", c.text)} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className={cn("text-lg font-bold tracking-tight truncate", theme.colors.sidebar.activeText)}>
                  {dashboardTitle}
                </h2>
                <p className={cn("text-xs opacity-70 truncate", c.text)}>Student Portal</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("lg:hidden", c.text, c.hover)}
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
              "transition-all duration-200",
              c.text, c.hover,
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
      <div className="flex-1 overflow-y-auto py-4 scrollbar-none">
        <div className="px-3 space-y-1.5">
          {displayItems.map(renderNavItem)}
        </div>
      </div>

      {/* Footer */}
      <div className={`px-3 py-4 border-t ${c.border} mt-auto`}>
        <div className="space-y-1">
          {/* Profile Link Placeholder - Could be actual profile link */}
          <div className={cn("flex items-center gap-3 px-2 py-2 mb-2 rounded-lg", c.activeBgSubtle)}>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium truncate", c.text)}>{user?.email || "User"}</p>
                <p className={cn("text-xs opacity-70 truncate", c.text)}>{user?.role}</p>
              </div>
            )}
          </div>

          <Link href="/dashboard/settings" onClick={handleLinkClick}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11",
                c.text, c.hover,
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
              "w-full justify-start gap-3 hover:bg-red-500/10 hover:text-red-500 h-11",
              c.text,
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
