"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileTab } from "./components/ProfileTab";
import { NotificationsTab } from "./components/NotificationsTab";
import { SecurityTab } from "./components/SecurityTab";
import { PreferencesTab } from "./components/PreferencesTab";
import { User, Bell, Shield, Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your personal information, security preferences, and notification settings"
        icon={SettingsIcon}
      />

      <Tabs defaultValue="profile" className="space-y-8">
        <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm inline-block">
          <TabsList className="bg-transparent h-11 gap-1">
            <TabsTrigger
              value="profile"
              className="px-5 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-bold transition-all gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="px-5 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-bold transition-all gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="px-5 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-bold transition-all gap-2"
            >
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="px-5 py-2 rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-bold transition-all gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait">
            <TabsContent value="profile" key="profile">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileTab user={user} refreshUser={refreshUser} />
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications" key="notifications">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationsTab user={user} refreshUser={refreshUser} />
              </motion.div>
            </TabsContent>

            <TabsContent value="security" key="security">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SecurityTab user={user} refreshUser={refreshUser} />
              </motion.div>
            </TabsContent>

            <TabsContent value="preferences" key="preferences">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PreferencesTab user={user} refreshUser={refreshUser} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
