"use client";

import { Clock, BookOpen, User, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Borrowing, Book, Reservation } from "@/services/library/types";

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
    return (
        <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold dashboard-title">
                            {book.title}
                        </p>
                        <StatusBadge
                            status={book.availableCopies && book.availableCopies > 0 ? "active" : "failed"}
                            label={book.availableCopies && book.availableCopies > 0 ? "Available" : "Unavailable"}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {book.author} • {book.category}
                    </p>
                    {book.publisher && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {book.publisher} {book.publicationYear ? `(${book.publicationYear})` : ''}
                        </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-[#1a3d32]">
                            Copies Available: {book.availableCopies || 0}
                        </span>
                        {book.language && (
                            <span>Language: {book.language}</span>
                        )}
                    </div>
                </div>
                {onReserve && book.availableCopies && book.availableCopies > 0 && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-[#1a3d32] border-[#3e6253] hover:bg-[#3e6253]/10"
                        onClick={() => onReserve(book)}
                        disabled={isReserving}
                    >
                        {isReserving ? "Reserving..." : "Reserve"}
                    </Button>
                )}
            </div>
        </div>
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
        <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold dashboard-title">
                            {bookDetails?.title || "Unknown Book"}
                        </p>
                        <StatusBadge status={getStatus()} label={getStatusLabel()} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {bookDetails?.author || "Unknown Author"} •{" "}
                        {bookDetails?.isbn || "N/A"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Borrowed: {new Date(item.borrowDate).toLocaleDateString()}
                        </span>
                        <span
                            className={`flex items-center gap-1 ${isOverdue
                                ? "text-red-600 font-semibold"
                                : daysLeft <= 3
                                    ? "text-yellow-700 font-semibold"
                                    : ""
                                }`}
                        >
                            <Clock className="h-3 w-3" />
                            Due: {dueDate.toLocaleDateString()}
                            {!isOverdue && ` (${daysLeft} days left)`}
                        </span>
                    </div>
                </div>
                {onReturn && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-[#1a3d32] border-[#3e6253] hover:bg-[#3e6253]/10"
                        onClick={() => onReturn(item.id)}
                        disabled={isReturning}
                    >
                        {isReturning ? "Returning..." : "Return"}
                    </Button>
                )}
            </div>
        </div>
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
        <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold dashboard-title">
                            {bookDetails?.title || "Unknown Book"}
                        </p>
                        <StatusBadge status={item.status === 'pending' ? 'active' : item.status} label={item.status.toUpperCase()} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {bookDetails?.author || "Unknown Author"} • Copy: {item.copy?.copyNumber || "N/A"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Reserved: {new Date(item.reservationDate).toLocaleDateString()}
                        </span>
                        <span className={`flex items-center gap-1 ${isExpired ? "text-red-600 font-semibold" : ""}`}>
                            <Clock className="h-3 w-3" />
                            Expires: {expiryDate.toLocaleString()}
                        </span>
                    </div>
                    {item.copy?.location && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Pickup Location: {item.copy.location}
                        </p>
                    )}
                </div>
                {onCancel && item.status === 'pending' && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => onCancel(item.id)}
                        disabled={isCancelling}
                    >
                        {isCancelling ? "Cancelling..." : "Cancel"}
                    </Button>
                )}
            </div>
        </div>
    );
}

// --- History Card (Unified Borrowing & Reservation) ---
export function HistoryCard({ item }: { item: Borrowing | Reservation }) {
    // Determine if it's a borrowing or reservation
    const isBorrowing = (item as Borrowing).borrowDate !== undefined;
    const bookDetails = item.copy?.book;

    const status = item.status;
    const statusLabel = status.toUpperCase();

    return (
        <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold dashboard-title">
                            {bookDetails?.title || "Unknown Book"}
                        </p>
                        <StatusBadge
                            status={status === 'returned' || status === 'fulfilled' ? 'success' : status}
                            label={statusLabel}
                        />
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            {isBorrowing ? "Borrowing" : "Reservation"}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {bookDetails?.author || "Unknown Author"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {isBorrowing ? (
                            <>
                                <span>Borrowed: {new Date((item as Borrowing).borrowDate).toLocaleDateString()}</span>
                                {(item as Borrowing).returnDate && (
                                    <span>Returned: {new Date((item as Borrowing).returnDate).toLocaleDateString()}</span>
                                )}
                            </>
                        ) : (
                            <>
                                <span>Reserved: {(item as Reservation).reservationDate ? new Date((item as Reservation).reservationDate).toLocaleDateString() : 'N/A'}</span>
                                {item.status === 'fulfilled' && (item as Reservation).fulfilledAt && (
                                    <span>Fulfilled: {new Date((item as Reservation).fulfilledAt!).toLocaleDateString()}</span>
                                )}
                            </>
                        )}

                        {(item as Borrowing).fineAmount !== undefined && (item as Borrowing).fineAmount > 0 && (
                            <span className="text-red-600 font-semibold">
                                Fine: ${((item as Borrowing).fineAmount).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
