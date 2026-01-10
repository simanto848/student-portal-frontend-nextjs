import { departmentService } from "@/services/academic/department.service";
import { StaffFormClient } from "../fragments/StaffFormClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function CreateStaffPage() {
  const departments = await departmentService.getAllDepartments();

  return (
    <DashboardLayout>
      <StaffFormClient
        departments={Array.isArray(departments) ? departments : []}
      />
    </DashboardLayout>
  );
}
