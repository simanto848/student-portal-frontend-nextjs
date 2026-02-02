import { staffService } from "@/services/user/staff.service";
import { staffProfileService } from "@/services/user/staffProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { StaffFormClient } from "../../fragments/StaffFormClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { notFound } from "next/navigation";

interface EditStaffPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  const { id } = await params;

  let staff, profile, departments;
  try {
    [staff, profile, departments] = await Promise.all([
      staffService.getById(id),
      staffProfileService.get(id).catch(() => null),
      departmentService.getAllDepartments()
    ]);
    if (!staff) {
      return notFound();
    }
  } catch {
    return notFound();
  }

  return (
    <StaffFormClient
      staff={staff}
      profile={profile}
      departments={Array.isArray(departments) ? departments : []}
    />
  );
}
