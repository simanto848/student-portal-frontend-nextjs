"use client";
import React from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    className?: string;
}

export function AuthLayout({ children, sidebar, className }: AuthLayoutProps) {
    return (
        <div className={"relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark " + (className || "")}>
            <div className="flex flex-1">
                <div className="grid w-full grid-cols-1 lg:grid-cols-2">
                    {sidebar ? (
                        <div className="relative hidden h-full w-full bg-accent-light lg:flex flex-col items-center justify-center">
                        {sidebar}
                        </div>
                    ) : null}
                    <div className="flex w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4 sm:p-6 md:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
