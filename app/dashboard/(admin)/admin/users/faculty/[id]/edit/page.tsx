import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FacultyFormClient } from "../../fragments/FacultyFormClient";
import { teacherService } from "@/services/user/teacher.service";
import { teacherProfileService } from "@/services/user/teacherProfile.service";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Modify Scholar | Protocol Calibration",
  description: "Recalibrate scholar authority and descriptive academic metadata.",
};

interface EditFacultyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFacultyPage({ params }: EditFacultyPageProps) {
  const { id } = await params;

  try {
    const teacher = await teacherService.getById(id);

    if (!teacher) {
      return notFound();
    }

    let profile = null;
    try {
      profile = await teacherProfileService.get(id);
    } catch (error) {
      console.warn(`Profile fetching failure for scholar ${id}:`, error);
    }

    return (
      <DashboardLayout>
        <FacultyFormClient
          teacher={teacher}
          profile={profile}
        />
      </DashboardLayout>
    );
  } catch (error) {
    console.error(`Critical failure in EditFacultyPage for ID ${id}:`, error);
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-4xl">
            ⚠️
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 italic uppercase">NEXUS BREACH</h1>
            <p className="text-slate-500 font-bold mt-2">The academic oracle is currently unresponsive. Scholar modification aborted.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
}
