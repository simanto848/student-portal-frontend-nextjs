"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClassesClient } from "./fragments/ClassesClient";

export default function StudentSchedulesPage() {
  return (
    <DashboardLayout>
      <ClassesClient />
    </DashboardLayout>
  );
}
