import { api, handleApiError } from "@/services/academic/axios-instance";

export interface AdminAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface AdminProfilePayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO date
  gender?: string; // Male/Female/Other
  addresses?: AdminAddress[];
}

export interface AdminProfile extends AdminProfilePayload {
  id: string;
  avatar?: string;
}

const normalize = (p: any): AdminProfile => ({
  id: p?.id || p?._id,
  firstName: p?.firstName || "",
  lastName: p?.lastName || "",
  middleName: p?.middleName || "",
  phoneNumber: p?.phoneNumber || "",
  dateOfBirth: p?.dateOfBirth,
  gender: p?.gender,
  avatar: p?.avatar,
  addresses: Array.isArray(p?.addresses) ? p.addresses.map((a: any) => ({
    street: a?.street || "",
    city: a?.city || "",
    state: a?.state || "",
    zipCode: a?.zipCode || "",
    country: a?.country || "",
    isPrimary: a?.isPrimary || false,
  })) : [],
});

export const adminProfileService = {
  get: async (adminId: string): Promise<AdminProfile | null> => {
    try {
      const res = await api.get(`/user/admins/${adminId}/profile`);
      const data = res.data?.data || res.data;
      if (!data) return null;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },
  create: async (adminId: string, payload: AdminProfilePayload): Promise<AdminProfile> => {
    try {
      const res = await api.post(`/user/admins/${adminId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },
  update: async (adminId: string, payload: Partial<AdminProfilePayload>): Promise<AdminProfile> => {
    try {
      const res = await api.patch(`/user/admins/${adminId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },
  upsert: async (adminId: string, payload: AdminProfilePayload): Promise<AdminProfile> => {
    try {
      const res = await api.put(`/user/admins/${adminId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },
};
