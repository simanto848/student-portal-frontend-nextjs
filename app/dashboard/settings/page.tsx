"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileTab } from "./components/ProfileTab";
import { NotificationsTab } from "./components/NotificationsTab";
import { SecurityTab } from "./components/SecurityTab";
import { PreferencesTab } from "./components/PreferencesTab";
import { User, Bell, Shield, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab user={user} refreshUser={refreshUser} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsTab user={user} refreshUser={refreshUser} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityTab user={user} refreshUser={refreshUser} />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <PreferencesTab user={user} refreshUser={refreshUser} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
