import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import FacultyDetailClient from "../fragments/FacultyDetailClient";

export default async function FacultyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
    const { id } = await params;

    return <FacultyDetailClient id={id} />;
}
