import { adminService } from "@/services/user/admin.service";
import { ModeratorManagementClient } from "@/app/dashboard/(admin)/admin/users/moderators/fragments/ModeratorManagementClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
    title: "Moderator Management",
    description: "Manage system moderators and their access.",
};

export default async function ModeratorManagementPage() {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    const [moderatorsResult, deletedResult] = await Promise.all([
        adminService.getAll({ role: "moderator", limit: 50 }).catch(() => ({ admins: [], pagination: undefined })),
        adminService.getDeleted().catch(() => []),
    ]);

    const initialModerators = moderatorsResult.admins || [];
    console.log(initialModerators);

    const initialDeletedModerators = deletedResult.filter((a: any) => a.role === "moderator");

    return (
        <ModeratorManagementClient
            initialModerators={initialModerators}
            initialDeletedModerators={initialDeletedModerators}
        />
    );
}
