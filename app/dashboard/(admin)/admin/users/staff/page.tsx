import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { staffService } from "@/services/user/staff.service";
import { StaffManagementClient } from "./fragments/StaffManagementClient";

export default async function StaffPage() {
  const [listRes, deletedStaff] = await Promise.all([
    staffService.getAll({ limit: 100 }).catch(() => ({ staff: [], pagination: null })),
    staffService.getDeleted().catch(() => [])
  ]);

  return (
    <DashboardLayout>
      <StaffManagementClient
        initialStaff={listRes.staff}
        deletedStaff={deletedStaff}
        pagination={listRes.pagination}
      />
    </DashboardLayout>
  );
}
