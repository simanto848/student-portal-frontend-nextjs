import { FacultyFormClient } from "../../fragments/FacultyFormClient";
import { teacherService } from "@/services/user/teacher.service";
import { teacherProfileService } from "@/services/user/teacherProfile.service";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Edit Faculty",
  description: "Edit detailed information about a faculty member.",
};

interface EditFacultyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFacultyPage({ params }: EditFacultyPageProps) {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const { id } = await params;

  let teacher;
  try {
    teacher = await teacherService.getById(id);
    if (!teacher) {
      return notFound();
    }
  } catch {
    return notFound();
  }

  let profile = null;
  try {
    profile = await teacherProfileService.get(id);
  } catch (error) {
    console.warn(`Profile fetching failure for scholar ${id}:`, error);
  }

  return (
    <FacultyFormClient
      teacher={teacher}
      profile={profile}
    />
  );
}
