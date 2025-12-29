"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { systemService, SystemHealth } from "@/services/system.service";
import { Server, Database, Cpu, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SystemHealthPage() {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        try {
            setLoading(true);
            const data = await systemService.getHealth();
            setHealth(data);
        } catch (error) {
            toast.error("Failed to fetch system health");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !health) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
                        <p className="text-muted-foreground">Real-time system performance monitoring</p>
                    </div>
                    <Button onClick={fetchHealth} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Server Status</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{health?.server.status}</div>
                            <p className="text-xs text-muted-foreground">
                                Uptime: {formatUptime(health?.server.uptime || 0)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold capitalize">{health?.database.status}</div>
                                {health?.database.status === 'connected' && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                                Host: {health?.database.host}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{health?.memory.usage.toFixed(1)}%</div>
                            <Progress value={health?.memory.usage} className="h-2 mt-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                Free: {formatBytes(health?.memory.free || 0)} / {formatBytes(health?.memory.total || 0)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{health?.cpu.load[0].toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                Cores: {health?.cpu.cores} | 15m Load: {health?.cpu.load[2].toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Metrics */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Health Check</CardTitle>
                            <CardDescription>Status of individual microservices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['User Service', 'Academic Service', 'Enrollment Service', 'Notification Service'].map((service) => (
                                <div key={service} className="flex items-center justify-between p-2 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="font-medium">{service}</span>
                                    </div>
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Operational</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                            <CardDescription>Environment details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Environment</span>
                                <span className="font-medium">Production</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Version</span>
                                <span className="font-medium">v2.4.0</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Node.js Version</span>
                                <span className="font-medium">v18.17.0</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Region</span>
                                <span className="font-medium">ap-southeast-1</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatUptime(seconds: number) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}
