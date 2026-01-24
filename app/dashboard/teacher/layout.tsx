"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    GraduationCap,
    Moon,
    Sun,
    User as UserIcon,
    Settings,
    LogOut
} from "lucide-react";
import { getNavigationForUser } from "@/config/navigation";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTheme } from "@/hooks";
import { getImageUrl } from "@/lib/utils";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const profilePicture = getImageUrl((user as any)?.profile?.profilePicture || user?.profileImage);
    const isMounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    const { isDarkMode, toggleTheme, mounted } = useTheme();

    const navItems = getNavigationForUser(user);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f0f4f8] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
            {/* Mesh Background Styles */}
            <style jsx global>{`
        .bg-mesh {
          background-color: #f0f4f8;
          background-image: 
              radial-gradient(at 0% 0%, hsla(180,70%,85%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(200,80%,90%,1) 0, transparent 50%), 
              radial-gradient(at 100% 100%, hsla(180,60%,92%,1) 0, transparent 50%), 
              radial-gradient(at 0% 100%, hsla(210,70%,90%,1) 0, transparent 50%);
        }
        /* ... (rest of styles managed by existing code logic if I don't touch them, but replace_file_content needs contiguous block) ... */
        /* Actually, I am replacing the RETURN statement start and the dropdown part. */
        /* Let's focus on the dropdown part specifically to avoid large payload if possible, but the console.log is before return. */
      `}</style>


            <style jsx global>{`
        .bg-mesh {
          background-color: #f0f4f8;
          background-image: 
              radial-gradient(at 0% 0%, hsla(180,70%,85%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(200,80%,90%,1) 0, transparent 50%), 
              radial-gradient(at 100% 100%, hsla(180,60%,92%,1) 0, transparent 50%), 
              radial-gradient(at 0% 100%, hsla(210,70%,90%,1) 0, transparent 50%);
        }
        .dark .bg-mesh {
            background-color: #0f172a;
            background-image: 
                radial-gradient(at 0% 0%, hsla(180,40%,15%,1) 0, transparent 50%), 
                radial-gradient(at 100% 0%, hsla(200,50%,15%,1) 0, transparent 50%), 
                radial-gradient(at 100% 100%, hsla(180,30%,18%,1) 0, transparent 50%), 
                radial-gradient(at 0% 100%, hsla(210,40%,15%,1) 0, transparent 50%);
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .dark .glass-panel {
            background: rgba(30, 41, 59, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5); 
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.8); 
        }
      `}</style>

            {/* Background Layer */}
            <div className="absolute inset-0 z-0 bg-mesh pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-20 lg:w-24 flex flex-col items-center py-8 glass-panel border-r-0 border-white/30 dark:border-slate-700/30 z-20 m-4 rounded-3xl h-[calc(100vh-2rem)]">
                <div className="mb-10 p-2 bg-[#2dd4bf] rounded-xl shadow-lg shadow-teal-500/30">
                    <GraduationCap className="text-white w-8 h-8" />
                </div>

                <nav className="flex-1 w-full flex flex-col items-center gap-6 overflow-y-auto no-scrollbar py-4 overflow-x-hidden">
                    <TooltipProvider>
                        {navItems.filter(item => item.href).map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Tooltip key={item.href!} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href!}
                                            className={`p-3 rounded-xl transition-all group relative ${isActive
                                                ? "bg-white/50 dark:bg-slate-700/50 text-[#2dd4bf] shadow-sm"
                                                : "text-slate-500 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-slate-700/30 hover:text-[#2dd4bf]"
                                                }`}
                                        >
                                            <item.icon className="w-6 h-6" />
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute inset-0 rounded-xl bg-white/20 dark:bg-white/10"
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={10} className="bg-slate-800 text-white border-slate-700">
                                        <p>{item.label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </nav>

                <div className="mt-auto flex flex-col gap-4 items-center">
                    <button
                        className="p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all"
                        onClick={toggleTheme}
                    >
                        {mounted && isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>



                    {/* Hydration safe dropdown */}
                    {isMounted ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    suppressHydrationWarning
                                    className="relative group cursor-pointer outline-none"
                                >
                                    <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-600 shadow-md cursor-pointer">
                                        <AvatarImage
                                            src={profilePicture}
                                            alt={user?.fullName || "User"}
                                        />
                                        <AvatarFallback className="bg-[#2dd4bf] text-white font-bold">
                                            {user?.fullName?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 ml-2" side="right" align="end" sideOffset={10}>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none truncate">{user?.fullName || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[#2dd4bf]/10 focus:text-[#2dd4bf] transition-colors duration-200" asChild>
                                        <Link href="/dashboard/teacher/profile" className="flex items-center w-full font-bold uppercase text-xs tracking-wider py-1">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[#2dd4bf]/10 focus:text-[#2dd4bf] transition-colors duration-200" asChild>
                                        <Link href="/dashboard/teacher/settings" className="flex items-center w-full font-bold uppercase text-xs tracking-wider py-1">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20" onClick={() => logout && logout()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="relative group cursor-pointer outline-none">
                            <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-600 shadow-md cursor-pointer">
                                <AvatarImage src={getImageUrl(user?.profileImage)} alt={user?.fullName || "User"} className="object-cover" />
                                <AvatarFallback className="bg-[#2dd4bf] text-white font-bold">
                                    {user?.fullName?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto relative z-10 p-6 lg:p-8 ml-0">
                {children}
            </main>
        </div>
    );
}
