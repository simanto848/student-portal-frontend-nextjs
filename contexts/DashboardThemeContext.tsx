"use client";

import React, { createContext, useContext } from "react";
import { DashboardTheme, ROLE_THEMES } from "@/config/themes";
import { useAuth } from "@/contexts/AuthContext";

const DashboardThemeContext = createContext<DashboardTheme | undefined>(undefined);

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    const theme = user && ROLE_THEMES[user.role]
        ? ROLE_THEMES[user.role]
        : ROLE_THEMES.default;

    return (
        <DashboardThemeContext.Provider value={theme}>
            {children}
        </DashboardThemeContext.Provider>
    );
}

export function useDashboardTheme() {
    const context = useContext(DashboardThemeContext);
    if (context === undefined) {
        return ROLE_THEMES.default;
    }
    return context;
}
