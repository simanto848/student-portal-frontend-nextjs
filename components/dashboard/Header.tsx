"use client";

import { Bell, HelpCircle, Menu } from "lucide-react";
import { NotificationDropdown } from "./notifications/NotificationDropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { DashboardTheme } from "@/config/themes";
import { UserRole } from "@/types/user";

interface HeaderProps {
  onMenuClick?: () => void;
  theme: DashboardTheme;
}

export function Header({ onMenuClick, theme }: HeaderProps) {
  const { user, logout } = useAuth();
  const profilePicture = getImageUrl((user as any)?.profile?.profilePicture || user?.profileImage);
  const c = theme.colors.header;

  return (
    <header className={`sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between gap-4 border-b px-4 sm:px-6 ${c.bg} ${c.border}`}>
      {/* Left side - Menu button for mobile */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`lg:hidden ${c.text} ${theme.colors.sidebar.hover}`}
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full ml-1 sm:ml-2"
              suppressHydrationWarning
            >
              <Avatar className={`h-9 w-9 sm:h-10 sm:w-10 border-2 ${theme.colors.sidebar.border}`}>
                <AvatarImage
                  src={profilePicture}
                  alt={user?.fullName || "User"}
                />
                <AvatarFallback className={`${theme.colors.accent.secondary} text-white text-sm`}>
                  {user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className={`text-sm font-medium leading-none ${theme.colors.accent.primary}`}>
                  {user?.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
