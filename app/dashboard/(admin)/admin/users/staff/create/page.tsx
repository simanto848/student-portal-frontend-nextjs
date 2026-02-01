import { departmentService } from "@/services/academic/department.service";
import { StaffFormClient } from "../fragments/StaffFormClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export default async function CreateStaffPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  const departments = await departmentService.getAllDepartments();

  return (
    <StaffFormClient
      departments={Array.isArray(departments) ? departments : []}
    />
  );
}
