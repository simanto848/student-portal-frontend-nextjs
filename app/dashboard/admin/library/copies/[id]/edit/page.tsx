"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { BookCopyUpdatePayload, BookCopy, BookCopyStatus } from "@/services/library";
import { toast } from "sonner";

export default function EditCopyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<BookCopy | null>(null);
  const [payload, setPayload] = useState<BookCopyUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await bookCopyService.getById(id);
        setItem(res);
        setPayload({
          copyNumber: res.copyNumber,
          status: res.status,
          location: res.location,
          bookId: res.bookId,
          libraryId: res.libraryId,
        });
      } catch {
        toast.error("Failed to load copy");
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
      router.push(`/dashboard/admin/library/copies/${id}`);
    } catch {
      toast.error("Failed to update copy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Book Copy</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Copy Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!item ? (
              <div>Loading...</div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Copy Number</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.copyNumber ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, copyNumber: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={payload.status ?? "available"}
                      onChange={(e) =>
                        setPayload({
                        onChange={(e) => setPayload({ ...payload, status: e.target.value as BookCopyStatus })}>
                      <option value="reserved">reserved</option>
                      <option value="borrowed">borrowed</option>
                      <option value="maintenance">maintenance</option>
                      <option value="lost">lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Location</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.location ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, location: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Book ID</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.bookId ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, bookId: e.target.value })
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
