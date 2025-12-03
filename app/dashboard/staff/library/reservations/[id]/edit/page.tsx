"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import type {
  ReservationUpdatePayload,
  Reservation,
  ReservationStatus,
} from "@/services/library";
import { toast } from "sonner";

export default function EditReservationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Reservation | null>(null);
  const [payload, setPayload] = useState<ReservationUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await reservationService.getAll({ limit: 50 });
        const found = list.reservations.find((r) => r.id === id) ?? null;
        if (found) {
          setItem(found);
          setPayload({
            status: found.status as ReservationStatus,
            notes: found.notes ?? "",
          });
        }
      } catch {
        toast.error("Failed to load reservation");
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const updated = await reservationService.updateStatus(id, payload);
      toast.success("Reservation updated");
      router.push(`/dashboard/staff/library/reservations/${updated.id}`);
    } catch {
      toast.error("Failed to update reservation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Edit Reservation</h1>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
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
                      value={payload.status ?? "pending"}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          status: e.target.value as ReservationStatus,
                        })
                      }
                    >
                      <option value="pending">pending</option>
                      <option value="fulfilled">fulfilled</option>
                      <option value="expired">expired</option>
                      <option value="cancelled">cancelled</option>
                    </select>
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
