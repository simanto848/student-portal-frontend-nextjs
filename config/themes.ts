import { UserRole } from "@/types/user";

export interface DashboardTheme {
    name: string;
    colors: {
        sidebar: {
            bg: string;
            text: string;
            hover: string;
            active: string;
            activeBgSubtle: string;
            activeText: string;
            border: string;
            borderSubtle: string;
            iconBg: string;
        };
        header: {
            bg: string;
            text: string;
            border: string;
        };
        main: {
            bg: string;
        };
        accent: {
            primary: string;
            secondary: string;
        };
    };
}

export const ROLE_THEMES: Record<string, DashboardTheme> = {
    [UserRole.SUPER_ADMIN]: {
        name: "System",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-slate-600",
                hover: "hover:bg-red-50 hover:text-red-700",
                active: "bg-red-50",
                activeBgSubtle: "bg-red-50/50",
                activeText: "text-red-700",
                border: "border-slate-200",
                borderSubtle: "border-red-100",
                iconBg: "bg-red-100",
            },
            header: {
                bg: "bg-white",
                text: "text-slate-800",
                border: "border-slate-200",
            },
            main: {
                bg: "bg-slate-50",
            },
            accent: {
                primary: "text-red-600",
                secondary: "bg-red-600",
            },
        },
    },
    [UserRole.ADMIN]: {
        name: "Institution",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-slate-600",
                hover: "hover:bg-amber-50 hover:text-amber-700",
                active: "bg-amber-50",
                activeBgSubtle: "bg-amber-50/50",
                activeText: "text-amber-700",
                border: "border-slate-200",
                borderSubtle: "border-amber-100",
                iconBg: "bg-amber-100",
            },
            header: {
                bg: "bg-white",
                text: "text-slate-800",
                border: "border-slate-200",
            },
            main: {
                bg: "bg-slate-50",
            },
            accent: {
                primary: "text-amber-600",
                secondary: "bg-amber-600",
            },
        },
    },
    [UserRole.MODERATOR]: {
        name: "Moderator",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-slate-600",
                hover: "hover:bg-blue-50 hover:text-blue-700",
                active: "bg-blue-50",
                activeBgSubtle: "bg-blue-50/50",
                activeText: "text-blue-700",
                border: "border-slate-200",
                borderSubtle: "border-blue-100",
                iconBg: "bg-blue-100",
            },
            header: {
                bg: "bg-white",
                text: "text-slate-800",
                border: "border-slate-200",
            },
            main: {
                bg: "bg-slate-50",
            },
            accent: {
                primary: "text-blue-600",
                secondary: "bg-blue-600",
            },
        },
    },
    [UserRole.TEACHER]: {
        name: "Academic Hub",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-slate-600",
                hover: "hover:bg-indigo-50 hover:text-indigo-700",
                active: "bg-indigo-50",
                activeBgSubtle: "bg-indigo-50/50",
                activeText: "text-indigo-700",
                border: "border-slate-200",
                borderSubtle: "border-indigo-100",
                iconBg: "bg-indigo-100",
            },
            header: {
                bg: "bg-white",
                text: "text-slate-800",
                border: "border-slate-200",
            },
            main: {
                bg: "bg-slate-50",
            },
            accent: {
                primary: "text-indigo-600",
                secondary: "bg-indigo-600",
            },
        },
    },
    [UserRole.STAFF]: {
        name: "Operations",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-slate-600",
                hover: "hover:bg-emerald-50 hover:text-emerald-700",
                active: "bg-emerald-50",
                activeBgSubtle: "bg-emerald-50/50",
                activeText: "text-emerald-700",
                border: "border-slate-200",
                borderSubtle: "border-emerald-100",
                iconBg: "bg-emerald-100",
            },
            header: {
                bg: "bg-white",
                text: "text-slate-800",
                border: "border-slate-200",
            },
            main: {
                bg: "bg-slate-50",
            },
            accent: {
                primary: "text-emerald-600",
                secondary: "bg-emerald-600",
            },
        },
    },
    [UserRole.STUDENT]: {
        name: "Student Hub",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-slate-500",
                hover: "hover:bg-cyan-50 hover:text-cyan-600",
                active: "bg-cyan-50",
                activeBgSubtle: "bg-cyan-50/40",
                activeText: "text-cyan-600",
                border: "border-slate-100",
                borderSubtle: "border-cyan-50",
                iconBg: "bg-cyan-100",
            },
            header: {
                bg: "bg-white/80",
                text: "text-slate-800",
                border: "border-slate-100",
            },
            main: {
                bg: "bg-[#f8fcff]",
            },
            accent: {
                primary: "text-cyan-600",
                secondary: "bg-cyan-600",
            },
        },
    },
    [UserRole.EXAM_CONTROLLER]: {
        name: "Exam Controller",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-slate-600",
                hover: "hover:bg-violet-100 hover:text-violet-900",
                active: "bg-violet-50",
                activeBgSubtle: "bg-violet-50/50",
                activeText: "text-violet-700",
                border: "border-slate-200",
                borderSubtle: "border-violet-100",
                iconBg: "bg-violet-100",
            },
            header: {
                bg: "bg-white",
                text: "text-slate-800",
                border: "border-slate-200",
            },
            main: {
                bg: "bg-slate-50",
            },
            accent: {
                primary: "text-violet-600",
                secondary: "bg-violet-600",
            },
        },
    },
    [UserRole.LIBRARY]: {
        name: "Library Hub",
        colors: {
            sidebar: {
                bg: "bg-gradient-to-b from-slate-900 via-slate-800 to-teal-900",
                text: "text-slate-300",
                hover: "hover:bg-teal-500/20 hover:text-teal-300",
                active: "bg-teal-500/25",
                activeBgSubtle: "bg-teal-500/15",
                activeText: "text-teal-400",
                border: "border-teal-800/50",
                borderSubtle: "border-teal-600/30",
                iconBg: "bg-teal-500/20",
            },
            header: {
                bg: "bg-gradient-to-r from-white via-teal-50/50 to-cyan-50/30",
                text: "text-slate-800",
                border: "border-teal-100",
            },
            main: {
                bg: "bg-gradient-to-br from-teal-50/40 via-slate-50 to-cyan-50/30",
            },
            accent: {
                primary: "text-teal-600",
                secondary: "bg-teal-600",
            },
        },
    },


    default: {
        name: "Default",
        colors: {
            sidebar: {
                bg: "bg-white",
                text: "text-gray-600",
                hover: "hover:bg-gray-50",
                active: "bg-gray-50",
                activeBgSubtle: "bg-gray-50/50",
                activeText: "text-gray-900",
                border: "border-gray-200",
                borderSubtle: "border-gray-100",
                iconBg: "bg-gray-100",
            },
            header: {
                bg: "bg-white",
                text: "text-gray-600",
                border: "border-gray-200",
            },
            main: {
                bg: "bg-gray-50",
            },
            accent: {
                primary: "text-black",
                secondary: "bg-black",
            },
        },
    },
};
