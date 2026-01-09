"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import LibraryManagementClient from "./fragments/LibraryManagementClient";

export default function StudentLibraryPage() {
  return (
    <DashboardLayout>
      <LibraryManagementClient />
    </DashboardLayout>
  );
}
