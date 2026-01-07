import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getTeacherSchedule } from "./actions";
import ScheduleClient from "./fragments/ScheduleClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Schedule | Teacher Dashboard",
  description: "View and manage your weekly class schedule",
};

export default async function TeacherSchedulePage() {
  const schedules = await getTeacherSchedule();

  return (
    <DashboardLayout>
      <ScheduleClient initialSchedules={schedules} />
    </DashboardLayout>
  );
}
