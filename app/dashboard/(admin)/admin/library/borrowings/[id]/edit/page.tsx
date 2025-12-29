"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowingService } from "@/services/library/borrowing.service";
import type {
  BorrowingUpdatePayload,
  Borrowing,
  BorrowingStatus,
} from "@/services/library";
import { toast } from "sonner";

export default function EditBorrowingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Borrowing | null>(null);
  const [payload, setPayload] = useState<BorrowingUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await borrowingService.getAll({ limit: 50 });
        const found = list.borrowings.find((b) => b.id === id) ?? null;
        if (found) {
          setItem(found);
          setPayload({
            status: found.status as BorrowingStatus,
            notes: found.notes ?? "",
            returnDate: found.returnDate ?? "",
            fineAmount: found.fineAmount ?? 0,
            finePaid: found.finePaid ?? false,
          });
        }
      } catch {
        toast.error("Failed to load borrowing");
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const updated = await borrowingService.updateStatus(id, payload);
      toast.success("Borrowing updated");
      router.push(`/dashboard/admin/library/borrowings/${updated.id}`);
    } catch {
      toast.error("Failed to update borrowing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Borrowing</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Borrowing Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!item ? (
              <div>Loading...</div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={payload.status ?? "borrowed"}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          status: e.target.value as BorrowingStatus,
                        })
                      }
                    >
                      <option value="borrowed">borrowed</option>
                      <option value="returned">returned</option>
                      <option value="overdue">overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Return Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                      value={payload.returnDate ?? ""}
                      onChange={(e) =>
                        setPayload({ ...payload, returnDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Fine Amount</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={payload.fineAmount ?? 0}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          fineAmount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="finePaid"
                      type="checkbox"
                      className="border rounded"
                      checked={payload.finePaid ?? false}
                      onChange={(e) =>
                        setPayload({ ...payload, finePaid: e.target.checked })
                      }
                    />
                    <label htmlFor="finePaid" className="text-sm">
                      Fine Paid
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Notes</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={payload.notes ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, notes: e.target.value })
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
