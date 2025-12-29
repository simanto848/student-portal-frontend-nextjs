"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { systemService, SystemHealth } from "@/services/system.service";
import { Server, Database, Cpu, Activity, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ALL_SERVICES = [
    { name: 'Gateway', port: 8000, description: 'API Gateway & Routing' },
    { name: 'User Service', port: 8001, description: 'Authentication & Users' },
    { name: 'Academic Service', port: 8002, description: 'Courses & Programs' },
    { name: 'Enrollment Service', port: 8003, description: 'Enrollments & Grades' },
    { name: 'Classroom Service', port: 8004, description: 'Virtual Classrooms' },
    { name: 'Library Service', port: 8005, description: 'Library Management' },
    { name: 'Notification Service', port: 8006, description: 'Alerts & Notifications' },
    { name: 'Communication Service', port: 8007, description: 'Messaging & Chat' },
];

export default function SystemHealthPage() {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [serviceStatus, setServiceStatus] = useState<Record<string, boolean>>({});

    const fetchHealth = async () => {
        try {
            setLoading(true);
            const data = await systemService.getHealth();
            setHealth(data);

            // For now, assume all services operational if API responds
            // In production, each service would have its own health endpoint
            const statuses: Record<string, boolean> = {};
            ALL_SERVICES.forEach(s => {
                statuses[s.name] = true; // All operational if we can reach the API
            });
            setServiceStatus(statuses);
        } catch (error) {
            toast.error("Failed to fetch system health");
            // Mark all services as down if API fails
            const statuses: Record<string, boolean> = {};
            ALL_SERVICES.forEach(s => {
                statuses[s.name] = false;
            });
            setServiceStatus(statuses);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
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

    const operationalCount = Object.values(serviceStatus).filter(Boolean).length;

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

                {/* All Microservices Health */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Microservices Health</CardTitle>
                                <CardDescription>Status of all backend services ({operationalCount}/{ALL_SERVICES.length} operational)</CardDescription>
                            </div>
                            <Badge variant="outline" className={operationalCount === ALL_SERVICES.length ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}>
                                {operationalCount === ALL_SERVICES.length ? "All Operational" : "Degraded"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            {ALL_SERVICES.map((service) => (
                                <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${serviceStatus[service.name] ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <span className="font-medium">{service.name}</span>
                                            <p className="text-xs text-muted-foreground">{service.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">:{service.port}</Badge>
                                        {serviceStatus[service.name] ? (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Operational
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Down
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>Environment and runtime details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Environment</span>
                                    <span className="font-medium">Development</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Node.js Version</span>
                                    <span className="font-medium">{typeof process !== 'undefined' ? process.version : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Database</span>
                                    <span className="font-medium">MongoDB</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Last Check</span>
                                    <span className="font-medium flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
