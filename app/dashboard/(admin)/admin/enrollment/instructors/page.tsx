import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorManagementClient from "./fragments/InstructorManagementClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function InstructorsPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return (
    <DashboardLayout>
      <InstructorManagementClient />
    </DashboardLayout>
  );
}
