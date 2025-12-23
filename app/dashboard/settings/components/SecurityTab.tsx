"use client";

import { useState, useMemo } from "react";
import { User } from "@/types/user";
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
import { notifyError, notifyPromise } from "@/components/toast";
import { settingsService } from "@/services/user/settings.service";
import { Smartphone, Laptop, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SecurityTabProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

export function SecurityTab({ user, refreshUser }: SecurityTabProps) {
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // 2FA State
  const [is2FAWorking, setIs2FAWorking] = useState(false);
  const [enableOtp, setEnableOtp] = useState("");
  const [enableOtpRequested, setEnableOtpRequested] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const twoFactorEnabled = Boolean((user as any)?.twoFactorEnabled);

  // Password Logic
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
        error: (e: unknown) =>
          (e as any)?.message || "Failed to change password",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      // Error handled by toast
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 2FA Logic
  const handleRequestEnable2FA = async () => {
    setIs2FAWorking(true);
    try {
      await notifyPromise(settingsService.enable2FA(), {
        loading: "Sending OTP...",
        success: "OTP sent to your email",
        error: (e: unknown) => (e as any)?.message || "Failed to start 2FA",
      });
      setEnableOtpRequested(true);
    } catch (error) {
      console.error(error);
      // Error handled by toast
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
        error: (e: unknown) => (e as any)?.message || "Failed to enable 2FA",
      });
      setEnableOtp("");
      setEnableOtpRequested(false);
      await refreshUser();
    } catch (error) {
      console.error(error);
      // Error handled by toast
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
        error: (e: unknown) => (e as any)?.message || "Failed to disable 2FA",
      });
      setDisablePassword("");
      await refreshUser();
    } catch (error) {
      console.error(error);
      // Error handled by toast
    } finally {
      setIs2FAWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showCurrentPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
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
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-start">
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !canSubmitPassword}
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Card */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Authenticator App</div>
                <div className="text-sm text-muted-foreground">
                  Use an app to generate 2FA codes
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "Enabled" : "Not configured"}
              </Badge>
            </div>
          </div>

          {!twoFactorEnabled && !enableOtpRequested && (
            <div className="pt-2">
              <Button
                onClick={handleRequestEnable2FA}
                disabled={is2FAWorking}
                variant="outline"
              >
                {is2FAWorking ? "Sending..." : "Setup 2FA"}
              </Button>
            </div>
          )}

          {!twoFactorEnabled && enableOtpRequested && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to your email to verify setup.
              </div>
              <div className="space-y-2">
                <Label htmlFor="enableOtp">OTP Code</Label>
                <Input
                  id="enableOtp"
                  inputMode="numeric"
                  maxLength={6}
                  value={enableOtp}
                  onChange={(e) => setEnableOtp(e.target.value)}
                  placeholder="123456"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
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
                  {is2FAWorking ? "Verifying..." : "Confirm Setup"}
                </Button>
              </div>
            </div>
          )}

          {twoFactorEnabled && (
            <div className="space-y-3 rounded-lg border p-4 border-destructive/20 bg-destructive/5">
              <div className="text-sm font-medium text-destructive">
                Disable Two-Factor Authentication
              </div>
              <div className="text-sm text-muted-foreground">
                Enter your password to disable 2FA. This will lower your account
                security.
              </div>
              <div className="space-y-2">
                <Label htmlFor="disable2faPassword">Password</Label>
                <Input
                  id="disable2faPassword"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter password to confirm"
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
          )}
        </CardContent>
      </Card>

      {/* Active Sessions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Laptop className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Chrome on MacOS</div>
                <div className="text-sm text-muted-foreground">
                  New York, US • Active now
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Current
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Safari on iPhone</div>
                <div className="text-sm text-muted-foreground">
                  New York, US • 2 hours ago
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Revoke
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
