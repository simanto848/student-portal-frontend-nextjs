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
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, AlertCircle, Search, History } from "lucide-react";
import {
  useStudentLibraryDashboard,
  useReturnBook,
} from "@/hooks/queries/useLibraryQueries";
import { Borrowing } from "@/services/library/types";

export default function StudentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Use React Query hooks for data fetching
  const { borrowed, overdue, history, isLoading, isError, error, refetch } =
    useStudentLibraryDashboard();

  const returnBookMutation = useReturnBook();

  // Filter borrowed books based on search
  const filteredBorrowed = useMemo(() => {
    if (!searchQuery) return borrowed;
    return borrowed.filter((item: Borrowing) =>
      JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [borrowed, searchQuery]);

  // Filter history based on search
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
          refetch();
        },
      },
    );
  };

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-grid" />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={BookOpen}
          label="Library Portal"
          title="Your borrowed books and reading history"
          description="Track borrowed books, due dates, and your complete borrowing history."
          actions={
            <>
              <Button
                size="sm"
                className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Download history
              </Button>
            </>
          }
        >
          {/* Custom stats section for library */}
          <div className="flex gap-3 mt-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[140px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Currently Borrowed
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-3xl font-bold">{borrowed.length}</span>
                <span className="text-sm text-white/70">books</span>
              </div>
            </div>
            <div
              className={`rounded-2xl backdrop-blur p-4 min-w-[140px] shadow-lg ${
                overdue.length > 0 ? "bg-red-500/20" : "bg-white/10"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-white/80">
                Overdue
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-3xl font-bold">{overdue.length}</span>
                <span className="text-sm text-white/70">books</span>
              </div>
            </div>
          </div>
        </DashboardHero>

        {/* Error Alert */}
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

        {/* Overdue Warning */}
        {overdue.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have {overdue.length} overdue book(s). Please return them as
              soon as possible to avoid fines.
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search your library..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="borrowed" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="borrowed">
              Currently Borrowed ({borrowed.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borrowed" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                  <BookOpen className="h-4 w-4 dashboard-accent" /> Currently
                  Borrowed Books
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
                    {searchQuery
                      ? "No borrowed books match your search."
                      : "You don't have any borrowed books."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
                  <History className="h-4 w-4 dashboard-accent" /> Borrowing
                  History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item: Borrowing) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? "No history matches your search."
                      : "No borrowing history available."}
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

// Borrowed Book Card sub-component
function BorrowedBookCard({
  item,
  onReturn,
  isReturning,
}: {
  item: Borrowing;
  onReturn: (id: string) => void;
  isReturning: boolean;
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
              className={`flex items-center gap-1 ${
                isOverdue
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
        <Button
          size="sm"
          variant="outline"
          className="text-[#1a3d32] border-[#3e6253] hover:bg-[#3e6253]/10"
          onClick={() => onReturn(item.id)}
          disabled={isReturning}
        >
          {isReturning ? "Returning..." : "Return"}
        </Button>
      </div>
    </div>
  );
}

// History Card sub-component
function HistoryCard({ item }: { item: Borrowing }) {
  const bookDetails = item.copy?.book;
  const isReturned = item.status === "returned";

  return (
    <div className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold dashboard-title">
              {bookDetails?.title || "Unknown Book"}
            </p>
            {isReturned ? (
              <StatusBadge status="returned" />
            ) : (
              <StatusBadge status={item.status || "borrowed"} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {bookDetails?.author || "Unknown Author"}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>
              Borrowed: {new Date(item.borrowDate).toLocaleDateString()}
            </span>
            {item.returnDate && (
              <span>
                Returned: {new Date(item.returnDate).toLocaleDateString()}
              </span>
            )}
            {item.fineAmount && item.fineAmount > 0 && (
              <span className="text-red-600 font-semibold">
                Fine: ${item.fineAmount.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
