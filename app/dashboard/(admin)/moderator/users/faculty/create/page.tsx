import { FacultyFormClient } from "../fragments/FacultyFormClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Initiate Scholar | Faculty Provisioning",
  description: "Securely provision new academic entities into the nexus.",
};

export default async function CreateFacultyPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  return (
    <FacultyFormClient />
  );
}
