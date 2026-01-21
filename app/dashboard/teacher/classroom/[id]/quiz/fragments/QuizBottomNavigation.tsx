import React from 'react'
import { notifyError } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function QuizBottomNavigation({ step, setStep, isSubmitting, validateStep, handleSubmit, quizId, steps }: any) {
    return (
        <div className="fixed bottom-2 sm:bottom-4 left-24 right-4 sm:left-34 sm:right-8 lg:left-40 lg:right-10 z-50">
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[24px] p-2 sm:p-3 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    {/* Previous Button */}
                    <Button
                        variant="ghost"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1 || isSubmitting}
                        className="h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {/* Step Indicators */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {steps.map((s: any) => (
                            <div
                                key={s.id}
                                className={cn(
                                    "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300",
                                    step === s.id
                                        ? "bg-[#2dd4bf] scale-125 shadow-md shadow-teal-500/30"
                                        : step > s.id
                                            ? "bg-[#2dd4bf]/40"
                                            : "bg-slate-200 dark:bg-slate-700"
                                )}
                            />
                        ))}
                    </div>

                    {/* Next/Submit Button */}
                    <Button
                        onClick={() => {
                            if (step === 4) {
                                handleSubmit();
                            } else {
                                if (validateStep(step)) {
                                    setStep(Math.min(4, step + 1));
                                } else {
                                    notifyError("Please complete all required fields before proceeding.");
                                }
                            }
                        }}
                        disabled={isSubmitting}
                        className={cn(
                            "h-10 sm:h-12 px-4 sm:px-8 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-95",
                            "bg-[#2dd4bf] text-white hover:bg-[#2dd4bf]/90"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin sm:mr-2" />
                                <span className="hidden sm:inline">Processing...</span>
                            </>
                        ) : step === 4 ? (
                            <>
                                <span className="hidden sm:inline">{quizId ? "Update Quiz" : "Publish Quiz"}</span>
                                <span className="sm:hidden text-xs">{quizId ? "Update" : "Publish"}</span>
                                <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Continue</span>
                                <ArrowRight className="w-4 h-4 sm:ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default QuizBottomNavigation