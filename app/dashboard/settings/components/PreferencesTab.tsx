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
import { notifyPromise } from "@/components/toast";
import { settingsService } from "@/services/user/settings.service";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      console.error(error);
      // Error handled by toast
    } finally {
      setIsPrefSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Preferences</CardTitle>
          <CardDescription>Customize your dashboard experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label className="text-base">Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <div className="w-[180px]">
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select your interface theme
              </p>
            </div>
            <div className="w-[180px]">
              <Select defaultValue="system">
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
          <CardDescription>Manage how we contact you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="font-medium">Email Updates</div>
              <div className="text-sm text-muted-foreground">
                Receive important updates by email.
              </div>
            </div>
            <Switch
              checked={emailUpdatesEnabled}
              onCheckedChange={handleToggleEmailUpdates}
              disabled={isPrefSaving}
            />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 opacity-60">
            <div className="space-y-1">
              <div className="font-medium">SMS Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive updates via SMS (Coming Soon).
              </div>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
