import { academicApi as api, handleApiError } from "../academic/axios-instance";

export type AdminRole = "super_admin" | "admin" | "moderator";

export interface Profile {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    profilePicture?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
}

export interface Admin {
    id: string;
    email: string;
    fullName: string;
    registrationNumber: string;
    role: AdminRole;
    profile?: Profile;
    lastLoginAt?: string;
    lastLoginIp?: string;
    joiningDate?: string;
    registeredIpAddress?: string[];
    isBlocked: boolean;
    blockReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminListParams {
    search?: string;
    role?: AdminRole;
    page?: number;
    limit?: number;
}

export interface AdminListResponse {
    admins: Admin[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface AdminStatistics {
    total: number;
    byRole: Record<AdminRole, number>;
}

const normalize = (a: Record<string, unknown>): Admin => ({
    id: (a?.id as string) || (a?._id as string) || "",
    email: (a?.email as string) || "",
    fullName: (a?.fullName as string) || "",
    registrationNumber: (a?.registrationNumber as string) || "",
    role: (a?.role as AdminRole) || "moderator",
    profile: a?.profile ? {
        id: (a.profile as any)._id || (a.profile as any).id,
        firstName: (a.profile as any).firstName || "",
        lastName: (a.profile as any).lastName || "",
        middleName: (a.profile as any).middleName || "",
        profilePicture: (a.profile as any).profilePicture,
        phoneNumber: (a.profile as any).phoneNumber || "",
        dateOfBirth: (a.profile as any).dateOfBirth || "",
        gender: (a.profile as any).gender || "",
    } : undefined,
    lastLoginAt: a?.lastLoginAt as string | undefined,
    lastLoginIp: a?.lastLoginIp as string | undefined,
    joiningDate: a?.joiningDate as string | undefined,
    registeredIpAddress: (a?.registeredIpAddress as string[]) || [],
    isBlocked: !!a?.isBlocked,
    blockReason: a?.blockReason as string | undefined,
    createdAt: a?.createdAt as string | undefined,
    updatedAt: a?.updatedAt as string | undefined,
});

const extractAdmins = (payload: any): AdminListResponse => {
    if (!payload) return { admins: [] };

    if (payload.admins) {
        return {
            admins: Array.isArray(payload.admins) ? payload.admins.map(normalize) : [],
            pagination: payload.pagination,
        };
    }

    if (Array.isArray(payload)) {
        return { admins: payload.map(normalize) };
    }

    return { admins: [] };
};

const extractAdmin = (payload: any): Admin => normalize(payload || {});

export const adminService = {
    getAll: async (params: AdminListParams = {}): Promise<AdminListResponse> => {
        try {
            const response = await api.get("/user/admins", { params });
            const data = response.data?.data || response.data;
            return extractAdmins(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    getById: async (id: string): Promise<Admin> => {
        try {
            const response = await api.get(`/user/admins/${id}`);
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    create: async (payload: Partial<Admin> | FormData): Promise<Admin> => {
        try {
            const response = await api.post("/user/admins", payload);
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    update: async (id: string, payload: Partial<Admin> | FormData): Promise<Admin> => {
        try {
            const response = await api.patch(`/user/admins/${id}`, payload);
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    updateRole: async (id: string, role: AdminRole): Promise<Admin> => {
        try {
            const response = await api.patch(`/user/admins/${id}/role`, { role });
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/user/admins/${id}`);
        } catch (error) {
            return handleApiError(error);
        }
    },

    getDeleted: async (): Promise<Admin[]> => {
        try {
            const response = await api.get("/user/admins/deleted");
            const data = response.data?.data || response.data;
            return extractAdmins(data).admins;
        } catch (error) {
            return handleApiError(error);
        }
    },

    restore: async (id: string): Promise<void> => {
        try {
            await api.post(`/user/admins/${id}/restore`);
        } catch (error) {
            return handleApiError(error);
        }
    },

    deletePermanently: async (id: string): Promise<void> => {
        try {
            await api.delete(`/user/admins/${id}/permanently`);
        } catch (error) {
            return handleApiError(error);
        }
    },

    getStatistics: async (): Promise<AdminStatistics> => {
        try {
            const response = await api.get("/user/admins/statistics");
            const data = response.data?.data || response.data;
            return data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    addRegisteredIp: async (id: string, ipAddress: string): Promise<Admin> => {
        try {
            const response = await api.post(`/user/admins/${id}/registered-ips/add`, { ipAddress });
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    removeRegisteredIp: async (id: string, ipAddress: string): Promise<Admin> => {
        try {
            const response = await api.post(`/user/admins/${id}/registered-ips/remove`, { ipAddress });
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    updateRegisteredIps: async (id: string, ipAddresses: string[]): Promise<Admin> => {
        try {
            const response = await api.put(`/user/admins/${id}/registered-ips`, { ipAddresses });
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    blockUser: async (userType: string, userId: string, reason: string): Promise<any> => {
        try {
            const response = await api.post("/user/admins/users/block", {
                userType,
                userId,
                reason
            });
            return response.data?.data || response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    unblockUser: async (userType: string, userId: string): Promise<any> => {
        try {
            const response = await api.post("/user/admins/users/unblock", {
                userType,
                userId
            });
            return response.data?.data || response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },
};

