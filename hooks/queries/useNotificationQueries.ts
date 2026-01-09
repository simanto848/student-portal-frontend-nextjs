import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  NotificationItem,
  NotificationListParams,
} from "@/services/notification/notification.service";

// ==================================== Query Keys ========================================

export const notificationKeys = {
  all: ["notification"] as const,

  // Notifications
  notifications: () => [...notificationKeys.all, "list"] as const,
  notificationsList: (params?: NotificationListParams) =>
    [...notificationKeys.notifications(), params] as const,
  notification: (id: string) =>
    [...notificationKeys.all, "detail", id] as const,
  myNotifications: (params?: NotificationListParams) =>
    [...notificationKeys.all, "mine", params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

function extractNotifications(response: unknown): NotificationItem[] {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response as NotificationItem[];
  }

  if (typeof response === "object") {
    const obj = response as Record<string, unknown>;
    if (Array.isArray(obj.notifications)) {
      return obj.notifications as NotificationItem[];
    }
    if (Array.isArray(obj.data)) {
      return obj.data as NotificationItem[];
    }
  }

  return [];
}

// Fetch notifications list with optional filters
export function useNotifications(params?: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.notificationsList(params),
    queryFn: async () => {
      const response = await notificationService.list(params);
      return {
        notifications: extractNotifications(response),
        pagination: response?.pagination,
      };
    },
  });
}

// Fetch current user's notifications
export function useMyNotifications(
  params?: Omit<NotificationListParams, "mine">,
  options?: any
) {
  return useQuery<{
    notifications: NotificationItem[];
    pagination?: any;
  }>({
    queryKey: notificationKeys.myNotifications(params),
    queryFn: async () => {
      const response = await notificationService.list({
        ...params,
        mine: true,
      });
      return {
        notifications: extractNotifications(response),
        pagination: (response as any)?.pagination,
      };
    },
    ...options
  });
}

// Fetch a single notification by ID
export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.notification(id),
    queryFn: () => notificationService.get(id),
    enabled: !!id,
  });
}

// Fetch unread notifications count
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await notificationService.list({
        mine: true,
        status: "sent",
      });
      const notifications = extractNotifications(response);
      return notifications.length;
    },
    // Refetch frequently to keep count up-to-date
    refetchInterval: 30000, // 30 seconds
    staleTime: 10000, // 10 seconds
  });
}

// ====================================== Notification Mutations ======================================

// Mark notification as read mutation
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: (_, id) => {
      // Update the specific notification in cache
      queryClient.setQueryData<NotificationItem>(
        notificationKeys.notification(id),
        (old) =>
          old
            ? { ...old, status: "read", readAt: new Date().toISOString() }
            : old,
      );

      // Invalidate lists to refresh
      queryClient.invalidateQueries({
        queryKey: notificationKeys.notifications(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.myNotifications(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

// Mark all notifications as read mutation
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Fetch all unread notifications and mark them as read
      const response = await notificationService.list({
        mine: true,
        status: "sent",
      });
      const notifications = extractNotifications(response);

      // Mark each as read
      await Promise.all(
        notifications.map((n) => notificationService.markRead(n.id)),
      );

      return { count: notifications.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.notifications(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.myNotifications(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

// React to notification mutation
export function useReactToNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) =>
      notificationService.react(id, emoji),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.notification(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.notifications(),
      });
    },
  });
}

// ==================================== Combined Hooks for Common Use Cases ========================================

// Hook for notification bell/badge in header
export function useNotificationBell() {
  const countQuery = useUnreadNotificationsCount();
  const recentQuery = useMyNotifications({ limit: 5 });

  return {
    unreadCount: countQuery.data ?? 0,
    recentNotifications: recentQuery.data?.notifications ?? [],
    isLoading: countQuery.isLoading || recentQuery.isLoading,
    isError: countQuery.isError || recentQuery.isError,
    refetch: () => {
      countQuery.refetch();
      recentQuery.refetch();
    },
  };
}

// Hook for notification center page
export function useNotificationCenter(params?: NotificationListParams, options?: any) {
  const query = useMyNotifications(params, options);
  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  return {
    notifications: query.data?.notifications ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}

// Hook to get notifications by status
export function useNotificationsByStatus(
  status: "sent" | "read" | "scheduled" | "draft",
) {
  return useMyNotifications({ status });
}

// Hook to get notification stats
export function useNotificationStats() {
  const allQuery = useMyNotifications({ limit: 100 });

  const notifications = allQuery.data?.notifications ?? [];

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => n.status === "sent").length,
    read: notifications.filter((n) => n.status === "read").length,
    scheduled: notifications.filter((n) => n.status === "scheduled").length,
  };

  return {
    stats,
    isLoading: allQuery.isLoading,
    isError: allQuery.isError,
  };
}
