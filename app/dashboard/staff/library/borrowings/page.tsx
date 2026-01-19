"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowingService } from "@/services/library/borrowing.service";
import type { Borrowing } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus, RotateCcw, Search, Filter, Calendar, User, BookOpen, AlertCircle, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function BorrowingsPage() {
  const [items, setItems] = useState<Borrowing[]>([]);
  const [filteredItems, setFilteredItems] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBorrowings = async () => {
    try {
      setIsLoading(true);
      const res = await borrowingService.getAll({
        limit: 100,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined
      });
      setItems(res.borrowings);
      setFilteredItems(res.borrowings);
    } catch {
      toast.error("Failed to load borrowings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const handleReturnClick = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setReturnNotes("");
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedBorrowing) return;

    setIsReturning(true);
    try {
      await borrowingService.returnBook(selectedBorrowing.id, {
        notes: returnNotes,
        returnDate: new Date().toISOString(),
      });
      toast.success("Book returned successfully");
      setReturnDialogOpen(false);
      fetchBorrowings();
    } catch (error: any) {
      console.error("Return failed:", error);
      toast.error(error.message || "Failed to return book");
    } finally {
      setIsReturning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "borrowed":
        return <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-cyan-200">Borrowed</Badge>;
      case "returned":
        return <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200">Returned</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">Overdue</Badge>;
      case "lost":
        return <Badge variant="destructive" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Borrowing Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track active loans, process returns, and manage overdue items
            </p>
          </div>
          <Link href="/dashboard/staff/library/borrowings/create">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Issue New Book
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by book, borrower, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm overflow-hidden p-0">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-teal-50/30 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-600" />
                Transaction History
                <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700">
                  {filteredItems.length}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4" />
                Loading records...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-teal-400" />
                </div>
                <p className="font-medium text-slate-900">No borrowings found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[300px]">Book Details</TableHead>
                      <TableHead className="w-[250px]">Borrower</TableHead>
                      <TableHead className="w-[200px]">Timeline</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Fines</TableHead>
                      <TableHead className="text-right w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((b) => (
                      <TableRow key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900 line-clamp-1" title={b.copy?.book?.title}>
                              {b.copy?.book?.title || "Unknown Book"}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                {b.copy?.copyNumber || b.copyId}
                              </span>
                              <span>•</span>
                              <span className="line-clamp-1">{b.copy?.book?.author}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <User className="h-4 w-4 text-teal-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-slate-900">
                                {b.borrower?.fullName || "Unknown User"}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase tracking-wider font-medium border-teal-200 bg-teal-50 text-teal-700">
                                  {b.userType}
                                </Badge>
                                <span className="truncate max-w-[120px]" title={b.borrower?.departmentName}>
                                  {b.borrower?.departmentName || b.borrowerId}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <Calendar className="h-3.5 w-3.5 text-teal-500" />
                              <span className="text-slate-600 w-8">Out:</span>
                              <span className="font-medium text-slate-900">
                                {new Date(b.borrowDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <AlertCircle className={cn("h-3.5 w-3.5",
                                new Date() > new Date(b.dueDate) && b.status === 'borrowed' ? "text-rose-500" : "text-cyan-500"
                              )} />
                              <span className="text-slate-600 w-8">Due:</span>
                              <span className={cn("font-medium",
                                new Date() > new Date(b.dueDate) && b.status === 'borrowed' ? "text-rose-600" : "text-slate-900"
                              )}>
                                {new Date(b.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                        <TableCell>
                          {b.fineAmount > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-rose-600 text-sm">
                                ${b.fineAmount.toFixed(2)}
                              </span>
                              <Badge
                                variant={b.finePaid ? "outline" : "destructive"}
                                className={cn("text-[10px] w-fit h-5 px-1.5",
                                  b.finePaid ? "text-teal-600 border-teal-200 bg-teal-50" : ""
                                )}
                              >
                                {b.finePaid ? "Paid" : "Unpaid"}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8",
                                b.status === 'returned'
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                              )}
                              onClick={() => handleReturnClick(b)}
                              disabled={b.status === 'returned'}
                              title={b.status === 'returned' ? "Already Returned" : "Return Book"}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Link href={`/dashboard/staff/library/borrowings/${b.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/staff/library/borrowings/${b.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-teal-700 hover:bg-teal-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Return Book</DialogTitle>
              <DialogDescription>
                Process the return for this borrowing. This will update the status and inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-teal-50/50 p-3 rounded-lg space-y-2 border border-teal-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Book:</span>
                  <span className="font-medium text-right truncate max-w-[200px]">{selectedBorrowing?.copy?.book?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Copy Number:</span>
                  <span className="font-mono text-teal-700">{selectedBorrowing?.copy?.copyNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Borrower:</span>
                  <span className="font-medium">{selectedBorrowing?.borrower?.fullName}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Return Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any notes about the return (e.g. condition, damage)..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="resize-none border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReturnDialogOpen(false)}
                disabled={isReturning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReturn}
                disabled={isReturning}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              >
                {isReturning ? "Processing..." : "Confirm Return"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
