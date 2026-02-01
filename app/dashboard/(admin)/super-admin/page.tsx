"use client";
import { useEffect, useState } from "react";
import {
    systemService,
    DatabaseStats,
    SystemAlert,
    ApiStats,
    ActivityLog,
    SystemHealth
} from "@/services/system.service";
import {
    Server,
    Activity,
    Database,
    Shield,
    Users,
    GraduationCap,
    AlertTriangle,
    RefreshCw,
    Cpu,
    Clock,
    HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [apiStats, setApiStats] = useState<ApiStats | null>(null);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [health, setHealth] = useState<SystemHealth | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [db, sysAlerts, api, sysLogs, sysHealth] = await Promise.all([
                systemService.getDatabaseStats(),
                systemService.getAlerts(),
                systemService.getApiStats(),
                systemService.getLogs({ level: "error" }),
                systemService.getHealth()
            ]);

            setDbStats(db);
            setAlerts(sysAlerts);
            setApiStats(api);
            setLogs(sysLogs);
            setHealth(sysHealth);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Refresh every minute
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Helper to extract collection count
    const getCollectionCount = (name: string) => {
        if (!dbStats?.databases) return 0;
        // Search across all databases provided in stats
        for (const db of dbStats.databases) {
            const col = db.collectionDetails.find(c => c.name === name || c.name === name + "s"); // simple plural check
            if (col) return col.count;
        }
        // Fallback for mock data if specific collection not found
        return 0;
    };

    // Mock historical data for charts if real API mostly returns snapshots
    const cpuData = health?.cpu.load.map((val, i) => ({ time: `Core ${i}`, value: val })) ||
        Array(8).fill(0).map((_, i) => ({ time: `Core ${i}`, value: Math.random() * 50 + 20 }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Good Morning, {user?.fullName?.split(" ")[0]}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Here's what's happening with your system today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Shield className="mr-2 h-4 w-4" />
                        Security Scan
                    </Button>
                </div>
            </div>

            {/* Critical Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="System Health"
                    value={health?.server.status || "Healthy"}
                    icon={Activity}
                    className="border-l-4 border-l-green-500"
                    iconClassName="text-green-500"
                    iconBgClassName="bg-green-500/10"
                    description={`Uptime: ${health ? Math.floor(health.server.uptime / 3600) + 'h' : 'Loading...'}`}
                    loading={loading}
                />
                <StatsCard
                    title="API Requests"
                    value={apiStats?.requests.total.toLocaleString() || "0"}
                    icon={Server}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-500"
                    iconBgClassName="bg-blue-500/10"
                    description={`${apiStats?.requests.error || 0} Errors (24h)`}
                    loading={loading}
                    trend={{ value: 12, label: "vs yesterday", positive: true }}
                />
                <StatsCard
                    title="Total Students"
                    value={getCollectionCount("student").toLocaleString()}
                    icon={Users}
                    className="border-l-4 border-l-indigo-500"
                    iconClassName="text-indigo-500"
                    iconBgClassName="bg-indigo-500/10"
                    description="Active enrollments"
                    loading={loading}
                />
                <StatsCard
                    title="Total Teachers"
                    value={getCollectionCount("teacher").toLocaleString()}
                    icon={GraduationCap}
                    className="border-l-4 border-l-purple-500"
                    iconClassName="text-purple-500"
                    iconBgClassName="bg-purple-500/10"
                    description="Faculty members"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CPU Usage Chart */}
                <Card className="col-span-2 shadow-md border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-indigo-500" />
                            System Resources
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cpuData}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
                                <XAxis dataKey="time" className="text-xs" tick={{ fill: '#94a3b8' }} />
                                <YAxis className="text-xs" tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Alerts Feed */}
                <Card className="shadow-md border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Recent Alerts
                            <Badge variant="secondary" className="ml-auto">{alerts.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {alerts.length === 0 ? (
                                        <p className="text-center text-slate-500 mt-10">No active alerts</p>
                                    ) : alerts.map((alert) => (
                                        <div key={alert.id} className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${alert.type === 'critical' ? 'bg-red-500' :
                                                    alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{alert.message}</p>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {alert.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Infrastructure & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-md border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-slate-500" />
                            Database Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <HardDrive className="h-5 w-5 text-slate-400" />
                                    <span className="font-medium text-sm">Storage Usage</span>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-slate-100">
                                    {dbStats?.size || "0 GB"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-slate-400" />
                                    <span className="font-medium text-sm">Active Connections</span>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-slate-100">
                                    {dbStats?.connections || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Database className="h-5 w-5 text-slate-400" />
                                    <span className="font-medium text-sm">Total Collections</span>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-slate-100">
                                    {dbStats?.collections || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-slate-500" />
                            Recent Error Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            {loading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />)}
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                                    No recent critical errors found.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log) => (
                                        <div key={log._id} className="text-xs p-2 rounded bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/20 font-mono">
                                            <span className="font-bold mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            {log.message}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
