import { staffService } from "@/services/user/staff.service";
import { staffProfileService } from "@/services/user/staffProfile.service";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StaffDetailClient } from "../fragments/StaffDetailClient";
import { notFound } from "next/navigation";

interface StaffDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffDetailsPage({ params }: StaffDetailsPageProps) {
  const { id } = await params;

  try {
    const [staff, profile] = await Promise.all([
      staffService.getById(id),
      staffProfileService.get(id).catch(() => null)
    ]);

    if (!staff) {
      return notFound();
    }

    return (
      <DashboardLayout>
        <StaffDetailClient staff={staff} profile={profile} />
      </DashboardLayout>
    );
  } catch (error) {
    return notFound();
  }
}
