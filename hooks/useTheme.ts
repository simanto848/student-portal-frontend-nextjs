"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to manage theme state (Dark/Light).
 * 
 * Default Behavior:
 * - Initializes based on user preference (if saved).
 * - If no preference, checks current time:
 *   - 6:00 PM - 5:59 AM: Dark Mode
 *   - 6:00 AM - 5:59 PM: Light Mode
 * 
 * Returns:
 * - isDarkMode: boolean
 * - toggleTheme: function to switch themes
 */
export function useTheme() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check local storage or time
        const storedTheme = localStorage.getItem("theme");

        if (storedTheme) {
            setIsDarkMode(storedTheme === "dark");
        } else {
            // Time-based default
            const hour = new Date().getHours();
            const isNight = hour >= 18 || hour < 6;
            setIsDarkMode(isNight);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode, mounted]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    return { isDarkMode, toggleTheme, mounted };
}
