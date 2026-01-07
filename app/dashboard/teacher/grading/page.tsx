import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import GradingWorkflowClient from "./fragments/GradingWorkflowClient";
import { getGradingWorkflows } from "./actions";

export default async function GradingPage() {
  const initialWorkflows = await getGradingWorkflows();

  return (
    <DashboardLayout>
      <GradingWorkflowClient initialWorkflows={initialWorkflows} />
    </DashboardLayout>
  );
}
