"use client";
import React, { useState } from "react";
import { AuthLayout, AuthLogo, AuthCard, PasswordField } from "@/components/auth";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
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
                    <div className="absolute inset-0 bg-linear-to-b from-primary/40 via-primary/20 to-transparent" aria-hidden="true" />
                </div>
                <div className="relative z-10 flex flex-col items-start p-16 max-w-xl text-white">
                    <h1 className="text-5xl font-black tracking-tighter mb-4">Unlock Your Potential.</h1>
                    <p className="text-lg text-gray-200">Access your courses, grades, and campus resources all in one place. Your academic journey starts here.</p>
                </div>
            </>
        }>
        <AuthCard
            footer={<p>© 2024 University Name | <a className="hover:underline text-primary dark:text-accent-dark" href="#">Help &amp; Support</a></p>}
        >
        <AuthLogo label="University Portal" />
        <main className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-3">
                <p className="text-text-light dark:text-text-dark text-4xl font-black leading-tight tracking-[-0.033em]">Welcome Back</p>
                <p className="text-accent-light dark:text-accent-dark text-base">Please enter your credentials to continue.</p>
            </div>
            <div className="flex w-full flex-col gap-4">
                <label className="flex flex-col gap-2">
                    <p className="text-text-light dark:text-text-dark text-sm font-medium leading-normal">Email</p>
                    <Input
                        className="h-12 rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border-border-light dark:border-border-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark"
                        placeholder="Enter your email or student ID"
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
                    <Link className="text-primary dark:text-accent-dark text-sm font-medium leading-normal self-end hover:underline" href="/forgot-password">Forgot Password?</Link>
                </div>
                <Button
                    className="h-12 rounded-lg w-full bg-primary text-white dark:text-background-dark text-base font-semibold hover:bg-primary/90 mt-4"
                >
                    Login
                </Button>
            </div>
        </main>
        </AuthCard>
    </AuthLayout>
  );
}
