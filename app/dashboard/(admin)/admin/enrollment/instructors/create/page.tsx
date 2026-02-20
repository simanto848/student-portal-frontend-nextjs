import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorCreateClient from "./fragments/InstructorCreateClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Faculty Allocation | Guardian Intelligence",
    description: "Assign instructors to course batches and manage faculty allocations.",
};

export default async function CreateInstructorAssignmentPage() {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    return <InstructorCreateClient />;
}
