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
  CheckCircle,
  CalendarClock,
  Library,
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
      const found = await reservationService.getById(id);
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



  const handleConvertToBorrowing = async () => {
    if (!item) return;
    if (!confirm("This will fulfill the reservation and issue the book to the user. Continue?")) return;

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
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "fulfilled": return "bg-teal-100 text-teal-800 border-teal-200";
      case "expired": return "bg-rose-100 text-rose-800 border-rose-200";
      case "cancelled": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <div className="p-4 bg-amber-50 rounded-full">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Reservation Not Found</h2>
          <p className="text-slate-500">The reservation you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()} variant="outline" className="border-slate-200 hover:bg-slate-50">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        {/* Header Section - Teal Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-800 to-cyan-700 p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                    <CalendarClock className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">Reservation Details</h1>
                  <Badge className={cn("capitalize ml-2", getStatusColor(item.status))}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-cyan-100 text-sm font-mono pl-12">ID: {item.id}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {(item.status === "pending" || item.status === "fulfilled") && (
                <Button
                  onClick={handleConvertToBorrowing}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white gap-2 shadow-lg"
                >
                  <BookUp className="h-4 w-4" />
                  {isProcessing ? "Processing..." : "Fulfill & Issue Asset"}
                </Button>
              )}

              {item.status === "pending" && (
                <Button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="bg-rose-500/20 border border-rose-300/30 text-rose-100 hover:bg-rose-500/30 gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              )}
              <Link href={`/dashboard/staff/library/reservations/${id}/edit`}>
                <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20 gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-12" />
          <div className="absolute right-10 bottom-0 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Details */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-cyan-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="py-4 border-b bg-gradient-to-r from-slate-50/50 to-cyan-50/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-cyan-50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-cyan-600" />
                  </div>
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <BookOpen className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-slate-900">{item.copy?.book?.title || "Unknown Title"}</h3>
                    <p className="text-slate-500">{item.copy?.book?.author || "Unknown Author"}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Copy Number:</span>
                        <Badge variant="outline" className="font-mono bg-teal-50 text-teal-700 border-teal-200">
                          {item.copy?.copyNumber || item.copyId}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Borrower Details */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-teal-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="py-4 border-b bg-gradient-to-r from-slate-50/50 to-teal-50/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-teal-50 rounded-lg">
                    <User className="h-4 w-4 text-teal-600" />
                  </div>
                  Requester Information
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-medium text-slate-900">{item.user?.fullName || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">User Type</p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "capitalize",
                        item.userType === 'student' && "bg-cyan-100 text-cyan-800",
                        item.userType === 'teacher' && "bg-violet-100 text-violet-800",
                        item.userType === 'staff' && "bg-amber-100 text-amber-800",
                        item.userType === 'admin' && "bg-slate-100 text-slate-800"
                      )}
                    >
                      {item.userType}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{item.user?.departmentName || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">ID / Registration</p>
                    <p className="font-mono text-slate-900">{item.user?.registrationNumber || item.userId}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-slate-900">{item.user?.email || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-sky-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="py-4 border-b bg-gradient-to-r from-slate-50/50 to-sky-50/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-sky-50 rounded-lg">
                    <FileText className="h-4 w-4 text-sky-600" />
                  </div>
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <p className="text-slate-700 whitespace-pre-wrap">{item.notes || "No notes recorded."}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-orange-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="py-4 border-b bg-gradient-to-r from-slate-50/50 to-orange-50/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-6">
                <div className="relative pl-5 border-l-2 border-slate-100 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-teal-500 border-2 border-white ring-2 ring-teal-100" />
                    <p className="text-sm text-slate-500 mb-0.5">Reserved On</p>
                    <p className="font-medium text-slate-900">{new Date(item.reservationDate).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400">{new Date(item.reservationDate).toLocaleTimeString()}</p>
                  </div>

                  <div className="relative">
                    <div className={cn("absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ring-2",
                      new Date() > new Date(item.expiryDate) && item.status === 'pending'
                        ? "bg-rose-500 ring-rose-100"
                        : "bg-amber-400 ring-amber-100"
                    )} />
                    <p className="text-sm text-slate-500 mb-0.5">Expires On</p>
                    <p className={cn("font-medium",
                      new Date() > new Date(item.expiryDate) && item.status === 'pending' ? "text-rose-600" : "text-slate-900"
                    )}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  </div>

                  {item.fulfilledAt && (
                    <div className="relative">
                      <div className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-cyan-500 border-2 border-white ring-2 ring-cyan-100" />
                      <p className="text-sm text-slate-500 mb-0.5">Fulfilled On</p>
                      <p className="font-medium text-slate-900">{new Date(item.fulfilledAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{new Date(item.fulfilledAt).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Library Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-violet-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="py-4 border-b bg-gradient-to-r from-slate-50/50 to-violet-50/30">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-violet-50 rounded-lg">
                    <Library className="h-4 w-4 text-violet-600" />
                  </div>
                  Library
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <p className="font-medium text-slate-900">{item.library?.name || "Unknown Library"}</p>
                {item.library?.code && (
                  <Badge variant="outline" className="mt-2 font-mono bg-violet-50 text-violet-700 border-violet-200">
                    {item.library.code}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout >
  );
}
