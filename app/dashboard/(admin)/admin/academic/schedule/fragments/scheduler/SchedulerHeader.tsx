"use client";

import { Sparkles, Sun, Moon, Zap, CheckCircle2 } from "lucide-react";

export function SchedulerHeader() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-purple-300/20 blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Automatic Schedule Generator</h1>
                        <p className="text-white/70 mt-1">
                            Generate optimized class schedules without conflicts automatically
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                        <Sun className="w-4 h-4 text-amber-300" />
                        <span className="text-sm font-medium">Day: 08:30 - 17:20 (Split)</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                        <Moon className="w-4 h-4 text-blue-300" />
                        <span className="text-sm font-medium">Evening: Tue/Fri Specific</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                        <Zap className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm font-medium">No Third-Party AI</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-green-300" />
                        <span className="text-sm font-medium">Conflict-Free Scheduling</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
