import { requireUser } from "@/lib/auth/userAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import CommunicationClient from "./fragments/CommunicationClient";

export default async function CommunicationHubPage() {
  await requireUser();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-10">
        <CommunicationClient />
      </div>
    </DashboardLayout>
  );
}
