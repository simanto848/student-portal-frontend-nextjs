"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import NotificationManagementClient from "./fragments/NotificationManagementClient";

export default function StudentNotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationManagementClient />
    </DashboardLayout>
  );
}
