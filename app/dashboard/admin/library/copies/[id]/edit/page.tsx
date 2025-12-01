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
  Book,
  Library,
} from "@/services/library";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function EditCopyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<BookCopy | null>(null);
  const [payload, setPayload] = useState<BookCopyUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch Books and Libraries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, librariesRes] = await Promise.all([
          bookService.getAll({ limit: 1000 }), // Fetch enough books
          libraryService.getAll({ limit: 1000 }), // Fetch enough libraries
        ]);
        setBooks(booksRes.books);
        setLibraries(librariesRes.libraries);
      } catch (error) {
        console.error("Failed to fetch form data:", error);
        toast.error("Failed to load books or libraries");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Copy Details
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await bookCopyService.getById(id);
        setItem(res);

        // Handle populated fields
        const bookId =
          typeof res.bookId === "object" && res.bookId !== null
            ? (res.bookId as any)._id || (res.bookId as any).id
            : (res.bookId as string);

        const libraryId =
          typeof res.libraryId === "object" && res.libraryId !== null
            ? (res.libraryId as any)._id || (res.libraryId as any).id
            : (res.libraryId as string);

        setPayload({
          copyNumber: res.copyNumber,
          status: res.status,
          location: res.location,
          bookId: bookId,
          libraryId: libraryId,
        });
      } catch (error) {
        console.error("Failed to fetch copy:", error);
        toast.error("Failed to load copy details");
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await bookCopyService.update(id, payload);
      toast.success("Copy updated successfully");
      router.push(`/dashboard/admin/library/copies/${id}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update copy");
    } finally {
      setSubmitting(false);
    }
  };

  if (!item || loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Book Copy
          </h1>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Copy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="copyNumber">Copy Number</Label>
                  <Input
                    id="copyNumber"
                    value={payload.copyNumber ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, copyNumber: e.target.value })
                    }
                    placeholder="e.g. LIB-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={payload.status}
                    onValueChange={(value) =>
                      setPayload({
                        ...payload,
                        status: value as BookCopyStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="borrowed">Borrowed</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={payload.location ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, location: e.target.value })
                    }
                    placeholder="e.g. Shelf A-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Book</Label>
                  <SearchableSelect
                    options={books.map((b) => ({
                      label: b.title,
                      value: b.id,
                    }))}
                    value={payload.bookId}
                    onChange={(value) =>
                      setPayload({ ...payload, bookId: value })
                    }
                    placeholder="Select book..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Library</Label>
                  <SearchableSelect
                    options={libraries.map((l) => ({
                      label: l.name,
                      value: l.id,
                    }))}
                    value={payload.libraryId}
                    onChange={(value) =>
                      setPayload({ ...payload, libraryId: value })
                    }
                    placeholder="Select library..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
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
                  className="bg-[#344e41] hover:bg-[#344e41]/90"
                >
                  {submitting ? (
                    "Saving..."
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
