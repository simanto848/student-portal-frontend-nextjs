import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorCreateClient from "./fragments/InstructorCreateClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function CreateInstructorAssignmentPage() {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

    return (
        <DashboardLayout>
            <InstructorCreateClient />
        </DashboardLayout>
    );
}
