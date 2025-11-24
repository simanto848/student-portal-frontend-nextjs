"use client";
import React from "react";
import Image from "next/image";

export function AuthLogo({ label = "DIU Student Portal" }: { label?: string }) {
    return (
        <header className="flex items-center gap-4 text-text-light dark:text-text-dark">
            <div className="relative h-40 w-40">
                <Image
                    src="/diu-logo.png"
                    alt="DIU Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">{label}</h2>
        </header>
    );
}
