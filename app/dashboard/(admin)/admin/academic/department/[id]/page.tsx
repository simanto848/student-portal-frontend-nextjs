import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import DepartmentDetailClient from "../fragments/DepartmentDetailClient";

export default async function DepartmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
    const { id } = await params;

    return <DepartmentDetailClient id={id} />;
}
