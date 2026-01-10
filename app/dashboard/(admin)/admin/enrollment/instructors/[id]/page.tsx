import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorDetailClient from "./fragments/InstructorDetailClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function InstructorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
    const { id } = await params;

    return (
        <DashboardLayout>
            <InstructorDetailClient id={id} />
        </DashboardLayout>
    );
}
