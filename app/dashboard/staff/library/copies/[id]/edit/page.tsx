"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import type {
  BookCopyUpdatePayload,
  BookCopy,
  BookCopyStatus,
} from "@/services/library";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function EditCopyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [payload, setPayload] = useState<BookCopyUpdatePayload>({});
  const [books, setBooks] = useState<{ label: string; value: string }[]>([]);
  const [libraries, setLibraries] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [copyRes, booksRes, librariesRes] = await Promise.all([
          bookCopyService.getById(id),
          bookService.getAll({ limit: 1000 }),
          libraryService.getAll({ limit: 100 }),
        ]);

        setPayload({
          copyNumber: copyRes.copyNumber,
          status: copyRes.status,
          location: copyRes.location,
          bookId: copyRes.bookId,
          libraryId: copyRes.libraryId,
          condition: copyRes.condition,
          notes: copyRes.notes,
        });

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
      } catch {
        toast.error("Failed to load copy details");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await bookCopyService.update(id, payload);
      toast.success("Copy updated");
      router.push(`/dashboard/staff/library/copies/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update copy");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard/staff" className="hover:text-[#344e41] flex items-center gap-1">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/dashboard/staff/library/books" className="hover:text-[#344e41]">
            Library
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href={`/dashboard/staff/library/copies/${id}`} className="hover:text-[#344e41]">
            Copy Details
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-gray-900">Edit Copy</span>
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
              <h1 className="text-2xl font-bold text-[#344e41]">Edit Book Copy</h1>
              <p className="text-sm text-gray-500">Update details for this physical copy</p>
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
                        value={payload.bookId || ""}
                        onChange={(val) => setPayload({ ...payload, bookId: val })}
                        placeholder="Select book..."
                      />
                      <p className="text-xs text-gray-500">The book title this copy belongs to.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Library Branch</Label>
                      <SearchableSelect
                        options={libraries}
                        value={payload.libraryId || ""}
                        onChange={(val) => setPayload({ ...payload, libraryId: val })}
                        placeholder="Select library..."
                      />
                      <p className="text-xs text-gray-500">The physical location where this copy is stored.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="copyNumber" className="text-sm font-medium text-gray-700">Copy Number</Label>
                      <Input
                        id="copyNumber"
                        value={payload.copyNumber || ""}
                        onChange={(e) =>
                          setPayload({ ...payload, copyNumber: e.target.value })
                        }
                        required
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
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
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">Shelf Location</Label>
                      <Input
                        id="location"
                        value={payload.location || ""}
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
                      value={payload.notes || ""}
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
                  className="bg-[#344e41] hover:bg-[#2a3f34] min-w-[120px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
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
