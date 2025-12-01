"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import type { Reservation, ReservationStatus } from "@/services/library";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const allowed: ReservationStatus[] = [
    "pending",
    "fulfilled",
    "expired",
    "cancelled",
  ];
  const status: ReservationStatus | undefined = allowed.includes(
    statusParam as ReservationStatus
  )
    ? (statusParam as ReservationStatus)
    : undefined;

  useEffect(() => {
    (async () => {
      try {
        const res = await reservationService.getAll({
          limit: 50,
          status,
        });
        setItems(res.reservations);
      } catch {
        toast.error("Failed to load reservations");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [status]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Reservations {status ? `(${status})` : ""}
          </h1>
          <Link
            href="/dashboard/admin/library/reservations/create"
            className="text-sm px-3 py-2 rounded bg-[#344e41] text-white"
          >
            New Reservation
          </Link>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-3">User</th>
                      <th className="p-3">Copy</th>
                      <th className="p-3">Expiry</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="p-3">{r.userId}</td>
                        <td className="p-3">{r.copyId}</td>
                        <td className="p-3">
                          {new Date(r.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">{r.status}</td>
                        <td className="p-3">
                          <Link
                            href={`/dashboard/admin/library/reservations/${r.id}`}
                            className="text-[#344e41] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
