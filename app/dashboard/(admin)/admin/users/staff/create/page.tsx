import { departmentService } from "@/services/academic/department.service";
import { StaffFormClient } from "../fragments/StaffFormClient";

export default async function CreateStaffPage() {
  const departments = await departmentService.getAllDepartments();

  return (
    <StaffFormClient
      departments={Array.isArray(departments) ? departments : []}
    />
  );
}
