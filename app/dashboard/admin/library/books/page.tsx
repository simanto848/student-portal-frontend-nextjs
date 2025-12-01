"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import type { Book } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function BooksPage() {
  const [items, setItems] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await bookService.getAll({ limit: 50 });
        setItems(res.books);
      } catch {
        toast.error("Failed to load books");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Books</h1>
          <Link
            href="/dashboard/admin/library/books/new"
            className="text-sm px-3 py-2 rounded bg-[#344e41] text-white"
          >
            New Book
          </Link>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Books</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-3">Title</th>
                      <th className="p-3">Author</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((b) => (
                      <tr key={b.id} className="border-b">
                        <td className="p-3">{b.title}</td>
                        <td className="p-3">{b.author}</td>
                        <td className="p-3">{b.category}</td>
                        <td className="p-3">{b.status}</td>
                        <td className="p-3">
                          <Link
                            href={`/dashboard/admin/library/books/${b.id}`}
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
