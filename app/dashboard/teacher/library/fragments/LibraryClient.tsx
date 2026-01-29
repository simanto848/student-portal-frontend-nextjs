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
    Library as LibraryIcon
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
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
    const searchParams = useSearchParams();
    const { user } = useAuth();

    // Get initial tab from URL or default to "borrowed"
    const initialTab = (searchParams.get('tab') as TabType) || "borrowed";
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [catalogSearch, setCatalogSearch] = useState("");

    // Update URL when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab as TabType);
        const url = new URL(window.location.href);
        if (tab === "borrowed") {
            url.searchParams.delete('tab');
        } else {
            url.searchParams.set('tab', tab);
        }
        router.replace(url.pathname + url.search, { scroll: false });
    };

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
        { label: 'Borrowed', value: borrowed.length, icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
        { label: 'Active Reservations', value: reservations.length, icon: Bookmark, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        { label: 'Overdue', value: overdue.length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    ];

    return (
        <div className="space-y-8 pb-12 font-display animate-in fade-in duration-500">
            {/* Standard Dashboard Header */}
            <GlassCard className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 shadow-sm backdrop-blur-md">
                            <LibraryIcon className="text-[#2dd4bf] w-6 h-6" />
                        </div>
                        Library Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-1">
                        Access the global knowledge repository and manage resources.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="h-10 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/20 transition-all hover:scale-105 shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Sync Catalog
                    </Button>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className="p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stat.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {isError && (
                <Alert variant="destructive" className="rounded-2xl border-rose-100 bg-rose-50 text-rose-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-bold text-xs uppercase tracking-widest">
                        {error instanceof Error ? error.message : "Synchronization failed. Please try again."}
                    </AlertDescription>
                </Alert>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <GlassCard className="p-1.5 w-full xl:w-auto overflow-x-auto no-scrollbar">
                        <TabsList className="bg-transparent h-auto p-0 gap-1">
                            <TabsTrigger
                                value="borrowed"
                                className="h-10 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Borrowed ({borrowed.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="reservations"
                                className="h-10 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Reservations ({reservations.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="catalog"
                                className="h-10 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Catalog
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="h-10 px-5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                History
                            </TabsTrigger>
                        </TabsList>
                    </GlassCard>

                    <div className="relative flex-1 xl:max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={activeTab === 'catalog' ? "Search global catalog..." : "Find in my records..."}
                            value={activeTab === 'catalog' ? catalogSearch : searchQuery}
                            onChange={(e) => activeTab === 'catalog' ? setCatalogSearch(e.target.value) : setSearchQuery(e.target.value)}
                            className="h-11 pl-12 pr-4 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-[#2dd4bf] text-sm shadow-sm"
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
                            <GlassCard className="p-6 overflow-hidden">
                                <div className="flex items-center gap-3 mb-6 px-2">
                                    <History className="h-5 w-5 text-[#2dd4bf]" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Timeline Activity</h3>
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
                            </GlassCard>
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
            className="py-16 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700"
        >
            <div className="h-20 w-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm">
                <Icon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 text-center px-6">
                {title}
            </h3>
            <p className="text-slate-400 font-medium text-center px-6 max-w-sm">
                {description}
            </p>
        </motion.div>
    );
}
