"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, X, AlertCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface InstructorDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export function InstructorDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: InstructorDeleteModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-white border-2 border-slate-100 sm:max-w-[480px] p-0 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500" />

                <div className="p-10">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 15, stiffness: 300 }}
                            className="h-20 w-20 rounded-[1.5rem] bg-rose-50 flex items-center justify-center mb-8 ring-2 ring-rose-100 shadow-xl shadow-rose-100/50"
                        >
                            <Trash2 className="h-10 w-10 text-rose-600" />
                        </motion.div>

                        <AlertDialogTitle className="text-3xl font-black text-slate-900 tracking-tighter mb-3">
                            Terminate Assignment
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-slate-400 font-bold leading-relaxed text-sm max-w-[320px]">
                            This will permanently remove the instructor assignment from the course batch. This operation cannot be reversed.
                        </AlertDialogDescription>

                        <div className="mt-6 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl w-full">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-rose-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Warning</p>
                                    <p className="text-xs text-slate-500 font-medium">Students will lose access to this instructor&apos;s resources</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <AlertDialogCancel asChild>
                            <Button
                                variant="outline"
                                disabled={isDeleting}
                                className="flex-1 border-2 border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 rounded-2xl h-14 font-black uppercase text-xs tracking-widest transition-all active:scale-95"
                            >
                                Abort Operation
                            </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onConfirm();
                                }}
                                disabled={isDeleting}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-200/50 rounded-2xl h-14 font-black uppercase text-xs tracking-widest transition-all active:scale-95"
                            >
                                {isDeleting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span>Terminating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        <span>Confirm Termination</span>
                                    </div>
                                )}
                            </Button>
                        </AlertDialogAction>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors p-2 rounded-xl hover:bg-slate-50"
                >
                    <X className="w-5 h-5" />
                </button>
            </AlertDialogContent>
        </AlertDialog>
    );
}
