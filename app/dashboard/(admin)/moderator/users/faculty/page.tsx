import { FacultyManagementClient } from "./fragments/FacultyManagementClient";
import { teacherService } from "@/services/user/teacher.service";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Faculty Management | Academic Matrix",
  description: "Manage the educators and scholars within the constellation",
};

export default async function FacultyPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  let listRes, deletedTeachers;
  try {
    [listRes, deletedTeachers] = await Promise.all([
      teacherService.getAll({ limit: 100 }).catch(() => ({ teachers: [], pagination: null })),
      teacherService.getDeleted().catch(() => [])
    ]);
  } catch {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 font-black italic">
        THE ACADEMIC MATRIX IS UNREACHABLE AT THIS TIME.
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
