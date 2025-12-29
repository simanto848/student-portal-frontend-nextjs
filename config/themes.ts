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
