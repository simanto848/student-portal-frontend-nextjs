import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import CourseDetailClient from "../fragments/CourseDetailClient";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("/login", [UserRole.TEACHER]);
  const { id } = await params;

  return (
    <DashboardLayout>
      <CourseDetailClient id={id} />
    </DashboardLayout>
  );
}
