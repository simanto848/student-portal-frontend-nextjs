import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PrerequisiteManagementClient } from "./fragments/PrerequisiteManagementClient";

export const metadata = {
  title: "Course Prerequisite Management | Admin Dashboard",
  description: "Manage course dependencies",
};

export default function CoursePrerequisiteManagementPage() {
  return (
    <DashboardLayout>
      <PrerequisiteManagementClient />
    </DashboardLayout>
  );
}
