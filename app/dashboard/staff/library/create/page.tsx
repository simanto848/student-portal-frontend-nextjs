"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import type { BookCreatePayload, BookStatus } from "@/services/library";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateBookPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<BookCreatePayload>({
    title: "",
    author: "",
    category: "",
    libraryId: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await bookService.create(payload);
      toast.success("Book created");
      router.push(`/dashboard/staff/library/books/${created.id}`);
    } catch {
      toast.error("Failed to create book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create Book</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={payload.title}
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
                    value={payload.author}
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
                    value={payload.category}
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
                    value={payload.libraryId}
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
              <button
                disabled={submitting}
                className="px-4 py-2 rounded bg-[#344e41] text-white"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
