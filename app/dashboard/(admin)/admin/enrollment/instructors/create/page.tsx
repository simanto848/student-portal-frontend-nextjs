import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorCreateClient from "./fragments/InstructorCreateClient";

export default async function CreateInstructorAssignmentPage() {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    return (
        <InstructorCreateClient />
    );
}
