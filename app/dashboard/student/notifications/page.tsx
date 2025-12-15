"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Card, CardContent } from "@/components/ui/card";
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
  Clock,
  Check,
  RefreshCw,
  Inbox,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  useNotificationCenter,
  useNotificationStats,
} from "@/hooks/queries/useNotificationQueries";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { NotificationItem } from "@/services/notification/notification.service";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type FilterType = "all" | "unread" | "read";

// Icon mapping for notification types - defined outside component to avoid recreation
const TYPE_ICONS = {
  alert: AlertTriangle,
  emergency: AlertTriangle,
  info: Info,
  announcement: MessageSquare,
  batch: MessageSquare,
  batch_students: MessageSquare,
  default: Bell,
} as const;

// Get badge color based on type
function getTypeBadgeColor(type: string): string {
  if (type === "alert" || type === "emergency")
    return "bg-red-100 text-red-700 border-red-200";
  if (type === "announcement" || type === "batch" || type === "batch_students")
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (type === "info") return "bg-green-100 text-green-700 border-green-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

// Get priority color
function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
}

// Format the notification type for display
function formatTargetType(type: string): string {
  if (!type) return "General";
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

  // Real-time socket connection for notifications
  const { isConnected, reconnect } = useNotificationSocket({
    enabled: true,
    onNotificationReceived: (notification) => {
      toast.success(`New notification: ${notification.title}`, {
        description: notification.content?.substring(0, 100),
        duration: 5000,
      });
    },
  });

  // Sort notifications by date (newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt || 0).getTime() -
        new Date(a.publishedAt || a.createdAt || 0).getTime(),
    );
  }, [notifications]);

  // Filter notifications based on filter and search
  const filteredNotifications = useMemo(() => {
    return sortedNotifications
      .filter((n) => {
        // Use status to determine read/unread
        const isRead = n.status === "read" || n.isRead;
        if (filter === "unread") return !isRead;
        if (filter === "read") return isRead;
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
          description="View all announcements, alerts, and important messages from your instructors and institution."
          actions={
            <>
              <Button
                size="sm"
                className="bg-white text-dashboard-900 hover:bg-white/90 shadow-md"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead || unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {isMarkingAllRead ? "Marking..." : "Mark all as read"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-dashboard-900 hover:bg-white/10"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
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
          <div className="flex items-center gap-2 mt-2">
            <p className="text-[11px] text-white/70">
              Total: {notifications.length} notifications
            </p>
            <span className="text-white/40">•</span>
            <div className="flex items-center gap-1 text-[11px]">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-400" />
                  <button
                    onClick={reconnect}
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    Reconnect
                  </button>
                </>
              )}
            </div>
          </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
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
              <TabsTrigger value="all" className="gap-1.5">
                <Inbox className="h-3.5 w-3.5" />
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                Unread
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs bg-dashboard-600 text-white"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Read
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onMarkAsRead={markAsRead}
                isMarkingRead={isMarkingRead}
              />
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">No notifications</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {searchQuery || filter !== "all"
                    ? "No notifications match your current filters. Try adjusting your search or filter criteria."
                    : "You're all caught up! New notifications from your instructors will appear here."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Notification Card sub-component with auto-mark as read
interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  isMarkingRead: boolean;
}

function NotificationCard({
  notification,
  onMarkAsRead,
  isMarkingRead,
}: NotificationCardProps) {
  const isRead = notification.status === "read" || notification.isRead;
  const notificationType = notification.targetType || "default";
  const badgeColor = getTypeBadgeColor(notificationType);
  const priority = notification.priority || "medium";
  const cardRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsReadRef = useRef(false);

  // Get the icon component based on type
  const IconComponent =
    TYPE_ICONS[notificationType as keyof typeof TYPE_ICONS] ||
    TYPE_ICONS.default;

  const timeAgo =
    notification.publishedAt || notification.createdAt
      ? formatDistanceToNow(
          new Date(notification.publishedAt || notification.createdAt || ""),
          { addSuffix: true },
        )
      : "";

  // Auto-mark as read when the notification becomes visible
  const handleVisibility = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        !isRead &&
        !hasMarkedAsReadRef.current &&
        !isMarkingRead
      ) {
        // Mark as read after a short delay to ensure user actually saw it
        const timeoutId = setTimeout(() => {
          if (!hasMarkedAsReadRef.current) {
            hasMarkedAsReadRef.current = true;
            onMarkAsRead(notification.id);
          }
        }, 1500); // 1.5 seconds delay

        return () => clearTimeout(timeoutId);
      }
    },
    [isRead, notification.id, onMarkAsRead, isMarkingRead],
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card || isRead) return;

    const observer = new IntersectionObserver(handleVisibility, {
      threshold: 0.5, // 50% of the card must be visible
      rootMargin: "0px",
    });

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, [handleVisibility, isRead]);

  // Reset the ref when notification changes
  useEffect(() => {
    if (isRead) {
      hasMarkedAsReadRef.current = true;
    }
  }, [isRead]);

  return (
    <Card
      ref={cardRef}
      className={`transition-all duration-200 hover:shadow-md ${
        isRead
          ? "bg-white border-gray-100"
          : "bg-gradient-to-r from-dashboard-600/5 to-transparent border-dashboard-600/20 shadow-sm"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Priority indicator and Icon */}
          <div className="relative shrink-0">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isRead ? "bg-gray-100" : "bg-dashboard-600/10"
              }`}
            >
              <IconComponent
                className={`h-5 w-5 ${
                  isRead ? "text-gray-400" : "text-dashboard-600"
                }`}
              />
            </div>
            {!isRead && priority !== "low" && (
              <div
                className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${getPriorityColor(
                  priority,
                )} ring-2 ring-white`}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3
                    className={`font-semibold text-sm ${
                      isRead ? "text-gray-600" : "text-dashboard-900"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  {!isRead && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-dashboard-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs ${badgeColor}`}>
                    {formatTargetType(notification.targetType || "")}
                  </Badge>
                  {notification.senderRole && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {notification.senderRole.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mark as read button */}
              {!isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead(notification.id)}
                  disabled={isMarkingRead}
                  className="text-dashboard-600 hover:bg-dashboard-600/10 shrink-0"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark read
                </Button>
              )}
            </div>

            <p
              className={`text-sm mt-2 line-clamp-2 ${
                isRead ? "text-gray-500" : "text-gray-600"
              }`}
            >
              {notification.content}
            </p>

            {/* Footer with time */}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
              {isRead && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="h-3 w-3" />
                  Read
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
