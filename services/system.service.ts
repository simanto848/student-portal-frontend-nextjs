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
        reads: number;
        writes: number;
        updates: number;
        deletes: number;
    };
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
    latency: { avg: number; p95: number };
    endpoints: { method: string; path: string; calls: number; errorRate: string }[];
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
    }
};
