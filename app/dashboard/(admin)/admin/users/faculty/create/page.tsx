import { FacultyFormClient } from "../fragments/FacultyFormClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Create Faculty",
  description: "Provision new academic entities into the system.",
};

export default async function CreateFacultyPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  return (
    <FacultyFormClient />
  );
}
