"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemService, ApiStats } from "@/services/system.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, RefreshCw, Key, Shield, TrendingUp, Clock, Zap, Activity, Server } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function ApiManagementPage() {
    const [stats, setStats] = useState<ApiStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await systemService.getApiStats();
            setStats(data);
        } catch {
            toast.error("Failed to fetch API stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-500 animate-pulse">Loading API statistics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">API Management</h1>
                        <Badge variant="outline" className="px-2.5 py-0.5 h-6 border-green-200 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/20">
                            System Healthy
                        </Badge>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Monitor API usage, endpoints, and performance metrics.
                    </p>
                </div>
                <Button onClick={fetchStats} variant="outline" className="gap-2 border-slate-200 dark:border-slate-800">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="shadow-md border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests (24h)</CardTitle>
                        <Globe className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.requests.total.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">
                                {((stats?.requests.success || 0) / (stats?.requests.total || 1) * 100).toFixed(1)}% success
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-md border-slate-200 dark:border-slate-800 border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Latency</CardTitle>
                        <Clock className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.latency.avg}ms</div>
                        <p className="text-xs text-slate-500 mt-1">
                            P95: {stats?.latency.p95}ms | P99: {stats?.latency.p99}ms
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-md border-slate-200 dark:border-slate-800 border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Error Rate</CardTitle>
                        <Activity className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.errorRate}%</div>
                        <Progress value={(stats?.errorRate || 0) * 20} max={100} className="h-1.5 mt-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-red-500" />
                    </CardContent>
                </Card>
                <Card className="shadow-md border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Services</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.activeServices} / {stats?.totalServices}</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckIcon className="h-3 w-3" />
                            All services responding
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Endpoint Performance Table */}
                <Card className="lg:col-span-2 shadow-md border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Server className="h-5 w-5 text-indigo-500" />
                                    Endpoint Performance
                                </CardTitle>
                                <CardDescription className="text-slate-500">Top endpoints by traffic volume</CardDescription>
                            </div>
                            {stats?.updatedAt && (
                                <span className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                                    Last update: {new Date(stats.updatedAt).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                    <TableHead className="w-[100px]">Method</TableHead>
                                    <TableHead>Endpoint</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead className="text-right">Calls</TableHead>
                                    <TableHead className="text-right">Latency</TableHead>
                                    <TableHead className="text-right">Errors</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && !stats ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats?.endpoints.map((ep, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800">
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    ep.method === "GET" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        ep.method === "POST" ? "bg-green-50 text-green-700 border-green-200" :
                                                            ep.method === "PUT" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                "bg-red-50 text-red-700 border-red-200"
                                                }>{ep.method}</Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={ep.path}>
                                                {ep.path}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{ep.service}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-600 dark:text-slate-300">{ep.calls.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={ep.avgLatency > 150 ? "text-amber-600 font-medium" : "text-green-600"}>
                                                    {ep.avgLatency}ms
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={ep.errorRate > 1 ? "text-red-600 font-bold" : "text-green-600"}>
                                                    {ep.errorRate}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* API Access */}
                <Card className="shadow-md border-slate-200 dark:border-slate-800 h-fit">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Key className="h-5 w-5 text-amber-500" />
                            API Access
                        </CardTitle>
                        <CardDescription className="text-slate-500">Configured integrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">Frontend App</p>
                                    <p className="text-xs text-slate-500">Client Access</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                                    <Server className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">Gateway Service</p>
                                    <p className="text-xs text-slate-500">Internal Mesh</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50 opacity-70">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                                    <Globe className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">Mobile App</p>
                                    <p className="text-xs text-slate-500">Not configured</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                        </div>
                        <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Key className="h-4 w-4 mr-2" />
                            Generate New Key
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
