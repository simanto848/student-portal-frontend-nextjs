"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircleIcon} from "lucide-react"

export default function PasswordChangeSuccessPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <Card className="w-full max-w-md flex-col items-center border-border-light/50 dark:border-border-dark/50 bg-card-light dark:bg-card-dark p-6 sm:p-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 dark:bg-accent-dark/20 mx-auto">
                    <CheckCircleIcon className="text-5xl text-primary dark:text-accent-light" />
                </div>
                <div className="mt-6 flex w-full flex-col items-center text-center">
                    <h1 className="text-2xl font-bold leading-tight tracking-tight text-text-light-primary dark:text-text-dark-primary">Password Updated Successfully</h1>
                    <p className="mt-2 max-w-sm text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                        Your password has been changed. You can now use your new password to log in to your account.
                    </p>
                    <div className="mt-8 w-full">
                        <Button asChild className="w-full h-12 rounded-lg bg-primary text-white text-base font-bold hover:bg-primary/90">
                        <Link href="/login">Return to Login</Link>
                        </Button>
                    </div>
                    <p className="mt-6 text-sm font-normal leading-normal text-text-helper-light dark:text-text-dark-secondary/80">
                        If you did not initiate this change, please contact support immediately.
                    </p>
                </div>
            </Card>
        </div>
    );
}
