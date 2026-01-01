import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FacultyManagementClient } from "./fragments/FacultyManagementClient";
import { teacherService } from "@/services/user/teacher.service";

export const metadata = {
  title: "Faculty Management | Academic Matrix",
  description: "Manage the educators and scholars within the constellation",
};

export default async function FacultyPage() {
  try {
    const [listRes, deletedTeachers] = await Promise.all([
      teacherService.getAll({ limit: 100 }).catch(() => ({ teachers: [], pagination: null })),
      teacherService.getDeleted().catch(() => [])
    ]);

    return (
      <DashboardLayout>
        <FacultyManagementClient
          initialTeachers={listRes.teachers}
          deletedTeachers={deletedTeachers}
          pagination={listRes.pagination}
        />
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Critical error in FacultyPage:", error);
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-20 text-slate-400 font-black italic">
          THE ACADEMIC MATRIX IS UNREACHABLE AT THIS TIME.
        </div>
      </DashboardLayout>
    );
  }
}
