import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import AssessmentManagementClient from "./fragments/AssessmentManagementClient";

export const metadata = {
    title: "Guardian Intelligence | Assessment Management",
    description: "Orchestrate academic evaluations and grade metrics",
};

export default function AssessmentManagementPage() {
    return <AssessmentManagementClient />;
}
