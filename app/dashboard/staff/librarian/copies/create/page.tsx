"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { BookCopyCreatePayload, BookCopyStatus } from "@/services/library";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateCopyPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<BookCopyCreatePayload>({
    copyNumber: "",
    status: "available",
    bookId: "",
    libraryId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await bookCopyService.create(payload);
      toast.success("Book copy created");
      router.push(`/dashboard/staff/librarian/copies/${created.id}`);
    } catch {
      toast.error("Failed to create copy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create Book Copy</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Copy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Copy Number</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={payload.copyNumber}
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
                        ...payload,
                        status: e.target.value as BookCopyStatus,
                      })
                    }
                  >
                    <option value="available">available</option>
                    <option value="reserved">reserved</option>
                    <option value="borrowed">borrowed</option>
                    <option value="maintenance">maintenance</option>
                    <option value="lost">lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Book ID</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={payload.bookId}
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
                    value={payload.libraryId}
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
                {submitting ? "Creating..." : "Create"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
