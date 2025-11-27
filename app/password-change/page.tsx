/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField, PasswordStrengthIndicator } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService, UserRole } from "@/services/auth.service";
import { toast } from "sonner";

function PasswordChangeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const role = searchParams.get("role") as UserRole;
  const otp = searchParams.get("otp");

  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = pwd.length > 0 && pwd === confirm;

  useEffect(() => {
    if (!email || !role || !otp) {
      toast.error("Missing verification information");
      router.push("/login");
    }
  }, [email, role, otp, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !email || !role || !otp) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, pwd, role);
      toast.success("Password Reset Successfully");
      router.push(`/login/${role}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !role || !otp) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-alt-light dark:bg-background-alt-dark">
      <div className="flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-alt-light dark:border-border-alt-dark/50 px-6 sm:px-10 md:px-20 py-4 bg-white dark:bg-background-dark">
          <div className="flex items-center gap-4 text-text-light dark:text-text-dark">
            <div className="size-8 text-primary-dark">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              Student Portal
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBy4g3oD8EvZCBbe6sujb1QHRUsQPhECLD44lginBEl3pt0YBi9nlePxkk_k2YNVMiQ3LzET1uMkYqpcNAhTpdTxz1woljZnIZehMNn1hHxSD9IuNEMAyjXt8hkdVBrHFNc9lDxk-L7RUpmlyjK3moaGj6NhtT_rP76_iRiUiSQNHdEeizEcIkWxRfabXhKh9kX83j9kFkaHRmKAHI_cCIXVNFhrNeSwNaxCgOUaclWpdBzUF6ux9qsvqUtXfUu4ZVJilpMWFtrUtw")',
              }}
            />
          </div>
        </header>
        <main className="flex flex-1 justify-center py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl">
            <Card className="bg-white dark:bg-background-dark/70 rounded-xl border-border-alt-light dark:border-border-alt-dark p-6 sm:p-10">
              <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                  Reset Your Password
                </h1>
                <p className="text-subtext-light dark:text-subtext-dark text-base">
                  Create a new, secure password for your account.
                </p>
              </div>
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <PasswordField
                  label="New Password"
                  value={pwd}
                  onChange={setPwd}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />
                <PasswordStrengthIndicator password={pwd} />
                <PasswordField
                  label="Confirm New Password"
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
                <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className="w-full sm:w-auto rounded-lg bg-primary-dark px-8 h-12 text-base font-bold text-white hover:bg-primary disabled:opacity-50"
                  >
                    {isLoading ? "Resetting..." : "Change Password"}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto rounded-lg bg-background-light dark:bg-background-dark/50 border-border-alt-light dark:border-border-alt-dark px-8 h-12 text-base font-bold text-subtext-light dark:text-subtext-dark hover:bg-border-alt-light/80 dark:hover:bg-border-alt-dark/50"
                  >
                    <Link href="/login">Cancel</Link>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PasswordChangePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordChangeContent />
    </Suspense>
  );
}
