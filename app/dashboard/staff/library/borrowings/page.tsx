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
import { Eye, Plus, RotateCcw } from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function BorrowingsPage() {
  const [items, setItems] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  const fetchBorrowings = async () => {
    try {
      const res = await borrowingService.getAll({ limit: 50 });
      setItems(res.borrowings);
    } catch {
      toast.error("Failed to load borrowings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

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
    } catch (error) {
      console.error("Return failed:", error);
      toast.error("Failed to return book");
    } finally {
      setIsReturning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "borrowed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Borrowed</Badge>;
      case "returned":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Returned</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Borrowings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage book borrowings and returns
            </p>
          </div>
          <Link href="/dashboard/staff/library/borrowings/create">
            <Button className="bg-[#344e41] hover:bg-[#344e41]/90">
              <Plus className="mr-2 h-4 w-4" />
              New Borrowing
            </Button>
          </Link>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Borrowings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No borrowings found
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="min-w-[200px]">Book</TableHead>
                        <TableHead className="whitespace-nowrap">Copy</TableHead>
                        <TableHead className="min-w-[150px]">Borrower</TableHead>
                        <TableHead className="whitespace-nowrap">User Type</TableHead>
                        <TableHead className="min-w-[200px]">Department</TableHead>
                        <TableHead className="whitespace-nowrap">Reg No</TableHead>
                        <TableHead className="min-w-[150px]">Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fines</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((b) => (
                        <TableRow key={b.id} className="hover:bg-muted/5">
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium line-clamp-2" title={b.copy?.book?.title}>
                                {b.copy?.book?.title || "Unknown Book"}
                              </span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {b.copy?.book?.author}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
                              {b.copy?.copyNumber || b.copyId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm whitespace-nowrap">
                                {b.borrower?.fullName || "Unknown User"}
                              </span>
                              {b.borrower?.email && (
                                <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={b.borrower.email}>
                                  {b.borrower.email}
                                </span>
                              )}
                              {!b.borrower && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  ID: {b.borrowerId.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "capitalize whitespace-nowrap",
                                b.userType === 'student' && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                                b.userType === 'teacher' && "bg-purple-100 text-purple-800 hover:bg-purple-100",
                                b.userType === 'staff' && "bg-orange-100 text-orange-800 hover:bg-orange-100",
                              )}
                            >
                              {b.userType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {b.borrower?.departmentName ? (
                              <span className="text-xs line-clamp-2" title={b.borrower.departmentName}>
                                {b.borrower.departmentName}
                              </span>
                            ) : b.borrower?.departmentId ? (
                              <span className="font-mono text-xs text-muted-foreground" title={b.borrower.departmentId}>
                                {b.borrower.departmentId.substring(0, 8)}...
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {b.borrower?.registrationNumber ? (
                              <span className="font-mono text-xs whitespace-nowrap">
                                {b.borrower.registrationNumber}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1 min-w-[140px]">
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Out:</span>
                                <span className="font-medium">{new Date(b.borrowDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Due:</span>
                                <span className={cn(
                                  "font-medium",
                                  new Date() > new Date(b.dueDate) && b.status === 'borrowed' ? "text-red-600" : ""
                                )}>
                                  {new Date(b.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                              {b.returnDate && (
                                <div className="flex justify-between gap-2">
                                  <span className="text-muted-foreground">In:</span>
                                  <span className="text-green-600 font-medium">{new Date(b.returnDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(b.status)}</TableCell>
                          <TableCell>
                            {b.fineAmount > 0 ? (
                              <div className="flex flex-col gap-1 min-w-[80px]">
                                <span className="font-medium text-red-600">
                                  ${b.fineAmount.toFixed(2)}
                                </span>
                                <Badge variant={b.finePaid ? "outline" : "destructive"} className="text-[10px] w-fit whitespace-nowrap">
                                  {b.finePaid ? "Paid" : "Unpaid"}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className={cn(
                                  "h-8 w-8 transition-colors",
                                  b.status === 'returned'
                                    ? 'text-muted-foreground opacity-50'
                                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200'
                                )}
                                onClick={() => handleReturnClick(b)}
                                disabled={b.status === 'returned'}
                                title={b.status === 'returned' ? "Already Returned" : "Return Book"}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Link href={`/dashboard/staff/library/borrowings/${b.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
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
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Return Book</DialogTitle>
              <DialogDescription>
                Process the return of this book copy.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Book</Label>
                <div className="text-sm font-medium">
                  {selectedBorrowing?.copy?.book?.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  Copy: {selectedBorrowing?.copy?.copyNumber}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any notes about the return (e.g. condition, damage)..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
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
                className="bg-[#344e41] hover:bg-[#344e41]/90"
              >
                {isReturning ? "Returning..." : "Confirm Return"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
