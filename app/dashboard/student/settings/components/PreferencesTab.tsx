"use client";

import { useState } from "react";
import { User } from "@/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { notifyError, notifyPromise } from "@/components/toast";
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
import { Settings, Palette, Mail, Smartphone, Monitor } from "lucide-react";
import { motion } from "framer-motion";

interface PreferencesTabProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

export function PreferencesTab({ user, refreshUser }: PreferencesTabProps) {
  const [isPrefSaving, setIsPrefSaving] = useState(false);
  const emailUpdatesEnabled = Boolean((user as any)?.emailUpdatesEnabled);

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
      notifyError("Failed to update preferences");
    } finally {
      setIsPrefSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <GlassCard className="p-8 dark:bg-slate-900/60">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-[#0088A9]/5 ring-1 ring-[#0088A9]/10">
            <Palette className="h-5 w-5 text-[#0088A9]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">General Appearance</h3>
            <p className="text-xs font-bold text-slate-400">Customize your portal experience</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform dark:bg-slate-800 dark:border-white/10">
                <Monitor className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Interface Theme</Label>
                <p className="text-[10px] font-bold text-slate-400">Select your preferred lighting</p>
              </div>
            </div>
            <div className="w-[180px]">
              <Select defaultValue="system">
                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-100 font-bold text-slate-700 focus:ring-[#0088A9]/20 dark:bg-slate-800 dark:border-white/10 dark:text-white">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 font-bold dark:bg-slate-800 dark:border-white/10 dark:text-white">
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-8 dark:bg-slate-900/60">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-[#0088A9]/5 ring-1 ring-[#0088A9]/10">
            <Settings className="h-5 w-5 text-[#0088A9]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Notifications</h3>
            <p className="text-xs font-bold text-slate-400">Receive important alerts via Noitifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform dark:bg-slate-800 dark:border-white/10">
                <Mail className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Email Updates</Label>
                <p className="text-[10px] font-bold text-slate-400">Receive important alerts via email</p>
              </div>
            </div>
            <Switch
              checked={emailUpdatesEnabled}
              onCheckedChange={handleToggleEmailUpdates}
              disabled={isPrefSaving}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 opacity-60 group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-white/10">
                <Smartphone className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-500 dark:text-slate-400">SMS Notifications</Label>
                <p className="text-[10px] font-bold text-slate-400">Updates via SMS (Coming Soon)</p>
              </div>
            </div>
            <Switch disabled />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
