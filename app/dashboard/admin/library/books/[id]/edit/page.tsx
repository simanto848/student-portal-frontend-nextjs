"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import type { BookUpdatePayload, Book, BookStatus } from "@/services/library";
import { toast } from "sonner";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Book | null>(null);
  const [payload, setPayload] = useState<BookUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);

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
        });
      } catch {
        toast.error("Failed to load book");
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await bookService.update(id, payload);
      toast.success("Book updated");
      router.push(`/dashboard/admin/library/books/${id}`);
    } catch {
      toast.error("Failed to update book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Book</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!item ? (
              <div>Loading...</div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.title ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Author</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.author ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, author: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Category</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.category ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, category: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Library ID</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.libraryId ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, libraryId: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={payload.status ?? "active"}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          status: e.target.value as BookStatus,
                        })
                      }
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="archived">archived</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={payload.description ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, description: e.target.value })
                    }
                  />
                </div>
                <button
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-[#344e41] text-white"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
