"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertCircle, Search, CheckCheck } from "lucide-react";
import {
  useNotificationCenter,
  useNotificationStats,
} from "@/hooks/queries/useNotificationQueries";

type FilterType = "all" | "unread" | "read";

export default function TeacherNotificationsPage() {
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
        new Date(b.sendAt || b.createdAt || 0).getTime() -
        new Date(a.sendAt || a.createdAt || 0).getTime(),
    );
  }, [notifications]);

  // Filter notifications based on filter and search
  const filteredNotifications = useMemo(() => {
    return sortedNotifications
      .filter((n) => {
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
          label="Notifications"
          title="Messages and alerts for you and your classes"
          description="Stay updated with important announcements and system notifications."
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
          <div className="relative flex-1 md:max-w-md">
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

        {/* Notifications Table */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold dashboard-title flex items-center gap-2">
              <Bell className="h-4 w-4 dashboard-accent" /> Inbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                {searchQuery || filter !== "all"
                  ? "No notifications match your filters."
                  : "No notifications yet."}
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
                  {filteredNotifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onMarkAsRead={() => markAsRead(n.id)}
                      isMarkingRead={isMarkingRead}
                    />
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

// Notification Row sub-component
interface NotificationRowProps {
  notification: {
    id: string;
    title: string;
    content?: string;
    message?: string;
    status?: string;
    sendAt?: string;
    createdAt?: string;
  };
  onMarkAsRead: () => void;
  isMarkingRead: boolean;
}

function NotificationRow({
  notification,
  onMarkAsRead,
  isMarkingRead,
}: NotificationRowProps) {
  const isRead = notification.status === "read";
  const dateStr = notification.sendAt || notification.createdAt;

  return (
    <TableRow className={isRead ? "" : "bg-[#3e6253]/5"}>
      <TableCell className="font-medium">
        <span className={isRead ? "text-gray-600" : "dashboard-title"}>
          {notification.title}
        </span>
      </TableCell>
      <TableCell className="max-w-xl text-sm text-muted-foreground">
        <span className="line-clamp-2">
          {notification.content || notification.message || "—"}
        </span>
      </TableCell>
      <TableCell>
        <StatusBadge status={notification.status || "draft"} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {dateStr ? new Date(dateStr).toLocaleString() : "—"}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          disabled={isRead || isMarkingRead}
          onClick={onMarkAsRead}
          className="text-[#3e6253] hover:bg-[#3e6253]/10"
        >
          Mark read
        </Button>
      </TableCell>
    </TableRow>
  );
}
