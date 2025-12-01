"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { BookCopy } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function ViewCopyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<BookCopy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await bookCopyService.getById(id);
        setItem(res);
      } catch {
        toast.error("Failed to load copy");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this copy?")) return;
    setIsDeleting(true);
    try {
      await bookCopyService.delete(id);
      toast.success("Copy deleted successfully");
      router.push("/dashboard/staff/librarian/copies");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete copy");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Copy Details</h1>
          <div className="flex gap-2">
            {id && (
              <>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <Link
                  href={`/dashboard/staff/librarian/copies/${id}/edit`}
                  className="text-sm px-3 py-2 rounded bg-[#344e41] text-white hover:bg-[#2a3f34]"
                >
                  Edit
                </Link>
              </>
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
                  <div className="text-sm text-gray-500">Copy Number</div>
                  <div className="text-base">{item.copyNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="text-base">{item.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-base">{item.location}</div>
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
