import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import BatchDetailClient from "../fragments/BatchDetailClient";

export default async function BatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);
  const { id } = await params;

  return <BatchDetailClient id={id} />;
}
