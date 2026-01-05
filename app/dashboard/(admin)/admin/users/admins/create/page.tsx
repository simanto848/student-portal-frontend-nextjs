import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminFormClient } from "../fragments/AdminFormClient";

export const metadata = {
  title: "Initiate Guardian | Admin Provisioning",
  description: "Securely provision new administrative entities into the matrix.",
};

export default function CreateAdminPage() {
  return (
    <DashboardLayout>
      <AdminFormClient />
    </DashboardLayout>
  );
}
