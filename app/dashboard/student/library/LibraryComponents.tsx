"use client";

import { Clock, BookOpen, User, MapPin, AlertCircle, Bookmark, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Borrowing, Book, Reservation } from "@/services/library/types";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion } from "framer-motion";

// --- Book Card (Catalog) ---
export function BookCard({
    book,
    onReserve,
    isReserving
}: {
    book: Book;
    onReserve?: (book: Book) => void;
    isReserving?: boolean;
}) {
    const isAvailable = book.availableCopies && book.availableCopies > 0;

    return (
        <GlassCard className="p-6 group hover:shadow-cyan-500/10 transition-all duration-500">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#0088A9] transition-colors">
                                {book.title}
                            </h4>
                            <StatusBadge
                                status={isAvailable ? "active" : "failed"}
                                label={isAvailable ? "Available" : "Checked Out"}
                            />
                        </div>
                        <p className="text-[10px] font-black text-[#0088A9] uppercase tracking-widest leading-none">
                            {book.author}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <BookOpen className="h-3.5 w-3.5 text-[#0088A9]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{book.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#0088A9]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{book.availableCopies || 0} Copies</span>
                        </div>
                    </div>

                    {book.publisher && (
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                            Published by {book.publisher} {book.publicationYear ? `(${book.publicationYear})` : ''}
                        </p>
                    )}
                </div>

                {onReserve && isAvailable && (
                    <Button
                        size="sm"
                        className="rounded-xl border border-gray-100 bg-white text-[#0088A9] hover:bg-[#0088A9] hover:text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-sm transition-all active:scale-95"
                        onClick={() => onReserve(book)}
                        disabled={isReserving}
                    >
                        {isReserving ? "Processing..." : "Reserve Book"}
                    </Button>
                )}
            </div>
        </GlassCard>
    );
}

// --- Borrowed Book Card ---
export function BorrowedBookCard({
    item,
    onReturn,
    isReturning,
}: {
    item: Borrowing;
    onReturn?: (id: string) => void;
    isReturning?: boolean;
}) {
    const bookDetails = item.copy?.book;
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const daysLeft = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const getStatus = () => {
        if (isOverdue) return "overdue";
        if (daysLeft <= 3) return "warning";
        return "borrowed";
    };

    const getStatusLabel = () => {
        if (isOverdue) return "Overdue";
        if (daysLeft <= 3) return "Due Soon";
        return "Active";
    };

    return (
        <GlassCard className={`p-6 border-2 transition-all duration-500 ${isOverdue ? 'border-rose-400/30' : 'border-transparent'}`}>
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-slate-900 leading-tight">
                                {bookDetails?.title || "Unknown Book"}
                            </h4>
                            <StatusBadge status={getStatus()} label={getStatusLabel()} />
                        </div>
                        <p className="text-[10px] font-black text-[#0088A9] uppercase tracking-widest leading-none">
                            {bookDetails?.author || "Unknown Author"} • ISBN: {bookDetails?.isbn || "N/A"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <Clock className="h-4 w-4 text-[#0088A9]" />
                            <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Due Date</p>
                                <p className={`text-xs font-black ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {dueDate.toLocaleDateString()} {!isOverdue && `(${daysLeft} days left)`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <Bookmark className="h-4 w-4 text-[#0088A9]" />
                            <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Borrow Date</p>
                                <p className="text-xs font-black text-slate-800">
                                    {new Date(item.borrowDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {onReturn && (
                    <Button
                        size="sm"
                        className="rounded-xl bg-slate-100 text-slate-600 hover:bg-[#0088A9] hover:text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-sm transition-all active:scale-95"
                        onClick={() => onReturn(item.id)}
                    >
                        Return Info
                    </Button>
                )}
            </div>
        </GlassCard>
    );
}

// --- Reservation Card ---
export function ReservationCard({
    item,
    onCancel,
    isCancelling,
}: {
    item: Reservation;
    onCancel?: (id: string) => void;
    isCancelling?: boolean;
}) {
    const bookDetails = item.copy?.book;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const isExpired = expiryDate < today;

    return (
        <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-slate-900 leading-tight">
                                {bookDetails?.title || "Pending Reservation"}
                            </h4>
                            <StatusBadge status={item.status === 'pending' ? 'active' : item.status} label={item.status === 'pending' ? 'Active' : item.status.toUpperCase()} />
                        </div>
                        <p className="text-[10px] font-black text-[#0088A9] uppercase tracking-widest">
                            {bookDetails?.author || "Library System"} • Copy: {item.copy?.copyNumber || "N/A"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <Clock className="h-4 w-4 text-[#0088A9]" />
                            <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Expires On</p>
                                <p className={`text-xs font-black ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {expiryDate.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        {item.library && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0088A9]/5 border border-[#0088A9]/10">
                                <MapPin className="h-4 w-4 text-[#0088A9]" />
                                <div>
                                    <p className="text-[8px] font-black text-[#0088A9] uppercase tracking-widest leading-none mb-1">Pickup Library</p>
                                    <p className="text-xs font-black text-slate-900">{item.library.name}</p>
                                </div>
                            </div>
                        )}
                        {!item.library && item.copy?.location && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Shelf Location</p>
                                    <p className="text-xs font-black text-slate-800">{item.copy.location}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {onCancel && item.status === 'pending' && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] h-10 px-6 transition-all"
                        onClick={() => onCancel(item.id)}
                        disabled={isCancelling}
                    >
                        {isCancelling ? "Cancelling..." : "Cancel Reservation"}
                    </Button>
                )}
            </div>
        </GlassCard>
    );
}

// --- History Card (Unified Borrowing & Reservation) ---
export function LibraryHistoryCard({ item }: { item: Borrowing | Reservation }) {
    const isBorrowing = (item as Borrowing).borrowDate !== undefined;
    const bookDetails = item.copy?.book;
    const status = item.status;

    return (
        <div className="group relative p-4 rounded-2xl border border-gray-100 hover:border-[#0088A9]/30 hover:bg-gray-50/50 transition-all duration-300">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-xl ${isBorrowing ? 'bg-gray-100 text-slate-500' : 'bg-[#0088A9]/10 text-[#0088A9]'}`}>
                        {isBorrowing ? <BookOpen className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-black text-slate-900">{bookDetails?.title || "Library Book"}</span>
                            <StatusBadge
                                status={status === 'returned' || status === 'fulfilled' ? 'success' : status}
                                label={status.toUpperCase()}
                            />
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>{isBorrowing ? "Borrowed" : "Reserved"}</span>
                            <span>•</span>
                            <span>{bookDetails?.author}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900 mb-0.5">
                        {isBorrowing ? new Date((item as Borrowing).borrowDate).toLocaleDateString() : new Date((item as Reservation).reservationDate).toLocaleDateString()}
                    </p>
                    {(item as Borrowing).fineAmount !== undefined && (item as Borrowing).fineAmount > 0 && (
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-tight">
                            Fine: ${((item as Borrowing).fineAmount).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
