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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Bell,
  AlertCircle,
  Search,
  CheckCheck,
  Plus,
  Send,
  Users,
  Clock,
  Check,
  RefreshCw,
  Inbox,
  MessageSquare,
  Info,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import {
  useNotificationCenter,
  useNotificationStats,
} from "@/hooks/queries/useNotificationQueries";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import {
  notificationService,
  NotificationItem,
} from "@/services/notification/notification.service";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type FilterType = "all" | "unread" | "read";
type TabType = "inbox" | "sent";

const TYPE_ICONS = {
  alert: AlertTriangle,
  emergency: AlertTriangle,
  info: Info,
  announcement: MessageSquare,
  batch: MessageSquare,
  batch_students: MessageSquare,
  default: Bell,
} as const;

function getTypeBadgeColor(type: string): string {
  if (type === "alert" || type === "emergency")
    return "bg-red-100 text-red-700 border-red-200";
  if (type === "announcement" || type === "batch" || type === "batch_students")
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (type === "info") return "bg-green-100 text-green-700 border-green-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function getStatusColor(status: string): string {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    case "draft":
      return "bg-gray-100 text-gray-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatTargetType(type: string): string {
  if (!type) return "General";
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function TeacherNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<TabType>("inbox");
  const [sentNotifications, setSentNotifications] = useState<
    NotificationItem[]
  >([]);
  const [isLoadingSent, setIsLoadingSent] = useState(false);

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

  const { isConnected, reconnect } = useNotificationSocket({
    enabled: true,
    onNotificationReceived: (notification) => {
      toast.success(`New notification: ${notification.title}`, {
        description: notification.content?.substring(0, 100),
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (activeTab === "sent") {
      fetchSentNotifications();
    }
  }, [activeTab]);

  const fetchSentNotifications = async () => {
    setIsLoadingSent(true);
    try {
      const result = await notificationService.getSent({ limit: 50 });
      setSentNotifications(result.items || []);
    } catch (err) {
      console.error("Failed to fetch sent notifications:", err);
    } finally {
      setIsLoadingSent(false);
    }
  };

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt || 0).getTime() -
        new Date(a.publishedAt || a.createdAt || 0).getTime(),
    );
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return sortedNotifications
      .filter((n) => {
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
          label="Notifications"
          title="Messages and alerts for you and your classes"
          description="Stay updated with important announcements and send notifications to your students."
          actions={
            <>
              <Link href="/dashboard/teacher/notifications/create">
                <Button
                  size="sm"
                  className="bg-white text-dashboard-900 hover:bg-white/90 shadow-md hover:cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notification
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-dashboard-900 hover:bg-white/10 hover:text-white hover:cursor-pointer"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead || unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {isMarkingAllRead ? "Marking..." : "Mark all read"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-dashboard-900 hover:bg-white/10 hover:text-white hover:cursor-pointer"
                onClick={() => {
                  refetch();
                  if (activeTab === "sent") fetchSentNotifications();
                }}
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
          <div className="flex items-center gap-4 mt-2 text-[11px] text-white/70">
            <span>Inbox: {notifications.length}</span>
            <span>Sent: {sentNotifications.length}</span>
            <span className="text-white/40">•</span>
            <div className="flex items-center gap-1">
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

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="inbox" className="gap-2">
                <Inbox className="h-4 w-4" />
                Inbox
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-xs bg-dashboard-600 text-white"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-2">
                <Send className="h-4 w-4" />
                Sent
              </TabsTrigger>
            </TabsList>

            {/* Search and Filter (only for inbox) */}
            {activeTab === "inbox" && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
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
            )}
          </div>

          {/* Inbox Tab Content */}
          <TabsContent value="inbox" className="mt-4">
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Inbox className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      No notifications
                    </h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                      {searchQuery || filter !== "all"
                        ? "No notifications match your filters."
                        : "Your inbox is empty. New notifications will appear here."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((n) => (
                  <InboxNotificationCard
                    key={n.id}
                    notification={n}
                    onMarkAsRead={() => markAsRead(n.id)}
                    isMarkingRead={isMarkingRead}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Sent Tab Content */}
          <TabsContent value="sent" className="mt-4">
            {isLoadingSent ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading sent notifications...
                </CardContent>
              </Card>
            ) : sentNotifications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    No sent notifications
                  </h3>
                  <p className="text-muted-foreground text-center max-w-sm mb-4">
                    You haven&apos;t sent any notifications yet. Create one to
                    reach your students.
                  </p>
                  <Link href="/dashboard/teacher/notifications/create">
                    <Button className="bg-dashboard-600 hover:bg-dashboard-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Notification
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sentNotifications.map((n) => (
                  <SentNotificationCard key={n.id} notification={n} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Inbox Notification Card with auto-mark as read
interface InboxNotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: () => void;
  isMarkingRead: boolean;
}

function InboxNotificationCard({
  notification,
  onMarkAsRead,
  isMarkingRead,
}: InboxNotificationCardProps) {
  const isRead = notification.status === "read" || notification.isRead;
  const notificationType = notification.targetType || "default";
  const badgeColor = getTypeBadgeColor(notificationType);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsReadRef = useRef(false);

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
            onMarkAsRead();
          }
        }, 1500); // 1.5 seconds delay

        return () => clearTimeout(timeoutId);
      }
    },
    [isRead, onMarkAsRead, isMarkingRead],
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
            {!isRead && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-dashboard-600 ring-2 ring-white" />
            )}
          </div>

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
                </div>
                <Badge variant="outline" className={`text-xs ${badgeColor}`}>
                  {formatTargetType(notification.targetType || "")}
                </Badge>
              </div>

              {!isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMarkAsRead}
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

// Sent Notification Card
interface SentNotificationCardProps {
  notification: NotificationItem;
}

function SentNotificationCard({ notification }: SentNotificationCardProps) {
  const timeAgo =
    notification.publishedAt || notification.createdAt
      ? formatDistanceToNow(
          new Date(notification.publishedAt || notification.createdAt || ""),
          { addSuffix: true },
        )
      : "";

  const readPercentage =
    notification.totalRecipients && notification.totalRecipients > 0
      ? Math.round(
          ((notification.readCount || 0) / notification.totalRecipients) * 100,
        )
      : 0;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-dashboard-900 mb-1">
                  {notification.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={getTypeBadgeColor(notification.targetType || "")}
                  >
                    {formatTargetType(notification.targetType || "")}
                  </Badge>
                  <Badge className={getStatusColor(notification.status || "")}>
                    {notification.status || "draft"}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-sm font-medium text-dashboard-900">
                  <Users className="h-4 w-4" />
                  {notification.totalRecipients || 0}
                </div>
                <div className="text-xs text-muted-foreground">recipients</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {notification.content}
            </p>

            {/* Read progress */}
            {notification.status === "published" && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Read by</span>
                  <span className="font-medium text-dashboard-600">
                    {notification.readCount || 0} /{" "}
                    {notification.totalRecipients || 0} ({readPercentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-dashboard-600 rounded-full transition-all duration-300"
                    style={{ width: `${readPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {notification.status === "published"
                  ? `Sent ${timeAgo}`
                  : notification.status === "scheduled"
                    ? `Scheduled for ${new Date(notification.scheduleAt || "").toLocaleString()}`
                    : `Created ${timeAgo}`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
