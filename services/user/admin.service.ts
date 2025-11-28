import { api, handleApiError } from "../academic/axios-instance";

export type AdminRole = "super_admin" | "admin" | "moderator";

export interface AdminProfileSummary {
    id?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatar?: string;
}

export interface Admin {
    id: string;
    fullName: string;
    email: string;
    role: AdminRole;
    registrationNumber: string;
    joiningDate?: string;
    registeredIpAddress?: string[];
    lastLoginAt?: string;
    lastLoginIp?: string;
    createdAt?: string;
    updatedAt?: string;
    profile?: AdminProfileSummary;
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

const normalizeAdmin = (admin: any): Admin => ({
    ...admin,
    id: admin?.id || admin?._id,
    registeredIpAddress: admin?.registeredIpAddress || [],
});

const extractAdmins = (payload: any): AdminListResponse => {
    if (!payload) return { admins: [] };

    if (payload.admins) {
        return {
            admins: Array.isArray(payload.admins) ? payload.admins.map(normalizeAdmin) : [],
            pagination: payload.pagination,
        };
    }

    if (Array.isArray(payload)) {
        return { admins: payload.map(normalizeAdmin) };
    }

    return { admins: [] };
};

const extractAdmin = (payload: any): Admin => normalizeAdmin(payload || {});

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

    create: async (payload: Partial<Admin>): Promise<Admin> => {
        try {
            const response = await api.post("/user/admins", payload);
            const data = response.data?.data || response.data;
            return extractAdmin(data);
        } catch (error) {
            return handleApiError(error);
        }
    },

    update: async (id: string, payload: Partial<Admin>): Promise<Admin> => {
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
};

