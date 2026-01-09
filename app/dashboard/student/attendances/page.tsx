"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import AttendanceManagementClient from "./fragments/AttendanceManagementClient";

export default function StudentAttendancesPage() {
  return (
    <DashboardLayout>
      <AttendanceManagementClient />
    </DashboardLayout>
  );
}
