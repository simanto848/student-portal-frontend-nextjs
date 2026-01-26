import GradingWorkflowClient from "./fragments/GradingWorkflowClient";
import { getGradingWorkflows } from "./actions";

export default async function GradingPage() {
  const initialWorkflows = await getGradingWorkflows();

  return (
    <GradingWorkflowClient initialWorkflows={initialWorkflows} />
  );
}
