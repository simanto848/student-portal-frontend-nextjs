import LibraryClient from "./fragments/LibraryClient";
import { getLibraryDashboardData } from "./actions";

export default async function TeacherLibraryPage() {
  const initialData = await getLibraryDashboardData();

  return (
    <LibraryClient initialData={initialData} />
  );
}
