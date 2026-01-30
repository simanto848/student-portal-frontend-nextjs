/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    Moon,
    Sun,
    LogOut,
    Settings,
    User as UserIcon,
} from "lucide-react";
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
import { getImageUrl } from "@/lib/utils";
import { useTheme } from "@/hooks";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

const navItems = [
    { href: "/dashboard/student", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/student/classes", label: "My Classes", icon: "menu_book" },
    { href: "/dashboard/student/attendances", label: "Attendance", icon: "fact_check" },
    { href: "/dashboard/student/grades", label: "Grades", icon: "insights" },
    { href: "/dashboard/student/classroom", label: "Classroom", icon: "school" },
    { href: "/dashboard/student/communication", label: "Chat", icon: "forum" },
    { href: "/dashboard/student/library", label: "Library", icon: "local_library" },
];

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Enable real-time notifications for students globally
    useNotificationSocket({ enabled: !!user });

    const profilePicture = getImageUrl((user as any)?.profile?.profilePicture || user?.profileImage);
    const isMounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    const { isDarkMode, toggleTheme, mounted } = useTheme();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#f0f4f8] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans p-4">
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

            {/* Main Rounded Container */}
            <div className="flex h-full w-full glass-panel rounded-4xl overflow-hidden shadow-2xl relative z-10 border-0">
                {/* Sidebar */}
                <aside className="w-20 border-r border-white/20 dark:border-slate-700/30 flex flex-col items-center py-6 h-full shrink-0 z-30">
                    {/* Logo */}
                    <div className="mb-8 p-3 bg-primary-nexus/20 rounded-2xl shadow-inner">
                        <span className="material-icons-outlined text-primary-nexus text-2xl">school</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-6 w-full flex flex-col items-center overflow-y-auto no-scrollbar py-4 px-2">
                        <TooltipProvider>
                            {navItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== "/dashboard/student" && pathname.startsWith(item.href));
                                return (
                                    <Tooltip key={item.href} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href}
                                                className={`p-3 rounded-2xl transition-all relative group flex items-center justify-center ${isActive
                                                    ? "bg-white/60 dark:bg-slate-700/60 text-primary-nexus shadow-[0_8px_16px_-4px_rgba(0,136,169,0.3)] ring-1 ring-white/50"
                                                    : "text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700/40 hover:text-primary-nexus"
                                                    }`}
                                            >
                                                <span className="material-icons-outlined text-2xl relative z-10">{item.icon}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="student-active-pill"
                                                        className="absolute inset-0 rounded-2xl bg-primary-nexus/5 dark:bg-primary-nexus/20"
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" sideOffset={10} className="bg-gray-900/90 backdrop-blur-md text-white border-white/10">
                                            <p>{item.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </TooltipProvider>
                    </nav>

                    {/* Bottom Section */}
                    <div className="mt-auto pt-6 border-t border-white/20 w-full flex flex-col items-center gap-6 pb-6">
                        {/* Dark Mode Toggle */}
                        <button
                            className="p-3 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            onClick={toggleTheme}
                        >
                            {mounted && isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                        </button>


                        {/* Profile Avatar */}
                        {isMounted ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="relative group cursor-pointer outline-none">
                                        <div className="h-12 w-12 rounded-full p-0.5 bg-white/80 dark:bg-gray-800 shadow-lg group-hover:scale-110 transition-transform border border-white/40">
                                            <Avatar className="w-full h-full border border-white/20">
                                                <AvatarImage src={profilePicture} alt={user?.fullName || "User"} className="object-cover" />
                                                <AvatarFallback className="bg-primary-nexus text-white font-bold">
                                                    {user?.fullName?.charAt(0) || "S"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 ml-4 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl" side="right" align="end" sideOffset={15}>
                                    <DropdownMenuLabel className="font-normal px-4 py-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none truncate text-gray-900 dark:text-white">{user?.fullName || "Student"}</p>
                                            <p className="text-xs leading-none text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuGroup className="p-2">
                                        <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-primary-nexus focus:text-white transition-colors py-2.5 px-3" asChild>
                                            <Link href="/dashboard/student/profile" className="flex items-center w-full text-xs font-semibold tracking-wide capitalize">
                                                <UserIcon className="mr-3 h-4 w-4" />
                                                <span>Profile View</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-primary-nexus focus:text-white transition-colors py-2.5 px-3" asChild>
                                            <Link href="/dashboard/student/settings" className="flex items-center w-full text-xs font-semibold tracking-wide capitalize">
                                                <Settings className="mr-3 h-4 w-4" />
                                                <span>System Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <div className="p-2">
                                        <DropdownMenuItem
                                            className="cursor-pointer rounded-xl text-red-500 focus:text-white focus:bg-red-500 transition-colors py-2.5 px-3 capitalize text-xs font-semibold"
                                            onClick={() => logout && logout()}
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span>Sign Out</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="h-12 w-12 rounded-full p-0.5 bg-white/40 border border-white/20">
                                <Avatar className="w-full h-full">
                                    <AvatarFallback className="bg-primary-nexus text-white font-bold">S</AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-transparent">
                    <div className="absolute inset-0 overflow-y-auto w-full h-full p-8 pb-36 scrollbar-hide">
                        {children}
                    </div>
                </main>

                {/* Floating Bottom Action Bar - Pill Style */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] px-4 pointer-events-none"
                >
                    <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 border border-white/60 dark:border-slate-700/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-2xl pointer-events-auto">
                        <Link href="/dashboard/student/classroom">
                            <button className="flex flex-col items-center group relative cursor-pointer outline-none">
                                <div className="h-11 w-11 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 text-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm border border-white/40 dark:border-slate-700/40 group-hover:scale-110 group-active:scale-95">
                                    <span className="material-icons-outlined text-xl">class</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">
                                    Class
                                </span>
                            </button>
                        </Link>
                        <Link href="/dashboard/student/library">
                            <button className="flex flex-col items-center group relative cursor-pointer outline-none">
                                <div className="h-11 w-11 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center group-hover:bg-amber-500 text-amber-500 group-hover:text-white transition-all duration-300 shadow-sm border border-white/40 dark:border-slate-700/40 group-hover:scale-110 group-active:scale-95">
                                    <span className="material-icons-outlined text-xl">library_books</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider group-hover:text-amber-500 transition-colors">
                                    Library
                                </span>
                            </button>
                        </Link>

                        {/* Center Home Button - Elevated */}
                        <Link href="/dashboard/student">
                            <button className="flex flex-col items-center group relative cursor-pointer outline-none -mt-4">
                                <div className="h-14 w-14 bg-gradient-to-br from-primary-nexus to-teal-400 rounded-2xl flex items-center justify-center text-white transition-all duration-300 shadow-lg shadow-primary-nexus/30 border-2 border-white/50 group-hover:scale-110 group-active:scale-95 group-hover:shadow-xl group-hover:shadow-primary-nexus/40">
                                    <span className="material-icons-outlined text-2xl">home</span>
                                </div>
                                <span className="text-[8px] font-black text-primary-nexus mt-1 uppercase tracking-wider">
                                    Home
                                </span>
                            </button>
                        </Link>

                        <Link href="/dashboard/student/classes">
                            <button className="flex flex-col items-center group relative cursor-pointer outline-none">
                                <div className="h-11 w-11 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 text-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm border border-white/40 dark:border-slate-700/40 group-hover:scale-110 group-active:scale-95">
                                    <span className="material-icons-outlined text-xl">calendar_today</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">
                                    Schedule
                                </span>
                            </button>
                        </Link>
                        <Link href="/dashboard/student/communication">
                            <button className="flex flex-col items-center group relative cursor-pointer outline-none">
                                <div className="h-11 w-11 bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center group-hover:bg-violet-500 text-violet-500 group-hover:text-white transition-all duration-300 shadow-sm border border-white/40 dark:border-slate-700/40 group-hover:scale-110 group-active:scale-95">
                                    <span className="material-icons-outlined text-xl">forum</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider group-hover:text-violet-500 transition-colors">
                                    Chat
                                </span>
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
