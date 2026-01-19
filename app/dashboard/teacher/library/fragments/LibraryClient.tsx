"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Search,
    RefreshCw,
    History,
    Bookmark,
    AlertCircle,
    Inbox,
    Filter,
    ChevronRight,
    ArrowRight,
    Library as LibraryIcon,
    Calendar,
    Zap,
    Sparkles,
    Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    useStudentLibraryDashboard,
    useInfiniteAvailableBooks,
    useReserveBook,
    useCancelReservation
} from "@/hooks/queries/useLibraryQueries";
import { useAuth } from "@/contexts/AuthContext";
import { Borrowing, Book, Reservation } from "@/services/library/types";
import {
    BorrowedBookCard,
    BookCard,
    ReservationCard,
    HistoryCard
} from "../LibraryComponents";
import { notifySuccess, notifyError, notifyLoading, dismissToast, notifyInfo } from "@/components/toast";

type TabType = "borrowed" | "reservations" | "history" | "catalog";

interface LibraryClientProps {
    initialData: {
        borrowed: Borrowing[];
        overdue: Borrowing[];
        history: Borrowing[];
        reservations: Reservation[];
    };
}

export default function LibraryClient({ initialData }: LibraryClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("borrowed");
    const [searchQuery, setSearchQuery] = useState("");
    const [catalogSearch, setCatalogSearch] = useState("");

    const {
        borrowed,
        overdue,
        history: activityHistory,
        reservations,
        isLoading,
        isError,
        error,
        refetch
    } = useStudentLibraryDashboard({ initialData });

    const {
        data: infiniteCatalog,
        isLoading: isLoadingCatalog,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteAvailableBooks({ search: catalogSearch });

    const availableBooks = infiniteCatalog?.pages.flatMap((page) => page.books) || [];

    const reserveBookMutation = useReserveBook();
    const cancelReservationMutation = useCancelReservation();

    const filteredBorrowed = useMemo(() => {
        if (!searchQuery) return borrowed;
        const q = searchQuery.toLowerCase();
        return borrowed.filter((item: Borrowing) =>
            item.copy?.book?.title?.toLowerCase().includes(q) ||
            item.copy?.book?.author?.toLowerCase().includes(q)
        );
    }, [borrowed, searchQuery]);

    const filteredReservations = useMemo(() => {
        if (!searchQuery) return reservations;
        const q = searchQuery.toLowerCase();
        return reservations.filter((item: Reservation) =>
            item.copy?.book?.title?.toLowerCase().includes(q) ||
            item.copy?.book?.author?.toLowerCase().includes(q)
        );
    }, [reservations, searchQuery]);

    const filteredHistory = useMemo(() => {
        if (!searchQuery) return activityHistory;
        const q = searchQuery.toLowerCase();
        return activityHistory.filter((item: Borrowing | Reservation) =>
            item.copy?.book?.title?.toLowerCase().includes(q) ||
            item.copy?.book?.author?.toLowerCase().includes(q)
        );
    }, [activityHistory, searchQuery]);

    const handleReturnInfo = () => {
        notifyInfo("Please visit the library physically to return this asset. A librarian will process your return.", {
            duration: 6000,
            position: "bottom-center"
        });
    };



    const handleReserveBook = async (book: Book) => {
        const toastId = notifyLoading(`Securing "${book.title}"...`);

        const libraryId = typeof book.libraryId === 'object'
            ? (book.libraryId as any)._id || (book.libraryId as any).id
            : book.libraryId;

        reserveBookMutation.mutate({
            bookId: book.id,
            libraryId,
            userId: user?.id || "",
            userType: user?.role || "student",
            notes: "Teacher reservation"
        }, {
            onSuccess: () => {
                notifySuccess("Reservation secured", { id: toastId });
                refetch();
            },
            onError: (err: any) => {
                notifyError(err.message || "Reservation failed", { id: toastId });
            }
        });
    };

    const handleCancelReservation = async (id: string) => {
        const toastId = notifyLoading("Cancelling reservation...");
        cancelReservationMutation.mutate(id, {
            onSuccess: () => {
                notifySuccess("Reservation cancelled", { id: toastId });
                refetch();
            },
            onError: (err: any) => {
                notifyError(err.message || "Cancellation failed", { id: toastId });
            }
        });
    };

    const stats = [
        { label: 'Borrowed', value: borrowed.length, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Active Reservations', value: reservations.length, icon: Bookmark, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Overdue', value: overdue.length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-2xl shadow-indigo-500/5">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl opacity-50" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <LibraryIcon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                                Academic Resources
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Library<span className="text-indigo-600"> Hub</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg">
                            Access the global knowledge repository. Manage your borrowings and discover new resources.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            className="h-12 border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Sync Repository
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`${stat.bg} rounded-2xl p-5 border border-white shadow-sm flex items-center gap-4`}
                        >
                            <div className={`p-3 rounded-xl bg-white shadow-sm ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold text-xs uppercase tracking-widest">
                        {error instanceof Error ? error.message : "Synchronization failed. Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-4 mb-8">
                    <TabsList className="h-14 p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/50 w-full xl:w-auto overflow-x-auto no-scrollbar">
                        <TabsTrigger
                            value="borrowed"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            Borrowed ({borrowed.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="reservations"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            Reservations ({reservations.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="catalog"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            Browse Catalog
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-slate-600 data-[state=active]:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            History
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative flex-1 xl:max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={activeTab === 'catalog' ? "Search global catalog..." : "Find in my records..."}
                            value={activeTab === 'catalog' ? catalogSearch : searchQuery}
                            onChange={(e) => activeTab === 'catalog' ? setCatalogSearch(e.target.value) : setSearchQuery(e.target.value)}
                            className="h-14 pl-12 pr-4 bg-white border-slate-200 rounded-2xl font-medium focus:ring-indigo-500/20 text-sm shadow-sm"
                        />
                    </div>
                </div>

                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <TabsContent key="borrowed" value="borrowed" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 gap-4">
                                {filteredBorrowed.length > 0 ? (
                                    filteredBorrowed.map((item: Borrowing, idx: number) => (
                                        <BorrowedBookCard
                                            key={item.id || `borrowed-${idx}`}
                                            item={item}
                                            index={idx}
                                            onReturn={handleReturnInfo}
                                        />
                                    ))
                                ) : (
                                    <EmptyState
                                        icon={BookOpen}
                                        title="No borrowed books"
                                        description={searchQuery ? "No matches for your search." : "Your borrowed list is empty. Browse the catalog to find resources!"}
                                    />
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent key="reservations" value="reservations" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 gap-4">
                                {filteredReservations.length > 0 ? (
                                    filteredReservations.map((item: Reservation, idx: number) => (
                                        <ReservationCard
                                            key={item.id || `res-${idx}`}
                                            item={item}
                                            index={idx}
                                            onCancel={handleCancelReservation}
                                            isCancelling={cancelReservationMutation.isPending}
                                        />
                                    ))
                                ) : (
                                    <EmptyState
                                        icon={Bookmark}
                                        title="No active reservations"
                                        description={searchQuery ? "No matches for your search." : "You don't have any pending book reservations!"}
                                    />
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent key="catalog" value="catalog" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 gap-4">
                                {isLoadingCatalog ? (
                                    <div className="py-12 flex justify-center">
                                        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                                    </div>
                                ) : availableBooks.length > 0 ? (
                                    <>
                                        {availableBooks.map((book: Book, idx: number) => (
                                            <BookCard
                                                key={book.id || `book-${idx}`}
                                                book={book}
                                                index={idx}
                                                onReserve={handleReserveBook}
                                                isReserving={reserveBookMutation.isPending}
                                            />
                                        ))}
                                        {hasNextPage && (
                                            <div className="py-8 flex justify-center">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => fetchNextPage()}
                                                    disabled={isFetchingNextPage}
                                                    className="h-12 px-8 rounded-xl font-black uppercase text-xs tracking-[0.2em] text-indigo-600 hover:bg-indigo-50"
                                                >
                                                    {isFetchingNextPage ? "Expanding..." : "Show More Results"}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <EmptyState
                                        icon={LibraryIcon}
                                        title="Catalog is empty"
                                        description={catalogSearch ? "No books match your criteria." : "No books available in the library at the moment."}
                                    />
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent key="history" value="history" className="mt-0 focus-visible:outline-none">
                            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 overflow-hidden">
                                <div className="flex items-center gap-3 mb-6 px-2">
                                    <History className="h-5 w-5 text-indigo-500" />
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Timeline Activity</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredHistory.length > 0 ? (
                                        filteredHistory.map((item: Borrowing | Reservation, idx: number) => (
                                            <HistoryCard
                                                key={item.id || `hist-${idx}`}
                                                item={item}
                                                index={idx}
                                            />
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 font-medium">
                                            No past activity recorded.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </AnimatePresence>
                </div>
            </Tabs>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200"
        >
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 text-center px-6">
                {title}
            </h3>
            <p className="text-slate-400 font-medium text-center px-6 max-w-sm">
                {description}
            </p>
        </motion.div>
    );
}
