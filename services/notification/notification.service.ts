import { api, handleApiError } from "../academic/axios-instance";

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  targetType?: string;
  targetId?: string;
  status?: "draft" | "scheduled" | "sent" | "read";
  sendAt?: string;
  createdAt?: string;
  updatedAt?: string;
  readAt?: string;
  reactions?: Record<string, number>;
}

export interface Pagination {
  total?: number;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  pagination?: Pagination;
}

export interface NotificationListParams extends Partial<Pagination> {
  status?: string;
  targetType?: string;
  mine?: boolean;
}

export const notificationService = {
  list: async (
    params?: NotificationListParams
  ): Promise<NotificationListResponse> => {
    try {
      const response = await api.get("/notification/notifications", { params });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  get: async (id: string): Promise<NotificationItem> => {
    try {
      const response = await api.get(`/notification/notifications/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  markRead: async (id: string): Promise<{ message?: string }> => {
    try {
      const response = await api.post(`/notification/notifications/${id}/read`);
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  react: async (id: string, emoji: string): Promise<{ message?: string }> => {
    try {
      const response = await api.post(
        `/notification/notifications/${id}/react`,
        { emoji }
      );
      return response.data?.data || response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
