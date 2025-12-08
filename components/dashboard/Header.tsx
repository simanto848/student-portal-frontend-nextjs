"use client";

import { Bell, HelpCircle, Menu } from "lucide-react";
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

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const profilePicture = getImageUrl(user?.profile?.profilePicture);

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between gap-4 border-b border-[#a3b18a]/30 bg-[#dad7cd] px-4 sm:px-6">
      {/* Left side - Menu button for mobile */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-[#344e41] hover:bg-[#a3b18a]/30"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#344e41] hover:text-[#344e41] hover:bg-[#a3b18a]/30 h-9 w-9 sm:h-10 sm:w-10"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-[#344e41] hover:text-[#344e41] hover:bg-[#a3b18a]/30 h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full ml-1 sm:ml-2"
            >
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-[#588157]">
                <AvatarImage
                  src={profilePicture}
                  alt={user?.fullName || "User"}
                />
                <AvatarFallback className="bg-[#588157] text-white text-sm">
                  {user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-[#344e41]">
                  {user?.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Settings
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
