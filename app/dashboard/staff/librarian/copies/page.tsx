"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { BookCopy } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function CopiesPage() {
  const [items, setItems] = useState<BookCopy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await bookCopyService.getAll({ limit: 50 });
        setItems(res.bookCopies);
      } catch {
        toast.error("Failed to load copies");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Book Copies</h1>
          <Link
            href="/dashboard/staff/librarian/copies/new"
            className="text-sm px-3 py-2 rounded bg-[#344e41] text-white"
          >
            New Copy
          </Link>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Copies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-3">Copy #</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c) => (
                      <tr key={c.id} className="border-b">
                        <td className="p-3">{c.copyNumber}</td>
                        <td className="p-3">{c.status}</td>
                        <td className="p-3">{c.location}</td>
                        <td className="p-3">
                          <Link
                            href={`/dashboard/staff/librarian/copies/${c.id}`}
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
