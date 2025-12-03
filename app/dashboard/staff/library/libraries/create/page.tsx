"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { LibraryCreatePayload, LibraryStatus } from "@/services/library";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateLibraryPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<LibraryCreatePayload>({
    name: "",
    code: "",
    status: "active",
    maxBorrowLimit: 3,
    borrowDuration: 14,
    finePerDay: 0,
    reservationHoldDays: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await libraryService.create(payload);
      toast.success("Library created");
      router.push(`/dashboard/staff/library/libraries/${created.id}`);
    } catch {
      toast.error("Failed to create library");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create Library</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Library Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={payload.name}
                    onChange={(e) =>
                      setPayload({ ...payload, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Code</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={payload.code}
                    onChange={(e) =>
                      setPayload({ ...payload, code: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={payload.status}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        status: e.target.value as LibraryStatus,
                      })
                    }
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="maintenance">maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Max Borrow Limit</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={payload.maxBorrowLimit ?? 0}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        maxBorrowLimit: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Borrow Duration (days)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={payload.borrowDuration ?? 0}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        borrowDuration: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Fine Per Day</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={payload.finePerDay ?? 0}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        finePerDay: Number(e.target.value),
                      })
                    }
                  />
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
                {submitting ? "Creating..." : "Create"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
