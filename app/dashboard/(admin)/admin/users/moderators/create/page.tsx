import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { ModeratorFormClient } from "../fragments/ModeratorFormClient";

export default async function CreateModeratorPage() {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    return (
        <ModeratorFormClient mode="create" />
    );
}
