import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import DepartmentManagementClient from "./fragments/DepartmentManagementClient";

export default async function DepartmentManagementPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return <DepartmentManagementClient />;
}
