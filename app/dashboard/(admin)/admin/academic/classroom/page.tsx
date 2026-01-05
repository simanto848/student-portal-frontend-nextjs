import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ClassroomManagementClient } from "./fragments/ClassroomManagementClient";

export const metadata = {
  title: "Classroom Management | Admin Dashboard",
  description: "Manage classrooms and facilities",
};

export default function ClassroomManagementPage() {
  return (
    <DashboardLayout>
      <ClassroomManagementClient />
    </DashboardLayout>
  );
}
