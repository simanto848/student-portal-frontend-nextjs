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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure which emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Grade Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails when grades are posted
              </p>
            </div>
            <Switch
              checked={emailSettings.gradeUpdates}
              onCheckedChange={(c) =>
                handleEmailSettingChange("gradeUpdates", c)
              }
            />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">New Assignments</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new assignments
              </p>
            </div>
            <Switch
              checked={emailSettings.newAssignments}
              onCheckedChange={(c) =>
                handleEmailSettingChange("newAssignments", c)
              }
            />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Deadline Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders before due dates
              </p>
            </div>
            <Switch
              checked={emailSettings.deadlineReminders}
              onCheckedChange={(c) =>
                handleEmailSettingChange("deadlineReminders", c)
              }
            />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Announcements</Label>
              <p className="text-sm text-muted-foreground">
                University and course announcements
              </p>
            </div>
            <Switch
              checked={emailSettings.announcements}
              onCheckedChange={(c) =>
                handleEmailSettingChange("announcements", c)
              }
            />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Direct Messages</Label>
              <p className="text-sm text-muted-foreground">
                Email notifications for new messages
              </p>
            </div>
            <Switch
              checked={emailSettings.directMessages}
              onCheckedChange={(c) =>
                handleEmailSettingChange("directMessages", c)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Manage browser push notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Messages</Label>
              <p className="text-sm text-muted-foreground">
                Real-time message notifications
              </p>
            </div>
            <Switch
              checked={pushSettings.messages}
              onCheckedChange={(c) => handlePushSettingChange("messages", c)}
            />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Class Reminders</Label>
              <p className="text-sm text-muted-foreground">
                15 minutes before class starts
              </p>
            </div>
            <Switch
              checked={pushSettings.classReminders}
              onCheckedChange={(c) =>
                handlePushSettingChange("classReminders", c)
              }
            />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Library Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Book due dates and availability
              </p>
            </div>
            <Switch
              checked={pushSettings.libraryAlerts}
              onCheckedChange={(c) =>
                handlePushSettingChange("libraryAlerts", c)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
