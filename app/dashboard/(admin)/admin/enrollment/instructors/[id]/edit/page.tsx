import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorEditClient from "./fragments/InstructorEditClient";

export default async function EditInstructorAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
    const { id } = await params;

    return (
        <InstructorEditClient id={id} />
    );
}
