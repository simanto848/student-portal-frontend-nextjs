import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import SessionManagementClient from "./fragments/SessionManagementClient";

export default async function SessionManagementPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return <SessionManagementClient />;
}
