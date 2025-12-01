"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import { libraryService } from "@/services/library/library.service";
import type { BookUpdatePayload, Book, BookStatus, Library } from "@/services/library";
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
import { Loader2 } from "lucide-react";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Book | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [payload, setPayload] = useState<BookUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookRes, libRes] = await Promise.all([
          bookService.getById(id),
          libraryService.getAll({ limit: 100 })
        ]);

        setItem(bookRes);
        setLibraries(libRes.libraries);

        setPayload({
          title: bookRes.title,
          author: bookRes.author,
          category: bookRes.category,
          status: bookRes.status,
          description: bookRes.description,
          libraryId: bookRes.libraryId,
          isbn: bookRes.isbn,
          publisher: bookRes.publisher,
          publicationYear: bookRes.publicationYear,
          edition: bookRes.edition,
          price: bookRes.price,
          pages: bookRes.pages,
          language: bookRes.language,
          subject: bookRes.subject
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await bookService.update(id, payload);
      toast.success("Book updated successfully");
      router.push(`/dashboard/admin/library/books/${id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update book");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Edit Book</h1>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={payload.title ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={payload.author ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, author: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={payload.isbn ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, isbn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={payload.category ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, category: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="library">Library</Label>
                  <Select
                    value={payload.libraryId}
                    onValueChange={(value) => setPayload({ ...payload, libraryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a library" />
                    </SelectTrigger>
                    <SelectContent>
                      {libraries.map((lib) => (
                        <SelectItem key={lib.id} value={lib.id}>
                          {lib.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={payload.status ?? "active"}
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
                    value={payload.publisher ?? ""}
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
                    value={payload.edition ?? ""}
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
                    value={payload.language ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, language: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={payload.subject ?? ""}
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
                  value={payload.description ?? ""}
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
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
