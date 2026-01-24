"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notifyPromise } from "@/components/toast";
import { settingsService } from "@/services/user/settings.service";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Bell, Mail, Smartphone, Library, Megaphone, MessageSquare, GraduationCap, ClipboardList, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface NotificationsTabProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

export function NotificationsTab({ user, refreshUser }: NotificationsTabProps) {
  const [emailSettings, setEmailSettings] = useState({
    gradeUpdates: true,
    newAssignments: true,
    deadlineReminders: true,
    announcements: false,
    directMessages: false,
  });

  const [pushSettings, setPushSettings] = useState({
    messages: true,
    classReminders: true,
    libraryAlerts: false,
  });

  // Sync with user preferences when user data loads
  useEffect(() => {
    if (user) {
      const isEnabled = Boolean((user as any).emailUpdatesEnabled);
      setEmailSettings((prev) => {
        if (prev.announcements === isEnabled) return prev;
        return {
          ...prev,
          announcements: isEnabled,
        };
      });
    }
  }, [user]);

  const handleEmailSettingChange = async (key: string, checked: boolean) => {
    setEmailSettings((prev) => ({ ...prev, [key]: checked }));

    // For 'announcements', we hook into the real backend preference
    if (key === "announcements") {
      try {
        await notifyPromise(
          settingsService.updatePreferences({ emailUpdatesEnabled: checked }),
          {
            loading: "Updating preferences...",
            success: "Preferences updated",
            error: "Failed to update preferences",
          },
        );
        await refreshUser();
      } catch (error) {
        console.error(error);
        // Revert on error
        setEmailSettings((prev) => ({ ...prev, [key]: !checked }));
      }
    } else {
      // For other fields, we just simulate a save since backend support might not exist yet
      console.log(`Updated ${key} to ${checked}`);
    }
  };

  const handlePushSettingChange = (key: string, checked: boolean) => {
    setPushSettings((prev) => ({ ...prev, [key]: checked }));
    console.log(`Updated ${key} to ${checked}`);
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
            <Mail className="h-5 w-5 text-[#0088A9]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Email Notifications</h3>
            <p className="text-xs font-bold text-slate-400">Manage your academic email alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform dark:bg-slate-800 dark:border-white/10">
                <GraduationCap className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Grade Updates</Label>
                <p className="text-[10px] font-bold text-slate-400">When results are published per course</p>
              </div>
            </div>
            <Switch
              checked={emailSettings.gradeUpdates}
              onCheckedChange={(c) => handleEmailSettingChange("gradeUpdates", c)}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">New Assignments</Label>
                <p className="text-[10px] font-bold text-slate-400">Alerts for new class tasks and labs</p>
              </div>
            </div>
            <Switch
              checked={emailSettings.newAssignments}
              onCheckedChange={(c) => handleEmailSettingChange("newAssignments", c)}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Due Date Alerts</Label>
                <p className="text-[10px] font-bold text-slate-400">Reminders before mission deadlines</p>
              </div>
            </div>
            <Switch
              checked={emailSettings.deadlineReminders}
              onCheckedChange={(c) => handleEmailSettingChange("deadlineReminders", c)}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <Megaphone className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Announcements</Label>
                <p className="text-[10px] font-bold text-slate-400">Campus-wide broadcast and updates</p>
              </div>
            </div>
            <Switch
              checked={emailSettings.announcements}
              onCheckedChange={(c) => handleEmailSettingChange("announcements", c)}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-8 dark:bg-slate-900/60">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-[#0088A9]/5 ring-1 ring-[#0088A9]/10">
            <Smartphone className="h-5 w-5 text-[#0088A9]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Push Notifications</h3>
            <p className="text-xs font-bold text-slate-400">Real-time alerts for active browsers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Messages</Label>
                <p className="text-[10px] font-bold text-slate-400">Browser alerts for instant updates</p>
              </div>
            </div>
            <Switch
              checked={pushSettings.messages}
              onCheckedChange={(c) => handlePushSettingChange("messages", c)}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <Bell className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Class Reminders</Label>
                <p className="text-[10px] font-bold text-slate-400">15-minute countdown before sessions</p>
              </div>
            </div>
            <Switch
              checked={pushSettings.classReminders}
              onCheckedChange={(c) => handlePushSettingChange("classReminders", c)}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:border-[#0088A9]/20 transition-all group dark:bg-slate-900/50 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <Library className="h-4 w-4 text-slate-400 group-hover:text-[#0088A9]" />
              </div>
              <div>
                <Label className="text-sm font-black text-slate-800 dark:text-white">Library Alerts</Label>
                <p className="text-[10px] font-bold text-slate-400">Return dates and reservation updates</p>
              </div>
            </div>
            <Switch
              checked={pushSettings.libraryAlerts}
              onCheckedChange={(c) => handlePushSettingChange("libraryAlerts", c)}
              className="data-[state=checked]:bg-[#0088A9]"
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
