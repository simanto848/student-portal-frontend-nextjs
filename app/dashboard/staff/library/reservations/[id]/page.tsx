"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import type { Reservation } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function ViewReservationPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      const list = await reservationService.getAll({ limit: 100 });
      const found = list.reservations.find((r) => r.id === id) ?? null;
      setItem(found);
    } catch {
      toast.error("Failed to load reservation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    setIsProcessing(true);
    try {
      await reservationService.cancel(id);
      toast.success("Reservation cancelled");
      fetchReservation();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel reservation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFulfill = async () => {
    if (!confirm("Are you sure you want to fulfill this reservation?")) return;
    setIsProcessing(true);
    try {
      await reservationService.fulfill(id);
      toast.success("Reservation fulfilled");
      fetchReservation();
    } catch (error: any) {
      toast.error(error.message || "Failed to fulfill reservation");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Reservation Details</h1>
          <div className="flex gap-2">
            {item && item.status === "pending" && (
              <>
                <button
                  onClick={handleFulfill}
                  disabled={isProcessing}
                  className="text-sm px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Fulfill"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="text-sm px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Cancel"}
                </button>
              </>
            )}
            {id && (
              <Link
                href={`/dashboard/staff/library/reservations/${id}/edit`}
                className="text-sm px-3 py-2 rounded bg-[#344e41] text-white hover:bg-[#2a3f34]"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading...</div>
            ) : item ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">User</div>
                  <div className="text-base">{item.userId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Copy</div>
                  <div className="text-base">{item.copyId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Expiry</div>
                  <div className="text-base">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="text-base capitalize">{item.status}</div>
                </div>
                {item.fulfilledAt && (
                  <div>
                    <div className="text-sm text-gray-500">Fulfilled At</div>
                    <div className="text-base">
                      {new Date(item.fulfilledAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Notes</div>
                  <div className="text-base">{item.notes || "-"}</div>
                </div>
              </div>
            ) : (
              <div>Not found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
