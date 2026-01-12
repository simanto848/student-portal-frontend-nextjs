import { academicApi as api, handleApiError } from "@/services/academic/axios-instance";

export type StaffRole = "program_controller" | "admission" | "library" | "it" | "exam_controller";

interface Department {
  id?: string;
  _id?: string;
  name: string;
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface Staff {
  id: string;
  email: string;
  fullName: string;
  registrationNumber: string;
  departmentId: string;
  department?: Department;
  joiningDate?: string;
  registeredIpAddress?: string[];
  role: StaffRole;
  profile?: Profile;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffCreatePayload {
  email: string;
  fullName: string;
  departmentId: string;
  role?: StaffRole;
  joiningDate?: string;
  registeredIpAddress?: string[];
}

export interface StaffUpdatePayload {
  fullName?: string;
  departmentId?: string;
  role?: StaffRole;
  joiningDate?: string;
  registeredIpAddress?: string[];
}

const normalize = (s: Record<string, unknown>): Staff => ({
  id: (s?.id as string) || (s?._id as string) || "",
  email: (s?.email as string) || "",
  fullName: (s?.fullName as string) || "",
  registrationNumber: (s?.registrationNumber as string) || "",
  departmentId: (s?.departmentId as string) || "",
  department: s?.department as Department | undefined,
  joiningDate: s?.joiningDate as string | undefined,
  registeredIpAddress: (s?.registeredIpAddress as string[]) || [],
  role: (s?.role as StaffRole) || "it",
  profile: s?.profile ? {
    id: (s.profile as any)._id || (s.profile as any).id,
    firstName: (s.profile as any).firstName,
    lastName: (s.profile as any).lastName,
    profilePicture: (s.profile as any).profilePicture,
  } : undefined,
  lastLoginAt: s?.lastLoginAt as string | undefined,
  lastLoginIp: s?.lastLoginIp as string | undefined,
  createdAt: s?.createdAt as string | undefined,
  updatedAt: s?.updatedAt as string | undefined,
});

export const staffService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    staff: Staff[];
    pagination?: { page: number; limit: number; total: number };
  }> => {
    try {
      const res = await api.get("/user/staffs", { params });
      const data = res.data?.data || res.data;
      const staff = Array.isArray(data.staff)
        ? data.staff.map(normalize)
        : Array.isArray(data)
          ? data.map(normalize)
          : [];
      return { staff, pagination: data.pagination };
    } catch (e) {
      return handleApiError(e);
    }
  },

  getById: async (id: string): Promise<Staff> => {
    try {
      const res = await api.get(`/user/staffs/${id}`);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  create: async (payload: StaffCreatePayload | FormData): Promise<Staff> => {
    try {
      const res = await api.post("/user/staffs", payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  update: async (id: string, payload: StaffUpdatePayload | FormData): Promise<Staff> => {
    try {
      const res = await api.patch(`/user/staffs/${id}`, payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/user/staffs/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      return handleApiError(e);
    }
  },

  addRegisteredIp: async (id: string, ipAddress: string): Promise<Staff> => {
    try {
      const res = await api.post(`/user/staffs/${id}/registered-ips/add`, {
        ipAddress,
      });
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  removeRegisteredIp: async (id: string, ipAddress: string): Promise<Staff> => {
    try {
      const res = await api.post(`/user/staffs/${id}/registered-ips/remove`, {
        ipAddress,
      });
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  updateRegisteredIps: async (
    id: string,
    ipAddresses: string[]
  ): Promise<Staff> => {
    try {
      const res = await api.put(`/user/staffs/${id}/registered-ips`, {
        ipAddresses,
      });
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  getDeleted: async (): Promise<Staff[]> => {
    try {
      const res = await api.get("/user/staffs/deleted");
      const data = res.data?.data || res.data;
      return Array.isArray(data)
        ? data.map(normalize)
        : Array.isArray(data.staff)
          ? data.staff.map(normalize)
          : [];
    } catch (e) {
      return handleApiError(e);
    }
  },

  restore: async (id: string): Promise<Staff> => {
    try {
      const res = await api.post(`/user/staffs/${id}/restore`);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  deletePermanently: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/user/staffs/${id}/permanently`);
      return res.data?.data || res.data;
    } catch (e) {
      return handleApiError(e);
    }
  },
};
