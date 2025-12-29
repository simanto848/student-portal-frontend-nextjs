"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { BookCopy } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  User,
  Building2,
  Calendar,
  MapPin,
  Activity,
  FileText,
  Hash,
  Barcode,
} from "lucide-react";

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
      router.push("/dashboard/admin/library/copies");
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
      case "reserved":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
      case "borrowed":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
      case "maintenance":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100/80";
      case "lost":
        return "bg-red-100 text-red-700 hover:bg-red-100/80";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100/80";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
          <h2 className="text-xl font-semibold">Copy not found</h2>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {item.copyNumber}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Barcode className="w-3 h-3" /> Copy Details
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
            <Link href={`/dashboard/admin/library/copies/${id}/edit`}>
              <Button className="bg-[#344e41] hover:bg-[#2a3f34]">
                <Edit className="w-4 h-4 mr-2" />
                Edit Copy
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Details Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Title
                  </span>
                  <p className="text-lg font-medium">
                    {item.book?.title || "Unknown Title"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Author
                  </span>
                  <p>{item.book?.author || "Unknown Author"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4" /> ISBN
                  </span>
                  <p className="font-mono text-sm">
                    {item.book?.isbn || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Library Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {item.library?.name || "Unknown Library"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Code: {item.library?.code || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Shelf Location
                  </span>
                  <p>{item.location || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Details Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Status & Condition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status
                    </span>
                    <div>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(item.status)}
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Condition
                    </span>
                    <div>
                      <Badge variant="outline" className="capitalize">
                        {item.condition || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Acquisition Date
                  </span>
                  <p>
                    {item.acquisitionDate
                      ? new Date(item.acquisitionDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notes
                  </span>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">
                    {item.notes || "No notes available."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
