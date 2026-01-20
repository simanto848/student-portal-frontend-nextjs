"use client";

import { useState, useMemo } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifyError, notifyPromise } from "@/components/toast";
import { settingsService } from "@/services/user/settings.service";
import { Smartphone, Laptop, Eye, EyeOff, ShieldCheck, KeyRound, Clock, MapPin, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface SecurityTabProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

interface UserSession {
  id: string;
  isCurrent?: boolean;
  device: {
    browser: string;
    os: string;
    deviceType: string;
  };
  ipAddress: string;
  location: string;
  lastActive: string;
  createdAt: string;
}

export function SecurityTab({ user, refreshUser }: SecurityTabProps) {
  const theme = useDashboardTheme();
  const { logout } = useAuth();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA State
  const [is2FAWorking, setIs2FAWorking] = useState(false);
  const [enableOtp, setEnableOtp] = useState("");
  const [enableOtpRequested, setEnableOtpRequested] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  // Sessions State
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const twoFactorEnabled = Boolean((user as any)?.twoFactorEnabled);

  // Fetch Session Data
  const fetchSessions = async () => {
    try {
      const data = await settingsService.getSessions();
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (session: UserSession) => {
    try {
      if (session.isCurrent) {
        const confirmSelf = window.confirm("You are revoking your CURRENT session. You will be logged out immediately. Continue?");
        if (!confirmSelf) return;
      }

      await notifyPromise(settingsService.revokeSession(session.id), {
        loading: "Revoking session...",
        success: "Session revoked",
        error: "Failed to revoke session",
      });

      if (session.isCurrent) {
        logout();
      } else {
        fetchSessions();
      }
    } catch (error) {
      console.error(error);
    }
  };

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
    } finally {
      setIs2FAWorking(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Password Section */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-orange-50 ring-1 ring-orange-200/50">
                <KeyRound className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Access Control</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-12 pr-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 pr-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold"
                      placeholder="Min 6 chars"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !canSubmitPassword}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black tracking-tight shadow-xl shadow-slate-200/50 transition-all active:scale-95"
              >
                {isChangingPassword ? "Updating Access..." : "Secure My Account"}
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* 2FA Section */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-emerald-50 ring-1 ring-emerald-200/50">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Two-Step Verification</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Email Authenticator</p>
                    <p className="text-xs font-bold text-slate-400">Verifies login via OTP</p>
                  </div>
                </div>
                <Badge className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                  twoFactorEnabled ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                )}>
                  {twoFactorEnabled ? "Protected" : "Inactive"}
                </Badge>
              </div>

              {/* 2FA Flow Controls */}
              {!twoFactorEnabled && !enableOtpRequested && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 text-center px-4 leading-relaxed">
                    Highly recommended to prevent unauthorized access to your academic records.
                  </p>
                  <Button
                    onClick={handleRequestEnable2FA}
                    disabled={is2FAWorking}
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-tight shadow-xl shadow-emerald-100 transition-all active:scale-95"
                  >
                    {is2FAWorking ? "Sending OTP..." : "Initialize 2FA"}
                  </Button>
                </div>
              )}

              {!twoFactorEnabled && enableOtpRequested && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-4"
                >
                  <div className="text-center">
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Enter Verification Code</p>
                    <p className="text-xs font-medium text-emerald-600/70">Check your university email</p>
                  </div>
                  <Input
                    maxLength={6}
                    value={enableOtp}
                    onChange={(e) => setEnableOtp(e.target.value)}
                    className="h-14 text-center text-2xl font-black tracking-[0.5em] rounded-xl border-emerald-200 bg-white"
                    placeholder="000000"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setEnableOtpRequested(false)}
                      className="flex-1 h-11 text-emerald-700 hover:bg-emerald-100/50 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmEnable2FA}
                      disabled={is2FAWorking}
                      className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl"
                    >
                      {is2FAWorking ? "Checking..." : "Confirm"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {twoFactorEnabled && (
                <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-[10px]">Deactivation Warning</span>
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter password to disable"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="h-11 rounded-xl bg-white border-rose-200"
                  />
                  <Button
                    variant="destructive"
                    onClick={handleDisable2FA}
                    disabled={is2FAWorking}
                    className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl"
                  >
                    {is2FAWorking ? "Processing..." : "Disable Protection"}
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Session Management */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-slate-100 ring-1 ring-slate-200/50">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Active Login Sessions</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingSessions ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-3 opacity-50">
                <Clock className="h-8 w-8 animate-pulse text-slate-400" />
                <p className="text-sm font-bold text-slate-400">Loading active sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-3 opacity-50">
                <ShieldCheck className="h-8 w-8 text-slate-400" />
                <p className="text-sm font-bold text-slate-400">No active sessions found.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      {session.device.deviceType === 'mobile' ? (
                        <Smartphone className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                      ) : session.device.deviceType === 'tablet' ? (
                        <Tablet className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                      ) : (
                        <Laptop className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 truncate max-w-[120px]">
                        {session.device.browser.split('/')[0]} on {session.device.os}
                      </p>
                      <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {session.ipAddress}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(session.lastActive).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {session.isCurrent && (
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter mr-2">
                      Current
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => handleRevokeSession(session)}
                    className="h-8 px-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    {session.isCurrent ? "Revoke Current" : "Revoke"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
