import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorManagementClient from "./fragments/InstructorManagementClient";

export default async function InstructorsPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  return (
    <InstructorManagementClient />
  );
}
