import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import InstructorDetailClient from "./fragments/InstructorDetailClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Assignment Details | Guardian Intelligence",
    description: "View detailed information about instructor course assignments.",
};

export default async function InstructorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
    const { id } = await params;

    return <InstructorDetailClient id={id} />;
}
