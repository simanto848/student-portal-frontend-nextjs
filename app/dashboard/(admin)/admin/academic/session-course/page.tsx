import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SessionCourseManagementClient } from "./fragments/SessionCourseManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Course Management | Admin Dashboard",
  description: "Assign courses to sessions and departments",
};

export default function SessionCourseManagementPage() {
  return (
    <DashboardLayout>
      <SessionCourseManagementClient />
    </DashboardLayout>
  );
}
