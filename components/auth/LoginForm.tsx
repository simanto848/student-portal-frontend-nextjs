"use client";
import React, { useState } from "react";
import {
  AuthLayout,
  AuthLogo,
  AuthCard,
  PasswordField,
} from "@/components/auth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";
import { notifyError } from "../toast";

interface LoginFormProps {
  role: UserRole;
}

export function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const { login, verify2FA, resend2FA, isLoading } = useAuth();

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpInput, timer]);

  const handleLogin = async () => {
    if (!email || !password) {
      notifyError("Please enter both email and password.");
      return;
    }

    try {
      const result = await login({ email, password }, role);
      if (result && result.twoFactorRequired) {
        setTempToken(result.tempToken);
        setShowOtpInput(true);
        setTimer(60);
      }
    } catch (error: any) {
      notifyError(error.response?.data?.message ||
        "Login failed. Please check your credentials.")
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verify2FA(tempToken, otp);
    } catch (error: any) {
      notifyError(error.response?.data?.message ||
        "Verification failed. Please check your OTP.")
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await resend2FA(tempToken);
      setTimer(60);
      // You might want to add a success toast here
    } catch (error: any) {
      notifyError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <AuthLayout
      sidebar={
        <>
          <div className="absolute inset-0">
            <Image
              src="/graduation-hero.jpeg"
              alt="Group of graduates celebrating throwing caps in the air"
              fill
              priority
              className="object-cover opacity-30"
            />
            <div
              className="absolute inset-0 bg-linear-to-b from-primary/40 via-primary/20 to-transparent"
              aria-hidden="true"
            />
          </div>
          <div className="relative z-10 flex flex-col items-start p-16 max-w-xl text-white">
            <h1 className="text-5xl font-black tracking-tighter mb-4">
              Unlock Your Potential.
            </h1>
            <p className="text-lg text-gray-200">
              Access your courses, grades, and campus resources all in one
              place. Your academic journey starts here.
            </p>
          </div>
        </>
      }
    >
      <AuthCard
        footer={
          <p>
            © 2024 University Name |{" "}
            <a
              className="hover:underline text-primary dark:text-accent-dark"
              href="#"
            >
              Help &amp; Support
            </a>
          </p>
        }
      >
        <AuthLogo label="University Portal" />
        <main className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">
              {showOtpInput ? "Two-Factor Authentication" : `${capitalize(role)} Login`}
            </p>
            <p className="text-accent-light dark:text-accent-dark text-base">
              {showOtpInput
                ? "Please enter the verification code sent to your email."
                : `Please enter your ${role} credentials to continue.`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            {!showOtpInput ? (
              <>
                <label className="flex flex-col gap-2">
                  <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">
                    Email / ID
                  </p>
                  <Input
                    className="h-12 rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark"
                    placeholder={`Enter your ${role} email or ID`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <div className="flex flex-col gap-2">
                  <PasswordField
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <Link
                    className="text-primary dark:text-accent-dark text-sm font-medium leading-normal self-end hover:underline"
                    href={`/forgot-password?role=${role}`}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-2">
                  <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">
                    One-Time Password
                  </p>
                  <Input
                    className="h-12 rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark tracking-widest text-center text-lg font-bold"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </label>
                <div className="text-center text-sm">
                  {timer > 0 ? (
                    <p className="text-gray-500">Resend code in {timer}s</p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="text-primary hover:underline font-medium"
                    >
                      {isResending ? "Sending..." : "Resend Code"}
                    </button>
                  )}
                </div>
              </>
            )}

            <Button
              className="h-12 rounded-lg w-full bg-primary text-white dark:text-background-dark text-base font-semibold hover:bg-primary/90 mt-4"
              onClick={showOtpInput ? handleVerifyOtp : handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : (showOtpInput ? "Verify Login" : "Login")}
            </Button>

            {!showOtpInput && (
              <div className="text-center mt-2">
                <Link
                  href="/login"
                  className="text-sm text-gray-500 hover:text-primary"
                >
                  Not a {role}? Switch user type
                </Link>
              </div>
            )}
            {showOtpInput && (
              <div className="text-center mt-2">
                <button
                  onClick={() => {
                    setShowOtpInput(false);
                    setTimer(0);
                    setOtp("");
                  }}
                  className="text-sm text-gray-500 hover:text-primary underline"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </main>
      </AuthCard>
    </AuthLayout>
  );
}
