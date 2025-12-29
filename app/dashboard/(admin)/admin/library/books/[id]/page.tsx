"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import type { Book } from "@/services/library";
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
  Tag,
  DollarSign,
  Languages,
  FileText,
  Hash,
  Layers
} from "lucide-react";

export default function ViewBookPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await bookService.getById(id);
        setItem(res);
      } catch {
        toast.error("Failed to load book");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    setIsDeleting(true);
    try {
      await bookService.delete(id);
      toast.success("Book deleted successfully");
      router.push("/dashboard/admin/library/books");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete book");
    } finally {
      setIsDeleting(false);
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
          <h2 className="text-xl font-semibold">Book not found</h2>
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
              <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3" /> {item.author}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
            <Link href={`/dashboard/admin/library/books/${id}/edit`}>
              <Button className="bg-[#344e41] hover:bg-[#2a3f34]">
                <Edit className="w-4 h-4 mr-2" />
                Edit Book
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details Column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Category</span>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        item.status === 'active' ? 'bg-green-600' :
                          item.status === 'inactive' ? 'bg-yellow-600' : 'bg-gray-600'
                      }>
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Subject</span>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-500" />
                      <span>{item.subject || "N/A"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Language</span>
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-gray-500" />
                      <span>{item.language}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Description
                  </span>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {item.description || "No description available."}
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
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-1">
                    <p className="font-medium">{item.library?.name || "Unknown Library"}</p>
                    <p className="text-sm text-muted-foreground">Code: {item.library?.code || "N/A"}</p>
                  </div>
                  <Badge variant="outline">
                    {item.library?.status || "Active"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Details Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publication Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4" /> ISBN
                  </span>
                  <span className="font-medium text-sm">{item.isbn || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Publisher
                  </span>
                  <span className="font-medium text-sm">{item.publisher || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Year
                  </span>
                  <span className="font-medium text-sm">{item.publicationYear || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Edition
                  </span>
                  <span className="font-medium text-sm">{item.edition || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Pages
                  </span>
                  <span className="font-medium text-sm">{item.pages || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Price
                  </span>
                  <span className="font-medium text-sm">
                    {item.price ? `${item.price.toFixed(2)} TK` : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
