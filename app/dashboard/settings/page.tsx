"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notifyError, notifySuccess, notifyPromise } from "@/components/toast";
import { settingsService } from "@/services/user/settings.service";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [is2FAWorking, setIs2FAWorking] = useState(false);
  const [enableOtp, setEnableOtp] = useState("");
  const [enableOtpRequested, setEnableOtpRequested] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const [isPrefSaving, setIsPrefSaving] = useState(false);

  const twoFactorEnabled = Boolean(user?.twoFactorEnabled);
  const emailUpdatesEnabled = Boolean(user?.emailUpdatesEnabled);

  const canSubmitPassword = useMemo(() => {
    return (
      currentPassword.trim().length > 0 &&
      newPassword.trim().length >= 6 &&
      confirmPassword.trim().length > 0
    );
  }, [currentPassword, newPassword, confirmPassword]);

  const handleChangePassword = async () => {
    if (!canSubmitPassword) {
      notifyError("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      notifyError("New password and confirm password do not match");
      return;
    }

    setIsChangingPassword(true);
    const promise = settingsService.changePassword({
      currentPassword,
      newPassword,
    });

    try {
      await notifyPromise(promise, {
        loading: "Changing password...",
        success: "Password changed successfully",
        error: (e: any) => e?.message || "Failed to change password",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRequestEnable2FA = async () => {
    setIs2FAWorking(true);
    try {
      await notifyPromise(settingsService.enable2FA(), {
        loading: "Sending OTP...",
        success: "OTP sent to your email",
        error: (e: any) => e?.message || "Failed to start 2FA",
      });
      setEnableOtpRequested(true);
    } catch (error) {
      //
    } finally {
      setIs2FAWorking(false);
    }
  };

  const handleConfirmEnable2FA = async () => {
    if (enableOtp.trim().length !== 6) {
      notifyError("Enter the 6-digit OTP");
      return;
    }
    setIs2FAWorking(true);
    try {
      await notifyPromise(settingsService.confirmEnable2FA(enableOtp.trim()), {
        loading: "Verifying OTP...",
        success: "2FA enabled successfully",
        error: (e: any) => e?.message || "Failed to enable 2FA",
      });
      setEnableOtp("");
      setEnableOtpRequested(false);
      await refreshUser();
    } catch (error) {
      //
    } finally {
      setIs2FAWorking(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword.trim()) {
      notifyError("Enter your password to disable 2FA");
      return;
    }
    setIs2FAWorking(true);
    try {
      await notifyPromise(settingsService.disable2FA(disablePassword), {
        loading: "Disabling 2FA...",
        success: "2FA disabled successfully",
        error: (e: any) => e?.message || "Failed to disable 2FA",
      });
      setDisablePassword("");
      await refreshUser();
    } catch (error) {
      //
    } finally {
      setIs2FAWorking(false);
    }
  };

  const handleToggleEmailUpdates = async (next: boolean) => {
    setIsPrefSaving(true);
    try {
      await notifyPromise(
        settingsService.updatePreferences({ emailUpdatesEnabled: next }),
        {
          loading: "Updating preferences...",
          success: "Preferences updated",
          error: (e: any) => e?.message || "Failed to update preferences",
        }
      );
      await refreshUser();
    } catch (error) {
      // Error handled by toast
    } finally {
      setIsPrefSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your security and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !canSubmitPassword}
              >
                {isChangingPassword ? "Saving..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enable or disable 2FA for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="font-medium">2FA Status</div>
                <div className="text-sm text-muted-foreground">
                  {twoFactorEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>
              {!twoFactorEnabled ? (
                <Button
                  onClick={handleRequestEnable2FA}
                  disabled={is2FAWorking}
                >
                  {is2FAWorking ? "Sending..." : "Enable 2FA"}
                </Button>
              ) : null}
            </div>

            {!twoFactorEnabled && enableOtpRequested ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">
                  Enter the 6-digit OTP sent to your email.
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enableOtp">OTP</Label>
                  <Input
                    id="enableOtp"
                    inputMode="numeric"
                    maxLength={6}
                    value={enableOtp}
                    onChange={(e) => setEnableOtp(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEnableOtpRequested(false);
                      setEnableOtp("");
                    }}
                    disabled={is2FAWorking}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmEnable2FA}
                    disabled={is2FAWorking}
                  >
                    {is2FAWorking ? "Verifying..." : "Confirm"}
                  </Button>
                </div>
              </div>
            ) : null}

            {twoFactorEnabled ? (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">
                  Enter your password to disable 2FA.
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disable2faPassword">Password</Label>
                  <Input
                    id="disable2faPassword"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={handleDisable2FA}
                    disabled={is2FAWorking}
                  >
                    {is2FAWorking ? "Disabling..." : "Disable 2FA"}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Control your account preferences.</CardDescription>
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
    </DashboardLayout>
  );
}
