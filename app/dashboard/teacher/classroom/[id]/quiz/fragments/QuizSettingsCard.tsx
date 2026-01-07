"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/services/classroom/quiz.service";
import { cn } from "@/lib/utils";
import {
    Settings,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    Shield,
    Layout
} from "lucide-react";

interface QuizSettingsCardProps {
    quiz: Quiz;
}

export function QuizSettingsCard({ quiz }: QuizSettingsCardProps) {
    const settings = [
        { label: "Shuffle Questions", value: quiz.shuffleQuestions, icon: Layout },
        { label: "Shuffle Options", value: quiz.shuffleOptions, icon: Layout },
        { label: "Show Results", value: quiz.showResultsAfterSubmit, icon: Shield },
        { label: "Show Answers", value: quiz.showCorrectAnswers, icon: CheckCircle2 },
    ];

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/30 p-0">
                <CardHeader className="pb-4 bg-slate-50/50 border-b-2 border-slate-50 p-8">
                    <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                            <Shield className="h-5 w-5" />
                        </div>
                        Quiz Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Target className="w-3 h-3" /> Allowed Attempts
                            </p>
                            <p className="text-2xl font-black text-slate-900">{quiz.maxAttempts}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-100/50 shadow-sm">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Target className="w-3 h-3 text-indigo-500" /> Passing Score
                            </p>
                            <p className="text-2xl font-black text-indigo-700">{quiz.passingScore}%</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {settings.map((s, idx) => (
                            <div key={`${s.label}-${idx}`} className="flex flex-col gap-2 p-5 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-indigo-100 transition-all group">
                                <div className="flex items-center gap-3">
                                    <s.icon className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{s.label}</span>
                                </div>
                                <Badge className={cn(
                                    "rounded-lg px-3 py-1 border-none font-black text-[9px] uppercase tracking-widest shadow-sm",
                                    s.value ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                                )}>
                                    {s.value ? "Active" : "Disabled"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/30 p-0">
                <CardHeader className="pb-4 bg-slate-50/50 border-b-2 border-slate-50 p-8">
                    <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                            <Calendar className="h-5 w-5" />
                        </div>
                        Quiz Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 shadow-sm">
                                <Clock className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
                                <p className="text-sm font-black text-slate-900 italic">
                                    {quiz.startAt ? new Date(quiz.startAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "Always Open"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 shadow-sm">
                                <Clock className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</p>
                                <p className="text-sm font-black text-slate-900 italic">
                                    {quiz.endAt ? new Date(quiz.endAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "No Deadline"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {quiz.instructions && (
                        <div className="mt-8 p-6 rounded-[2rem] bg-amber-50 border-2 border-amber-100 shadow-xl shadow-amber-500/5 relative overflow-hidden group">
                            <div className="absolute -top-6 -right-6 text-amber-200 opacity-20 transform group-hover:rotate-12 transition-transform duration-700">
                                <Shield className="w-24 h-24" />
                            </div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> Instructions for Students
                            </p>
                            <p className="text-sm font-bold text-amber-900/80 leading-relaxed whitespace-pre-wrap relative z-10">
                                {quiz.instructions}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("lucide lucide-info", className)}
        >
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
    );
}
