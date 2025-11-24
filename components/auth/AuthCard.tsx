"use client";
import React from "react";

interface AuthCardProps {
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function AuthCard({ children, footer, className }: AuthCardProps) {
    return (
        <div className={"flex w-full max-w-md flex-col gap-8 py-10 " + (className || "") }>
            {children}
            {footer ? (
                <footer className="text-center text-sm text-accent-light dark:text-accent-dark">{footer}</footer>
            ) : null}
        </div>
    );
}
