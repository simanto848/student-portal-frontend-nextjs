"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import Link from "next/link";
import { toast } from "sonner";
import type { Reservation, BookCopy } from "@/services/library";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ViewReservationPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Reservation | null>(null);
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      const reservation = await reservationService.getById(id);
      setItem(reservation);

      if (reservation.copy?.bookId) {
        const bookId = typeof reservation.copy.bookId === 'object'
          ? (reservation.copy.bookId as any)._id || (reservation.copy.bookId as any).id
          : reservation.copy.bookId;

        if (bookId) {
          const copies = await bookCopyService.getAvailableCopiesByBook(bookId);
          setAvailableCopies(copies.filter(c => c.id !== reservation.copyId));
        }
      }
    } catch {
      toast.error("Failed to load reservation details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    setIsProcessing(true);
    try {
      await reservationService.cancel(id);
      toast.success("Reservation cancelled");
      fetchReservation();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel reservation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFulfill = async () => {
    if (!confirm("Are you sure you want to fulfill this reservation?")) return;
    setIsProcessing(true);
    try {
      await reservationService.fulfill(id);
      toast.success("Reservation fulfilled");
      fetchReservation();
    } catch (error: any) {
      toast.error(error.message || "Failed to fulfill reservation");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading reservation details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="text-muted-foreground">Reservation not found</div>
          <Link href="/dashboard/admin/library/reservations">
            <Button variant="outline">Back to Reservations</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/admin/library/reservations" className="text-muted-foreground hover:text-foreground">
                Reservations
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-2xl font-semibold tracking-tight">Reservation Details</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage reservation #{item.id.substring(0, 8)}
            </p>
          </div>
          <div className="flex gap-2">
            {item.status === "pending" && (
              <>
                <Button
                  onClick={handleFulfill}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing ? "Processing..." : "Fulfill Reservation"}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  variant="destructive"
                >
                  {isProcessing ? "Processing..." : "Cancel Reservation"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info - Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* User Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Full Name</div>
                  <div className="text-base font-medium">{item.user?.fullName || "Unknown User"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Email Address</div>
                  <div className="text-base">{item.user?.email || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">User Type</div>
                  <Badge variant="secondary" className="capitalize">{item.userType}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Registration No</div>
                  <div className="text-base font-mono">{item.user?.registrationNumber || "-"}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Department</div>
                  <div className="text-base">{item.user?.departmentName || item.user?.departmentId || "-"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Book & Copy Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Book Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Book Title</div>
                  <div className="text-lg font-medium">{item.copy?.book?.title || "Unknown Book"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Author</div>
                  <div className="text-base">{item.copy?.book?.author || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">ISBN</div>
                  <div className="text-base font-mono">{item.copy?.book?.isbn || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Reserved Copy</div>
                  <Badge variant="outline" className="font-mono">{item.copy?.copyNumber || item.copyId}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Copy Location</div>
                  <div className="text-base">{item.copy?.location || "-"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Available Copies Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Other Available Copies</CardTitle>
              </CardHeader>
              <CardContent>
                {availableCopies.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Copy Number</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Condition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableCopies.map((copy) => (
                          <TableRow key={copy.id}>
                            <TableCell className="font-mono">{copy.copyNumber}</TableCell>
                            <TableCell>{copy.location || "-"}</TableCell>
                            <TableCell className="capitalize">{copy.condition || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No other available copies found for this book.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Reservation Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reservation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <Badge
                    variant={item.status === 'pending' ? 'default' : 'secondary'}
                    className={cn(
                      "capitalize",
                      item.status === 'pending' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                      item.status === 'fulfilled' && "bg-green-100 text-green-800 hover:bg-green-100",
                      item.status === 'expired' && "bg-red-100 text-red-800 hover:bg-red-100",
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Reserved Date</div>
                  <div className="text-base">{new Date(item.reservationDate).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">{new Date(item.reservationDate).toLocaleTimeString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Expiry Date</div>
                  <div className={cn(
                    "text-base font-medium",
                    new Date() > new Date(item.expiryDate) && item.status === 'pending' ? "text-red-600" : ""
                  )}>
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(item.expiryDate).toLocaleTimeString()}</div>
                </div>
                {item.fulfilledAt && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Fulfilled Date</div>
                    <div className="text-base text-green-600">{new Date(item.fulfilledAt).toLocaleDateString()}</div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm italic text-muted-foreground">{item.notes || "No notes provided"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
