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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ArrowLeft, Save } from "lucide-react";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Book | null>(null);
  const [payload, setPayload] = useState<BookUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(true);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const res = await libraryService.getAll({ limit: 100, status: "active" });
        setLibraries(res.libraries);
      } catch {
        toast.error("Failed to load libraries");
      } finally {
        setIsLoadingLibraries(false);
      }
    };
    fetchLibraries();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await bookService.getById(id);
        setItem(res);
        setPayload({
          title: res.title,
          author: res.author,
          category: res.category,
          status: res.status,
          description: res.description,
          libraryId: res.libraryId,
          isbn: res.isbn,
          publisher: res.publisher,
          publicationYear: res.publicationYear,
          edition: res.edition,
          language: res.language,
          pages: res.pages,
          price: res.price,
        });
      } catch {
        toast.error("Failed to load book");
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!payload.libraryId) {
      toast.error("Please select a library");
      return;
    }
    setSubmitting(true);
    try {
      await bookService.update(id, payload);
      toast.success("Book updated successfully");
      router.push(`/dashboard/staff/library/books/${id}`);
    } catch {
      toast.error("Failed to update book");
    } finally {
      setSubmitting(false);
    }
  };

  const libraryOptions = libraries.map((lib) => ({
    label: `${lib.name} (${lib.code})`,
    value: lib.id,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
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
            <h1 className="text-2xl font-bold text-[#344e41]">Edit Book</h1>
            <p className="text-gray-500 text-sm">Update book details</p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Book Information</CardTitle>
          </CardHeader>
          <CardContent>
            {!item ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]" />
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      value={payload.title ?? ""}
                      onChange={(e) => setPayload({ ...payload, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                    <Input
                      id="author"
                      value={payload.author ?? ""}
                      onChange={(e) => setPayload({ ...payload, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Input
                      id="category"
                      value={payload.category ?? ""}
                      onChange={(e) => setPayload({ ...payload, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="library">Library Branch <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      options={libraryOptions}
                      value={payload.libraryId}
                      onChange={(value) => setPayload({ ...payload, libraryId: value })}
                      placeholder="Select a library..."
                      disabled={isLoadingLibraries}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={payload.isbn ?? ""}
                      onChange={(e) => setPayload({ ...payload, isbn: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      value={payload.publisher ?? ""}
                      onChange={(e) => setPayload({ ...payload, publisher: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publicationYear">Publication Year</Label>
                    <Input
                      id="publicationYear"
                      type="number"
                      value={payload.publicationYear ?? ""}
                      onChange={(e) => setPayload({ ...payload, publicationYear: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edition">Edition</Label>
                    <Input
                      id="edition"
                      value={payload.edition ?? ""}
                      onChange={(e) => setPayload({ ...payload, edition: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={payload.language ?? ""}
                      onChange={(e) => setPayload({ ...payload, language: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pages">Pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      value={payload.pages ?? ""}
                      onChange={(e) => setPayload({ ...payload, pages: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (TK)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={payload.price ?? ""}
                      onChange={(e) => setPayload({ ...payload, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={payload.status}
                      onValueChange={(value: BookStatus) => setPayload({ ...payload, status: value })}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    className="min-h-[120px]"
                    value={payload.description ?? ""}
                    onChange={(e) => setPayload({ ...payload, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#344e41] hover:bg-[#2a3f34] text-white gap-2 min-w-[150px]"
                  >
                    <Save className="h-4 w-4" />
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
