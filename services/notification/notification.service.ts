import { academicApi as api, handleApiError } from "../academic/axios-instance";

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  targetType?: string;
  targetDepartmentIds?: string[];
  targetBatchIds?: string[];
  targetFacultyIds?: string[];
  targetUserIds?: string[];
  status?: "draft" | "scheduled" | "published" | "cancelled" | "sent" | "read";
  scheduleAt?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  sendEmail?: boolean;
  deliveryChannels?: string[];
  senderRole?: string;
  createdById?: string;
  createdByRole?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  totalRecipients?: number;
  readCount?: number;
  reactionCounts?: Record<string, number>;
  isRead?: boolean;
  readAt?: string;
}

export interface TargetOption {
  type: string;
  id?: string;
  label: string;
}

export interface MyScope {
  canSend: boolean;
  roles: string[];
  options: TargetOption[];
}

export interface Pagination {
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  mine?: boolean;
}

export interface NotificationListResponse {
  items?: NotificationItem[];
  notifications?: NotificationItem[];
  total?: number;
  page?: number;
  pages?: number;
  pagination?: Pagination;
}

export interface CreateNotificationData {
  title: string;
  content: string;
  summary?: string;
  targetType: string;
  targetDepartmentIds?: string[];
  targetBatchIds?: string[];
  targetFacultyIds?: string[];
  targetUserIds?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
  sendEmail?: boolean;
  deliveryChannels?: ("socket" | "email")[];
  scheduleAt?: string;
}

export const notificationService = {
  // Get available targeting options for current user
  getMyScope: async (): Promise<MyScope> => {
    try {
      const response = await api.get("/notification/notifications/my-scope");
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create a new notification
  create: async (data: CreateNotificationData): Promise<NotificationItem> => {
    try {
      const response = await api.post("/notification/notifications", data);
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Schedule a notification
  schedule: async (
    id: string,
    scheduleAt: string,
  ): Promise<NotificationItem> => {
    try {
      const response = await api.post(
        `/notification/notifications/${id}/schedule`,
        { scheduleAt },
      );
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Publish a notification immediately
  publish: async (id: string): Promise<NotificationItem> => {
    try {
      const response = await api.post(
        `/notification/notifications/${id}/publish`,
      );
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Cancel a scheduled notification
  cancel: async (id: string): Promise<NotificationItem> => {
    try {
      const response = await api.post(
        `/notification/notifications/${id}/cancel`,
      );
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // List received notifications
  list: async (
    params?: NotificationListParams,
  ): Promise<NotificationListResponse> => {
    try {
      const response = await api.get("/notification/notifications", { params });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // List sent notifications (for senders)
  getSent: async (
    params?: NotificationListParams,
  ): Promise<NotificationListResponse> => {
    try {
      const response = await api.get("/notification/notifications/sent", {
        params,
      });
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get a single notification
  get: async (id: string): Promise<NotificationItem> => {
    try {
      const response = await api.get(`/notification/notifications/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Mark notification as read
  markRead: async (id: string): Promise<{ message?: string }> => {
    try {
      const response = await api.post(`/notification/notifications/${id}/read`);
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Mark all notifications as read
  markAllRead: async (): Promise<{ message?: string, count?: number }> => {
    try {
      const response = await api.post(`/notification/notifications/mark-all-read`);
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // React to a notification
  react: async (
    id: string,
    reaction: string,
  ): Promise<{ message?: string }> => {
    try {
      const response = await api.post(
        `/notification/notifications/${id}/react`,
        { reaction },
      );
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update a draft/scheduled notification
  update: async (
    id: string,
    data: Partial<CreateNotificationData>,
  ): Promise<NotificationItem> => {
    try {
      const response = await api.put(`/notification/notifications/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete a notification
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/notification/notifications/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
