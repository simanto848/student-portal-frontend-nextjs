"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowingService } from "@/services/library/borrowing.service";
import type { Borrowing } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  RotateCcw,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ViewBorrowingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [item, setItem] = useState<Borrowing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBorrowing();
  }, [id]);

  const fetchBorrowing = async () => {
    try {
      const list = await borrowingService.getAll({ limit: 100 });
      const found = list.borrowings.find((b) => b.id === id) ?? null;
      setItem(found);
    } catch {
      toast.error("Failed to load borrowing details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!confirm("Are you sure you want to return this book?")) return;
    setIsReturning(true);
    try {
      await borrowingService.returnBook(id, {
        returnDate: new Date().toISOString()
      });
      toast.success("Book returned successfully");
      fetchBorrowing();
    } catch (error: any) {
      toast.error(error.message || "Failed to return book");
    } finally {
      setIsReturning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "borrowed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "returned": return "bg-green-100 text-green-700 border-green-200";
      case "overdue": return "bg-red-100 text-red-700 border-red-200";
      case "lost": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
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
          <h2 className="text-xl font-semibold">Borrowing Record Not Found</h2>
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
                <h1 className="text-2xl font-bold text-[#344e41]">Borrowing Details</h1>
                <Badge className={cn("capitalize", getStatusColor(item.status))}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className="font-mono">ID: {item.id}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {(item.status === "borrowed" || item.status === "overdue") && (
              <Button
                onClick={handleReturn}
                disabled={isReturning}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {isReturning ? "Returning..." : "Return Book"}
              </Button>
            )}
            <Link href={`/dashboard/staff/library/borrowings/${id}/edit`}>
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
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="font-medium">ISBN:</span>
                        <span className="font-mono">{item.copy?.book?.isbn || "N/A"}</span>
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
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{item.borrower?.fullName || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">User Type</p>
                    <Badge variant="outline" className="capitalize">{item.userType}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{item.borrower?.departmentName || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">ID / Registration</p>
                    <p className="font-mono text-gray-900">{item.borrower?.registrationNumber || item.borrowerId}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{item.borrower?.email || "-"}</p>
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
                    <p className="text-sm text-gray-500 mb-0.5">Borrowed On</p>
                    <p className="font-medium text-gray-900">{new Date(item.borrowDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(item.borrowDate).toLocaleTimeString()}</p>
                  </div>

                  <div className="relative">
                    <div className={cn("absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ring-gray-100",
                      new Date() > new Date(item.dueDate) && item.status === 'borrowed' ? "bg-red-500" : "bg-gray-300"
                    )} />
                    <p className="text-sm text-gray-500 mb-0.5">Due Date</p>
                    <p className={cn("font-medium",
                      new Date() > new Date(item.dueDate) && item.status === 'borrowed' ? "text-red-600" : "text-gray-900"
                    )}>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  {item.returnDate && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-gray-100" />
                      <p className="text-sm text-gray-500 mb-0.5">Returned On</p>
                      <p className="font-medium text-gray-900">{new Date(item.returnDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(item.returnDate).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fines */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#588157]" />
                  Fines & Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Fine Amount</span>
                  <span className="font-bold text-lg text-gray-900">${item.fineAmount?.toFixed(2) || "0.00"}</span>
                </div>
                {item.fineAmount > 0 && (
                  <div className="mt-4">
                    <Badge
                      variant={item.finePaid ? "outline" : "destructive"}
                      className={cn("w-full justify-center py-1",
                        item.finePaid ? "text-green-600 border-green-200 bg-green-50" : ""
                      )}
                    >
                      {item.finePaid ? "PAID" : "UNPAID"}
                    </Badge>
                  </div>
                )}
                {item.fineAmount === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-2">No fines applied</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
