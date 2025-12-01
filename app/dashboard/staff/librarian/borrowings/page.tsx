"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { borrowingService } from "@/services/library/borrowing.service";
import type { Borrowing } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function BorrowingsPage() {
  const [items, setItems] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await borrowingService.getAll({ limit: 50 });
        setItems(res.borrowings);
      } catch {
        toast.error("Failed to load borrowings");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Borrowings</h1>
          <Link
            href="/dashboard/staff/librarian/borrowings/create"
            className="text-sm px-3 py-2 rounded bg-[#344e41] text-white"
          >
            New Borrowing
          </Link>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Borrowings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-3">Borrower</th>
                      <th className="p-3">Copy</th>
                      <th className="p-3">Due</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((b) => (
                      <tr key={b.id} className="border-b">
                        <td className="p-3">{b.borrowerId}</td>
                        <td className="p-3">{b.copyId}</td>
                        <td className="p-3">
                          {new Date(b.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">{b.status}</td>
                        <td className="p-3">
                          <Link
                            href={`/dashboard/staff/librarian/borrowings/${b.id}`}
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
