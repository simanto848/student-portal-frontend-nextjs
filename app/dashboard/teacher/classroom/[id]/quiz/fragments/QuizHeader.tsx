"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Home, ChevronRight, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface QuizHeaderProps {
    title: string;
    subtitle?: string;
    backHref: string;
    breadcrumbs: Breadcrumb[];
    action?: React.ReactNode;
    icon?: LucideIcon;
    badgeText?: string;
}

export function QuizHeader({
    title,
    subtitle,
    backHref,
    breadcrumbs,
    action,
    icon: Icon = Sparkles,
    badgeText = "Quiz Hub",
}: QuizHeaderProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Link
                    href="/dashboard/teacher"
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <Home className="h-3.5 w-3.5" />
                    Dashboard
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-slate-300" />
                        {crumb.href ? (
                            <Link
                                href={crumb.href}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate max-w-[150px]">
                                {crumb.label}
                            </span>
                        )}
                    </div>
                ))}
            </nav>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(backHref)}
                        className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-lg shadow-slate-200/40 active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                                <Icon className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">
                                    {badgeText}
                                </span>
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {action}
                </div>
            </div>
        </div>
    );
}
