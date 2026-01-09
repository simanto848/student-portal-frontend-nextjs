"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import GradeManagementClient from "./fragments/GradeManagementClient";

export default function StudentGradesPage() {
  return (
    <DashboardLayout>
      <GradeManagementClient />
    </DashboardLayout>
  );
}
