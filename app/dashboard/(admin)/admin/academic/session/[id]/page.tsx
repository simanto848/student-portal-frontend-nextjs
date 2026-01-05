import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import SessionDetailClient from "../fragments/SessionDetailClient";

export default async function SessionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
    const { id } = await params;

    return <SessionDetailClient id={id} />;
}
