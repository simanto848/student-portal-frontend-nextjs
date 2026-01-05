import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import FacultyManagementClient from "./fragments/FacultyManagementClient";

export default async function FacultyManagementPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return <FacultyManagementClient />;
}
