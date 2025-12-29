"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, AlertCircle, Search, History, Bookmark } from "lucide-react";
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
} from "./LibraryComponents";
import { toast } from "sonner";

export default function StudentLibraryPage() {
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
    const confirmed = window.confirm("Return this book now?");
    if (!confirmed) return;

    returnBookMutation.mutate(
      { id: borrowingId, data: {} },
      {
        onSuccess: () => {
          toast.success("Book returned successfully");
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to return book");
        }
      },
    );
  };

  const handleReserveBook = async (book: Book) => {
    console.log("handleReserveBook called for:", book);

    if (!book.libraryId) {
      toast.error("Library information missing for this book");
      return;
    }

    const libraryId = typeof book.libraryId === 'object'
      ? (book.libraryId as any)._id || (book.libraryId as any).id
      : book.libraryId;

    console.log("Reserving with libraryId:", libraryId);

    const promise = reserveBookMutation.mutateAsync({
      bookId: book.id,
      libraryId,
      userId: user?.id || "",
      userType: user?.role || "student",
      notes: "Self reservation from dashboard"
    });

    toast.promise(promise, {
      loading: 'Finding available copy and reserving...',
      success: (data) => {
        console.log("Reservation successful:", data);
        refetch();
        return `Successfully reserved "${book.title}"`;
      },
      error: (err) => {
        console.error("Reservation failed:", err);
        return err.message || "Failed to reserve book";
      }
    });
  };

  const handleCancelReservation = async (id: string) => {
    toast.promise(cancelReservationMutation.mutateAsync(id), {
      loading: "Cancelling reservation...",
      success: () => {
        refetch();
        return "Reservation cancelled successfully";
      },
      error: (err) => {
        console.error("Cancellation failed:", err);
        return err.message || "Failed to cancel reservation";
      }
    });
  };

  if (isLoading) {
    return <DashboardSkeleton layout="hero-grid" />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHero
          icon={BookOpen}
          label="Library Portal"
          title="Your Library Hub"
          description="Manage your borrowings, reservations, and explore the complete catalog."
          actions={
            <>
              <Button
                size="sm"
                className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </>
          }
        >
          <div className="flex gap-3 mt-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[140px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Borrowed
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-3xl font-bold">{borrowed.length}</span>
                <span className="text-sm text-white/70">books</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[140px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Reservations
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-3xl font-bold">{reservations.length}</span>
                <span className="text-sm text-white/70">active</span>
              </div>
            </div>
            {overdue.length > 0 && (
              <div className="rounded-2xl bg-red-500/20 backdrop-blur p-4 min-w-[140px] shadow-lg border border-red-500/30">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Overdue
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-3xl font-bold text-red-100">{overdue.length}</span>
                  <span className="text-sm text-white/70">books</span>
                </div>
              </div>
            )}
          </div>
        </DashboardHero>

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load library data."}
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search your library..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="borrowed" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
            <TabsTrigger value="borrowed">
              Borrowed ({borrowed.length})
            </TabsTrigger>
            <TabsTrigger value="reservations">
              Reservations ({reservations.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History
            </TabsTrigger>
            <TabsTrigger value="catalog">
              Browse Catalog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borrowed" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                  <BookOpen className="h-4 w-4 dashboard-accent" /> Currently Borrowed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredBorrowed.length > 0 ? (
                  filteredBorrowed.map((item: Borrowing) => (
                    <BorrowedBookCard
                      key={item.id}
                      item={item}
                      onReturn={handleReturnBook}
                      isReturning={returnBookMutation.isPending}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No matches." : "No borrowed books."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                  <Bookmark className="h-4 w-4 dashboard-accent" /> Active Reservations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((item: Reservation) => (
                    <ReservationCard
                      key={item.id}
                      item={item}
                      onCancel={handleCancelReservation}
                      isCancelling={cancelReservationMutation.isPending}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No matches." : "No active reservations."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                  <History className="h-4 w-4 dashboard-accent" /> Library History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item: Borrowing) => (
                    <LibraryHistoryCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No matches." : "No history available."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                placeholder="Search catalog by title, author, or category..."
                className="pl-9"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                  <BookOpen className="h-4 w-4 dashboard-accent" /> Library Catalog
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingCatalog ? (
                  <DashboardSkeleton layout="cards-only" cardCount={3} />
                ) : availableBooks.length > 0 ? (
                  <>
                    {availableBooks.map((book: Book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onReserve={handleReserveBook}
                        isReserving={reserveBookMutation.isPending}
                      />
                    ))}
                    {hasNextPage && (
                      <div className="pt-4 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="text-dashboard-accent hover:bg-dashboard-accent/10"
                        >
                          {isFetchingNextPage ? "Loading more..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {catalogSearch ? "No matches." : "Catalog is empty."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
