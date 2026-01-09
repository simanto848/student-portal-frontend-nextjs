import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getTeacherNotifications, getTeacherSentNotifications, getNotificationStats } from "./actions";
import NotificationListClient from "./fragments/NotificationListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Teacher Dashboard",
  description: "Manage and send notifications to your students",
};

export default async function TeacherNotificationsPage() {
  const [notifications, sentNotifications, stats] = await Promise.all([
    getTeacherNotifications(),
    getTeacherSentNotifications(),
    getNotificationStats()
  ]);

  return (
    <DashboardLayout>
      <NotificationListClient
        initialNotifications={notifications}
        initialSentNotifications={sentNotifications}
        initialUnreadCount={stats.unread || 0}
      />
    </DashboardLayout>
  );
}
