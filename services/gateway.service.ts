import { api } from "@/services/academic/axios-instance";

export interface ServiceMetrics {
    key: string;
    name: string;
    status: string;
    circuitState: string;
    metrics: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        avgResponseTime: number;
        lastResponseTime: number;
    };
    circuitStats: {
        successes: number;
        failures: number;
        rejects: number;
        timeouts: number;
        fallbacks: number;
    } | null;
}

export interface GatewayMetrics {
    gateway: {
        uptimeSeconds: number;
        startedAt: string;
        memory: {
            heapUsed: number;
            heapTotal: number;
            rss: number;
            external: number;
        };
        nodeVersion: string;
    };
    requests: {
        total: number;
        success: number;
        failed: number;
        successRate: string;
        byService: Record<
            string,
            {
                total: number;
                success: number;
                failed: number;
                statusCodes: Record<string, number>;
            }
        >;
    };
    services: ServiceMetrics[];
    timestamp: string;
}

export interface Alert {
    id: string;
    type: string;
    severity: "info" | "warning" | "critical";
    message: string;
    data: Record<string, unknown>;
    createdAt: string;
    acknowledged: boolean;
    acknowledgedAt?: string;
}

export interface AlertsResponse {
    count: number;
    alerts: Alert[];
}

export const gatewayService = {
    async getMetrics(): Promise<GatewayMetrics> {
        const response = await api.get("/metrics");
        return response.data.data;
    },

    async getMetricsSummary() {
        const response = await api.get("/metrics/summary");
        return response.data.data;
    },

    async getAlerts(limit = 20, includeAcknowledged = false): Promise<AlertsResponse> {
        const response = await api.get("/alerts", {
            params: { limit, acknowledged: includeAcknowledged },
        });
        return response.data.data;
    },

    async acknowledgeAlert(alertId: string): Promise<boolean> {
        const response = await api.post(`/alerts/${alertId}/acknowledge`);
        return response.data.success;
    },
};

export default gatewayService;
