import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import BatchManagementClient from "./fragments/BatchManagementClient";

export default async function BatchManagementPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return <BatchManagementClient />;
}
