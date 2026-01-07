import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import CourseManagementClient from "./fragments/CourseManagementClient";

export default async function MyCoursesPage() {
  await requireUser("/login", [UserRole.TEACHER]);

  return (
    <DashboardLayout>
      <CourseManagementClient />
    </DashboardLayout>
  );
}
