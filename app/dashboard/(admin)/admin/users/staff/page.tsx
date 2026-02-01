import { staffService } from "@/services/user/staff.service";
import { StaffManagementClient } from "./fragments/StaffManagementClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export default async function StaffPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const [listRes, deletedStaff] = await Promise.all([
    staffService.getAll({ limit: 100 }).catch(() => ({ staff: [], pagination: null })),
    staffService.getDeleted().catch(() => [])
  ]);

  return (
    <StaffManagementClient
      initialStaff={listRes.staff}
      deletedStaff={deletedStaff}
      pagination={listRes.pagination}
    />
  );
}
