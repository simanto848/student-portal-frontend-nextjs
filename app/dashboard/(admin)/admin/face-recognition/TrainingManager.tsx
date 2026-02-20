"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Loader2, Play, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

export function TrainingManager() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [status, setStatus] = useState<any>({ status: "idle", progress: 0, message: "" });
    const [isPolling, setIsPolling] = useState(false);

    const pollStatus = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/training_status");
            const data = await res.json();
            setStatus(data);
            if (data.status === "running") {
                setIsPolling(true);
            } else if (data.status === "idle" && isPolling) {
                setIsPolling(false);
                if (data.progress === 100 && !data.message.includes("failed")) {
                    toast.success("Training completed successfully!");
                } else if (data.message.includes("failed")) {
                    toast.error(data.message);
                }
            }
        } catch (e) {
            console.error("Failed to fetch status:", e);
        }
    };

    // Poll status initially and while running
    useEffect(() => {
        pollStatus();
        let interval: NodeJS.Timeout;
        if (isPolling || status.status === "running") {
            interval = setInterval(pollStatus, 1000);
        }
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPolling, status.status]);

    const startTraining = async (isFresh: boolean = false) => {
        try {
            const res = await fetch("http://localhost:5000/api/train", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fresh: isFresh })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(isFresh ? "Fresh training pipeline started." : "Incremental training pipeline started.");
                setIsPolling(true);
                pollStatus(); // Immediate update
            } else {
                toast.error(data.error || "Failed to start training");
            }
        } catch (e) {
            toast.error("Network error. Is the AI server running?");
            console.error(e);
        }
    };

    const isRunning = status.status === "running";

    return (
        <Card className="border-amber-100 shadow-sm relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-amber-400/20 to-rose-400/10 rounded-full blur-3xl -mr-20 -mt-20 z-0 opacity-60 pointer-events-none" />

            <CardHeader className="relative z-10 border-b border-amber-50 bg-amber-50/10">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <BrainCircuit className="w-5 h-5 text-amber-600" />
                    Model Training Console
                </CardTitle>
                <CardDescription>
                    Retrain the face recognition neural network to incorporate newly enrolled student datasets or sync dataset deletions.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6 p-6">

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 font-mono text-sm leading-relaxed shadow-inner">
                    <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-700/50 pb-3">
                        <div className="flex gap-1.5 opacity-80">
                            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        </div>
                        <span className="ml-2 text-xs font-semibold tracking-wider">console_output.log</span>
                    </div>
                    <div className="min-h-[120px] flex flex-col justify-end">
                        <p className="opacity-40 text-xs mb-2">[{new Date().toLocaleTimeString()}] System ready to process datasets...</p>
                        {status.message && (
                            <p className="text-amber-400 mt-2 flex items-start gap-2 max-w-full break-all font-semibold">
                                <span className="opacity-50">&gt;</span>
                                <span>{status.message}</span>
                            </p>
                        )}
                        {isRunning && (
                            <p className="text-emerald-400 animate-pulse mt-1 font-bold">_</p>
                        )}
                    </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>Pipeline Progress</span>
                        <span className="text-amber-600 bg-amber-100 px-2 rounded-full">{status.progress}%</span>
                    </div>
                    <Progress value={status.progress} className="h-2.5 bg-slate-200 [&>div]:bg-amber-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={() => startTraining(false)}
                        disabled={isRunning}
                        variant="outline"
                        className="w-full bg-amber-50/50 hover:bg-amber-100/50 text-amber-700 border-amber-200 font-bold h-12 shadow-sm transition-all rounded-xl"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-600" />
                                Please wait...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-5 w-5 text-amber-500" />
                                Fast Incremental Training (New Data)
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={() => startTraining(true)}
                        disabled={isRunning}
                        className="w-full bg-linear-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold h-12 shadow-md shadow-slate-200 transition-all border border-slate-700 rounded-xl"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-500" />
                                Pipeline Active...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-5 w-5 text-emerald-400" />
                                Fresh Base Retraining (All Data)
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
