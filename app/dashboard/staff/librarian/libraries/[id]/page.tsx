"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { Library } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";

export default function ViewLibraryPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Library | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await libraryService.getById(id);
        setItem(res);
      } catch {
        toast.error("Failed to load library");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this library?")) return;
    setIsDeleting(true);
    try {
      await libraryService.delete(id);
      toast.success("Library deleted successfully");
      router.push("/dashboard/staff/librarian/libraries");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete library");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Library Details</h1>
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
                  href={`/dashboard/staff/librarian/libraries/${id}/edit`}
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
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="text-base">{item.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Code</div>
                  <div className="text-base">{item.code}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="text-base">{item.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Borrow Limit</div>
                  <div className="text-base">{item.maxBorrowLimit}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="text-base">{item.description}</div>
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
