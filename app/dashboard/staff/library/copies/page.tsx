"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CopiesPage() {
  const router = useRouter();

  useEffect(() => {
    toast.info("Please select a book to view its copies.");
    router.replace("/dashboard/staff/library/books");
  }, [router]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
        <p className="text-gray-500">Redirecting to Books...</p>
      </div>
    </DashboardLayout>
  );
}
