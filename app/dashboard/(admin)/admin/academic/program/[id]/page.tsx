import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import ProgramDetailClient from "../fragments/ProgramDetailClient";

export default async function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
    const { id } = await params;

    return <ProgramDetailClient id={id} />;
}
