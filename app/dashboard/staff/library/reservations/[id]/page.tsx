"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import { borrowingService } from "@/services/library/borrowing.service";
import type { Reservation } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Edit,
  AlertTriangle,
  Clock,
  FileText,
  BookUp,
  XCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ViewReservationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      const list = await reservationService.getAll({ limit: 100 });
      const found = list.reservations.find((r) => r.id === id) ?? null;
      setItem(found);
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

  const handleConvertToBorrowing = async () => {
    if (!item) return;
    if (!confirm("This will create a new borrowing record and fulfill this reservation. Continue?")) return;

    setIsProcessing(true);
    try {
      // 1. Create Borrowing
      const res = await borrowingService.borrow({
        userType: item.userType,
        borrowerId: item.userId,
        copyId: item.copyId,
        libraryId: item.libraryId,
        notes: `Converted from reservation ${item.id}. ${item.notes || ""}`
      });

      // 2. Fulfill Reservation if not already fulfilled
      if (item.status !== 'fulfilled') {
        await reservationService.fulfill(id, "Converted to borrowing");
      }

      toast.success("Successfully converted to borrowing");
      // Redirect to the new borrowing details
      if (res && res.id) {
        router.push(`/dashboard/staff/library/borrowings/${res.id}`);
      } else {
        router.push("/dashboard/staff/library/borrowings");
      }
    } catch (error: any) {
      console.error("Conversion failed:", error);
      toast.error(error.message || "Failed to convert to borrowing");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fulfilled": return "bg-green-100 text-green-800 border-green-200";
      case "expired": return "bg-red-100 text-red-800 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#344e41]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-xl font-semibold">Reservation Not Found</h2>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#344e41]">Reservation Details</h1>
                <Badge className={cn("capitalize", getStatusColor(item.status))}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className="font-mono">ID: {item.id}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-end">
            {(item.status === "pending" || item.status === "fulfilled") && (
              <Button
                onClick={handleConvertToBorrowing}
                disabled={isProcessing}
                className="bg-[#344e41] hover:bg-[#2a3f34] text-white gap-2"
              >
                <BookUp className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Issue Book (Borrow)"}
              </Button>
            )}

            {item.status === "pending" && (
              <>
                <Button
                  onClick={handleFulfill}
                  disabled={isProcessing}
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50 gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Fulfilled
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            <Link href={`/dashboard/staff/library/reservations/${id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Details
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Details */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#588157]" />
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900">{item.copy?.book?.title || "Unknown Title"}</h3>
                    <p className="text-gray-500">{item.copy?.book?.author || "Unknown Author"}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="font-medium">Copy Number:</span>
                        <span className="font-mono bg-gray-100 px-1.5 rounded">{item.copy?.copyNumber || item.copyId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Borrower Details */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-[#588157]" />
                  Requester Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{item.user?.fullName || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">User Type</p>
                    <Badge variant="outline" className="capitalize">{item.userType}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{item.user?.departmentName || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">ID / Registration</p>
                    <p className="font-mono text-gray-900">{item.user?.registrationNumber || item.userId}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{item.user?.email || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#588157]" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 whitespace-pre-wrap">{item.notes || "No notes recorded."}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#588157]" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white ring-1 ring-gray-100" />
                    <p className="text-sm text-gray-500 mb-0.5">Reserved On</p>
                    <p className="font-medium text-gray-900">{new Date(item.reservationDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(item.reservationDate).toLocaleTimeString()}</p>
                  </div>

                  <div className="relative">
                    <div className={cn("absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ring-gray-100",
                      new Date() > new Date(item.expiryDate) && item.status === 'pending' ? "bg-red-500" : "bg-gray-300"
                    )} />
                    <p className="text-sm text-gray-500 mb-0.5">Expires On</p>
                    <p className={cn("font-medium",
                      new Date() > new Date(item.expiryDate) && item.status === 'pending' ? "text-red-600" : "text-gray-900"
                    )}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>

                  {item.fulfilledAt && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-gray-100" />
                      <p className="text-sm text-gray-500 mb-0.5">Fulfilled On</p>
                      <p className="font-medium text-gray-900">{new Date(item.fulfilledAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(item.fulfilledAt).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
