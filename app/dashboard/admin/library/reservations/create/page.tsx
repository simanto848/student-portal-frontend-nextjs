"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateReservationPage() {
  const router = useRouter();
  const [payload, setPayload] = useState({
    userId: "",
    copyId: "",
    libraryId: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await reservationService.create(payload);
      toast.success("Reservation created successfully");
      router.push(`/dashboard/admin/library/reservations/${created.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create Reservation</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">User ID</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={payload.userId}
                    onChange={(e) =>
                      setPayload({ ...payload, userId: e.target.value })
                    }
                    required
                    placeholder="Enter student/staff ID"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Copy ID</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={payload.copyId}
                    onChange={(e) =>
                      setPayload({ ...payload, copyId: e.target.value })
                    }
                    required
                    placeholder="Enter book copy ID"
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
                    placeholder="Enter library ID"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Notes</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={payload.notes}
                  onChange={(e) =>
                    setPayload({ ...payload, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <button
                disabled={submitting}
                className="px-4 py-2 rounded bg-[#344e41] text-white hover:bg-[#2a3f34] transition-colors"
              >
                {submitting ? "Creating..." : "Create Reservation"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
