"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { BookCopy } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit,
  Library,
  MapPin,
  Trash2,
  AlertCircle,
  FileText,
  Hash,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ViewCopyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<BookCopy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await bookCopyService.getById(id);
        setItem(res);
      } catch {
        toast.error("Failed to load copy");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this copy?")) return;
    setIsDeleting(true);
    try {
      await bookCopyService.delete(id);
      toast.success("Copy deleted successfully");
      router.push("/dashboard/staff/library/copies");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete copy");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 hover:bg-green-100/80";
      case "borrowed":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
      case "maintenance":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100/80";
      case "lost":
        return "bg-red-100 text-red-700 hover:bg-red-100/80";
      case "reserved":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100/80";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Copy Not Found</h2>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
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
                <h1 className="text-2xl font-bold text-[#344e41]">
                  Copy #{item.copyNumber}
                </h1>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-500 mt-1">
                {item.book?.title} - {item.library?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/staff/library/copies/${id}/edit`}>
              <Button className="bg-[#344e41] hover:bg-[#2a3f34] gap-2">
                <Edit className="h-4 w-4" />
                Edit Copy
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Details */}
          <Card className="border-none shadow-sm md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-[#588157]" />
                Copy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Copy Number</h3>
                      <p className="text-sm text-gray-500 font-mono">{item.copyNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Condition</h3>
                      <p className="text-sm text-gray-500 capitalize">{item.condition || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Location</h3>
                      <p className="text-sm text-gray-500">{item.location || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Book</h3>
                      <Link
                        href={`/dashboard/staff/library/books/${item.bookId}`}
                        className="text-sm text-[#344e41] hover:underline font-medium"
                      >
                        {item.book?.title || "Unknown Book"}
                      </Link>
                      <p className="text-xs text-gray-500">{item.book?.author}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Library className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Library</h3>
                      <p className="text-sm text-gray-500">{item.library?.name || "Unknown Library"}</p>
                      <p className="text-xs text-gray-400">{item.library?.code}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Acquisition Date</h3>
                      <p className="text-sm text-gray-500">
                        {item.acquisitionDate ? new Date(item.acquisitionDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {item.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Notes</h3>
                    <p className="text-sm text-gray-600">{item.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
