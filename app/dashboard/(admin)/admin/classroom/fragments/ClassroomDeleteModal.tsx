"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ClassroomDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    workspaceName: string;
    isDeleting: boolean;
}

export function ClassroomDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    workspaceName,
    isDeleting,
}: ClassroomDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white">
                <div className="p-8">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-8 ring-red-50/50">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>

                    <DialogHeader className="text-left p-0">
                        <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
                            Dissolve Workspace?
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 mt-2 text-base leading-relaxed">
                            Are you sure you want to remove <span className="font-bold text-slate-900">"{workspaceName}"</span>? This action is irreversible and will archive all classroom data.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="bg-slate-50 px-8 py-5 flex justify-end gap-3 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-xl px-5 font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
                    >
                        Keep it
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="rounded-xl px-6 font-bold shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Dissolve Now"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
