"use client";

import React from "react";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Calendar, Clock, MapPin, Search, Plus, AlertCircle } from "lucide-react";

export default function ClassroomBookingPage() {
    return (
        <div className="flex flex-col gap-6 font-display animate-in fade-in duration-500">
            {/* Header */}
            <header className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-[#2dd4bf]/20 blur-[60px] opacity-60 dark:opacity-20 pointer-events-none" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar className="text-[#2dd4bf] w-6 h-6" />
                        Classroom Booking
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Schedule and manage your classroom reservations
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            className="w-full bg-white/50 dark:bg-slate-800/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2dd4bf] placeholder-slate-400 transition-all shadow-sm outline-none"
                            placeholder="Search rooms..."
                        />
                    </div>
                    <button className="bg-[#2dd4bf] hover:bg-teal-400 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        New Booking
                    </button>
                </div>
            </header>

            {/* Main Content - Under Construction State */}
            <GlassCard className="rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px] opacity-60 dark:opacity-20 transition-all group-hover:scale-150 duration-700 pointer-events-none" />

                <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-full mb-6 relative z-10">
                    <AlertCircle className="w-12 h-12 text-orange-500" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 relative z-10">
                    Module Under Construction
                </h2>

                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 relative z-10">
                    The classroom booking system is currently being upgraded to provide you with a better scheduling experience. Please check back later.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl relative z-10">
                    <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col items-center gap-2">
                        <MapPin className="w-6 h-6 text-[#2dd4bf]" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Room Directory</span>
                        <span className="text-xs text-slate-500">Coming soon</span>
                    </div>
                    <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Real-time Availability</span>
                        <span className="text-xs text-slate-500">Coming soon</span>
                    </div>
                    <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col items-center gap-2">
                        <Calendar className="w-6 h-6 text-purple-500" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recurring Bookings</span>
                        <span className="text-xs text-slate-500">Coming soon</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
