import { FacultyManagementClient } from "./fragments/FacultyManagementClient";
import { teacherService } from "@/services/user/teacher.service";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Faculty Management",
  description: "Manage the educators and scholars within the system",
};

export default async function FacultyPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  let listRes, deletedTeachers;
  try {
    [listRes, deletedTeachers] = await Promise.all([
      teacherService.getAll({ limit: 100 }).catch(() => ({ teachers: [], pagination: null })),
      teacherService.getDeleted().catch(() => [])
    ]);
  } catch {
    return (
      <div className="flex items-center justify-center p-20 text-slate-500 font-medium">
        Failed to load faculty data.
      </div>
    );
  }

  return (
    <FacultyManagementClient
      initialTeachers={listRes.teachers}
      deletedTeachers={deletedTeachers}
      pagination={listRes.pagination}
    />
  );
}
