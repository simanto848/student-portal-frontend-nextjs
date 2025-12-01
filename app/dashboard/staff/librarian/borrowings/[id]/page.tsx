"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowingService } from "@/services/library/borrowing.service";
import type { Borrowing } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function ViewBorrowingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Borrowing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBorrowing();
  }, [id]);

  const fetchBorrowing = async () => {
    try {
      // TODO: Backend should ideally support GET /:id
      // For now, we might need to rely on getAll or if the backend supports filtering by ID in getAll
      const list = await borrowingService.getAll({ limit: 100 }); // Increase limit to find it
      const found = list.borrowings.find((b) => b.id === id) ?? null;
      setItem(found);
    } catch {
      toast.error("Failed to load borrowing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!confirm("Are you sure you want to return this book?")) return;
    setIsReturning(true);
    try {
      await borrowingService.returnBook(id, {});
      toast.success("Book returned successfully");
      fetchBorrowing();
    } catch (error: any) {
      toast.error(error.message || "Failed to return book");
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Borrowing Details</h1>
          <div className="flex gap-2">
            {item &&
              (item.status === "borrowed" || item.status === "overdue") && (
                <button
                  onClick={handleReturn}
                  disabled={isReturning}
                  className="text-sm px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isReturning ? "Returning..." : "Return Book"}
                </button>
              )}
            {id && (
              <Link
                href={`/dashboard/staff/librarian/borrowings/${id}/edit`}
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
                  <div className="text-sm text-gray-500">Borrower</div>
                  <div className="text-base">{item.borrowerId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Copy</div>
                  <div className="text-base">{item.copyId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Due Date</div>
                  <div className="text-base">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="text-base capitalize">{item.status}</div>
                </div>
                {item.returnDate && (
                  <div>
                    <div className="text-sm text-gray-500">Return Date</div>
                    <div className="text-base">
                      {new Date(item.returnDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {item.fineAmount > 0 && (
                  <div>
                    <div className="text-sm text-gray-500">Fine Amount</div>
                    <div className="text-base text-red-600">
                      ${item.fineAmount} ({item.finePaid ? "Paid" : "Unpaid"})
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
