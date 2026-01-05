"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, SystemAlert } from "@/services/system.service";
import { AlertCircle, AlertTriangle, Info, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SystemAlertsPage() {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await systemService.getAlerts();
            setAlerts(data);
        } catch (error) {
            toast.error("Failed to fetch alerts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertCircle className="h-5 w-5 text-destructive" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical': return "border-destructive/50 bg-destructive/5";
            case 'warning': return "border-yellow-500/50 bg-yellow-500/5";
            default: return "border-blue-500/50 bg-blue-500/5";
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                        <p className="text-muted-foreground">Critical notifications and warnings</p>
                    </div>
                    <Button onClick={fetchAlerts} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Alerts</CardTitle>
                        <CardDescription>Current issues requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : alerts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                                    <p>All systems operational. No active alerts.</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`flex items-start p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                                    >
                                        <div className="mt-0.5 mr-3">
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold capitalize text-sm">{alert.type} Alert</h4>
                                                <span className="text-xs text-muted-foreground">{alert.time}</span>
                                            </div>
                                            <p className="text-sm mt-1">{alert.message}</p>
                                        </div>
                                        <div className="ml-3">
                                            <Button variant="ghost" size="sm" onClick={() => toast.success("Alert acknowledged")}>
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
