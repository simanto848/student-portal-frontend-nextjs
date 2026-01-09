"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    Clock,
    AlertCircle,
    Search,
    History,
    Bookmark,
    RefreshCw,
    LibraryBig
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    useStudentLibraryDashboard,
    useReturnBook,
    useInfiniteAvailableBooks,
    useReserveBook,
    useCancelReservation,
} from "@/hooks/queries/useLibraryQueries";
import { Borrowing, Book, Reservation } from "@/services/library/types";
import {
    BorrowedBookCard,
    BookCard,
    ReservationCard,
    LibraryHistoryCard
} from "../LibraryComponents";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LibraryManagementClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [catalogSearch, setCatalogSearch] = useState("");
    const { user } = useAuth();

    const {
        borrowed,
        overdue,
        history,
        reservations,
        isLoading,
        isError,
        error,
        refetch
    } = useStudentLibraryDashboard();

    const {
        data: infiniteCatalog,
        isLoading: isLoadingCatalog,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteAvailableBooks({ search: catalogSearch });

    const availableBooks = infiniteCatalog?.pages.flatMap((page) => page.books) || [];

    const returnBookMutation = useReturnBook();
    const reserveBookMutation = useReserveBook();
    const cancelReservationMutation = useCancelReservation();

    const filteredBorrowed = useMemo(() => {
        if (!searchQuery) return borrowed;
        return borrowed.filter((item: Borrowing) =>
            JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [borrowed, searchQuery]);

    const filteredReservations = useMemo(() => {
        if (!searchQuery) return reservations;
        return reservations.filter((item: Reservation) =>
            JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [reservations, searchQuery]);

    const filteredHistory = useMemo(() => {
        if (!searchQuery) return history;
        return history.filter((item: Borrowing) =>
            JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [history, searchQuery]);

    const handleReturnBook = async (borrowingId: string) => {
        const confirmed = window.confirm("Initiate return sequence for this asset?");
        if (!confirmed) return;

        returnBookMutation.mutate(
            { id: borrowingId, data: {} },
            {
                onSuccess: () => {
                    toast.success("Asset returned to central repository");
                    refetch();
                },
                onError: (err: any) => {
                    toast.error(err.message || "Protocol failure: Return failed");
                }
            },
        );
    };

    const handleReserveBook = async (book: Book) => {
        if (!book.libraryId) {
            toast.error("Source library identifier missing");
            return;
        }

        const libraryId = typeof book.libraryId === 'object'
            ? (book.libraryId as any)._id || (book.libraryId as any).id
            : book.libraryId;

        const promise = reserveBookMutation.mutateAsync({
            bookId: book.id,
            libraryId,
            userId: user?.id || "",
            userType: user?.role || "student",
            notes: "Remote reservation via Student Nexus"
        });

        toast.promise(promise, {
            loading: 'Allocating asset and establishing reservation...',
            success: () => {
                refetch();
                return `Asset "${book.title}" successfully reserved`;
            },
            error: (err) => err.message || "Allocation failure"
        });
    };

    const handleCancelReservation = async (id: string) => {
        toast.promise(cancelReservationMutation.mutateAsync(id), {
            loading: "Decommissioning reservation...",
            success: () => {
                refetch();
                return "Reservation purged successfully";
            },
            error: (err) => err.message || "Decommissioning failure"
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6 flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                <p className="text-slate-500 font-bold animate-pulse">Establishing secure link to Library Hub...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <PageHeader
                title="Knowledge Archive"
                subtitle="Centralized management of physical and digital assets."
                icon={LibraryBig}
                extraActions={
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-bold"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync
                    </Button>
                }
            />

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-700 shadow-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold">
                        {error instanceof Error ? error.message : "Archive link failure."}
                    </AlertDescription>
                </Alert>
            )}

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Assets</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{borrowed.length} Borrowed</p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-600 shadow-lg shadow-cyan-200">
                            <Bookmark className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending Sync</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{reservations.length} Reserved</p>
                        </div>
                    </div>
                </GlassCard>

                {overdue.length > 0 && (
                    <GlassCard className="p-6 border-rose-100 bg-rose-50/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-rose-600 shadow-lg shadow-rose-200">
                                <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Critical Priority</p>
                                <p className="text-2xl font-black text-rose-700 leading-none">{overdue.length} Overdue</p>
                            </div>
                        </div>
                    </GlassCard>
                )}
            </div>

            <Tabs defaultValue="borrowed" className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 h-12">
                        <TabsTrigger value="borrowed" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">
                            Borrowed
                        </TabsTrigger>
                        <TabsTrigger value="reservations" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">
                            Reservations
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">
                            History
                        </TabsTrigger>
                        <TabsTrigger value="catalog" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-cyan-600 data-[state=active]:shadow-lg">
                            Catalog
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-[300px]">
                        <Search className="h-4 w-4 text-cyan-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search Archive..."
                            className="pl-11 bg-white/40 backdrop-blur-sm border-cyan-100 rounded-[1.2rem] h-10 text-sm focus:ring-cyan-500/20 active:scale-[0.99] transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="borrowed" className="mt-0">
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {filteredBorrowed.length > 0 ? (
                                filteredBorrowed.map((item: Borrowing, idx: number) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <BorrowedBookCard
                                            item={item}
                                            onReturn={handleReturnBook}
                                            isReturning={returnBookMutation.isPending}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center">
                                    <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest">No Active Borrowings Detected</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="reservations" className="mt-0">
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {filteredReservations.length > 0 ? (
                                filteredReservations.map((item: Reservation, idx: number) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <ReservationCard
                                            item={item}
                                            onCancel={handleCancelReservation}
                                            isCancelling={cancelReservationMutation.isPending}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center">
                                    <Bookmark className="h-12 w-12 text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest">No Active Reservations Detected</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item: any, idx: number) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        <LibraryHistoryCard item={item} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center">
                                    <History className="h-12 w-12 text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest">Archive History Empty</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="catalog" className="mt-0 space-y-6">
                    <div className="relative">
                        <Search className="h-4 w-4 text-cyan-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search complete Archive Catalog..."
                            className="pl-11 bg-white/40 backdrop-blur-sm border-cyan-100 rounded-[1.2rem] h-12 focus:ring-cyan-500/20 active:scale-[0.99] transition-all shadow-sm"
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-6">
                        {isLoadingCatalog ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : availableBooks.length > 0 ? (
                            <>
                                <AnimatePresence>
                                    {availableBooks.map((book: Book, idx: number) => (
                                        <motion.div
                                            key={book.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <BookCard
                                                book={book}
                                                onReserve={handleReserveBook}
                                                isReserving={reserveBookMutation.isPending}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {hasNextPage && (
                                    <div className="pt-8 flex justify-center">
                                        <Button
                                            variant="ghost"
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            className="rounded-xl border border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 font-black uppercase tracking-widest text-[10px] px-8 py-6 h-auto shadow-sm"
                                        >
                                            {isFetchingNextPage ? "Sourcing Assets..." : "Expand Results"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center">
                                <History className="h-12 w-12 text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">No Catalog Entries Match Search Pattern</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
