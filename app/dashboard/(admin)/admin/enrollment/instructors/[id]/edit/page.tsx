import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorEditClient from "./fragments/InstructorEditClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Modify Assignment | Guardian Intelligence",
    description: "Update instructor assignments and modify faculty allocations.",
};

export default async function EditInstructorAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
    const { id } = await params;

    return <InstructorEditClient id={id} />;
}
