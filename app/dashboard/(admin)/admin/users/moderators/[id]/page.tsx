import { adminService } from "@/services/user/admin.service";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { ModeratorDetailClient } from "../fragments/ModeratorDetailClient";
import { notFound } from "next/navigation";

interface ModeratorDetailPageProps {
    params: {
        id: string;
    };
}

export default async function ModeratorDetailPage({ params }: ModeratorDetailPageProps) {
    const { id } = await params;
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    try {
        const moderator = await adminService.getById(id);
        if (!moderator || moderator.role !== "moderator") {
            return notFound();
        }

        return (
            <ModeratorDetailClient moderator={moderator} />
        );
    } catch (error) {
        return notFound();
    }
}
