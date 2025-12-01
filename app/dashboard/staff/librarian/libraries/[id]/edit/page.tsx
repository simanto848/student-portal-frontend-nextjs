"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { LibraryUpdatePayload, Library } from "@/services/library";
import { toast } from "sonner";

export default function EditLibraryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
import { libraryService } from "@/services/library/library.service";
import type { LibraryUpdatePayload, Library, LibraryStatus } from "@/services/library";
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await libraryService.getById(id);
        setItem(res);
        setPayload({
          name: res.name,
          code: res.code,
          status: res.status,
          description: res.description,
          maxBorrowLimit: res.maxBorrowLimit,
          borrowDuration: res.borrowDuration,
          finePerDay: res.finePerDay,
          reservationHoldDays: res.reservationHoldDays,
        });
      } catch {
        toast.error("Failed to load library");
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await libraryService.update(id, payload);
      toast.success("Library updated");
      router.push(`/dashboard/staff/librarian/libraries/${id}`);
    } catch {
      toast.error("Failed to update library");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Library</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Library Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!item ? (
              <div>Loading...</div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Name</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={payload.name ?? ""}
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
                      value={payload.code ?? ""}
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
                      value={payload.status ?? "active"}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          status: e.target.value as any,
                        })
                      }
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="maintenance">maintenance</option>
                          status: e.target.value as LibraryStatus,
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Max Borrow Limit
                    </label>
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
