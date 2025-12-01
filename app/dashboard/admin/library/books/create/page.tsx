"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService, BookCreatePayload } from "@/services/library/book.service";
import { libraryService } from "@/services/library/library.service";
import type { Library, BookStatus } from "@/services/library";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";

export default function CreateBookPage() {
  const router = useRouter();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loadingLibraries, setLoadingLibraries] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [payload, setPayload] = useState<BookCreatePayload>({
    title: "",
    author: "",
    category: "",
    libraryId: "",
    status: "active",
    language: "English",
    description: "",
    isbn: "",
    publisher: "",
    publicationYear: undefined,
    edition: "",
    subject: "",
    pages: undefined,
    price: undefined,
  });

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const res = await libraryService.getAll({ limit: 100, status: 'active' });
        setLibraries(res.libraries);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load libraries");
      } finally {
        setLoadingLibraries(false);
      }
    };
    fetchLibraries();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payload.libraryId) {
      toast.error("Please select a library");
      return;
    }

    setSubmitting(true);
    try {
      await bookService.create(payload);
      toast.success("Book created successfully");
      router.push("/dashboard/admin/library/books");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Add New Book</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Fields */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="Enter book title"
                    value={payload.title}
                    onChange={(e) =>
                      setPayload({ ...payload, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                  <Input
                    id="author"
                    placeholder="Enter author name"
                    value={payload.author}
                    onChange={(e) =>
                      setPayload({ ...payload, author: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                  <Input
                    id="category"
                    placeholder="e.g. Fiction, Science, History"
                    value={payload.category}
                    onChange={(e) =>
                      setPayload({ ...payload, category: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="library">Library <span className="text-red-500">*</span></Label>
                  <Select
                    value={payload.libraryId}
                    onValueChange={(value) => setPayload({ ...payload, libraryId: value })}
                    disabled={loadingLibraries}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingLibraries ? "Loading libraries..." : "Select a library"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {libraries.map((lib) => (
                        <SelectItem key={lib.id} value={lib.id}>
                          {lib.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Fields */}
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    placeholder="ISBN-13 or ISBN-10"
                    value={payload.isbn}
                    onChange={(e) =>
                      setPayload({ ...payload, isbn: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={payload.status}
                    onValueChange={(value) =>
                      setPayload({
                        ...payload,
                        status: value as BookStatus,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    placeholder="Publisher name"
                    value={payload.publisher}
                    onChange={(e) =>
                      setPayload({ ...payload, publisher: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicationYear">Publication Year</Label>
                  <Input
                    id="publicationYear"
                    type="number"
                    placeholder="YYYY"
                    value={payload.publicationYear ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, publicationYear: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edition">Edition</Label>
                  <Input
                    id="edition"
                    placeholder="e.g. 1st, 2nd, Revised"
                    value={payload.edition}
                    onChange={(e) =>
                      setPayload({ ...payload, edition: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    placeholder="Number of pages"
                    value={payload.pages ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, pages: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={payload.price ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, price: parseFloat(e.target.value) || undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    placeholder="e.g. English"
                    value={payload.language}
                    onChange={(e) =>
                      setPayload({ ...payload, language: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g. Mathematics, Physics"
                    value={payload.subject}
                    onChange={(e) =>
                      setPayload({ ...payload, subject: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="min-h-[100px]"
                  placeholder="Enter book description..."
                  value={payload.description}
                  onChange={(e) =>
                    setPayload({ ...payload, description: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Book
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
