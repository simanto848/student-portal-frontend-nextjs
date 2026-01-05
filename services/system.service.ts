import { api } from "@/lib/api";

export interface SystemHealth {
    server: {
        uptime: number;
        status: string;
        timestamp: string;
    };
    database: {
        status: string;
        host: string;
    };
    memory: {
        free: number;
        total: number;
        usage: number;
    };
    cpu: {
        load: number[];
        cores: number;
    };
}

export interface DatabaseStats {
    status: string;
    collections: number;
    documents: number;
    size: string;
    connections: number;
    operations: {
        reads: string;
        writes: string;
        updates: string;
        deletes: string;
    };
    counts: {
        totalUsers: number;
        students: number;
        teachers: number;
        admins: number;
        staff: number;
        organizations: number;
    };
    breakdown: {
        name: string;
        count: number;
        color: string;
    }[];
    topCollections: {
        name: string;
        count: number;
        size: string;
    }[];
}

export interface ActivityLog {
    id: string;
    level: "info" | "warn" | "error";
    message: string;
    timestamp: string;
    service: string;
    user: string;
}

export interface SystemAlert {
    id: number;
    type: "critical" | "warning" | "info";
    message: string;
    time: string;
}

export interface ApiStats {
    requests: { total: number; success: number; error: number };
    latency: { avg: number; p95: number; p99?: number };
    errorRate: number;
    activeServices: number;
    totalServices: number;
    endpoints: {
        method: string;
        path: string;
        service: string;
        description: string;
        calls: number;
        avgLatency: number;
        errorRate: number;
        lastCalled: string;
    }[];
    updatedAt: string;
}


export const systemService = {
    getHealth: async (): Promise<SystemHealth> => {
        const response = await api.get("/user/system/health");
        return response.data.data;
    },

    getDatabaseStats: async (): Promise<DatabaseStats> => {
        const response = await api.get("/user/system/database");
        return response.data.data;
    },

    getLogs: async (): Promise<ActivityLog[]> => {
        const response = await api.get("/user/system/logs");
        return response.data.data;
    },

    getAlerts: async (): Promise<SystemAlert[]> => {
        const response = await api.get("/user/system/alerts");
        return response.data.data;
    },

    getApiStats: async (): Promise<ApiStats> => {
        const response = await api.get("/user/system/api-stats");
        return response.data.data;
    },

    getOrganizations: async (): Promise<Organization[]> => {
        const response = await api.get("/user/system/organizations");
        return response.data.data;
    }
};

export interface Organization {
    name: string;
    users: number;
    status: "active" | "inactive" | "pending";
    growth: number;
}
