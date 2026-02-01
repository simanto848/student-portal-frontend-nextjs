import { userApi as api } from "@/lib/api";

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

export interface CollectionDetail {
    name: string;
    count: number;
    size: string;
    storageSize: string;
}

export interface DatabaseInfo {
    name: string;
    sizeOnDisk: string;
    empty: boolean;
    collections: number;
    objects: number;
    avgObjSize: number;
    dataSize: string;
    storageSize: string;
    indexes: number;
    indexSize: string;
    collectionDetails: CollectionDetail[];
}

export interface DatabaseStats {
    status: string;
    host: string;
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
    // Legacy support or current db summary
    topCollections: {
        name: string;
        count: number;
        size: string; // KB or MB string
    }[];

    // New field for all DBs
    databases: DatabaseInfo[];
}

export interface ActivityLog {
    _id: string;
    id?: string;
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
        const response = await api.get("/system/health");
        return response.data.data;
    },

    getDatabaseStats: async (): Promise<DatabaseStats> => {
        const response = await api.get("/system/database");
        return response.data.data;
    },

    getLogs: async (filters?: { service?: string; level?: string; search?: string }): Promise<ActivityLog[]> => {
        const params = new URLSearchParams();
        if (filters?.service) params.append("service", filters.service);
        if (filters?.level) params.append("level", filters.level);
        if (filters?.search) params.append("search", filters.search);

        const response = await api.get(`/system/logs?${params.toString()}`);
        return response.data.data;
    },

    getAlerts: async (): Promise<SystemAlert[]> => {
        const response = await api.get("/system/alerts");
        return response.data.data;
    },

    getApiStats: async (): Promise<ApiStats> => {
        const response = await api.get("/system/api-stats");
        return response.data.data;
    },

    getOrganizations: async (): Promise<Organization[]> => {
        const response = await api.get("/system/organizations");
        return response.data.data;
    }
};

export interface Organization {
    name: string;
    users: number;
    status: "active" | "inactive" | "pending";
    growth: number;
}
