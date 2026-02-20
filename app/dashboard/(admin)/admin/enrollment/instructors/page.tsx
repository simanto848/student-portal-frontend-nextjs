import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorManagementClient from "./fragments/InstructorManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Faculty Registry | Guardian Intelligence",
    description: "Manage instructor assignments and faculty allocations for courses and batches.",
};

export default async function InstructorsPage() {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

    return <InstructorManagementClient />;
}
