"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/types/user";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
    role: UserRole;
}

export function ForgotPasswordForm({ role }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            await authService.forgotPassword(email, role);
            toast.success("OTP sent successfully");

            const params = new URLSearchParams();
            params.set("email", email);
            params.set("role", role);

            router.push(`/otp-verification?${params.toString()}`);
        } catch (error: any) {
            console.error(error);
            setMessage(error.response?.data?.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
            <main className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-primary-dark dark:text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}><GraduationCap /></span>
                        <h2 className="text-2xl font-bold tracking-tight text-primary-dark dark:text-text-dark">Student Portal</h2>
                    </div>
                </div>
                <Card className="rounded-xl border-border-light/30 dark:border-border-dark bg-white dark:bg-card-dark p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-primary-dark dark:text-text-dark">Reset {capitalize(role)} Password</h1>
                        <p className="mt-2 text-base text-gray-600 dark:text-subtext-dark">No worries! Enter your email address below, and we&apos;ll send you a link to reset your password.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-primary-dark dark:text-text-dark mb-2">Email Address</label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={`e.g., your.${role}@university.edu`}
                                autoComplete="email"
                                required
                                className="h-12 rounded-lg border-border-light dark:border-border-dark bg-white dark:bg-background-dark text-base"
                            />
                        </div>

                        {message && (
                            <p className={`text-sm text-center ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                                {message}
                            </p>
                        )}

                        <Button type="submit" className="w-full h-12 rounded-lg bg-primary-dark dark:bg-primary text-base font-bold hover:bg-primary dark:hover:bg-primary-dark" disabled={loading}>
                            {loading ? "Sending..." : "Send OTP"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-subtext-dark">
                            Remember your password?{" "}
                            <Link className="font-bold text-primary-dark dark:text-primary hover:underline" href={`/login/${role}`}>
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </Card>

                <footer className="mt-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-subtext-dark">©{new Date().getFullYear()} University Portal. All rights reserved.</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <Link className="text-sm text-gray-600 dark:text-subtext-dark hover:text-primary-dark dark:hover:text-primary hover:underline" href="#">
                            Help Center
                        </Link>
                        <span className="text-gray-400 dark:text-subtext-dark/60">.</span>
                        <Link className="text-sm text-gray-600 dark:text-subtext-dark hover:text-primary-dark dark:hover:text-primary hover:underline" href="#">
                            Contact Support
                        </Link>
                    </div>
                </footer>
            </main>
        </div>
    )
}
