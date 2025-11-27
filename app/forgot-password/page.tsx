"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, UserRole } from "@/services/auth.service";
import { toast } from "sonner";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roleParam) {
      setRole(roleParam as UserRole);
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email, role);
      toast.success("If an account exists, an OTP has been sent to your email");

      const params = new URLSearchParams();
      params.set("email", email);
      params.set("role", role);

      router.push(`/otp-verification?${params.toString()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div className="absolute top-8 text-center flex items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary-dark dark:text-text-dark">
          school
        </span>
        <span className="text-2xl font-bold">Student Portal</span>
      </div>
      <Card className="w-full max-w-md rounded-xl bg-card-light dark:bg-card-dark dark:border-border-dark p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight">
            Forgot Password
          </h1>
          <p className="mt-2 text-base text-text-helper-light dark:text-text-helper-dark">
            Enter your email and role to receive a reset code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-lg bg-primary text-white text-base font-bold hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link
            className="font-semibold text-primary dark:text-text-helper-dark hover:underline"
            href="/login"
          >
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
