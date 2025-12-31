import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExamCommitteeManagementClient } from "./fragments/ExamCommitteeManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Committee | Admin Dashboard",
  description: "Manage departmental and batch-wise exam committees",
};

export default function ExamCommitteePage() {
  return (
    <DashboardLayout>
      <ExamCommitteeManagementClient />
    </DashboardLayout>
  );
}
