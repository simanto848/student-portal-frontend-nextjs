"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import type { Book } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit,
  Info,
  Library as LibraryIcon,
  Trash2,
  User,
  Tag,
  Globe,
  FileText,
  DollarSign,
  Layers,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
      router.push("/dashboard/staff/library/books");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete book");
    } finally {
      setIsDeleting(false);
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
          <h2 className="text-xl font-semibold">Book Not Found</h2>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
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
                <h1 className="text-2xl font-bold text-[#344e41]">{item.title}</h1>
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                  className={
                    item.status === "active"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {item.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  {item.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/staff/library/books/${id}/edit`}>
              <Button className="bg-[#344e41] hover:bg-[#2a3f34] gap-2">
                <Edit className="h-4 w-4" />
                Edit Book
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Info className="h-5 w-5 text-[#588157]" />
                  Book Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">ISBN</h3>
                        <p className="text-sm text-gray-500 font-mono">{item.isbn || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Publisher</h3>
                        <p className="text-sm text-gray-500">{item.publisher || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Publication Year</h3>
                        <p className="text-sm text-gray-500">{item.publicationYear || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Layers className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Edition</h3>
                        <p className="text-sm text-gray-500">{item.edition || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Language</h3>
                        <p className="text-sm text-gray-500">{item.language || "English"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Pages</h3>
                        <p className="text-sm text-gray-500">{item.pages || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Availability Card */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <CheckCircle className="h-5 w-5 text-[#588157]" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-700">Available Copies</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-2xl font-bold text-gray-900">
                      {item.availableCopies !== undefined ? item.availableCopies : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">Currently in library</p>
                  </div>
                </div>

                {item.library && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <LibraryIcon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-700">Library Branch</span>
                    </div>
                    <div className="pl-12">
                      <p className="text-lg font-semibold text-gray-900">{item.library.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{item.library.code}</p>
                    </div>
                  </div>
                )}

                {item.price && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-700">Price</span>
                    </div>
                    <div className="pl-12">
                      <p className="text-xl font-bold text-gray-900">{item.price} TK</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
