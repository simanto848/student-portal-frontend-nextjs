"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notifyPromise } from "@/components/toast";
import { settingsService } from "@/services/user/settings.service";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion } from "framer-motion";
import { Mail, Bell, MessageCircle, BookOpen, Clock, Megaphone } from "lucide-react";
import type { Variants, Easing } from "framer-motion";

interface NotificationsTabProps {
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
        setEmailSettings((prev) => ({ ...prev, [key]: !checked }));
      }
    } else {
      console.log(`Updated ${key} to ${checked}`);
    }
  };

  const handlePushSettingChange = (key: string, checked: boolean) => {
    setPushSettings((prev) => ({ ...prev, [key]: checked }));
    console.log(`Updated ${key} to ${checked}`);
  };

  const emailNotificationItems = [
    {
      key: "announcements",
      icon: Megaphone,
      title: "Announcements",
      description: "University and course announcements",
      color: "text-[#2dd4bf]",
      bg: "bg-[#2dd4bf]/10",
    },
    {
      key: "directMessages",
      icon: MessageCircle,
      title: "Direct Messages",
      description: "Email notifications for new messages",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  const pushNotificationItems = [
    {
      key: "messages",
      icon: Bell,
      title: "Messages",
      description: "Real-time message notifications",
      color: "text-[#2dd4bf]",
      bg: "bg-[#2dd4bf]/10",
    },
    {
      key: "classReminders",
      icon: Clock,
      title: "Class Reminders",
      description: "15 minutes before class starts",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      key: "libraryAlerts",
      icon: BookOpen,
      title: "Library Alerts",
      description: "Book due dates and availability",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Email Notifications */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 ring-1 ring-[#2dd4bf]/20">
              <Mail className="h-5 w-5 text-[#2dd4bf]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Email Notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure which emails you want to receive
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {emailNotificationItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 hover:border-[#2dd4bf]/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={emailSettings[item.key as keyof typeof emailSettings]}
                  onCheckedChange={(c) => handleEmailSettingChange(item.key, c)}
                  className="data-[state=checked]:bg-[#2dd4bf]"
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Push Notifications */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Push Notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage browser push notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pushNotificationItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 hover:border-[#2dd4bf]/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={pushSettings[item.key as keyof typeof pushSettings]}
                  onCheckedChange={(c) => handlePushSettingChange(item.key, c)}
                  className="data-[state=checked]:bg-[#2dd4bf]"
                />
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

