import { ScheduleManagementClient } from "./fragments/ScheduleManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Schedule | Admin Dashboard",
  description: "Schedule and manage academic classes",
};

export default function SchedulePage() {
  return <ScheduleManagementClient />;
}
