"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  BookCopyCreatePayload,
  BookCopyStatus,
  Book,
  Library,
} from "@/services/library";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";

export default function CreateCopyPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<BookCopyCreatePayload>({
    copyNumber: "",
    status: "available",
    condition: "good",
    bookId: "",
    libraryId: "",
    location: "",
    notes: "",
    acquisitionDate: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, librariesRes] = await Promise.all([
          bookService.getAll({ limit: 1000 }),
          libraryService.getAll({ limit: 1000 }),
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Ensure acquisitionDate is a Date object or undefined
      const submitPayload = {
        ...payload,
        acquisitionDate: payload.acquisitionDate
          ? new Date(payload.acquisitionDate)
          : undefined,
      };

      const created = await bookCopyService.create(submitPayload);
      toast.success("Book copy created successfully");
      router.push(`/dashboard/admin/library/copies/${created.id}`);
    } catch (error) {
      console.error("Create failed:", error);
      toast.error("Failed to create copy");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
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
            Create Book Copy
          </h1>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>New Copy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="copyNumber">
                    Copy Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="copyNumber"
                    value={payload.copyNumber}
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
                  <Label>
                    Book <span className="text-red-500">*</span>
                  </Label>
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
                  <Label>
                    Library <span className="text-red-500">*</span>
                  </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={payload.condition}
                    onValueChange={(value) =>
                      setPayload({ ...payload, condition: value as any })
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
                  <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                  <Input
                    id="acquisitionDate"
                    type="date"
                    value={
                      payload.acquisitionDate
                        ? new Date(payload.acquisitionDate)
                          .toISOString()
                          .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        acquisitionDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={payload.notes ?? ""}
                  onChange={(e) =>
                    setPayload({ ...payload, notes: e.target.value })
                  }
                  placeholder="Additional notes about this copy..."
                  className="min-h-[100px]"
                />
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
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
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
