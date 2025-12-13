import {
  api,
  handleApiError,
  extractItemData,
} from "@/services/academic/axios-instance";

export const settingsService = {
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message?: string } | any> => {
    try {
      const res = await api.post("/user/auth/change-password", data);
      return extractItemData(res as any);
    } catch (e) {
      return handleApiError(e);
    }
  },

  enable2FA: async (): Promise<{ message?: string } | any> => {
    try {
      const res = await api.post("/user/auth/2fa/enable");
      return extractItemData(res as any);
    } catch (e) {
      return handleApiError(e);
    }
  },

  confirmEnable2FA: async (
    otp: string
  ): Promise<{ message?: string } | any> => {
    try {
      const res = await api.post("/user/auth/2fa/confirm", { otp });
      return extractItemData(res as any);
    } catch (e) {
      return handleApiError(e);
    }
  },

  disable2FA: async (password: string): Promise<{ message?: string } | any> => {
    try {
      const res = await api.post("/user/auth/2fa/disable", { password });
      return extractItemData(res as any);
    } catch (e) {
      return handleApiError(e);
    }
  },

  updatePreferences: async (data: {
    emailUpdatesEnabled?: boolean;
  }): Promise<{ emailUpdatesEnabled: boolean } | any> => {
    try {
      const res = await api.patch("/user/auth/preferences", data);
      return extractItemData(res as any);
    } catch (e) {
      return handleApiError(e);
    }
  },

  getMe: async (): Promise<any> => {
    try {
      const res = await api.get("/user/auth/me");
      const data = (res as any).data?.data?.data || (res as any).data?.data;
      return data?.user || data;
    } catch (e) {
      return handleApiError(e);
    }
  },
};
