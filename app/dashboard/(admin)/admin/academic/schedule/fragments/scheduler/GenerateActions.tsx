"use client";

import { Info, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    selectionSummary: string;
    selectedSessionId: string;
    isValidating: boolean;
    isGenerating: boolean;
    onValidate: () => void;
    onGenerate: () => void;
}

export function GenerateActions({
    selectionSummary,
    selectedSessionId,
    isValidating,
    isGenerating,
    onValidate,
    onGenerate,
}: Props) {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
                <Info className="w-4 h-4" />
                <span className="text-sm">{selectionSummary}</span>
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={onValidate}
                    disabled={!selectedSessionId || isValidating}
                    variant="outline"
                    className="h-12 px-6 rounded-xl font-semibold border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                    {isValidating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Validating...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Validate First
                        </>
                    )}
                </Button>

                <Button
                    onClick={onGenerate}
                    disabled={!selectedSessionId || isGenerating}
                    className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all duration-300 hover:shadow-xl hover:shadow-violet-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Schedule
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
