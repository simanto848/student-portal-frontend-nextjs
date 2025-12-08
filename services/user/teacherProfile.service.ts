import { api, handleApiError } from "@/services/academic/axios-instance";

export interface TeacherAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface TeacherProfilePayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  addresses?: TeacherAddress[];
}

export interface TeacherProfile extends TeacherProfilePayload {
  id: string;
  avatar?: string;
  profilePicture?: string;
}

const normalize = (p: any): TeacherProfile => ({
  id: p?.id || p?._id,
  firstName: p?.firstName || "",
  lastName: p?.lastName || "",
  middleName: p?.middleName || "",
  phoneNumber: p?.phoneNumber || "",
  dateOfBirth: p?.dateOfBirth,
  gender: p?.gender,
  avatar: p?.avatar,
  profilePicture: p?.profilePicture,
  addresses: Array.isArray(p?.addresses) ? p.addresses.map((a: any) => ({
    street: a?.street || "",
    city: a?.city || "",
    state: a?.state || "",
    zipCode: a?.zipCode || "",
    country: a?.country || "",
    isPrimary: a?.isPrimary || false,
  })) : [],
});

export const teacherProfileService = {
  get: async (teacherId: string): Promise<TeacherProfile | null> => {
    try {
      const res = await api.get(`/user/teachers/${teacherId}/profile`);
      const data = res.data?.data || res.data;
      if (!data) return null;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  create: async (teacherId: string, payload: TeacherProfilePayload): Promise<TeacherProfile> => {
    try {
      const res = await api.post(`/user/teachers/${teacherId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  update: async (teacherId: string, payload: Partial<TeacherProfilePayload>): Promise<TeacherProfile> => {
    try {
      const res = await api.patch(`/user/teachers/${teacherId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  upsert: async (teacherId: string, payload: TeacherProfilePayload): Promise<TeacherProfile> => {
    try {
      const res = await api.put(`/user/teachers/${teacherId}/profile`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  delete: async (teacherId: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/user/teachers/${teacherId}/profile`);
      return res.data?.data || res.data;
    } catch (e) {
      return handleApiError(e);
    }
  },
};
