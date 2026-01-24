"use client";

import { motion } from "framer-motion";
import {
    Clock,
    BookOpen,
    User,
    MapPin,
    AlertCircle,
    Calendar,
    Bookmark,
    History as HistoryIcon,
    ArrowRight,
    MapPinned,
    Info,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Borrowing, Book, Reservation } from "@/services/library/types";
import { cn } from "@/lib/utils";

// --- Book Card (Catalog) ---
export function BookCard({
    book,
    onReserve,
    isReserving,
    index = 0
}: {
    book: Book;
    onReserve?: (book: Book) => void;
    isReserving?: boolean;
    index?: number;
}) {
    const isAvailable = book.availableCopies && book.availableCopies > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                        <div className={cn(
                            "p-4 rounded-2xl transition-all duration-300 group-hover:scale-110",
                            isAvailable ? "bg-indigo-50 text-indigo-500" : "bg-slate-50 text-slate-400"
                        )}>
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h3 className="text-lg font-black tracking-tight text-slate-900 truncate">
                                    {book.title}
                                </h3>
                                <StatusBadge
                                    status={isAvailable ? "active" : "failed"}
                                    label={isAvailable ? "Available" : "Checked Out"}
                                    size="sm"
                                    pill
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
                                <User className="h-4 w-4 text-slate-400" />
                                <span>{book.author}</span>
                                <span className="mx-1 opacity-30">•</span>
                                <span className="text-indigo-600/80 font-bold uppercase text-[10px] tracking-widest">{book.category}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Bookmark className="h-3 w-3" />
                                    Copies: <span className="text-slate-700">{book.availableCopies || 0}</span>
                                </span>
                                {book.language && (
                                    <span className="flex items-center gap-1.5">
                                        <Info className="h-3 w-3" />
                                        Language: <span className="text-slate-700">{book.language}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        {onReserve && isAvailable && (
                            <Button
                                size="lg"
                                className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-xl font-black uppercase text-xs tracking-[0.15em] transition-all active:scale-95"
                                onClick={() => onReserve(book)}
                                disabled={isReserving}
                            >
                                {isReserving ? "Processing..." : "Reserve Now"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --- Borrowed Book Card ---
export function BorrowedBookCard({
    item,
    onReturn,
    isReturning,
    index = 0
}: {
    item: Borrowing;
    onReturn?: (id: string) => void;
    isReturning?: boolean;
    index?: number;
}) {
    const bookDetails = item.copy?.book;
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const getStatusColor = () => {
        if (isOverdue) return "text-rose-500 bg-rose-50 border-rose-100";
        if (daysLeft <= 3) return "text-amber-500 bg-amber-50 border-amber-100";
        return "text-indigo-500 bg-indigo-50 border-indigo-100";
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-xl hover:border-indigo-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-all duration-300", getStatusColor().split(' ')[1], getStatusColor().split(' ')[0])}>
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h3 className="text-lg font-black tracking-tight text-slate-900 truncate">
                                    {bookDetails?.title || "Unknown Book"}
                                </h3>
                                <StatusBadge
                                    status={isOverdue ? "overdue" : daysLeft <= 3 ? "warning" : "borrowed"}
                                    label={isOverdue ? "Overdue" : daysLeft <= 3 ? "Due Soon" : "Active"}
                                    size="sm"
                                    pill
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
                                <User className="h-4 w-4 text-slate-400" />
                                <span>{bookDetails?.author || "Unknown Author"}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-[0.12em]">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>Borrowed: <span className="text-slate-700">{new Date(item.borrowDate).toLocaleDateString()}</span></span>
                                </div>
                                <div className={cn("flex items-center gap-2", isOverdue ? "text-rose-500" : daysLeft <= 3 ? "text-amber-500" : "text-slate-400")}>
                                    <Clock className="h-3 w-3" />
                                    <span>Due Date: <span className={cn("font-black", !isOverdue && daysLeft > 3 ? "text-slate-700" : "")}>{dueDate.toLocaleDateString()} {!isOverdue && `(${daysLeft}d left)`}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        {onReturn && (
                            <Button
                                size="sm"
                                onClick={() => onReturn(item.id)}
                                variant="outline"
                                className="h-10 px-4 rounded-xl font-black uppercase text-[9px] tracking-widest border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                            >
                                How to Return
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --- Reservation Card ---
export function ReservationCard({
    item,
    onCancel,
    isCancelling,
    index = 0
}: {
    item: Reservation;
    onCancel?: (id: string) => void;
    isCancelling?: boolean;
    index?: number;
}) {
    const bookDetails = item.copy?.book;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const isExpired = expiryDate < today;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="p-4 rounded-2xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-all duration-300">
                            <Bookmark className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h3 className="text-lg font-black tracking-tight text-slate-900 truncate">
                                    {bookDetails?.title || "Unknown Book"}
                                </h3>
                                <StatusBadge
                                    status={item.status === 'pending' ? 'active' : item.status}
                                    label={item.status.toUpperCase()}
                                    size="sm"
                                    pill
                                />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
                                <span className="flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-slate-400" />
                                    {bookDetails?.author || "Unknown Author"}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="flex items-center gap-1.5">
                                    <Info className="h-3 w-3 text-slate-400" />
                                    Copy # {item.copy?.copyNumber || "N/A"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-[0.12em]">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>Placed: <span className="text-slate-700">{new Date(item.reservationDate).toLocaleDateString()}</span></span>
                                </div>
                                <div className={cn("flex items-center gap-2", isExpired ? "text-rose-500" : "text-amber-500")}>
                                    <Clock className="h-3 w-3" />
                                    <span>Expires: <span className="font-black">{expiryDate.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span></span>
                                </div>
                            </div>

                            {item.copy?.location && (
                                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 w-fit">
                                    <MapPinned className="h-3 w-3 text-indigo-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Pick up: {item.copy.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        {onCancel && item.status === 'pending' && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-10 px-6 border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                                onClick={() => onCancel(item.id)}
                                disabled={isCancelling}
                            >
                                {isCancelling ? "Wait..." : "Cancel"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div >
    );
}

// --- History Card ---
export function HistoryCard({ item, index = 0 }: { item: Borrowing | Reservation; index?: number }) {
    const isBorrowing = (item as Borrowing).borrowDate !== undefined;
    const bookDetails = item.copy?.book;
    const status = item.status;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
        >
            <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-300">
                <div className={cn(
                    "p-3 rounded-xl",
                    isBorrowing ? "bg-indigo-100/50 text-indigo-500" : "bg-amber-100/50 text-amber-500"
                )}>
                    {isBorrowing ? <HistoryIcon className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-0.5">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                            {bookDetails?.title || "Unknown Book"}
                        </h4>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {isBorrowing ? "BORROWING" : "RESERVATION"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-xs text-slate-500 font-medium">
                            {isBorrowing ? (
                                `Borrowed: ${new Date((item as Borrowing).borrowDate).toLocaleDateString()}`
                            ) : (
                                `Reserved: ${new Date((item as Reservation).reservationDate).toLocaleDateString()}`
                            )}
                        </span>

                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                status === 'returned' || status === 'fulfilled' ? "bg-emerald-500" : "bg-slate-300"
                            )} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{status}</span>
                        </div>

                        {(item as Borrowing).fineAmount > 0 && (
                            <span className="text-rose-500 font-black text-[10px] tracking-widest">
                                FINE: ${((item as Borrowing).fineAmount).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
