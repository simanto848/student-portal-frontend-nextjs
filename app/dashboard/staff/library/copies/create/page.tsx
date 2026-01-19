"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { bookService } from "@/services/library/book.service";
import { libraryService } from "@/services/library/library.service";
import type { BookCopyCreatePayload, BookCopyStatus } from "@/services/library";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function CreateCopyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledBookId = searchParams?.get("bookId");

  const [payload, setPayload] = useState<BookCopyCreatePayload>({
    copyNumber: "",
    status: "available",
    bookId: prefilledBookId || "",
    libraryId: "",
    condition: "excellent",
    location: "",
    notes: "",
  });

  const [books, setBooks] = useState<{ label: string; value: string }[]>([]);
  const [libraries, setLibraries] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [booksRes, librariesRes] = await Promise.all([
          bookService.getAll({ limit: 1000 }), // Fetch enough books for selection
          libraryService.getAll({ limit: 100 }),
        ]);

        setBooks(
          booksRes.books.map((b) => ({
            label: `${b.title} (${b.author})`,
            value: b.id,
          }))
        );

        setLibraries(
          librariesRes.libraries.map((l) => ({
            label: `${l.name} (${l.code})`,
            value: l.id,
          }))
        );

        if (prefilledBookId) {
          const book = booksRes.books.find(b => b.id === prefilledBookId);
          if (book && book.libraryId) {
            setPayload(prev => ({ ...prev, libraryId: book.libraryId }));
          }
        }

      } catch {
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [prefilledBookId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.bookId || !payload.libraryId) {
      toast.error("Please select both a book and a library");
      return;
    }
    setSubmitting(true);
    try {
      const created = await bookCopyService.create(payload);
      toast.success("Book copy created");
      if (prefilledBookId) {
        router.push(`/dashboard/staff/library/books/${prefilledBookId}`);
      } else {
        router.push(`/dashboard/staff/library/copies/${created.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create copy");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-slate-500">
          <Link href="/dashboard/staff" className="hover:text-teal-600 flex items-center gap-1">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/dashboard/staff/library/books" className="hover:text-teal-600">
            Library
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-slate-900">Create Copy</span>
        </nav>

        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-slate-800">Create Book Copy</h1>
              <p className="text-sm text-slate-500">Add a new physical copy to the library inventory</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Copy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Core Info */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Book Selection</Label>
                      <SearchableSelect
                        options={books}
                        value={payload.bookId}
                        onChange={(val) => setPayload({ ...payload, bookId: val })}
                        placeholder="Select book..."
                        disabled={!!prefilledBookId}
                      />
                      <p className="text-xs text-slate-500">Select the book title this copy belongs to.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Library Branch</Label>
                      <SearchableSelect
                        options={libraries}
                        value={payload.libraryId}
                        onChange={(val) => setPayload({ ...payload, libraryId: val })}
                        placeholder="Select library..."
                      />
                      <p className="text-xs text-slate-500">The physical location where this copy is stored.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="copyNumber" className="text-sm font-medium text-slate-700">Copy Number</Label>
                      <Input
                        id="copyNumber"
                        value={payload.copyNumber}
                        onChange={(e) =>
                          setPayload({ ...payload, copyNumber: e.target.value })
                        }
                        placeholder="e.g. CP-2024-001"
                        required
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-slate-700">Status</Label>
                      <Select
                        value={payload.status}
                        onValueChange={(val) =>
                          setPayload({ ...payload, status: val as BookCopyStatus })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="borrowed">Borrowed</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Additional Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="condition" className="text-sm font-medium text-gray-700">Condition</Label>
                      <Select
                        value={payload.condition}
                        onValueChange={(val) =>
                          setPayload({ ...payload, condition: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">Shelf Location</Label>
                      <Input
                        id="location"
                        value={payload.location}
                        onChange={(e) =>
                          setPayload({ ...payload, location: e.target.value })
                        }
                        placeholder="e.g. Shelf A-1, Row 3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                    <Input
                      id="notes"
                      value={payload.notes}
                      onChange={(e) =>
                        setPayload({ ...payload, notes: e.target.value })
                      }
                      placeholder="Any additional notes about this copy..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 min-w-[120px] text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Copy
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function CreateCopyPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    }>
      <CreateCopyContent />
    </Suspense>
  );
}
