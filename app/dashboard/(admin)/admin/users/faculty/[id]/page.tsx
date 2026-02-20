import { FacultyDetailClient } from "../fragments/FacultyDetailClient";
import { teacherService } from "@/services/user/teacher.service";
import { teacherProfileService } from "@/services/user/teacherProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Faculty Details",
  description: "View detailed information about a faculty member.",
};

interface TeacherDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherDetailsPage({ params }: TeacherDetailsPageProps) {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const { id } = await params;

  let teacher, departmentsRes;
  try {
    [teacher, departmentsRes] = await Promise.all([
      teacherService.getById(id),
      departmentService.getAllDepartments().catch(() => [])
    ]);
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
    console.warn(`Profile fetching failure for teacher ${id}:`, error);
  }

  return (
    <FacultyDetailClient
      teacher={teacher}
      profile={profile}
      departments={Array.isArray(departmentsRes) ? departmentsRes : []}
    />
  );
}
