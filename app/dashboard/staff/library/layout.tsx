"use client";

import { ReactNode } from "react";

interface LibraryLayoutProps {
    children: ReactNode;
}

export default function LibraryLayout({ children }: LibraryLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50/60 via-slate-50 to-cyan-50/40">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -left-20 w-60 h-60 bg-cyan-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
            </div>

            {/* Content wrapper */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
