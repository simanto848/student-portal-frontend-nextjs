"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ClassroomManagementClient from "./fragments/ClassroomManagementClient";

export default function StudentClassroomPage() {
  return (
    <DashboardLayout>
      <ClassroomManagementClient />
    </DashboardLayout>
  );
}
