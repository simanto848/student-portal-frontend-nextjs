import { adminService } from "@/services/user/admin.service";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { ModeratorFormClient } from "../../fragments/ModeratorFormClient";
import { notFound } from "next/navigation";

interface EditModeratorPageProps {
    params: {
        id: string;
    };
}

export default async function EditModeratorPage({ params }: EditModeratorPageProps) {
    const { id } = await params;
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    try {
        const moderator = await adminService.getById(id);
        if (!moderator || moderator.role !== "moderator") {
            return notFound();
        }

        return (
            <ModeratorFormClient mode="edit" initialData={moderator} />
        );
    } catch (error) {
        return notFound();
    }
}
