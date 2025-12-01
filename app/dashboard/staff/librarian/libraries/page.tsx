"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { Library } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function LibrariesPage() {
  const [items, setItems] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await libraryService.getAll({ limit: 20 });
        setItems(res.libraries);
      } catch {
        toast.error("Failed to load libraries");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Libraries</h1>
          <Link
            href="/dashboard/staff/librarian/libraries/new"
            className="text-sm px-3 py-2 rounded bg-[#344e41] text-white"
          >
            New Library
          </Link>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Libraries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-3">Name</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((lib) => (
                      <tr key={lib.id} className="border-b">
                        <td className="p-3">{lib.name}</td>
                        <td className="p-3">{lib.code}</td>
                        <td className="p-3">{lib.status}</td>
                        <td className="p-3">
                          <Link
                            href={`/dashboard/staff/librarian/libraries/${lib.id}`}
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
