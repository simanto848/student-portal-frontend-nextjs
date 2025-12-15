"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCheck,
  Search,
  AlertCircle,
  Info,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  useNotificationCenter,
  useNotificationStats,
} from "@/hooks/queries/useNotificationQueries";
import { NotificationItem } from "@/services/notification/notification.service";

type FilterType = "all" | "unread" | "read";

// Icon mapping for notification types - defined outside component to avoid recreation
const TYPE_ICONS = {
  alert: AlertTriangle,
  emergency: AlertTriangle,
  info: Info,
  announcement: MessageSquare,
  default: Bell,
} as const;

// Get badge color based on type
function getTypeBadgeColor(type: string): string {
  if (type === "alert" || type === "emergency")
    return "bg-orange-100 text-orange-700";
  if (type === "announcement") return "bg-blue-100 text-blue-700";
  if (type === "info") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

export default function StudentNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Use React Query hooks for data fetching
  const {
    notifications,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarkingRead,
    isMarkingAllRead,
  } = useNotificationCenter();

  const { stats } = useNotificationStats();

  // Sort notifications by date (newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) =>
        new Date(b.createdAt || b.sendAt || 0).getTime() -
        new Date(a.createdAt || a.sendAt || 0).getTime(),
    );
  }, [notifications]);

  // Filter notifications based on filter and search
  const filteredNotifications = useMemo(() => {
    return sortedNotifications
      .filter((n) => {
        // Use status to determine read/unread
        if (filter === "unread") return n.status !== "read";
        if (filter === "read") return n.status === "read";
        return true;
      })
      .filter((n) =>
        JSON.stringify(n).toLowerCase().includes(searchQuery.toLowerCase()),
      );
  }, [sortedNotifications, filter, searchQuery]);

  const unreadCount = stats?.unread ?? 0;

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-table" rowCount={6} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={Bell}
          label="Notification Center"
          title="Stay updated with campus news"
          description="View all announcements, alerts, and important messages from your institution."
          actions={
            <>
              <Button
                size="sm"
                className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead || unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {isMarkingAllRead ? "Marking..." : "Mark all as read"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </>
          }
          stats={{
            label: "Unread Notifications",
            value: unreadCount.toString(),
            subtext: "new",
          }}
        >
          <p className="text-[11px] text-white/70 mt-2">
            Total: {notifications.length} notifications
          </p>
        </DashboardHero>

        {/* Error Alert */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load notifications."}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filter */}
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
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FilterType)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
              <Bell className="h-4 w-4 dashboard-accent" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <NotificationItemCard
                  key={notif.id}
                  notification={notif}
                  onMarkAsRead={markAsRead}
                  isMarkingRead={isMarkingRead}
                />
              ))
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

// Notification Item Card sub-component
interface NotificationItemCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
}

function NotificationItemCard({
  notification,
  onMarkAsRead,
  isMarkingRead,
}: NotificationItemCardProps) {
  const isRead = notification.status === "read";
  const notificationType = notification.targetType || "default";
  const badgeColor = getTypeBadgeColor(notificationType);

  // Get the icon component based on type
  const IconComponent =
    TYPE_ICONS[notificationType as keyof typeof TYPE_ICONS] ||
    TYPE_ICONS.default;

  return (
    <div
      className={`rounded-xl border p-4 hover:bg-gray-50 transition-all duration-200 ${
        isRead
          ? "border-gray-100 bg-white"
          : "border-[#3e6253]/30 bg-[#3e6253]/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <IconComponent
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
                  {notification.title}
                </p>
                {notification.targetType && (
                  <Badge className={badgeColor}>
                    {notification.targetType}
                  </Badge>
                )}
              </div>
              <p
                className={`text-sm mt-1 ${
                  isRead ? "text-gray-500" : "text-muted-foreground"
                }`}
              >
                {notification.content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(
                  notification.createdAt || notification.sendAt || "",
                ).toLocaleString()}
              </p>
            </div>
            {!isRead && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMarkAsRead(notification.id)}
                disabled={isMarkingRead}
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
}
