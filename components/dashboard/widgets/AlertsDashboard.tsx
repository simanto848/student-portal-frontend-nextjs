"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    AlertTriangle,
    Bell,
    CheckCircle,
    Info,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { gatewayService, Alert, AlertsResponse } from "@/services/gateway.service";
import { formatDistanceToNow } from "date-fns";

function getSeverityIcon(severity: Alert["severity"]) {
    switch (severity) {
        case "critical":
            return <XCircle className="h-4 w-4 text-red-500" />;
        case "warning":
            return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        case "info":
            return <Info className="h-4 w-4 text-blue-500" />;
        default:
            return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
}

function getSeverityBadgeClass(severity: Alert["severity"]): string {
    switch (severity) {
        case "critical":
            return "bg-red-100 text-red-800 hover:bg-red-100";
        case "warning":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
        case "info":
            return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function getAlertTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        SERVICE_DOWN: "Service Down",
        SERVICE_RECOVERED: "Service Recovered",
        CIRCUIT_OPEN: "Circuit Open",
        HIGH_ERROR_RATE: "High Error Rate",
        SLOW_RESPONSE: "Slow Response",
        CONSECUTIVE_FAILURES: "Consecutive Failures",
    };
    return labels[type] || type;
}

export function AlertsDashboard() {
    const [alertsData, setAlertsData] = useState<AlertsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAcknowledged, setShowAcknowledged] = useState(false);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            const data = await gatewayService.getAlerts(50, showAcknowledged);
            setAlertsData(data);
            setError(null);
        } catch {
            setError("Failed to load alerts");
        } finally {
            setLoading(false);
        }
    }, [showAcknowledged]);

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000);
        return () => clearInterval(interval);
    }, [fetchAlerts]);

    const handleAcknowledge = async (alertId: string) => {
        setAcknowledging(alertId);
        try {
            await gatewayService.acknowledgeAlert(alertId);
            await fetchAlerts();
        } catch (err) {
            console.error("Failed to acknowledge alert:", err);
        } finally {
            setAcknowledging(null);
        }
    };

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

    const alerts = alertsData?.alerts || [];
    const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length;
    const warningCount = alerts.filter((a) => a.severity === "warning" && !a.acknowledged).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        System Alerts
                        {criticalCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {criticalCount} Critical
                            </Badge>
                        )}
                        {warningCount > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                                {warningCount} Warnings
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAcknowledged(!showAcknowledged)}
                        >
                            {showAcknowledged ? "Hide Acknowledged" : "Show All"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchAlerts}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="text-center text-red-500 py-4">{error}</div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                        <p className="text-lg font-medium text-green-700">All Clear!</p>
                        <p className="text-sm text-muted-foreground">No active alerts at this time</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`flex items-start gap-3 p-4 rounded-lg border ${alert.acknowledged
                                    ? "bg-gray-50 opacity-60"
                                    : alert.severity === "critical"
                                        ? "bg-red-50 border-red-200"
                                        : alert.severity === "warning"
                                            ? "bg-yellow-50 border-yellow-200"
                                            : "bg-blue-50 border-blue-200"
                                    }`}
                            >
                                <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={getSeverityBadgeClass(alert.severity)}>
                                            {alert.severity.toUpperCase()}
                                        </Badge>
                                        <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
                                        {alert.acknowledged && (
                                            <Badge variant="secondary" className="bg-gray-200">
                                                Acknowledged
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 font-medium">{alert.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                        {typeof alert.data?.serviceKey === "string" && ` • Service: ${alert.data.serviceKey}`}
                                    </p>
                                </div>
                                {!alert.acknowledged && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAcknowledge(alert.id)}
                                        disabled={acknowledging === alert.id}
                                    >
                                        {acknowledging === alert.id ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default AlertsDashboard;
