"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Home, ChevronRight, LucideIcon, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Breadcrumb {
    label: string;
    href?: string;
}

export interface HeaderStep {
    id: number;
    title: string;
    icon: LucideIcon;
}

interface QuizHeaderProps {
    title: string;
    subtitle?: string;
    backHref: string;
    breadcrumbs?: Breadcrumb[];
    action?: React.ReactNode;
    icon?: LucideIcon;
    badgeText?: string;
    steps?: HeaderStep[];
    step?: number;
    setStep?: (step: any) => void;
}

export function QuizHeader({
    title,
    subtitle,
    backHref,
    breadcrumbs,
    action,
    icon: Icon = Sparkles,
    badgeText = "Quiz Hub",
    steps,
    step,
    setStep,
}: QuizHeaderProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            {breadcrumbs && (
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
            )}

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(backHref)}
                        className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
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

            {/* Steps Content */}
            {steps && step && setStep && (
                <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-[24px] p-2 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 sticky top-4 z-40">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center flex-1 w-full group last:flex-none">
                            <button
                                onClick={() => step > s.id && setStep(s.id)}
                                disabled={step <= s.id && step !== s.id}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 relative z-10 w-full md:w-auto font-bold text-xs uppercase tracking-wider",
                                    step === s.id
                                        ? "bg-[#2dd4bf] text-white shadow-lg shadow-teal-500/20"
                                        : step > s.id
                                            ? "text-[#2dd4bf] bg-[#2dd4bf]/10"
                                            : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                                    step === s.id ? "bg-white/20" : "bg-transparent"
                                )}>
                                    {step > s.id ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                                </div>
                                <span>{s.title}</span>
                            </button>
                            {idx < steps.length - 1 && (
                                <div className="hidden md:block flex-1 h-px mx-4 bg-slate-100 dark:bg-slate-800" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
