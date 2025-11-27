/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPInputGroup } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService, UserRole } from "@/services/auth.service";
import { toast } from "sonner";

function OTPVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const role = searchParams.get("role") as UserRole;

  const [code, setCode] = useState("".padEnd(6));
  const [isLoading, setIsLoading] = useState(false);
  const isComplete = code.replace(/\s/g, "").length === 6;

  useEffect(() => {
    if (!email || !role) {
      toast.error("Missing email or role information");
      router.push("/login");
    }
  }, [email, role, router]);

  useEffect(() => {
    if (isComplete && !isLoading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleVerify = async () => {
    if (!email || !role) return;

    setIsLoading(true);
    try {
      await authService.verifyResetOTP(email, code, role);
      toast.success("OTP Verified Successfully");

      const params = new URLSearchParams();
      params.set("email", email);
      params.set("role", role);
      params.set("otp", code);

      router.push(`/password-change?${params.toString()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !role) return;
    try {
      await authService.forgotPassword(email, role);
      toast.success("OTP Resent Successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  if (!email || !role) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="absolute top-8 text-center flex items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary-dark dark:text-text-dark">
          school
        </span>
        <span className="text-2xl font-bold">Student Portal</span>
      </div>
      <Card className="w-full max-w-md rounded-xl bg-card-light dark:bg-card-dark dark:border-border-dark p-8">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">
            Verify Your Identity
          </h1>
          <p className="mt-2 text-base text-text-helper-light dark:text-text-helper-dark">
            Enter the 6-digit code sent to your email at {email}
          </p>
        </div>
        <div className="flex justify-center mt-8">
          <OTPInputGroup value={code} onChange={setCode} />
        </div>
        <div className="text-center h-5 mt-4">
          {isLoading ? (
            <p className="text-primary text-sm font-medium">Verifying...</p>
          ) : isComplete ? (
            <p className="text-success text-sm font-medium">Code complete</p>
          ) : null}
        </div>
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleVerify}
            disabled={!isComplete || isLoading}
            className="w-full h-12 rounded-lg bg-primary text-white text-base font-bold hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </div>
        <div className="text-center mt-6">
          <p className="text-text-helper-light dark:text-text-helper-dark text-sm">
            Didn&apos;t receive a code?{" "}
            <button
              onClick={handleResend}
              className="font-semibold text-primary dark:text-text-helper-dark hover:underline"
            >
              Resend Code
            </button>
          </p>
        </div>
      </Card>
      <div className="absolute bottom-8 text-center text-sm text-text-helper-light dark:text-text-helper-dark">
        <Link
          className="font-semibold text-primary dark:text-text-helper-dark hover:underline"
          href="/login"
        >
          Back to Login
        </Link>
        <span className="mx-2">·</span>
        <a
          className="font-semibold text-primary dark:text-text-helper-dark hover:underline"
          href="#"
        >
          Need Help?
        </a>
      </div>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerificationContent />
    </Suspense>
  );
}
