import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FacultyDetailClient } from "../fragments/FacultyDetailClient";
import { teacherService } from "@/services/user/teacher.service";
import { teacherProfileService } from "@/services/user/teacherProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Faculty Intelligence | Academic Matrix",
  description: "In-depth synchronization of scholar metadata",
};

interface TeacherDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherDetailsPage({ params }: TeacherDetailsPageProps) {
  const { id } = await params;

  try {
    const [teacher, departmentsRes] = await Promise.all([
      teacherService.getById(id),
      departmentService.getAllDepartments().catch(() => [])
    ]);

    if (!teacher) {
      return notFound();
    }

    let profile = null;
    try {
      profile = await teacherProfileService.get(id);
    } catch (error) {
      console.warn(`Profile fetching failure for teacher ${id}:`, error);
    }

    return (
      <DashboardLayout>
        <FacultyDetailClient
          teacher={teacher}
          profile={profile}
          departments={Array.isArray(departmentsRes) ? departmentsRes : []}
        />
      </DashboardLayout>
    );
  } catch (error) {
    console.error(`Critical failure in TeacherDetailsPage for ID ${id}:`, error);
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 italic uppercase">ACADEMIC BRAIN DISCONNECTED</h1>
            <p className="text-slate-500 font-bold mt-2">The requested faculty synchronization is currently unreachable.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}
