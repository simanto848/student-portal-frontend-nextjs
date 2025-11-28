import { api, handleApiError } from "@/services/academic/axios-instance";

export type TeacherDesignation = "professor" | "associate_professor" | "assistant_professor" | "lecturer" | "senior_lecturer";

export interface Teacher {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  registrationNumber: string;
  departmentId: string;
  department?: any;
  designation?: TeacherDesignation;
  joiningDate?: string;
  registeredIpAddress?: string[];
  profile?: any;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherCreatePayload {
  email: string;
  fullName: string;
  phone?: string;
  departmentId: string;
  designation?: TeacherDesignation;
  joiningDate?: string;
  registeredIpAddress?: string[];
  profile?: any;
}

export interface TeacherUpdatePayload {
  fullName?: string;
  phone?: string;
  departmentId?: string;
  designation?: TeacherDesignation;
  joiningDate?: string;
  registeredIpAddress?: string[];
  profile?: any;
}

const normalize = (t: any): Teacher => ({
  id: t?.id || t?._id,
  email: t?.email || "",
  fullName: t?.fullName || "",
  phone: t?.phone,
  registrationNumber: t?.registrationNumber || "",
  departmentId: t?.departmentId || "",
  department: t?.department,
  designation: t?.designation,
  joiningDate: t?.joiningDate,
  registeredIpAddress: t?.registeredIpAddress || [],
  profile: t?.profile,
  lastLoginAt: t?.lastLoginAt,
  lastLoginIp: t?.lastLoginIp,
  createdAt: t?.createdAt,
  updatedAt: t?.updatedAt,
});

export const teacherService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ teachers: Teacher[]; pagination?: any }> => {
    try {
      const res = await api.get("/user/teachers", { params });
      const data = res.data?.data || res.data;
      const teachers = Array.isArray(data.teachers) ? data.teachers.map(normalize) : [];
      return { teachers, pagination: data.pagination };
    } catch (e) {
      return handleApiError(e);
    }
  },

  getById: async (id: string): Promise<Teacher> => {
    try {
      const res = await api.get(`/user/teachers/${id}`);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  create: async (payload: TeacherCreatePayload): Promise<Teacher> => {
    try {
      const res = await api.post("/user/teachers", payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  update: async (id: string, payload: TeacherUpdatePayload): Promise<Teacher> => {
    try {
      const res = await api.patch(`/user/teachers/${id}`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/user/teachers/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  addRegisteredIp: async (id: string, ipAddress: string): Promise<Teacher> => {
    try {
      const res = await api.post(`/user/teachers/${id}/registered-ips/add`, { ipAddress });
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  removeRegisteredIp: async (id: string, ipAddress: string): Promise<Teacher> => {
    try {
      const res = await api.post(`/user/teachers/${id}/registered-ips/remove`, { ipAddress });
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  updateRegisteredIps: async (id: string, ipAddresses: string[]): Promise<Teacher> => {
    try {
      const res = await api.put(`/user/teachers/${id}/registered-ips`, { ipAddresses });
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  getDeleted: async (): Promise<Teacher[]> => {
    try {
      const res = await api.get('/user/teachers/deleted');
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data.map(normalize) : (Array.isArray(data.teachers)? data.teachers.map(normalize): []);
    } catch (e) {
      return handleApiError(e);
    }
  },

  restore: async (id: string): Promise<Teacher> => {
    try {
      const res = await api.post(`/user/teachers/${id}/restore`);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  deletePermanently: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/user/teachers/${id}/permanently`);
      return res.data?.data || res.data;
    } catch (e) {
      return handleApiError(e);
    }
  }
};
