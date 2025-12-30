import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import ProgramManagementClient from "./fragments/ProgramManagementClient";

export default async function ProgramManagementPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return <ProgramManagementClient />;
}
