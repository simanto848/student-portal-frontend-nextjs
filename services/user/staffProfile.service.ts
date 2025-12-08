import { api, handleApiError } from "@/services/academic/axios-instance";

export interface StaffAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface StaffProfilePayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  addresses?: StaffAddress[];
}

export interface StaffProfile extends StaffProfilePayload {
  id: string;
  avatar?: string;
  profilePicture?: string;
}

const normalize = (p: Record<string, unknown>): StaffProfile => ({
  id: (p?.id as string) || (p?._id as string) || "",
  firstName: (p?.firstName as string) || "",
  lastName: (p?.lastName as string) || "",
  middleName: (p?.middleName as string) || "",
  phoneNumber: (p?.phoneNumber as string) || "",
  dateOfBirth: p?.dateOfBirth as string | undefined,
  gender: p?.gender as string | undefined,
  avatar: p?.avatar as string | undefined,
  profilePicture: p?.profilePicture as string | undefined,
  addresses: Array.isArray(p?.addresses)
    ? p.addresses.map((a: Record<string, unknown>) => ({
      street: (a?.street as string) || "",
      city: (a?.city as string) || "",
      state: (a?.state as string) || "",
      zipCode: (a?.zipCode as string) || "",
      country: (a?.country as string) || "",
      isPrimary: (a?.isPrimary as boolean) || false,
    }))
    : [],
});

export const staffProfileService = {
  get: async (staffId: string): Promise<StaffProfile | null> => {
    try {
      const res = await api.get(`/user/staffs/${staffId}/profile`);
      const data = res.data?.data || res.data;
      if (!data) return null;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  create: async (
    staffId: string,
    payload: StaffProfilePayload
  ): Promise<StaffProfile> => {
    try {
      const res = await api.post(`/user/staffs/${staffId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  update: async (
    staffId: string,
    payload: Partial<StaffProfilePayload>
  ): Promise<StaffProfile> => {
    try {
      const res = await api.patch(`/user/staffs/${staffId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  upsert: async (
    staffId: string,
    payload: StaffProfilePayload
  ): Promise<StaffProfile> => {
    try {
      const res = await api.put(`/user/staffs/${staffId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  delete: async (staffId: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/user/staffs/${staffId}/profile`);
      return res.data?.data || res.data;
    } catch (e) {
      return handleApiError(e);
    }
  },
};
