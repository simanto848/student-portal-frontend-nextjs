"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Switch } from "@/components/ui/switch";
import { notifyPromise, notifySuccess } from "@/components/toast";
import { settingsService } from "@/services/user/settings.service";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion } from "framer-motion";
import { Palette, Mail, MessageSquare, Settings, Sun, Moon, Monitor } from "lucide-react";
import type { Variants, Easing } from "framer-motion";

interface PreferencesTabProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as Easing } }
};

type ThemeMode = "light" | "dark" | "system";

export function PreferencesTab({ user, refreshUser }: PreferencesTabProps) {
  const [isPrefSaving, setIsPrefSaving] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);
  const emailUpdatesEnabled = Boolean((user as any)?.emailUpdatesEnabled);

  // Initialize theme from localStorage
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme");
    const storedThemeMode = localStorage.getItem("themeMode") as ThemeMode | null;

    if (storedThemeMode) {
      setThemeMode(storedThemeMode);
    } else if (storedTheme === "dark") {
      setThemeMode("dark");
    } else if (storedTheme === "light") {
      setThemeMode("light");
    } else {
      setThemeMode("system");
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    let isDark = false;

    if (mode === "system") {
      // Use time-based logic for system
      const hour = new Date().getHours();
      isDark = hour >= 18 || hour < 6;
      localStorage.removeItem("theme"); // Let the layout handle auto-detection
    } else {
      isDark = mode === "dark";
      localStorage.setItem("theme", mode);
    }

    localStorage.setItem("themeMode", mode);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleThemeChange = (value: ThemeMode) => {
    setThemeMode(value);
    applyTheme(value);
    notifySuccess(`Theme set to ${value === "system" ? "System (Auto)" : value.charAt(0).toUpperCase() + value.slice(1)}`);
  };

  const handleToggleEmailUpdates = async (next: boolean) => {
    setIsPrefSaving(true);
    try {
      await notifyPromise(
        settingsService.updatePreferences({ emailUpdatesEnabled: next }),
        {
          loading: "Updating preferences...",
          success: "Preferences updated",
          error: (e: unknown) =>
            (e as any)?.message || "Failed to update preferences",
        },
      );
      await refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPrefSaving(false);
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* General Preferences */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 ring-1 ring-[#2dd4bf]/20">
              <Settings className="h-5 w-5 text-[#2dd4bf]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                General Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your dashboard experience
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 hover:border-[#2dd4bf]/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform">
                  <Palette className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-800 dark:text-white">Theme</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your interface theme
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-[180px]">
                {mounted && (
                  <Select value={themeMode} onValueChange={handleThemeChange}>
                    <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="light" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-amber-500" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4 text-indigo-500" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-slate-500" />
                          <span>System (Auto)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Communication Preferences */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Communication Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage how we contact you
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 hover:border-[#2dd4bf]/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 group-hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4 text-[#2dd4bf]" />
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-800 dark:text-white">Email Updates</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive important updates by email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailUpdatesEnabled}
                onCheckedChange={handleToggleEmailUpdates}
                disabled={isPrefSaving}
                className="data-[state=checked]:bg-[#2dd4bf]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 opacity-60">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-slate-500/10">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-800 dark:text-white">SMS Notifications</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive updates via SMS (Coming Soon)
                  </p>
                </div>
              </div>
              <Switch disabled className="data-[state=checked]:bg-[#2dd4bf]" />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
