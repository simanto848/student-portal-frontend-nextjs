"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  notificationService,
  NotificationItem,
} from "@/services/notification/notification.service";
import { toast } from "sonner";

export default function TeacherNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.list({
        mine: true,
        page: 1,
        limit: 50,
      });
      const list = res?.notifications || [];
      setNotifications(list);
    } catch (error) {
      console.error("Notifications fetch error", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    setMarkingId(id);
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, status: "read", readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error("Mark read error", error);
      toast.error("Failed to mark as read");
    } finally {
      setMarkingId(null);
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-blue-500 text-white">Sent</Badge>;
      case "read":
        return <Badge className="bg-green-500 text-white">Read</Badge>;
      case "scheduled":
        return <Badge className="bg-amber-500 text-white">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Messages and alerts sent to you and your classes
            </p>
          </div>
          <Button variant="outline" onClick={loadNotifications}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.title}</TableCell>
                      <TableCell className="max-w-xl text-sm text-muted-foreground">
                        {n.content}
                      </TableCell>
                      <TableCell>{statusBadge(n.status)}</TableCell>
                      <TableCell>
                        {n.sendAt ? new Date(n.sendAt).toLocaleString() : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={n.status === "read" || markingId === n.id}
                          onClick={() => markRead(n.id)}
                        >
                          Mark read
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
