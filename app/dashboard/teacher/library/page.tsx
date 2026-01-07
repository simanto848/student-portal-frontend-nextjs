import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import LibraryClient from "./fragments/LibraryClient";
import { getLibraryDashboardData } from "./actions";

export default async function TeacherLibraryPage() {
  const initialData = await getLibraryDashboardData();

  return (
    <DashboardLayout>
      <LibraryClient initialData={initialData} />
    </DashboardLayout>
  );
}
