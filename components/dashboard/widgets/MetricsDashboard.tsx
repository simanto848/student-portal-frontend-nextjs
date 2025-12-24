"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Activity,
    Clock,
    Cpu,
    HardDrive,
    Server,
    TrendingUp,
    Zap,
} from "lucide-react";
import { gatewayService, GatewayMetrics } from "@/services/gateway.service";

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

function getCircuitStateColor(state: string): string {
    switch (state) {
        case "closed":
            return "bg-green-100 text-green-800";
        case "open":
            return "bg-red-100 text-red-800";
        case "half-open":
            return "bg-yellow-100 text-yellow-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export function MetricsDashboard() {
    const [metrics, setMetrics] = useState<GatewayMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchMetrics = async () => {
            try {
                const data = await gatewayService.getMetrics();
                if (!cancelled) {
                    setMetrics(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Failed to load metrics");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3d32]"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !metrics) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-red-500">{error || "No metrics available"}</div>
                </CardContent>
            </Card>
        );
    }

    const memoryUsagePercent = Math.round(
        (metrics.gateway.memory.heapUsed / metrics.gateway.memory.heapTotal) * 100
    );

    return (
        <div className="space-y-6">
            {/* Gateway Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Clock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Uptime</p>
                                <p className="text-xl font-bold">{formatUptime(metrics.gateway.uptimeSeconds)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Requests</p>
                                <p className="text-xl font-bold">{metrics.requests.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                <p className="text-xl font-bold">{metrics.requests.successRate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Cpu className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Memory Usage</p>
                                <p className="text-xl font-bold">{metrics.gateway.memory.heapUsed} MB</p>
                            </div>
                        </div>
                        <Progress value={memoryUsagePercent} className="mt-2 h-1" />
                    </CardContent>
                </Card>
            </div>

            {/* Service Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Service Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="pb-3 font-medium">Service</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Circuit</th>
                                    <th className="pb-3 font-medium text-right">Requests</th>
                                    <th className="pb-3 font-medium text-right">Success</th>
                                    <th className="pb-3 font-medium text-right">Failed</th>
                                    <th className="pb-3 font-medium text-right">Avg Response</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {metrics.services.map((service) => (
                                    <tr key={service.key} className="text-sm">
                                        <td className="py-3 font-medium">{service.name}</td>
                                        <td className="py-3">
                                            <Badge
                                                variant={
                                                    service.status === "operational"
                                                        ? "default"
                                                        : service.status === "down"
                                                            ? "destructive"
                                                            : "secondary"
                                                }
                                                className={
                                                    service.status === "operational"
                                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                        : ""
                                                }
                                            >
                                                {service.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <Badge className={getCircuitStateColor(service.circuitState)}>
                                                {service.circuitState}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-right">{service.metrics.totalRequests}</td>
                                        <td className="py-3 text-right text-green-600">
                                            {service.metrics.successfulRequests}
                                        </td>
                                        <td className="py-3 text-right text-red-600">
                                            {service.metrics.failedRequests}
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className="flex items-center justify-end gap-1">
                                                <Zap className="h-3 w-3 text-yellow-500" />
                                                {service.metrics.avgResponseTime.toFixed(1)}ms
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Memory Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Memory Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Heap Used</p>
                            <p className="text-2xl font-bold">{metrics.gateway.memory.heapUsed} MB</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Heap Total</p>
                            <p className="text-2xl font-bold">{metrics.gateway.memory.heapTotal} MB</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">RSS</p>
                            <p className="text-2xl font-bold">{metrics.gateway.memory.rss} MB</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">External</p>
                            <p className="text-2xl font-bold">{metrics.gateway.memory.external} MB</p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                        Node.js {metrics.gateway.nodeVersion} • Started{" "}
                        {new Date(metrics.gateway.startedAt).toLocaleString()}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default MetricsDashboard;
