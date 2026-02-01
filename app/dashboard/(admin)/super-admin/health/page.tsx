"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { systemService, SystemHealth as SystemHealthType } from "@/services/system.service";
import { 
    Server, 
    Database, 
    Cpu, 
    Activity, 
    RefreshCw, 
    CheckCircle, 
    XCircle, 
    Clock,
    Shield,
    Zap,
    HardDrive,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ALL_SERVICES = [
    { name: 'Gateway', port: 8000, description: 'API Gateway & Routing', icon: Server },
    { name: 'User Service', port: 8001, description: 'Authentication & Users', icon: Shield },
    { name: 'Academic Service', port: 8002, description: 'Courses & Programs', icon: Database },
    { name: 'Enrollment Service', port: 8003, description: 'Enrollments & Grades', icon: Activity },
    { name: 'Classroom Service', port: 8004, description: 'Virtual Classrooms', icon: Server },
    { name: 'Library Service', port: 8005, description: 'Library Management', icon: Database },
    { name: 'Notification Service', port: 8006, description: 'Alerts & Notifications', icon: Zap },
    { name: 'Communication Service', port: 8007, description: 'Messaging & Chat', icon: Server },
];

export default function SystemHealthPage() {
    const [health, setHealth] = useState<SystemHealthType | null>(null);
    const [loading, setLoading] = useState(true);
    const [serviceStatus, setServiceStatus] = useState<Record<string, boolean>>({});
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchHealth = useCallback(async () => {
        try {
            setLoading(true);
            const data = await systemService.getHealth();
            setHealth(data);
            setLastUpdated(new Date());

            // For now, assume all services operational if API responds
            const statuses: Record<string, boolean> = {};
            ALL_SERVICES.forEach(s => {
                statuses[s.name] = true;
            });
            setServiceStatus(statuses);
        } catch (err) {
            console.error("Failed to fetch health:", err);
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
    }, []);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, [fetchHealth]);

    const operationalCount = Object.values(serviceStatus).filter(Boolean).length;
    const allOperational = operationalCount === ALL_SERVICES.length;

    const getHealthStatus = () => {
        if (!health) return { label: "Unknown", color: "slate", icon: AlertTriangle };
        if (health.server.status === "healthy" && allOperational) {
            return { label: "Healthy", color: "green", icon: CheckCircle2 };
        }
        if (health.server.status === "degraded" || operationalCount < ALL_SERVICES.length) {
            return { label: "Degraded", color: "amber", icon: AlertTriangle };
        }
        return { label: "Critical", color: "red", icon: XCircle };
    };

    const healthStatus = getHealthStatus();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title="System Health"
                subtitle="Real-time system performance monitoring and service status"
                icon={Activity}
                extraActions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                        <Button 
                            onClick={fetchHealth} 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 border-slate-200 dark:border-slate-700"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                }
            />

            {/* Overall Health Status */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "rounded-xl p-4 flex items-center gap-4 border",
                        healthStatus.color === "green" && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                        healthStatus.color === "amber" && "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
                        healthStatus.color === "red" && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
                        healthStatus.color === "slate" && "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800"
                    )}
                >
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                        healthStatus.color === "green" && "bg-green-100 dark:bg-green-900/30",
                        healthStatus.color === "amber" && "bg-amber-100 dark:bg-amber-900/30",
                        healthStatus.color === "red" && "bg-red-100 dark:bg-red-900/30",
                        healthStatus.color === "slate" && "bg-slate-100 dark:bg-slate-800"
                    )}>
                        <healthStatus.icon className={cn(
                            "h-6 w-6",
                            healthStatus.color === "green" && "text-green-600 dark:text-green-400",
                            healthStatus.color === "amber" && "text-amber-600 dark:text-amber-400",
                            healthStatus.color === "red" && "text-red-600 dark:text-red-400",
                            healthStatus.color === "slate" && "text-slate-600 dark:text-slate-400"
                        )} />
                    </div>
                    <div className="flex-1">
                        <h3 className={cn(
                            "font-semibold",
                            healthStatus.color === "green" && "text-green-800 dark:text-green-200",
                            healthStatus.color === "amber" && "text-amber-800 dark:text-amber-200",
                            healthStatus.color === "red" && "text-red-800 dark:text-red-200",
                            healthStatus.color === "slate" && "text-slate-800 dark:text-slate-200"
                        )}>
                            System Status: {healthStatus.label}
                        </h3>
                        <p className={cn(
                            "text-sm",
                            healthStatus.color === "green" && "text-green-600 dark:text-green-300",
                            healthStatus.color === "amber" && "text-amber-600 dark:text-amber-300",
                            healthStatus.color === "red" && "text-red-600 dark:text-red-300",
                            healthStatus.color === "slate" && "text-slate-600 dark:text-slate-400"
                        )}>
                            {operationalCount} of {ALL_SERVICES.length} services operational
                            {health?.server.uptime && ` • Uptime: ${formatUptime(health.server.uptime)}`}
                        </p>
                    </div>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "shrink-0",
                            allOperational 
                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                                : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                        )}
                    >
                        {allOperational ? "All Operational" : "Degraded"}
                    </Badge>
                </motion.div>
            </AnimatePresence>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Server Status"
                    value={health?.server.status ? health.server.status.charAt(0).toUpperCase() + health.server.status.slice(1) : "Unknown"}
                    icon={Server}
                    className={cn(
                        "border-l-4",
                        health?.server.status === "healthy" ? "border-l-green-500" : "border-l-amber-500"
                    )}
                    iconClassName={health?.server.status === "healthy" ? "text-green-500" : "text-amber-500"}
                    iconBgClassName={health?.server.status === "healthy" ? "bg-green-500/10" : "bg-amber-500/10"}
                    description={health?.server.uptime ? `Uptime: ${formatUptime(health.server.uptime)}` : "Loading..."}
                    loading={loading}
                />
                <StatsCard
                    title="Database"
                    value={health?.database.status ? health.database.status.charAt(0).toUpperCase() + health.database.status.slice(1) : "Unknown"}
                    icon={Database}
                    className={cn(
                        "border-l-4",
                        health?.database.status === "connected" ? "border-l-green-500" : "border-l-red-500"
                    )}
                    iconClassName={health?.database.status === "connected" ? "text-green-500" : "text-red-500"}
                    iconBgClassName={health?.database.status === "connected" ? "bg-green-500/10" : "bg-red-500/10"}
                    description={health?.database.host || "Loading..."}
                    loading={loading}
                />
                <StatsCard
                    title="Memory Usage"
                    value={health?.memory.usage ? `${health.memory.usage.toFixed(1)}%` : "0%"}
                    icon={Activity}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-500"
                    iconBgClassName="bg-blue-500/10"
                    description={health ? `Free: ${formatBytes(health.memory.free)} / ${formatBytes(health.memory.total)}` : "Loading..."}
                    loading={loading}
                />
                <StatsCard
                    title="CPU Load"
                    value={health?.cpu.load[0] ? health.cpu.load[0].toFixed(2) : "0.00"}
                    icon={Cpu}
                    className="border-l-4 border-l-purple-500"
                    iconClassName="text-purple-500"
                    iconBgClassName="bg-purple-500/10"
                    description={health ? `${health.cpu.cores} Cores • 15m: ${health.cpu.load[2].toFixed(2)}` : "Loading..."}
                    loading={loading}
                />
            </div>

            {/* Memory Progress */}
            {health && (
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-slate-500" />
                            Memory Utilization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Memory Usage</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{health.memory.usage.toFixed(1)}%</span>
                                </div>
                                <Progress 
                                    value={health.memory.usage} 
                                    className="h-3"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatBytes(health.memory.total)}</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Used</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatBytes(health.memory.total - health.memory.free)}</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Free</p>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatBytes(health.memory.free)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Microservices Health */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-slate-500" />
                            <CardTitle className="text-lg">Microservices Health</CardTitle>
                        </div>
                        <Badge 
                            variant="outline" 
                            className={cn(
                                allOperational 
                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                                    : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                            )}
                        >
                            {operationalCount}/{ALL_SERVICES.length} Operational
                        </Badge>
                    </div>
                    <CardDescription>
                        Status of all backend microservices and their health
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {ALL_SERVICES.map((service, index) => {
                                const isOperational = serviceStatus[service.name];
                                const ServiceIcon = service.icon;
                                
                                return (
                                    <motion.div
                                        key={service.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                                isOperational ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                                            )}>
                                                <ServiceIcon className={cn(
                                                    "h-5 w-5",
                                                    isOperational ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                )} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {service.name}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        :{service.port}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {service.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOperational ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Operational
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Down
                                                </Badge>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* System Information */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-slate-500" />
                        System Information
                    </CardTitle>
                    <CardDescription>
                        Environment and runtime details
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Environment</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">Development</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Node.js Version</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100 font-mono">
                                    {typeof process !== 'undefined' ? process.version : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Platform</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {typeof process !== 'undefined' ? process.platform : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Database</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">MongoDB</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Last Check</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lastUpdated.toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">Check Interval</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">30 seconds</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
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
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
