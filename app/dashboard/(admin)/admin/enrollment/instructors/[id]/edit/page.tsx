import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorEditClient from "./fragments/InstructorEditClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function EditInstructorAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
    const { id } = await params;

    return (
        <DashboardLayout>
            <InstructorEditClient id={id} />
        </DashboardLayout>
    );
}
