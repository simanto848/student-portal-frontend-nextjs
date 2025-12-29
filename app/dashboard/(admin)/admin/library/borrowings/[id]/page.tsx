"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { borrowingService } from "@/services/library/borrowing.service";
import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/user/teacher.service";
import { staffService } from "@/services/user/staff.service";
import type { Borrowing } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, BookOpen, User, AlertCircle, CheckCircle2, RotateCcw, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export default function ViewBorrowingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<Borrowing | null>(null);
  const [borrower, setBorrower] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnNotes, setReturnNotes] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  const fetchBorrowing = async () => {
    try {
      // Since backend doesn't have getById for admin yet, we filter from getAll
      const res = await borrowingService.getAll({ limit: 1000 });
      const found = res.borrowings.find((b) => b.id === id) ?? null;
      setItem(found);

      if (found && found.borrowerId) {
        fetchBorrowerDetails(found.borrowerId, found.userType);
      }
    } catch {
      toast.error("Failed to load borrowing details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBorrowerDetails = async (borrowerId: string, userType: string) => {
    try {
      let data;
      switch (userType) {
        case 'student':
          data = await studentService.getById(borrowerId);
          break;
        case 'teacher':
          data = await teacherService.getById(borrowerId);
          break;
        case 'staff':
          data = await staffService.getById(borrowerId);
          break;
        default:
          // Try student as default or handle unknown
          data = await studentService.getById(borrowerId);
      }
      setBorrower(data);
    } catch (error) {
      console.error("Failed to fetch borrower details", error);
    }
  };

  useEffect(() => {
    if (id) fetchBorrowing();
  }, [id]);

  const handleReturnClick = () => {
    setReturnNotes("");
    setReturnDialogOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!item) return;

    setIsReturning(true);
    try {
      await borrowingService.returnBook(item.id, {
        notes: returnNotes,
        returnDate: new Date().toISOString(),
      });
      toast.success("Book returned successfully");
      setReturnDialogOpen(false);
      fetchBorrowing();
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
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Borrowed</Badge>;
      case "returned":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Returned</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-muted-foreground">Loading details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <div className="text-muted-foreground">Borrowing record not found</div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Borrowing Details</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>ID: {item.id}</span>
                <span>•</span>
                <span>{new Date(item.createdAt || "").toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReturnClick}
              disabled={item.status === 'returned'}
              className={item.status === 'returned'
                ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {item.status === 'returned' ? "Returned" : "Return Book"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Title</div>
                    <div className="text-lg font-medium mt-1">{item.copy?.book?.title || "Unknown Title"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Author</div>
                    <div className="text-base mt-1">{item.copy?.book?.author || "Unknown Author"}</div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Copy Number</div>
                    <div className="font-mono mt-1 bg-slate-100 w-fit px-2 py-1 rounded text-sm">
                      {item.copy?.copyNumber || item.copyId}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">ISBN</div>
                    <div className="text-sm mt-1">{item.copy?.book?.isbn || "-"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                    <div className="text-lg font-medium mt-1">{borrower?.fullName || "Loading..."}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Department</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{borrower?.department?.name || "Unknown Department"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Borrower ID</div>
                    <div className="font-mono text-sm mt-1 bg-slate-100 w-fit px-2 py-1 rounded">
                      {item.borrowerId}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">User Type</div>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {item.userType}
                    </Badge>
                  </div>
                  {borrower?.email && (
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-muted-foreground">Email</div>
                      <div className="text-sm mt-1">{borrower.email}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {item.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  Status & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Current Status</div>
                  {getStatusBadge(item.status)}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Borrowed</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.borrowDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Due Date</div>
                      <div className={`text-sm ${new Date() > new Date(item.dueDate) && item.status === 'borrowed' ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {item.returnDate && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Returned</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(item.returnDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {item.fineAmount > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Fines</div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-red-600">
                          ${item.fineAmount.toFixed(2)}
                        </span>
                        <Badge variant={item.finePaid ? "outline" : "destructive"}>
                          {item.finePaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
                  {item.copy?.book?.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  Copy: {item.copy?.copyNumber}
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
