import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FacultyFormClient } from "../fragments/FacultyFormClient";

export const metadata = {
  title: "Initiate Scholar | Faculty Provisioning",
  description: "Securely provision new academic entities into the nexus.",
};

export default function CreateFacultyPage() {
  return (
    <DashboardLayout>
      <FacultyFormClient />
    </DashboardLayout>
  );
}
