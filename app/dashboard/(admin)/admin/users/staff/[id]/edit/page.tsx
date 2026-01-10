import { staffService } from "@/services/user/staff.service";
import { staffProfileService } from "@/services/user/staffProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { StaffFormClient } from "../../fragments/StaffFormClient";
import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface EditStaffPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params;

  try {
    const [staff, profile, departments] = await Promise.all([
      staffService.getById(id),
      staffProfileService.get(id).catch(() => null),
      departmentService.getAllDepartments()
    ]);

    if (!staff) {
      return notFound();
    }

    return (
      <DashboardLayout>
        <StaffFormClient
          staff={staff}
          profile={profile}
          departments={Array.isArray(departments) ? departments : []}
        />
      </DashboardLayout>
    );
  } catch (error) {
    return notFound();
  }
}
