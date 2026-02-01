import { staffService } from "@/services/user/staff.service";
import { staffProfileService } from "@/services/user/staffProfile.service";
import { StaffDetailClient } from "../fragments/StaffDetailClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { notFound } from "next/navigation";

interface StaffDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffDetailsPage({ params }: StaffDetailsPageProps) {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const { id } = await params;

  let staff, profile;
  try {
    [staff, profile] = await Promise.all([
      staffService.getById(id),
      staffProfileService.get(id).catch(() => null)
    ]);
    if (!staff) {
      return notFound();
    }
  } catch {
    return notFound();
  }

  return (
    <StaffDetailClient staff={staff} profile={profile} />
  );
}
