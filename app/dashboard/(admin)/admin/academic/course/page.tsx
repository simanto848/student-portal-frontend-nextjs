import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseManagementClient } from "./fragments/CourseManagementClient";

export const metadata = {
  title: "Course Management | Admin Dashboard",
  description: "Manage academic courses and curriculum",
};

export default function CourseManagementPage() {
  return (
    <DashboardLayout>
      <CourseManagementClient />
    </DashboardLayout>
  );
}
