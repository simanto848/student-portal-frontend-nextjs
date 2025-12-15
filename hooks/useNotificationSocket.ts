"use client";

import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketService } from "@/services/socket.service";
import { notificationKeys } from "@/hooks/queries/useNotificationQueries";
import { NotificationItem } from "@/services/notification/notification.service";

interface UseNotificationSocketOptions {
  enabled?: boolean;
  onNotificationReceived?: (notification: NotificationItem) => void;
}

/**
 * Hook to handle real-time notification updates via WebSocket
 * Automatically connects to the notification socket and listens for new notifications
 */
export function useNotificationSocket(
  options: UseNotificationSocketOptions = {},
) {
  const { enabled = true, onNotificationReceived } = options;
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);

  const handleNotificationPublished = useCallback(
    (notification: NotificationItem) => {
      console.log("[NotificationSocket] New notification received:", notification);

      // Optimistically add the notification to the cache
      queryClient.setQueryData(
        notificationKeys.myNotifications(),
        (oldData: { notifications: NotificationItem[]; pagination?: unknown } | undefined) => {
          if (!oldData) return oldData;

          // Check if notification already exists
          const exists = oldData.notifications.some(
            (n) => n.id === notification.id,
          );
          if (exists) return oldData;

          // Add new notification at the beginning
          return {
            ...oldData,
            notifications: [notification, ...oldData.notifications],
          };
        },
      );

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: notificationKeys.notifications(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.myNotifications(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });

      // Call the callback if provided
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    },
    [queryClient, onNotificationReceived],
  );

  const handleNotificationRead = useCallback(
    (data: { notificationId: string; userId: string }) => {
      console.log("[NotificationSocket] Notification marked as read:", data);

      // Update the notification in cache
      queryClient.setQueryData(
        notificationKeys.myNotifications(),
        (oldData: { notifications: NotificationItem[]; pagination?: unknown } | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            notifications: oldData.notifications.map((n) =>
              n.id === data.notificationId
                ? { ...n, status: "read" as const, isRead: true, readAt: new Date().toISOString() }
                : n,
            ),
          };
        },
      );

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    // Connect to notification socket
    const socket = socketService.connect("notification");

    if (socket && !isConnectedRef.current) {
      isConnectedRef.current = true;

      // Listen for new notifications
      socket.on("notification.published", handleNotificationPublished);

      // Listen for read status updates
      socket.on("notification.read", handleNotificationRead);

      console.log("[NotificationSocket] Listeners attached");
    }

    return () => {
      const currentSocket = socketService.getSocket("notification");
      if (currentSocket) {
        currentSocket.off("notification.published", handleNotificationPublished);
        currentSocket.off("notification.read", handleNotificationRead);
        console.log("[NotificationSocket] Listeners removed");
      }
      isConnectedRef.current = false;
    };
  }, [enabled, handleNotificationPublished, handleNotificationRead]);

  // Function to manually reconnect
  const reconnect = useCallback(() => {
    socketService.disconnect("notification");
    isConnectedRef.current = false;
    const socket = socketService.connect("notification");
    if (socket) {
      socket.on("notification.published", handleNotificationPublished);
      socket.on("notification.read", handleNotificationRead);
      isConnectedRef.current = true;
    }
  }, [handleNotificationPublished, handleNotificationRead]);

  return {
    isConnected: socketService.isConnected("notification"),
    reconnect,
  };
}

export default useNotificationSocket;
