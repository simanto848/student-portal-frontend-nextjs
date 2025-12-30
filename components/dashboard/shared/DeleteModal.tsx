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
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    description = "Are you sure you want to delete this item? This action cannot be undone and the data will be permanently removed.",
    isDeleting = false,
}: DeleteModalProps) {
    const theme = useDashboardTheme();

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-white border-slate-200 sm:max-w-[440px] p-0 overflow-hidden rounded-2xl shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />

                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 ring-1 ring-red-100 shadow-sm"
                        >
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </motion.div>

                        <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            {title}
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                            {description}
                        </AlertDialogDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                        <AlertDialogCancel asChild>
                            <Button
                                variant="outline"
                                disabled={isDeleting}
                                className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-12 font-bold uppercase text-xs tracking-wider transition-all"
                            >
                                Cancel
                            </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    onConfirm();
                                }}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 rounded-xl h-12 font-bold uppercase text-xs tracking-wider transition-all active:scale-95"
                            >
                                {isDeleting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span>Deleting...</span>
                                    </div>
                                ) : (
                                    "Confirm Delete"
                                )}
                            </Button>
                        </AlertDialogAction>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                    <X className="w-5 h-5" />
                </button>
            </AlertDialogContent>
        </AlertDialog>
    );
}
