import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminManagementClient } from "./fragments/AdminManagementClient";
import { adminService } from "@/services/user/admin.service";

export const metadata = {
  title: "Admin Management | Security Oracle",
  description: "Orchestrate high-level guardian authority",
};

export default async function AdminManagementPage() {
  try {
    const [listRes, stats, deletedAdmins] = await Promise.all([
      adminService.getAll({ limit: 100 }).catch(() => ({ admins: [] })),
      adminService.getStatistics().catch(() => ({ total: 0, byRole: { super_admin: 0, admin: 0, moderator: 0 } })),
      adminService.getDeleted().catch(() => [])
    ]);

    return (
      <DashboardLayout>
        <AdminManagementClient
          initialAdmins={listRes.admins}
          deletedAdmins={deletedAdmins}
          statistics={stats}
        />
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Critical error in AdminManagementPage:", error);
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-20 text-slate-400 font-black italic">
          THE SECURITY ORACLE IS UNREACHABLE AT THIS TIME.
        </div>
      </DashboardLayout>
    );
  }
}
