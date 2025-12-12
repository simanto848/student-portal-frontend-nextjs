"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  History,
  Loader2,
} from "lucide-react";
import { borrowingService } from "@/services/library/borrowing.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentLibraryPage() {
  const [borrowed, setBorrowed] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const [borrowedData, overdueData, historyData] = await Promise.all([
        borrowingService.getMyBorrowedBooks(),
        borrowingService.getMyOverdueBooks(),
        borrowingService.getMyBorrowingHistory(),
      ]);

      setBorrowed(borrowedData || []);
      setOverdue(overdueData || []);
      setHistory(historyData || []);
    } catch (err: any) {
      console.error("Failed to fetch library data", err);
      setError("Failed to load library data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBorrowed = borrowed.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[400px] w-full lg:col-span-2" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Library Portal
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Your borrowed books and reading history
              </h1>
              <p className="text-white/75 max-w-2xl">
                Track borrowed books, due dates, and your complete borrowing
                history.
              </p>
              <div className="flex gap-3 flex-wrap pt-1">
                <Button
                  size="sm"
                  className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                  onClick={() => window.location.reload()}
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[140px] shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Currently Borrowed
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-3xl font-bold">{borrowed.length}</span>
                  <span className="text-sm text-white/70">books</span>
                </div>
              </div>
              <div className="rounded-2xl bg-red-500/20 backdrop-blur p-4 min-w-[140px] shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Overdue
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-3xl font-bold">{overdue.length}</span>
                  <span className="text-sm text-white/70">books</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {overdue.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have {overdue.length} overdue book(s). Please return them as
              soon as possible to avoid fines.
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
                <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#3e6253]" /> Currently
                  Borrowed Books
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredBorrowed.length > 0 ? (
                  filteredBorrowed.map((item) => {
                    const bookDetails = item.copy?.book;
                    const dueDate = new Date(item.dueDate);
                    const today = new Date();
                    const isOverdue = dueDate < today;
                    const daysLeft = Math.ceil(
                      (dueDate.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[#1a3d32]">
                                {bookDetails?.title || "Unknown Book"}
                              </p>
                              {isOverdue ? (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                  Overdue
                                </Badge>
                              ) : daysLeft <= 3 ? (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  Due Soon
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {bookDetails?.author || "Unknown Author"} •{" "}
                              {bookDetails?.isbn || "N/A"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Borrowed:{" "}
                                {new Date(item.borrowDate).toLocaleDateString()}
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
                            onClick={async () => {
                              const ok = window.confirm(
                                "Return this book now?"
                              );
                              if (!ok) return;
                              try {
                                await borrowingService.returnBook(item.id, {});
                                await fetchLibraryData();
                              } catch (e) {
                                setError("Failed to return book.");
                              }
                            }}
                          >
                            Return
                          </Button>
                        </div>
                      </div>
                    );
                  })
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
                <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                  <History className="h-4 w-4 text-[#3e6253]" /> Borrowing
                  History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => {
                    const bookDetails = item.copy?.book;
                    const isReturned = item.status === "returned";

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[#1a3d32]">
                                {bookDetails?.title || "Unknown Book"}
                              </p>
                              {isReturned ? (
                                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Returned
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                  {item.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {bookDetails?.author || "Unknown Author"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Borrowed:{" "}
                                {new Date(item.borrowDate).toLocaleDateString()}
                              </span>
                              {item.returnDate && (
                                <span>
                                  Returned:{" "}
                                  {new Date(
                                    item.returnDate
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              {item.fine && item.fine > 0 && (
                                <span className="text-red-600 font-semibold">
                                  Fine: ${item.fine.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
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
