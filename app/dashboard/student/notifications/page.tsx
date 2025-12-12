"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  AlertCircle,
  Info,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { notificationService } from "@/services/notification/notification.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.list();

      let notifList: any[] = [];
      if (Array.isArray(response)) {
        notifList = response;
      } else if (response && Array.isArray((response as any).notifications)) {
        notifList = (response as any).notifications;
      } else if (response && Array.isArray((response as any).data)) {
        notifList = (response as any).data;
      }

      // Sort by date (newest first)
      notifList.sort(
        (a, b) =>
          new Date(b.createdAt || b.publishedAt).getTime() -
          new Date(a.createdAt || a.publishedAt).getTime()
      );

      setNotifications(notifList);
    } catch (err: any) {
      console.error("Failed to fetch notifications", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, readBy: [...(n.readBy || []), "current-user"] }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all unread as read
      const unreadNotifs = notifications.filter(
        (n) => !n.readBy || n.readBy.length === 0
      );
      await Promise.all(
        unreadNotifs.map((n) => notificationService.markRead(n.id))
      );
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const filteredNotifications = notifications
    .filter((n) => {
      if (filter === "unread") return !n.readBy || n.readBy.length === 0;
      if (filter === "read") return n.readBy && n.readBy.length > 0;
      return true;
    })
    .filter((n) =>
      JSON.stringify(n).toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = notifications.filter(
    (n) => !n.readBy || n.readBy.length === 0
  ).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert":
      case "emergency":
        return AlertTriangle;
      case "info":
        return Info;
      case "announcement":
        return MessageSquare;
      default:
        return Bell;
    }
  };

  const getTypeBadgeColor = (type: string, priority: string) => {
    if (priority === "urgent" || priority === "high")
      return "bg-red-100 text-red-700";
    if (type === "alert" || type === "emergency")
      return "bg-orange-100 text-orange-700";
    if (type === "announcement") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notification Center
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Stay updated with campus news
              </h1>
              <p className="text-white/75 max-w-2xl">
                View all announcements, alerts, and important messages from your
                institution.
              </p>
              <div className="flex gap-3 flex-wrap pt-1">
                <Button
                  size="sm"
                  className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[220px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Unread Notifications
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">{unreadCount}</span>
                <span className="text-sm text-white/70">new</span>
              </div>
              <p className="text-[11px] text-white/70 mt-2">
                Total: {notifications.length} notifications
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              placeholder="Search notifications..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#3e6253]" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const isRead = notif.readBy && notif.readBy.length > 0;
                const TypeIcon = getTypeIcon(notif.type);
                const badgeColor = getTypeBadgeColor(
                  notif.type,
                  notif.priority
                );

                return (
                  <div
                    key={notif.id}
                    className={`rounded-xl border p-4 hover:bg-gray-50 transition-all duration-200 ${
                      isRead
                        ? "border-gray-100 bg-white"
                        : "border-[#3e6253]/30 bg-[#3e6253]/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <TypeIcon
                        className={`h-5 w-5 mt-0.5 ${
                          isRead ? "text-gray-400" : "text-[#3e6253]"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`text-sm font-semibold ${
                                  isRead ? "text-gray-600" : "text-[#1a3d32]"
                                }`}
                              >
                                {notif.title}
                              </p>
                              <Badge className={badgeColor}>{notif.type}</Badge>
                              {notif.priority &&
                                notif.priority !== "normal" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-red-300 text-red-700"
                                  >
                                    {notif.priority}
                                  </Badge>
                                )}
                            </div>
                            <p
                              className={`text-sm mt-1 ${
                                isRead
                                  ? "text-gray-500"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(
                                notif.createdAt || notif.publishedAt
                              ).toLocaleString()}
                            </p>
                          </div>
                          {!isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-[#3e6253] hover:bg-[#3e6253]/10"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || filter !== "all"
                  ? "No notifications match your filters."
                  : "No notifications available."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
